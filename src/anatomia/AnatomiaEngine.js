// AnatomiaEngine.js — orchestrator. Spec: ENGINEERING.md §3.
// User-paced: the reader advances, we never advance for them (single sanctioned
// exception: fx "carrera", Phase 2). Content comes exclusively from the score —
// Germán's text is canon, never inline strings.

import './anatomia.css';
import score from './score.es.json';
import { applyFx, startWipe } from './effects.js';
import { SceneFX } from './SceneFX.js';
import { AnatomiaAudio } from './AnatomiaAudio.js';

const STORAGE_KEY = 'sw_anatomia';
const HINT_KEY = 'sw_anatomia_hinted';

// Per-floor palette — presentation, not content, so it lives in the engine
// rather than the score. Backgrounds morph slowly (3 s CSS transition);
// the epilogue inverts to bone-white: the letter as paper.
const PALETTES = {
  'prologo': { bg: '#020202', ink: '#d8dce0', dim: '#8a8a92' },
  'piso-1':  { bg: '#050507', ink: '#d8dce0', dim: '#8a8a92' },
  'piso-2':  { bg: '#04060a', ink: '#d4dae2', dim: '#828a96' },
  'piso-3':  { bg: '#060504', ink: '#dad6d0', dim: '#8e8880' },
  'piso-4':  { bg: '#070303', ink: '#dcd4d2', dim: '#948684' },
  'piso-5':  { bg: '#030303', ink: '#d0d2d6', dim: '#7e8086' },
  'piso-6':  { bg: '#050408', ink: '#d6d4de', dim: '#88849a' },
  'piso-7':  { bg: '#060303', ink: '#dcd2d0', dim: '#968280' },
  'piso-8':  { bg: '#040406', ink: '#d8d8e0', dim: '#86869a' },
  'epilogo': { bg: '#e9e6df', ink: '#1c1c1f', dim: '#6a6a70' },
};

class AnatomiaEngine {
  constructor() {
    this.floors = score.floors;
    this.floorIndex = 0;
    this.beatIndex = -1;
    this.loopsDone = 0;
    this.corrupted = false;
    this.state = 'entry'; // entry | titlecard | playing | transition | finale
    this.lockUntil = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.sceneFX = new SceneFX();
    this.audio = new AnatomiaAudio();

    this._stage = document.getElementById('stage');
    this._stageWrap = document.getElementById('stage-wrap');
    this._titlecard = document.getElementById('titlecard');
    this._entry = document.getElementById('entry');
    this._hint = document.getElementById('hint');
    this._floorIndicator = document.getElementById('floor-indicator');

    this._wheelAccum = 0;
    this._wheelCoolUntil = 0;
    this._advances = 0;
    this._hintTimer = null;
    this._pending = [];
    this._accelStep = 0;
    this.pendingInteract = false;
    // Auto-advance: 3 s of stillness and the building climbs on its own.
    // A quiet ring in the corner fills with each breath.
    this._autoMs = 3000;
    this._autoEligibleAt = Infinity;
    this._ring = document.getElementById('auto-ring');
    this._ringCircle = this._ring?.querySelector('circle');

    this._bindEntry();
    this._bindChrome();
    // Debug handle — lets tests and DevTools inspect the live engine.
    window.__anatomia = this;
  }

  // ── Entry ────────────────────────────────────────────────────────────────

  _bindEntry() {
    const saved = this._loadProgress();
    const btnContinuar = document.getElementById('btn-continuar');
    const btnEntrar = document.getElementById('btn-entrar');

    if (saved && !saved.done && (saved.floorIndex > 0 || saved.beatIndex > 3)) {
      const floor = this.floors[saved.floorIndex];
      btnContinuar.textContent = `CONTINUAR — ${floor.title.split(':')[0]}`;
      btnContinuar.hidden = false;
      btnEntrar.textContent = 'EMPEZAR DE NUEVO';
      btnContinuar.addEventListener('click', () => this._enter(saved.floorIndex));
    }
    btnEntrar.addEventListener('click', () => this._enter(0));
  }

  _enter(floorIndex) {
    // Audio context must be created synchronously inside this gesture (iOS).
    this.audio.init();
    this._entry.classList.add('leaving');
    setTimeout(() => { this._entry.remove(); }, 1700);

    document.getElementById('btn-exit').hidden = false;
    document.getElementById('btn-sound').hidden = false;
    this._stageWrap.hidden = false;

    if (this.reduced) { this._renderReadingMode(); return; }

    this.sceneFX.startDust();
    this.floorIndex = floorIndex;
    this._bindInput();
    this._startAutoLoop();
    this._startFloor();
  }

  // ── Auto-advance — the reader may rest; the building does not ────────────

  _startAutoLoop() {
    const CIRC = 56.5; // 2πr for r=9
    // rAF pauses while the tab is hidden, but performance.now() keeps running.
    // On return, give the reader their full reading window again instead of
    // instantly auto-advancing on the stale clock.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this._autoEligibleAt = performance.now();
    });
    const tick = () => {
      requestAnimationFrame(tick);
      if (this.state !== 'playing' || this.pendingInteract ||
          !document.getElementById('exit-confirm').hidden) {
        this._ring?.classList.add('hidden');
        this._autoEligibleAt = performance.now() + 400; // re-arm after interruptions
        return;
      }
      const now = performance.now();
      // Dwell is the per-beat reading window (set in _renderBeat). The manual
      // input-lock (lockUntil, from an authored `delay`) is already folded into
      // _autoMs, so the fill can start at render time.
      const fill = Math.min(1, Math.max(0, (now - this._autoEligibleAt) / this._autoMs));
      if (this._autoMs === Infinity) { this._ring?.classList.add('hidden'); return; }
      this._ring?.classList.remove('hidden');
      if (this._ringCircle) this._ringCircle.style.strokeDashoffset = `${CIRC * (1 - fill)}`;
      if (fill >= 1) {
        this._autoEligibleAt = now + 200; // reset before advancing
        this.advance(true); // dwell already satisfied the reading window
      }
    };
    requestAnimationFrame(tick);
  }

  // ── Floor lifecycle ──────────────────────────────────────────────────────

  get floor() { return this.floors[this.floorIndex]; }

  _startFloor() {
    this.beatIndex = -1;
    this.loopsDone = 0;
    this.corrupted = false;
    this._accelStep = 0;
    this.pendingInteract = false;
    this.sceneFX.resetFloorLayers();
    this._clearStage(true);
    this._stage.classList.remove('desviado');
    this._stage.style.transform = '';
    this._stage.classList.toggle('carta', this.floor.mode === 'carta');
    // The letter as paper: grain overlay only on the epilogue
    document.body.classList.toggle('carta-paper', this.floor.mode === 'carta');
    // If the 11:11 clock hijacked the tab title on a previous floor, release it
    document.title = 'Anatomía del Vacío — Soulware';
    this._floorIndicator.textContent = this.floor.title.split(':')[0];
    this._applyPalette(this.floor.id);
    this.audio.setAmbience(this.floor.ambience);
    this._showTitlecard(this.floor.title).then(() => {
      this.state = 'playing';
      this.advance();
    });
  }

  _applyPalette(floorId) {
    const p = PALETTES[floorId] || PALETTES['prologo'];
    const root = document.documentElement.style;
    root.setProperty('--bg', p.bg);
    root.setProperty('--ink', p.ink);
    root.setProperty('--dim', p.dim);
    this.sceneFX.setDustInk(p.ink);
  }

  _showTitlecard(text) {
    this.state = 'titlecard';
    // Piso 8's title lies for a single breath before correcting itself.
    // Almost subliminal — the building promising the floor it will never give.
    if (this.floor.id === 'piso-8' && text === this.floor.title) {
      this._titlecard.textContent = 'NOVENO PISO';
      setTimeout(() => { this._titlecard.textContent = text; }, 130);
    } else {
      this._titlecard.textContent = text;
    }
    this._titlecard.classList.add('on');
    return new Promise(resolve => {
      const done = () => {
        clearTimeout(timer);
        this._stageWrap.removeEventListener('click', done);
        this._titlecard.classList.remove('on');
        setTimeout(resolve, 700);
      };
      const timer = setTimeout(done, 2200);
      this._stageWrap.addEventListener('click', done, { once: true });
    });
  }

  async _nextFloor() {
    this.state = 'transition';
    if (this.floorIndex + 1 >= this.floors.length) { this._finale(); return; }
    await this.sceneFX.blackout(() => {
      this.floorIndex++;
      this._saveProgress();
    });
    this._startFloor();
  }

  _finale() {
    // Phase 2 completes the full "final" sequence (input-dead hold, Pacto).
    this._saveProgress(true);
    this.sceneFX.blackout(() => {
      this._clearStage(true);
      this._floorIndicator.textContent = '';
      this._titlecard.innerHTML =
        `${score.meta.title}<br><span style="font-size:.7em;color:#666">${score.meta.author} · ${score.meta.publisher}</span>`;
      this._titlecard.classList.add('on');
      setTimeout(() => {
        const back = document.createElement('a');
        back.href = '/obras/anatomia-del-vacio/';
        back.textContent = 'VOLVER AL ARCHIVO';
        back.className = 'finale-back';
        document.body.appendChild(back);
      }, 3000);
    });
  }

  // ── Advance ──────────────────────────────────────────────────────────────

  advance(force = false) {
    if (this.state !== 'playing') return;
    if (!force && (performance.now() < this.lockUntil || this.pendingInteract)) return;
    const beats = this.floor.beats;
    const next = this.beatIndex + 1;

    if (next >= beats.length) {
      const loop = this.floor.loop;
      if (loop && this.loopsDone < loop.times) {
        // The trap (Quinto Piso): the reader is sent back. Second pass corrupts.
        this.loopsDone++;
        this.corrupted = true;
        this.beatIndex = beats.findIndex(b => b.id === loop.toBeatId);
        this._renderBeat();
        return;
      }
      this._nextFloor();
      return;
    }
    this.beatIndex = next;
    this._renderBeat();
  }

  // Stanzas are PRE-LAID: on a group's first beat, every subsequent stack
  // beat is rendered invisibly in its final position; each advance merely
  // reveals the next line. Nothing on screen ever moves. (Ruben: "bring the
  // lines in their final position" — the score is known, so we can.)
  _renderBeat() {
    const b = this.floor.beats[this.beatIndex];

    let el;
    if (!b.stack) {
      this._clearStage();
      this._pending = [];
      // Build this beat + its whole trailing stack group at final geometry
      const beats = this.floor.beats;
      for (let i = this.beatIndex; i < beats.length; i++) {
        const gb = beats[i];
        if (i > this.beatIndex && !gb.stack) break;
        const p = this._buildBeatEl(gb);
        this._stage.appendChild(p);
        this._pending.push(p);
      }
      el = this._pending.shift();
    } else {
      el = this._pending?.shift();
      if (!el) { // resumed/jumped mid-group (loop trap) — degrade to append
        el = this._buildBeatEl(b);
        this._stage.appendChild(el);
      }
    }

    el.classList.remove('pending');
    applyFx(el, b, { stage: this._stage, scene: this.sceneFX, carta: this.floor.mode === 'carta' });
    if (this.corrupted) el.classList.add('repeat-glitch');

    // acelera: successive stacked reveals arrive faster and faster
    if (b.fx === 'acelera') this._accelStep = 1;
    else if (!b.stack) this._accelStep = 0;
    if (this._accelStep > 0 && b.stack) {
      const dur = Math.max(0.12, 1.9 * Math.pow(0.55, this._accelStep));
      el.style.animationDuration = `${dur}s`;
      el.style.animationDelay = '0.1s';
      this._accelStep++;
    }

    // Idea #1: the tab title becomes the clock. Whoever glances at their
    // browser sees 11:11 has followed them out of the page.
    if (b.fx === 'clock') document.title = '11:11';

    this._compressStack();

    if (b.scene === 'silence') this.audio.duckAll();
    else if (b.scene === 'silence-swing') this.audio.duckAllExcept('columpio');
    else if (b.scene === 'respiro') this.audio.breathe(3000);
    else if (b.scene) this.sceneFX.trigger(b.scene);
    if (b.sfx) this.audio.play(b.sfx);

    // "Paso el dedo." — the reader's only physical act: wipe the vaho away.
    if (b.interact === 'wipe' && !this.reduced) {
      this.pendingInteract = true;
      const vahoEl = [...this._stage.children].find(c => c.classList.contains('fx-vaho-write'));
      startWipe(vahoEl, () => {
        this.pendingInteract = false;
        const hint = document.getElementById('hint');
        if (hint) { hint.classList.remove('on'); hint.textContent = 'toca para continuar'; }
      });
    }

    // "Subo corriendo." — the ONE sanctioned theft of the reader's pace.
    if (b.fx === 'carrera') {
      const gaps = [550, 450, 350, 300];
      this.lockUntil = performance.now() + gaps.reduce((a, c) => a + c, 0) + 400;
      this._autoMs = Infinity; // the burst drives itself; ring never completes
      let acc = 0;
      gaps.forEach(gap => {
        acc += gap;
        setTimeout(() => this.advance(true), acc);
      });
    } else {
      this.lockUntil = performance.now() + (b.delay || 0);
      this._autoMs = this._computeAutoMs(b);
    }

    this._advances++;
    this._autoEligibleAt = performance.now(); // ring + dwell restart with each beat
    this._maybeHint();
    this._saveProgress();
  }

  // How long a beat stays before auto-advancing. The window has three parts:
  // a legibility base (the entrance animation must resolve before you can even
  // read), a dramatic reading pace per word, and a small pause bonus for each
  // sentence break within the beat. Clamped, and never shorter than an authored
  // `delay` hold. This kills both failure modes: long baroque sentences got
  // clipped, one-word punches sat too long.
  _computeAutoMs(b) {
    const BASE = 1400;          // entrance legibility + one breath
    const PER_WORD = 340;       // ~176 wpm — a dwell pace, not a skim
    const PER_PAUSE = 220;      // each . … ? ! ; buys a beat of silence
    const MIN = 2100, MAX = 9500;

    const text = (b.t || '').trim();
    const words = text ? text.split(/\s+/).length : 1;
    const pauses = (text.match(/[.…?!;:]/g) || []).length;

    // Slow, staggered entrances (letters/words revealed one at a time) push the
    // legible moment later — give them extra headroom so reading starts fresh.
    const STAGGERED = new Set(['de-humo', 'vaho-write', 'cadence', 'limpia',
      'gravedad', 'etiquetas', 'corrige', 'rewrite', 'amputada']);
    const staggerPad = STAGGERED.has(b.fx) ? Math.min(words, 8) * 90 : 0;

    let ms = BASE + words * PER_WORD + pauses * PER_PAUSE + staggerPad;
    if (b.delay) ms = Math.max(ms, b.delay + BASE); // honor authored holds
    return Math.max(MIN, Math.min(MAX, ms));
  }

  _buildBeatEl(b) {
    const el = document.createElement('p');
    el.className = 'beat pending';
    if (b.voice === 'void') el.classList.add('voice-void');
    if (b.t.startsWith('—')) el.classList.add('dialogue');
    const sz = this._sizeClass(b);
    if (sz) el.classList.add(sz);
    el.textContent = b.t;
    return el;
  }

  // Typographic scale: short lines strike harder. The score can override via
  // b.em ('sm'|'lg'|'xl'|'xxl'); otherwise a length heuristic decides.
  // Void-voice lines stay small — the system does not shout.
  _sizeClass(b) {
    if (b.em) return `sz-${b.em}`;
    if (b.voice === 'void' || b.fx === 'whisper' || b.fx === 'slam') return null;
    const t = b.t;
    const words = t.split(/\s+/).length;
    if (t.length > 150) return 'sz-sm';
    if (words === 1 && t.length <= 14) return 'sz-xl';
    if (t.length <= 14) return 'sz-lg';
    return null;
  }

  // The departing stanza lifts away in an absolutely-positioned ghost while
  // the incoming beat rises in the normal flow — a true cross-fade with no
  // layout jump. Exit: ease-in up + defocus. Entry: fxRise handles it.
  _clearStage(instant = false) {
    if (instant) { this._stage.textContent = ''; return; }
    const kids = [...this._stage.children];
    if (!kids.length) return;
    const ghost = document.createElement('div');
    ghost.className = 'stage-ghost';
    const col = document.createElement('div');
    col.className = 'ghost-col';
    col.classList.toggle('carta', this.floor.mode === 'carta');
    kids.forEach(k => {
      // Moving a node restarts its CSS animations — freeze the FINAL computed
      // state (opacity + transform + filter) so the ghost fades out exactly as
      // the line looked. Forcing transform/filter to 'none' snapped rotated,
      // shrunk or blurred lines (e.g. the upside-down "Y de eso.", the shrinking
      // closing stanza) back to full size for a frame before the fade — the
      // glitch Ruben caught.
      const cs = getComputedStyle(k);
      k.style.opacity = cs.opacity;
      k.style.animation = 'none';
      k.style.transform = cs.transform === 'none' ? '' : cs.transform;
      k.style.filter = cs.filter === 'none' ? '' : cs.filter;
      col.appendChild(k);
    });
    ghost.appendChild(col);
    this._stageWrap.appendChild(ghost);
    requestAnimationFrame(() => requestAnimationFrame(() => ghost.classList.add('out')));
    setTimeout(() => ghost.remove(), 900);
  }

  // Older revealed lines recede by opacity only — geometry is sacred now
  // (pre-laid stanzas), so nothing is ever removed or collapsed mid-group.
  _compressStack() {
    if (this.floor.mode === 'carta') return; // the letter accumulates — sole exception
    const revealed = [...this._stage.children].filter(el => !el.classList.contains('pending'));
    revealed.forEach((el, i) => {
      el.classList.remove('old-1', 'old-2', 'old-3');
      const age = revealed.length - 1 - i;
      if (age >= 6) el.classList.add('old-3');
      else if (age >= 4) el.classList.add('old-2');
      else if (age >= 3) el.classList.add('old-1');
    });
  }

  // ── Input: one gesture = one advance ─────────────────────────────────────

  _bindInput() {
    this._stageWrap.addEventListener('click', (e) => {
      if (e.target.closest('button, a')) return;
      this.advance();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { this._toggleExitConfirm(); return; }
      if ([' ', 'Enter', 'ArrowRight', 'ArrowDown'].includes(e.key) ||
          e.code === 'Space') {
        e.preventDefault();
        this.advance();
      }
    });
    window.addEventListener('wheel', (e) => {
      const now = performance.now();
      if (now < this._wheelCoolUntil) return;
      this._wheelAccum += e.deltaY;
      if (this._wheelAccum > 50) {
        this._wheelAccum = 0;
        this._wheelCoolUntil = now + 400;
        this.advance();
      } else if (this._wheelAccum < 0) {
        this._wheelAccum = 0; // no going back — the building doesn't allow it
      }
    }, { passive: true });
  }

  _maybeHint() {
    if (localStorage.getItem(HINT_KEY)) return;
    if (this._advances > 3) { localStorage.setItem(HINT_KEY, '1'); return; }
    clearTimeout(this._hintTimer);
    this._hint.classList.remove('on');
    this._hintTimer = setTimeout(() => {
      if (this._advances <= 3) this._hint.classList.add('on');
    }, 4000);
    setTimeout(() => this._hint.classList.remove('on'), 8000);
  }

  // ── Chrome ───────────────────────────────────────────────────────────────

  _bindChrome() {
    document.getElementById('btn-exit').addEventListener('click', () => this._toggleExitConfirm());
    document.getElementById('btn-exit-stay').addEventListener('click', () => this._toggleExitConfirm(false));
    document.getElementById('btn-sound').addEventListener('click', (e) => {
      const muted = this.audio.toggleMute();
      e.currentTarget.innerHTML = `SONIDO&nbsp;&middot;&nbsp;${muted ? 'OFF' : 'ON'}`;
      e.currentTarget.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar sonido');
    });
  }

  _toggleExitConfirm(force) {
    const dlg = document.getElementById('exit-confirm');
    dlg.hidden = force !== undefined ? !force : !dlg.hidden;
  }

  // ── Progress ─────────────────────────────────────────────────────────────

  _saveProgress(done = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        floorIndex: this.floorIndex, beatIndex: this.beatIndex, done,
      }));
    } catch (_) {}
  }

  _loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (_) { return null; }
  }

  // ── Reading mode (prefers-reduced-motion) ────────────────────────────────
  // Same content, dignified static presentation. No traps, no effects.

  _renderReadingMode() {
    const wrap = document.createElement('div');
    wrap.id = 'reading-mode';
    const article = document.createElement('article');
    for (const floor of this.floors) {
      const h = document.createElement('h2');
      h.textContent = floor.title;
      article.appendChild(h);
      for (const b of floor.beats) {
        const p = document.createElement('p');
        if (b.voice === 'void') p.className = 'voice-void';
        if (b.t.startsWith('—')) p.className = 'dialogue';
        p.textContent = b.t;
        article.appendChild(p);
      }
    }
    wrap.appendChild(article);
    document.body.appendChild(wrap);
    this._floorIndicator.textContent = '';
  }
}

new AnatomiaEngine();
