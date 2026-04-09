/**
 * TiznoTease.js
 * Hollow Knight style peek element. Bounces at bottom, reveals panel on click.
 * Echoey laugh via Web Audio on first open.
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
    this._panel?.addEventListener('click', e => { if(e.target===this._panel) this.close(); });
    this._startIrregularBlink();
  }

  /** Irregular async blink — slightly offset between eyes, random interval */
  _startIrregularBlink() {
    const eyes = this._tease?.querySelectorAll('.tizno-eye');
    if (!eyes?.length) return;
    const doBlink = () => {
      // Left eye blinks slightly before right (0–60ms offset)
      const offset = Math.floor(Math.random() * 60);
      eyes[0].classList.add('blink');
      setTimeout(() => { eyes[1].classList.add('blink'); }, offset);
      // Open after ~160ms
      setTimeout(() => {
        eyes[0].classList.remove('blink');
        eyes[1].classList.remove('blink');
      }, 160);
      // Next blink: 1.2s – 3.8s (irregular)
      setTimeout(doBlink, 1200 + Math.random() * 2600);
    };
    // Start after random initial delay
    setTimeout(doBlink, 800 + Math.random() * 1200);
  }

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this._panel?.classList.add('open');
    this._tease.style.animationPlayState = 'paused';
    document.body.style.overflow = 'hidden';
    if (!this._laughed) {
      this._laughed = true;
      this._playEchoLaugh();
    }
    setTimeout(()=>{ this._closeBtn?.focus(); }, 150);
  }

  close() {
    this._open = false;
    this._panel?.classList.remove('open');
    this._tease.style.animationPlayState = '';
    document.body.style.overflow = '';
    this._tease?.focus();
  }

  getPosition() {
    const r = this._tease?.getBoundingClientRect();
    if (!r) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  isOpen() { return this._open; }

  /**
   * Echoey laugh — creature-like chuckle with reverb tail.
   * Three pulses + a fading echo chain using delay nodes.
   */
  _playEchoLaugh() {
    try {
      if (!this._audioCtx) {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      // Delay node for echo effect
      const delay1 = ctx.createDelay(1.0);
      const delay2 = ctx.createDelay(1.0);
      delay1.delayTime.value = 0.22;
      delay2.delayTime.value = 0.44;

      const feedbackGain1 = ctx.createGain();
      const feedbackGain2 = ctx.createGain();
      feedbackGain1.gain.value = 0.35;
      feedbackGain2.gain.value = 0.18;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;

      // Low-pass for warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      // Routing: source → filter → delay1 → delay2 → master → out
      filter.connect(delay1);
      delay1.connect(feedbackGain1);
      feedbackGain1.connect(delay1); // feedback loop 1
      delay1.connect(delay2);
      delay2.connect(feedbackGain2);
      feedbackGain2.connect(delay2); // feedback loop 2
      delay1.connect(masterGain);
      delay2.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Three laugh pulses
      const pulses = [
        { t: 0,    f: 520, fe: 300, vol: 0.11 },
        { t: 0.16, f: 460, fe: 260, vol: 0.09 },
        { t: 0.32, f: 400, fe: 220, vol: 0.07 },
      ];

      pulses.forEach(p => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        const dist = ctx.createWaveShaper();
        dist.curve = _distCurve(40);

        osc.connect(dist); dist.connect(gain); gain.connect(filter);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.f, ctx.currentTime + p.t);
        osc.frequency.exponentialRampToValueAtTime(p.fe, ctx.currentTime + p.t + 0.12);
        gain.gain.setValueAtTime(p.vol, ctx.currentTime + p.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + p.t + 0.15);
        osc.start(ctx.currentTime + p.t);
        osc.stop(ctx.currentTime + p.t + 0.18);
      });

      // Auto-fade master after 1.5s (echo tail decays)
      masterGain.gain.setValueAtTime(0.7, ctx.currentTime + 1.0);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);
    } catch(_) {}
  }
}

function _distCurve(amount) {
  const n = 256, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}
