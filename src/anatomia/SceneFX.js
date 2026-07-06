// SceneFX.js — environment layer. Spec: ENGINEERING.md §6. Phase 2: complete.

export class SceneFX {
  constructor() {
    this._vignette = document.getElementById('vignette');
    this._blackout = document.getElementById('blackout');
    this._redwash = document.getElementById('redwash');
    this._figura = document.getElementById('figura');
    this._whiteflash = document.getElementById('whiteflash');
    this._zippo = document.getElementById('zippo-glow');
    this._stageWrap = document.getElementById('stage-wrap');
    this._dust = null;
    this._flickerTimer = null;
    this._smoke = null;
    this._zippoRAF = null;
  }

  trigger(name) {
    switch (name) {
      case 'close-in': this._vignette.classList.add('on'); break;
      case 'blackout': break; // engine drives floor transitions itself
      case 'red-on': this._redwash.classList.add('on'); break;
      case 'red-off': this._redwash.classList.remove('on'); break;
      case 'figura-on': this._figura.classList.add('on'); break;
      case 'figura-close': this._figura.classList.add('on', 'close'); break;
      case 'figura-off': this._figura.classList.remove('on', 'close'); break;
      case 'flicker': this._startFlicker(); break;
      case 'smoke': this._startSmoke(); break;
      case 'zippo-on': this._zippoOn(); break;
      case 'zippo-off': this._zippoOff(); break;
      case 'reflejo': this._vignette.classList.add('on', 'reflejo'); break;
      default:
        if (import.meta.env.DEV) console.debug(`[anatomia] scene "${name}" unhandled`);
    }
  }

  /** "Parpadeo." — the page blinks. */
  blink(ms = 150) {
    this._blackout.classList.add('blink');
    setTimeout(() => this._blackout.classList.remove('blink'), ms);
  }

  /** "Blanco." — one breath of white. */
  whiteFlash(ms = 420) {
    this._whiteflash.classList.add('on');
    setTimeout(() => this._whiteflash.classList.remove('on'), ms);
  }

  /** Floor transition: fade to black, swap while hidden, fade back. */
  blackout(swapFn) {
    this._blackout.classList.add('on');
    return new Promise(resolve => {
      setTimeout(() => {
        swapFn?.();
        setTimeout(() => {
          this._blackout.classList.remove('on');
          resolve();
        }, 400);
      }, 850);
    });
  }

  /** Reset per-floor layers. */
  resetFloorLayers() {
    this._vignette.classList.remove('on', 'reflejo');
    this._redwash.classList.remove('on');
    this._figura.classList.remove('on', 'close');
    this._zippoOff();
    clearInterval(this._flickerTimer);
    this._flickerTimer = null;
    this._stopSmoke();
  }

  // ── Bombilla enferma — the page's light palpitates ────────────────────────

  _startFlicker() {
    if (this._flickerTimer) return;
    const dip = () => {
      this._blackout.classList.add('flicker-dip');
      setTimeout(() => this._blackout.classList.remove('flicker-dip'), 90 + Math.random() * 130);
    };
    const loop = () => {
      dip();
      if (Math.random() < 0.3) setTimeout(dip, 220); // double-stutter sometimes
      this._flickerTimer = setTimeout(loop, 3000 + Math.random() * 4000);
    };
    this._flickerTimer = setTimeout(loop, 1500);
  }

  // ── Zippo — the cursor becomes the flame (idea #2) ────────────────────────
  // Desktop: a warm glow replaces the pointer and follows it with a lag.
  // Mobile: the glow breathes at bottom-center. zippo-off: the reader goes
  // nearly blind until the floor releases them.

  _zippoOn() {
    this._zippo.classList.add('on');
    this._stageWrap.classList.add('zippo-cursor');
    if (this._zippoRAF) return;
    let tx = innerWidth / 2, ty = innerHeight * 0.6, x = tx, y = ty;
    this._zippoMove = (e) => { tx = e.clientX; ty = e.clientY; };
    addEventListener('pointermove', this._zippoMove);
    const step = () => {
      this._zippoRAF = requestAnimationFrame(step);
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      const flick = Math.sin(performance.now() / 90) * 2 + Math.random() * 1.5;
      this._zippo.style.left = `${x + flick}px`;
      this._zippo.style.top = `${y}px`;
    };
    step();
  }

  _zippoOff() {
    this._zippo.classList.remove('on');
    this._stageWrap?.classList.remove('zippo-cursor');
    if (this._zippoRAF) cancelAnimationFrame(this._zippoRAF);
    this._zippoRAF = null;
    if (this._zippoMove) removeEventListener('pointermove', this._zippoMove);
  }

  // ── Smoke — the zippo's blue thread, bending to another breath ───────────

  _startSmoke() {
    if (this._smoke) return;
    const canvas = document.getElementById('smoke');
    canvas.classList.add('on');
    canvas.width = innerWidth; canvas.height = innerHeight;
    const ctx = canvas.getContext('2d');
    const wisps = Array.from({ length: 26 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: innerHeight * (0.65 + Math.random() * 0.3),
      vy: -(12 + Math.random() * 16) / 24,
      phase: Math.random() * Math.PI * 2,
      r: 1 + Math.random() * 2.4,
      a: 0.03 + Math.random() * 0.05,
    }));
    this._smoke = { dead: false };
    let last = 0;
    const frame = (t) => {
      if (this._smoke?.dead) return;
      requestAnimationFrame(frame);
      if (t - last < 41 || document.hidden) return;
      last = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const w of wisps) {
        w.y += w.vy;
        w.phase += 0.012;
        // Rises straight, then bends — "como si respondiera a una respiración ajena"
        const bend = w.y < innerHeight * 0.45 ? Math.sin(w.phase) * 1.4 : Math.sin(w.phase) * 0.3;
        w.x += bend;
        if (w.y < innerHeight * 0.18) { w.y = innerHeight * (0.65 + Math.random() * 0.3); w.x = innerWidth / 2 + (Math.random() - 0.5) * 120; }
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,160,190,${w.a})`;
        ctx.fill();
      }
    };
    requestAnimationFrame(frame);
  }

  _stopSmoke() {
    if (!this._smoke) return;
    this._smoke.dead = true;
    this._smoke = null;
    const canvas = document.getElementById('smoke');
    canvas.classList.remove('on');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  // ── Dust — ash motes, always alive once the reader enters ────────────────

  startDust() {
    if (this._dust) return;
    const canvas = document.getElementById('dust');
    const ctx = canvas.getContext('2d');
    let w, h;
    const size = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
    size();
    addEventListener('resize', size);
    const motes = Array.from({ length: 36 }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: 0.5 + Math.random() * 1.3,
      vy: -(2 + Math.random() * 5) / 24,
      drift: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      a: 0.06 + Math.random() * 0.1,
    }));
    let ink = [216, 220, 224];
    this._dust = { setInk: (rgb) => { ink = rgb; }, dead: false };
    let last = 0;
    const frame = (t) => {
      if (this._dust.dead) return;
      requestAnimationFrame(frame);
      if (t - last < 41 || document.hidden) return;
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y += m.vy;
        m.phase += 0.008;
        m.x += Math.sin(m.phase) * m.drift * 0.3;
        if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
        if (m.x < -4) m.x = w + 4; else if (m.x > w + 4) m.x = -4;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},${m.a})`;
        ctx.fill();
      }
    };
    requestAnimationFrame(frame);
  }

  setDustInk(hex) {
    if (!this._dust) return;
    const n = parseInt(hex.slice(1), 16);
    this._dust.setInk([(n >> 16) & 255, (n >> 8) & 255, n & 255]);
  }
}
