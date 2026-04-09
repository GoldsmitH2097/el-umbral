/**
 * TiznoTease.js
 * Hollow Knight style peek element. Bounces at bottom, reveals panel on click.
 * Synthetic laugh via Web Audio on first reveal.
 */

export class TiznoTease {
  constructor() {
    this._tease    = document.getElementById('tizno-tease');
    this._panel    = document.getElementById('tizno-panel');
    this._closeBtn = document.getElementById('tizno-panel-close');
    this._open     = false;
    this._laughed  = false;
    this._audioCtx = null;
  }

  init() {
    if (!this._tease) return;
    this._tease.classList.add('visible');
    this._tease.addEventListener('click',   () => this.toggle());
    this._tease.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') this.toggle(); });
    this._closeBtn?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => { if(e.key==='Escape' && this._open) this.close(); });
    // Click outside panel closes it
    this._panel?.addEventListener('click', e => { if(e.target===this._panel) this.close(); });
  }

  toggle() {
    this._open ? this.close() : this.open();
  }

  open() {
    this._open = true;
    this._panel?.classList.add('open');
    this._tease.style.animationPlayState = 'paused';
    document.body.style.overflow = 'hidden';
    if (!this._laughed) {
      this._laughed = true;
      this._playLaugh();
    }
    setTimeout(()=>{ this._closeBtn?.focus(); }, 100);
  }

  close() {
    this._open = false;
    this._panel?.classList.remove('open');
    this._tease.style.animationPlayState = '';
    document.body.style.overflow = '';
    this._tease?.focus();
  }

  /** Returns viewport position of Tizno for firefly targeting */
  getPosition() {
    const r = this._tease?.getBoundingClientRect();
    if (!r) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  isOpen() { return this._open; }

  /**
   * Synthetic laugh — 3 short descending oscillator pulses.
   * Sounds like a small creature going "heh... heh... heh"
   */
  _playLaugh() {
    try {
      if (!this._audioCtx) {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const pulses = [
        { t: 0,    freq: 480, endFreq: 280, vol: 0.08 },
        { t: 0.14, freq: 420, endFreq: 240, vol: 0.07 },
        { t: 0.28, freq: 360, endFreq: 200, vol: 0.06 },
      ];

      pulses.forEach(p => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        // Slight distortion — makes it sound less clean, more creature-like
        const wave = ctx.createWaveShaper();
        wave.curve = _makeDistortionCurve(30);

        osc.connect(wave); wave.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, ctx.currentTime + p.t);
        osc.frequency.exponentialRampToValueAtTime(p.endFreq, ctx.currentTime + p.t + 0.1);
        gain.gain.setValueAtTime(p.vol, ctx.currentTime + p.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + p.t + 0.13);
        osc.start(ctx.currentTime + p.t);
        osc.stop(ctx.currentTime + p.t + 0.15);
      });
    } catch(e) {
      // AudioContext unavailable — silent fail
    }
  }
}

function _makeDistortionCurve(amount) {
  const n = 256, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}
