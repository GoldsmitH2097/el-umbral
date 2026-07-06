// AnatomiaEngine.js — orchestrator. Spec: ENGINEERING.md §3.
// User-paced: the reader advances, we never advance for them (single sanctioned
// exception: fx "carrera", Phase 2). Content comes exclusively from the score —
// Germán's text is canon, never inline strings.

import './anatomia.css';
import score from './score.es.json';
import { applyFx } from './effects.js';
import { SceneFX } from './SceneFX.js';
import { AnatomiaAudio } from './AnatomiaAudio.js';

const STORAGE_KEY = 'sw_anatomia';
const HINT_KEY = 'sw_anatomia_hinted';

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

    this._bindEntry();
    this._bindChrome();
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

    this.floorIndex = floorIndex;
    this._bindInput();
    this._startFloor();
  }

  // ── Floor lifecycle ──────────────────────────────────────────────────────

  get floor() { return this.floors[this.floorIndex]; }

  _startFloor() {
    this.beatIndex = -1;
    this.loopsDone = 0;
    this.corrupted = false;
    this.sceneFX.resetFloorLayers();
    this._clearStage(true);
    this._stage.classList.toggle('carta', this.floor.mode === 'carta');
    this._floorIndicator.textContent = this.floor.title.split(':')[0];
    this.audio.setAmbience(this.floor.ambience);
    this._showTitlecard(this.floor.title).then(() => {
      this.state = 'playing';
      this.advance();
    });
  }

  _showTitlecard(text) {
    this.state = 'titlecard';
    this._titlecard.textContent = text;
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

  advance() {
    if (this.state !== 'playing' || performance.now() < this.lockUntil) return;
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

  _renderBeat() {
    const b = this.floor.beats[this.beatIndex];
    if (!b.stack) this._clearStage();

    const el = document.createElement('p');
    el.className = 'beat';
    if (b.voice === 'void') el.classList.add('voice-void');
    if (b.t.startsWith('—')) el.classList.add('dialogue');
    el.textContent = b.t;
    this._stage.appendChild(el);
    applyFx(el, b);
    if (this.corrupted) el.classList.add('repeat-glitch');

    this._compressStack();
    if (b.scene) this.sceneFX.trigger(b.scene);
    if (b.sfx) this.audio.play(b.sfx);
    // interact:"wipe" lands with its fx in Phase 2

    this.lockUntil = performance.now() + (b.delay || 0);
    this._advances++;
    this._maybeHint();
    this._saveProgress();
  }

  _clearStage(instant = false) {
    if (instant) { this._stage.textContent = ''; return; }
    const old = [...this._stage.children];
    old.forEach(el => {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
    });
    setTimeout(() => old.forEach(el => el.remove()), 320);
  }

  // The chamber never scrolls: oldest stacked lines compress away instead.
  _compressStack() {
    if (this.floor.mode === 'carta') return; // the letter accumulates — sole exception
    const kids = [...this._stage.children];
    const over = kids.length - 8;
    kids.forEach((el, i) => {
      el.classList.remove('old-1', 'old-2', 'old-3', 'old-gone');
      const age = kids.length - 1 - i;
      if (i < over) el.classList.add('old-gone');
      else if (age >= 6) el.classList.add('old-3');
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
