// AnatomiaAudio.js — synthesized ambience + SFX. Spec: ENGINEERING.md §7.
// Follows AudioEngine.js patterns (see CLAUDE.md iOS constraints):
//  - context created + resumed synchronously inside the ENTRAR gesture handler
//  - navigator.audioSession playback hint for the iOS mute switch
//  - Page Visibility suspend/resume; looping noise sources restarted on resume
// Phase 1: void-static ambience + master mute. SFX cues log-and-skip until Phase 2.

export class AnatomiaAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this._ambienceGain = null;
    this._noiseSrc = null;
    this._droneOsc = null;
    this._droneOsc2 = null;
    this._lfo = null;
    this._swellTimer = null;
    this.muted = false;
    this._currentAmbience = null;
  }

  /** Must be called synchronously from a user gesture (the ENTRAR click). */
  init() {
    if (this.ctx) { this._resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
      this._ambienceGain = this.ctx.createGain();
      this._ambienceGain.gain.value = 0;
      this._ambienceGain.connect(this.master);
      this.ctx.resume().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) this.ctx.suspend().catch(() => {});
        else this._resume();
      });
    } catch (_) { /* audio is an enhancement, never a blocker */ }
  }

  _resume() {
    if (!this.ctx) return;
    this.ctx.resume().then(() => {
      // iOS drops looping buffer sources across suspend — rebuild the bed.
      if (this._currentAmbience) this.setAmbience(this._currentAmbience, true);
    }).catch(() => {});
  }

  toggleMute() {
    if (!this.ctx) return this.muted;
    this.muted = !this.muted;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.1);
    return this.muted;
  }

  /** Crossfade to a named ambience preset. One shared recipe, tuned per floor
      Phase 2 differentiates fully; the bed must feel DESIGNED, not like static:
      drones dominate, noise is a whisper underneath, and the building takes a
      slow breath every ~20 s. */
  setAmbience(name, force = false) {
    if (!this.ctx) return;
    if (name === this._currentAmbience && !force) return;
    this._currentAmbience = name;
    this._stopBed();
    this._buildBed(0.02);
  }

  _buildBed(targetGain) {
    const ctx = this.ctx, now = ctx.currentTime;
    // A whisper of brown noise, heavily lowpassed — texture, not hiss
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    this._noiseSrc = ctx.createBufferSource();
    this._noiseSrc.buffer = buf; this._noiseSrc.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 140;
    const noiseGain = ctx.createGain(); noiseGain.gain.value = 0.35;
    this._noiseSrc.connect(lp); lp.connect(noiseGain); noiseGain.connect(this._ambienceGain);
    this._noiseSrc.start();

    // Two deep drones a hair apart — the ~0.7 Hz beating is the room's pulse
    this._droneOsc = ctx.createOscillator();
    this._droneOsc.type = 'sine'; this._droneOsc.frequency.value = 55;
    this._droneOsc2 = ctx.createOscillator();
    this._droneOsc2.type = 'sine'; this._droneOsc2.frequency.value = 55.7;
    const droneGain = ctx.createGain(); droneGain.gain.value = 0.5;
    this._lfo = ctx.createOscillator();
    this._lfo.frequency.value = 1 / 13;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 2;
    this._lfo.connect(lfoGain); lfoGain.connect(this._droneOsc.frequency);
    this._droneOsc.connect(droneGain);
    this._droneOsc2.connect(droneGain);
    droneGain.connect(this._ambienceGain);
    this._droneOsc.start(); this._droneOsc2.start(); this._lfo.start();

    this._ambienceGain.gain.setTargetAtTime(targetGain, now, 2.5);

    // The building breathes: a soft filtered swell every 14–26 s
    const swell = () => {
      if (!this.ctx || this._noiseSrc === null) return;
      const c = this.ctx, t = c.currentTime;
      const src = c.createBufferSource();
      src.buffer = buf; src.loop = true;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 280; bp.Q.value = 0.6;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.018, t + 2.8);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 6.5);
      src.connect(bp); bp.connect(g); g.connect(this._ambienceGain);
      src.start(); src.stop(t + 7);
      this._swellTimer = setTimeout(swell, 14000 + Math.random() * 12000);
    };
    this._swellTimer = setTimeout(swell, 6000 + Math.random() * 6000);
  }

  _stopBed() {
    const kill = (node) => { try { node?.stop(); } catch (_) {} };
    clearTimeout(this._swellTimer);
    if (this.ctx && this._ambienceGain) {
      this._ambienceGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.8);
    }
    const olds = [this._noiseSrc, this._droneOsc, this._droneOsc2, this._lfo];
    setTimeout(() => olds.forEach(kill), 2500);
    this._noiseSrc = this._droneOsc = this._droneOsc2 = this._lfo = null;
  }

  /** SFX cues — Phase 2. Logged so score annotations are visibly wired. */
  play(cue) {
    if (import.meta.env.DEV) console.debug(`[anatomia] sfx "${cue}" pending Phase 2`);
  }
}
