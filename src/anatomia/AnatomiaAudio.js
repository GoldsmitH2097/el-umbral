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
    this._lfo = null;
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

  /** Crossfade to a named ambience preset. Phase 1 implements void-static;
      unknown presets reuse it at lower gain (a bed is better than silence). */
  setAmbience(name, force = false) {
    if (!this.ctx) return;
    if (name === this._currentAmbience && !force) return;
    this._currentAmbience = name;
    this._stopBed();
    const gain = name === 'void-static' ? 0.028 : 0.018;
    this._buildBed(gain);
  }

  _buildBed(targetGain) {
    const ctx = this.ctx, now = ctx.currentTime;
    // Brown noise → lowpass: the void's floor tone
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
    lp.type = 'lowpass'; lp.frequency.value = 220;
    this._noiseSrc.connect(lp); lp.connect(this._ambienceGain);
    this._noiseSrc.start();
    // Sub drone with slow wander
    this._droneOsc = ctx.createOscillator();
    this._droneOsc.type = 'sine'; this._droneOsc.frequency.value = 38;
    const droneGain = ctx.createGain(); droneGain.gain.value = 0.4;
    this._lfo = ctx.createOscillator();
    this._lfo.frequency.value = 1 / 9;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 3;
    this._lfo.connect(lfoGain); lfoGain.connect(this._droneOsc.frequency);
    this._droneOsc.connect(droneGain); droneGain.connect(this._ambienceGain);
    this._droneOsc.start(); this._lfo.start();
    this._ambienceGain.gain.setTargetAtTime(targetGain, now, 2);
  }

  _stopBed() {
    const kill = (node) => { try { node?.stop(); } catch (_) {} };
    if (this.ctx && this._ambienceGain) {
      this._ambienceGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.8);
    }
    const oldNoise = this._noiseSrc, oldDrone = this._droneOsc, oldLfo = this._lfo;
    setTimeout(() => { kill(oldNoise); kill(oldDrone); kill(oldLfo); }, 2500);
    this._noiseSrc = this._droneOsc = this._lfo = null;
  }

  /** SFX cues — Phase 2. Logged so score annotations are visibly wired. */
  play(cue) {
    if (import.meta.env.DEV) console.debug(`[anatomia] sfx "${cue}" pending Phase 2`);
  }
}
