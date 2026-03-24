import { state } from '../core/StateManager.js';

const CHAR_FREQUENCIES = [130.81, 155.56, 196.00, 233.08];

export class AudioEngine {
  constructor() {
    this.audioCtx = null; this.fireGain = null; this.windGain = null;
    this.windFilter = null; this.masterDelay = null; this.masterFeedback = null;
    this.awakeningLFO = null; this.awakeningOscillators = []; this.initialized = false;
    this._awakeningActive = false;
    this._windInterval = null; // Captured for clean teardown on scene 4
    document.addEventListener('visibilitychange', () => {
      if (!this.audioCtx) return;
      document.hidden ? this.audioCtx.suspend() : this.audioCtx.resume();
    });
  }

  init() {
    if (this.initialized || this._initializing) return;
    this._initializing = true;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // iOS WebKit audio unlock — must all happen synchronously in the gesture handler.
      //
      // Step 1: Play a silent buffer. This activates the iOS audio session immediately.
      // It must happen synchronously before any other audio work.
      const unlock = this.audioCtx.createBuffer(1, 1, 22050);
      const unlockSrc = this.audioCtx.createBufferSource();
      unlockSrc.buffer = unlock;
      unlockSrc.connect(this.audioCtx.destination);
      unlockSrc.start(0);

      // Step 2: Build graph and start looping sources SYNCHRONOUSLY.
      // BufferSourceNodes started while context is 'suspended' queue up correctly
      // and play the moment resume() resolves. They must NOT be started in a Promise
      // callback — that runs outside the gesture window and iOS silently drops them.
      this._buildGraph();
      this._scheduleDroplet();
      this._scheduleWhisperBreath();
      this.initialized = true;
      this._initializing = false;

      // Step 3: Resume — kick off asynchronously. Queued sources play when it resolves.
      if (this.audioCtx.state !== 'running') {
        this.audioCtx.resume().catch(() => {});
      }

    } catch(e) {
      console.warn('[AudioEngine] blocked', e);
      this._initializing = false;
    }
  }

  _buildGraph() {
    const ctx = this.audioCtx;
    this.masterDelay = ctx.createDelay(); this.masterDelay.delayTime.value = 0.5;
    this.masterFeedback = ctx.createGain(); this.masterFeedback.gain.value = 0.6;
    const caveFilter = ctx.createBiquadFilter(); caveFilter.type = 'lowpass'; caveFilter.frequency.value = 800;
    this.masterDelay.connect(caveFilter); caveFilter.connect(this.masterFeedback);
    this.masterFeedback.connect(this.masterDelay); this.masterDelay.connect(ctx.destination);
    const noise = this._createPinkNoise(ctx);
    const fireFilter = ctx.createBiquadFilter(); fireFilter.type = 'lowpass'; fireFilter.frequency.value = 250;
    this.fireGain = ctx.createGain(); this.fireGain.gain.value = 0;
    const fireSrc = ctx.createBufferSource(); fireSrc.buffer = noise; fireSrc.loop = true;
    fireSrc.connect(fireFilter); fireFilter.connect(this.fireGain); this.fireGain.connect(ctx.destination); fireSrc.start();
    this.windFilter = ctx.createBiquadFilter(); this.windFilter.type = 'bandpass'; this.windFilter.frequency.value = 120; this.windFilter.Q.value = 0.8;
    this.windGain = ctx.createGain(); this.windGain.gain.value = 0.015;
    const windSrc = ctx.createBufferSource(); windSrc.buffer = noise; windSrc.loop = true;
    windSrc.connect(this.windFilter); this.windFilter.connect(this.windGain);
    this.windGain.connect(ctx.destination); this.windGain.connect(this.masterDelay); windSrc.start();
    this._windInterval = setInterval(() => { if (this.windGain.gain.value > 0 && !this._awakeningActive) this.windFilter.frequency.setTargetAtTime(80 + Math.random()*200, ctx.currentTime, 4); }, 3000);
  }

  _createPinkNoise(ctx) {
    const size = ctx.sampleRate * 2; const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const out = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < size; i++) { const w = Math.random()*2-1; out[i] = (last + 0.02*w)/1.02; last = out[i]; out[i] *= 3.5; }
    return buf;
  }

  _scheduleDroplet() {
    if (this.audioCtx && !this._awakeningActive && state.activeScene < 4) {
      try {
        const osc = this.audioCtx.createOscillator(), g = this.audioCtx.createGain(), now = this.audioCtx.currentTime;
        osc.type = 'sine'; osc.frequency.setValueAtTime(400+Math.random()*200, now); osc.frequency.exponentialRampToValueAtTime(100, now+0.08);
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.03+Math.random()*0.02, now+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+0.15);
        osc.connect(g); g.connect(this.audioCtx.destination); g.connect(this.masterDelay); osc.start(); osc.stop(now+0.2);
      } catch(_) {}
    }
    setTimeout(() => this._scheduleDroplet(), 4000 + Math.random()*6000);
  }

  emitCrackle() {
    if (!this.audioCtx || Math.random() >= 0.15) return;
    try {
      const size = Math.floor(this.audioCtx.sampleRate*0.01), buf = this.audioCtx.createBuffer(1, size, this.audioCtx.sampleRate);
      const d = buf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      const src = this.audioCtx.createBufferSource(); src.buffer = buf;
      const f = this.audioCtx.createBiquadFilter(); f.type='highpass'; f.frequency.value = 6000+Math.random()*2000;
      const g = this.audioCtx.createGain(), now = this.audioCtx.currentTime;
      g.gain.value = 0.01+Math.random()*0.015; g.gain.exponentialRampToValueAtTime(0.001, now+0.02);
      src.connect(f); f.connect(g); g.connect(this.audioCtx.destination); src.start();
    } catch(_) {}
  }

  _scheduleWhisperBreath() {
    if (this.audioCtx && !this._awakeningActive && state.activeScene < 4) {
      try {
        const ctx = this.audioCtx, size = ctx.sampleRate*2, buf = ctx.createBuffer(1, size, ctx.sampleRate);
        const d = buf.getChannelData(0); for (let i=0;i<size;i++) d[i]=Math.random()*2-1;
        const noise = ctx.createBufferSource(); noise.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type='bandpass'; f.Q.value=2;
        const now = ctx.currentTime;
        f.frequency.setValueAtTime(800+Math.random()*1500, now); f.frequency.exponentialRampToValueAtTime(300, now+2);
        const g = ctx.createGain(); g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.02, now+0.5); g.gain.linearRampToValueAtTime(0, now+2);
        noise.connect(f); f.connect(g); g.connect(ctx.destination); g.connect(this.masterDelay); noise.start();
      } catch(_) {}
    }
    setTimeout(() => this._scheduleWhisperBreath(), 7000+Math.random()*12000);
  }

  playCharacterSignature(index) {
    if (!this.audioCtx) return;
    try {
      const freq = CHAR_FREQUENCIES[index], now = this.audioCtx.currentTime;
      [1,2].forEach(h => {
        const osc = this.audioCtx.createOscillator(), g = this.audioCtx.createGain();
        osc.type = h===1?'triangle':'sine'; osc.frequency.setValueAtTime(freq*h, now);
        const vol = h===1?0.08:0.04;
        g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(vol,now+0.4); g.gain.exponentialRampToValueAtTime(0.001,now+3.5);
        osc.connect(g); g.connect(this.audioCtx.destination); g.connect(this.masterDelay); osc.start(); osc.stop(now+4);
      });
    } catch(_) {}
  }

  playSpinningAwakening() {
    if (!this.audioCtx) return;
    try {
      const ctx = this.audioCtx, now = ctx.currentTime;
      if (this.windGain) this.windGain.gain.setTargetAtTime(0, now, 1);
      let pan = null;
      if (ctx.createStereoPanner) {
        pan = ctx.createStereoPanner();
        this.awakeningLFO = ctx.createOscillator(); this.awakeningLFO.type='sine';
        this.awakeningLFO.frequency.setValueAtTime(0.5,now); this.awakeningLFO.frequency.exponentialRampToValueAtTime(12,now+3);
        this.awakeningLFO.connect(pan.pan); this.awakeningLFO.start();
        pan.connect(ctx.destination); pan.connect(this.masterDelay);
      }
      CHAR_FREQUENCIES.forEach(f => [1,2].forEach(h => {
        const osc=ctx.createOscillator(), g=ctx.createGain();
        osc.type=h===1?'triangle':'sine'; osc.frequency.setValueAtTime(f*h,now);
        g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(0.06,now+2);
        osc.connect(g); pan ? g.connect(pan) : (g.connect(ctx.destination),g.connect(this.masterDelay));
        osc.start(); this.awakeningOscillators.push({osc,gain:g});
      }));
    } catch(_) {}
  }

  playTransitionEcho() {
    if (!this.audioCtx) return;
    try {
      const osc=this.audioCtx.createOscillator(), g=this.audioCtx.createGain(), now=this.audioCtx.currentTime;
      osc.type='triangle'; osc.frequency.setValueAtTime(45+Math.random()*10,now);
      g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(0.5,now+0.1); g.gain.exponentialRampToValueAtTime(0.001,now+0.8);
      osc.connect(g); g.connect(this.masterDelay); osc.start(); osc.stop(now+1.0);
    } catch(_) {}
  }

  setFireVolume(oxygenScale, active) {
    if (!this.audioCtx||!this.fireGain) return;
    this.fireGain.gain.setTargetAtTime(active?0.01+oxygenScale*0.04:0, this.audioCtx.currentTime, active?0.1:0.2);
  }

  setWindVolume(target, tc=3) {
    if (!this.audioCtx||!this.windGain) return;
    this.windGain.gain.setTargetAtTime(target, this.audioCtx.currentTime, tc);
  }

  stopAwakening() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    this.awakeningOscillators.forEach(n => { n.gain.gain.setTargetAtTime(0,now,1.5); setTimeout(()=>{try{n.osc.stop();}catch(_){}},2000); });
    this.awakeningOscillators = [];
    if (this.awakeningLFO) setTimeout(()=>{try{this.awakeningLFO.stop();}catch(_){}},2000);
    if (this.windGain&&this.windFilter) { this.windFilter.frequency.setValueAtTime(60,now); this.windGain.gain.setTargetAtTime(0.005,now,2); }
    if (this._windInterval) { clearInterval(this._windInterval); this._windInterval = null; }
  }

  setAwakening(v) { this._awakeningActive = v; }
  /** iOS Safari: call on every touch. Catches 'suspended' AND 'interrupted' states. */
  resumeIfSuspended() {
    if (this.audioCtx && this.audioCtx.state !== 'running') {
      return this.audioCtx.resume().catch(() => {});
    }
    return Promise.resolve();
  }
  get isReady() { return this.initialized; }
}
