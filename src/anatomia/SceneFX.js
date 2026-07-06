// SceneFX.js — environment layer. Spec: ENGINEERING.md §6.
// Phase 1 set: close-in, blackout. Others are stubs that no-op gracefully
// (logged in dev) so the score can reference them today — Phase 2 fills them in.

export class SceneFX {
  constructor() {
    this._vignette = document.getElementById('vignette');
    this._blackout = document.getElementById('blackout');
    this._redwash = document.getElementById('redwash');
    this._figura = document.getElementById('figura');
    this._whiteflash = document.getElementById('whiteflash');
    this._zippo = document.getElementById('zippo-glow');
    this._dust = null;
  }

  /** Ash motes drifting in the dark — always on once the reader enters.
      Cheap: ≤36 particles at 24 fps, paused when the tab is hidden. */
  startDust() {
    if (this._dust) return;
    const canvas = document.getElementById('dust');
    const ctx = canvas.getContext('2d');
    let w, h;
    const size = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
    size();
    addEventListener('resize', size);

    const N = 36;
    const motes = Array.from({ length: N }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: 0.5 + Math.random() * 1.3,
      vy: -(2 + Math.random() * 5) / 24,       // px per frame at 24 fps — slow ascent
      drift: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      a: 0.06 + Math.random() * 0.1,
    }));

    let ink = [216, 220, 224];
    this._dust = {
      setInk: (rgb) => { ink = rgb; },
      stop: () => { this._dust.dead = true; },
      dead: false,
    };

    let last = 0;
    const frame = (t) => {
      if (this._dust.dead) return;
      requestAnimationFrame(frame);
      if (t - last < 41 || document.hidden) return;  // ~24 fps
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

  /** Dust motes take the floor's ink color (dark motes on the pale epilogue). */
  setDustInk(hex) {
    if (!this._dust) return;
    const n = parseInt(hex.slice(1), 16);
    this._dust.setInk([(n >> 16) & 255, (n >> 8) & 255, n & 255]);
  }

  trigger(name) {
    switch (name) {
      case 'close-in': this._vignette.classList.add('on'); break;
      case 'blackout': /* engine drives floor transitions itself */ break;
      case 'red-on': this._redwash.classList.add('on'); break;
      case 'red-off': this._redwash.classList.remove('on'); break;
      case 'figura-on': this._figura.classList.add('on'); break;
      case 'figura-close': this._figura.classList.add('on', 'close'); break;
      case 'figura-off': this._figura.classList.remove('on', 'close'); break;
      default:
        if (import.meta.env.DEV) console.debug(`[anatomia] scene "${name}" pending Phase 2`);
    }
  }

  /** Floor transition: fade to black, run swap while hidden, fade back. */
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

  /** Reset per-floor layers (vignette persists only within its floor). */
  resetFloorLayers() {
    this._vignette.classList.remove('on', 'reflejo');
    this._redwash.classList.remove('on');
    this._figura.classList.remove('on', 'close');
    this._zippo.classList.remove('on');
  }
}
