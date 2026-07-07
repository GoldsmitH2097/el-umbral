// AnatomiaAudio.js — synthesized ambience + SFX. Spec: ENGINEERING.md §7.
// Phase 2: full palette. Everything synthesized (AudioEngine.js patterns);
// the only pre-recorded audio will be the Phase-3 voiceover.
// iOS: context created + resumed synchronously in the ENTRAR gesture;
// looping sources restarted after visibility resume.

// Per-floor ambience recipes. All share the bed architecture (noise whisper +
// beating drones + breath swells); parameters give each floor its own air.
const AMBIENCES = {
  'void-static':      { noise: 0.35, lp: 140, dA: 55,  dB: 55.7, swell: 0.018, extra: null },
  'casa-madrugada':   { noise: 0.2,  lp: 120, dA: 49,  dB: 49.4, swell: 0.010, extra: null },
  'vestibulo-lluvia': { noise: 0.3,  lp: 160, dA: 52,  dB: 52.6, swell: 0.014, extra: 'rain' },
  'corredor':         { noise: 0.28, lp: 130, dA: 47,  dB: 47.5, swell: 0.012, extra: 'wind' },
  'escalera-profunda':{ noise: 0.3,  lp: 110, dA: 41,  dB: 41.6, swell: 0.016, extra: 'gear' },
  'escalera-espiral': { noise: 0.3,  lp: 110, dA: 41,  dB: 41.8, swell: 0.016, extra: 'creaks' },
  'interior-humedo':  { noise: 0.32, lp: 150, dA: 50,  dB: 50.5, swell: 0.014, extra: 'drips' },
  'casa-exacta':      { noise: 0.18, lp: 120, dA: 50,  dB: 50.0, swell: 0.008, extra: 'mains' },
  'edificio-vivo':    { noise: 0.34, lp: 130, dA: 44,  dB: 44.9, swell: 0.026, extra: null },
  'silencio-residual':{ noise: 0.08, lp: 100, dA: 30,  dB: 30.2, swell: 0.004, extra: null },
};

export class AnatomiaAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this._ambienceGain = null;
    this._sfxGain = null;
    this._bedNodes = [];
    this._bedTimers = [];
    this._loops = {}; // named loops: mecedora, columpio
    this.muted = false;
    this._currentAmbience = null;
    this._noiseBuf = null;
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
      this._sfxGain = this.ctx.createGain();
      this._sfxGain.gain.value = 1;
      this._sfxGain.connect(this.master);
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
      if (this._currentAmbience) this.setAmbience(this._currentAmbience, true);
    }).catch(() => {});
  }

  toggleMute() {
    if (!this.ctx) return this.muted;
    this.muted = !this.muted;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.1);
    return this.muted;
  }

  /** "El último sonido no es un grito." — everything ducks to nothing. */
  duckAll(tc = 0.8) {
    if (!this.ctx) return;
    this._ambienceGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, tc);
    Object.values(this._loops).forEach(l => l.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, tc));
  }

  /** Silence except one named loop (the swing, alone in the garden). */
  duckAllExcept(name, tc = 0.8) {
    this.duckAll(tc);
    const keep = this._loops[name];
    if (keep) keep.gain.gain.setTargetAtTime(keep.baseGain, this.ctx.currentTime, tc);
  }

  /** "Hubo un tiempo…" — the room holds its breath for a memory, then returns. */
  breathe(ms = 3000) {
    if (!this.ctx) return;
    this._ambienceGain.gain.setTargetAtTime(0.004, this.ctx.currentTime, 0.7);
    setTimeout(() => {
      if (this.ctx) this._ambienceGain.gain.setTargetAtTime(0.02, this.ctx.currentTime, 1.5);
    }, ms);
  }

  // ── Ambience ──────────────────────────────────────────────────────────────

  setAmbience(name, force = false) {
    if (!this.ctx) return;
    if (name === this._currentAmbience && !force) return;
    this._currentAmbience = name;
    this._stopBed();
    this._buildBed(AMBIENCES[name] || AMBIENCES['void-static']);
  }

  _noise() {
    if (this._noiseBuf) return this._noiseBuf;
    const len = this.ctx.sampleRate * 4;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    }
    this._noiseBuf = buf;
    return buf;
  }

  _keep(node) { this._bedNodes.push(node); return node; }

  _buildBed(cfg) {
    const ctx = this.ctx, now = ctx.currentTime;
    const buf = this._noise();

    const noiseSrc = this._keep(ctx.createBufferSource());
    noiseSrc.buffer = buf; noiseSrc.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = cfg.lp;
    const nGain = ctx.createGain(); nGain.gain.value = cfg.noise;
    noiseSrc.connect(lp); lp.connect(nGain); nGain.connect(this._ambienceGain);
    noiseSrc.start();

    const dA = this._keep(ctx.createOscillator());
    dA.type = 'sine'; dA.frequency.value = cfg.dA;
    const dB = this._keep(ctx.createOscillator());
    dB.type = 'sine'; dB.frequency.value = cfg.dB;
    const dGain = ctx.createGain(); dGain.gain.value = 0.5;
    const lfo = this._keep(ctx.createOscillator());
    lfo.frequency.value = 1 / 13;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 2;
    lfo.connect(lfoGain); lfoGain.connect(dA.frequency);
    dA.connect(dGain); dB.connect(dGain); dGain.connect(this._ambienceGain);
    dA.start(); dB.start(); lfo.start();

    this._ambienceGain.gain.setTargetAtTime(0.02, now, 2.5);

    // The building breathes
    const swell = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 280; bp.Q.value = 0.6;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(cfg.swell, t + 2.8);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 6.5);
      src.connect(bp); bp.connect(g); g.connect(this._ambienceGain);
      src.start(); src.stop(t + 7);
      this._bedTimers.push(setTimeout(swell, 14000 + Math.random() * 12000));
    };
    this._bedTimers.push(setTimeout(swell, 6000 + Math.random() * 6000));

    // Per-floor extra layer
    switch (cfg.extra) {
      case 'rain': {
        const r = this._keep(ctx.createBufferSource());
        r.buffer = buf; r.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.4;
        const g = ctx.createGain(); g.gain.value = 0.35;
        r.connect(bp); bp.connect(g); g.connect(this._ambienceGain);
        r.start();
        break;
      }
      case 'wind': {
        const wSrc = this._keep(ctx.createBufferSource());
        wSrc.buffer = buf; wSrc.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 1.2;
        const g = ctx.createGain(); g.gain.value = 0.2;
        const gustLfo = this._keep(ctx.createOscillator());
        gustLfo.frequency.value = 1 / 7;
        const gustGain = ctx.createGain(); gustGain.gain.value = 0.12;
        gustLfo.connect(gustGain); gustGain.connect(g.gain);
        wSrc.connect(bp); bp.connect(g); g.connect(this._ambienceGain);
        wSrc.start(); gustLfo.start();
        break;
      }
      case 'gear': {
        const gOsc = this._keep(ctx.createOscillator());
        gOsc.type = 'sine'; gOsc.frequency.value = 31;
        const am = this._keep(ctx.createOscillator());
        am.frequency.value = 0.4;
        const amGain = ctx.createGain(); amGain.gain.value = 0.25;
        const gg = ctx.createGain(); gg.gain.value = 0.3;
        am.connect(amGain); amGain.connect(gg.gain);
        gOsc.connect(gg); gg.connect(this._ambienceGain);
        gOsc.start(); am.start();
        break;
      }
      case 'creaks': {
        const creak = () => {
          this.play('crujido', 0.35);
          this._bedTimers.push(setTimeout(creak, 9000 + Math.random() * 5000));
        };
        this._bedTimers.push(setTimeout(creak, 5000));
        break;
      }
      case 'drips': {
        const drip = () => {
          const t = this.ctx.currentTime;
          const o = this.ctx.createOscillator();
          o.frequency.setValueAtTime(1300 + Math.random() * 600, t);
          o.frequency.exponentialRampToValueAtTime(500, t + 0.09);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.015, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
          const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
          if (pan) { pan.pan.value = Math.random() * 1.6 - 0.8; o.connect(g); g.connect(pan); pan.connect(this._ambienceGain); }
          else { o.connect(g); g.connect(this._ambienceGain); }
          o.start(); o.stop(t + 0.45);
          this._bedTimers.push(setTimeout(drip, 4000 + Math.random() * 9000));
        };
        this._bedTimers.push(setTimeout(drip, 3000));
        break;
      }
      case 'mains': {
        const hum = this._keep(ctx.createOscillator());
        hum.frequency.value = 50;
        const hg = ctx.createGain(); hg.gain.value = 0.12;
        hum.connect(hg); hg.connect(this._ambienceGain);
        hum.start();
        break;
      }
    }
  }

  _stopBed() {
    this._bedTimers.forEach(clearTimeout);
    this._bedTimers = [];
    if (this.ctx && this._ambienceGain) {
      this._ambienceGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.8);
    }
    const olds = this._bedNodes;
    this._bedNodes = [];
    setTimeout(() => olds.forEach(n => { try { n.stop(); } catch (_) {} }), 2500);
    Object.values(this._loops).forEach(l => { try { l.src.stop(); } catch (_) {} clearInterval(l.timer); });
    this._loops = {};
  }

  // ── SFX — one small synth per cue ─────────────────────────────────────────

  play(cue, gainScale = 1) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    switch (cue) {
      case 'timbre':      this._doorbell(t, 0.06 * gainScale, false); break;
      case 'timbre-dead': this._doorbell(t, 0.03 * gainScale, true); break;
      case 'tick':        this._tick(t, 0.035); break;
      case 'tick-stop':   this._tick(t, 0.035); break; // one tick. never two.
      case 'rain': case 'wind': case 'gear': case 'hum': break; // ambience carries these
      case 'gate':        this._thump(t, 180, 0.5, 0.05, 'square'); this._noiseBurst(t, 900, 0.25, 0.03); break;
      case 'steps':       [0, 0.42, 0.86, 1.32].forEach(d => this._thump(t + d, 70, 0.18, 0.03)); break;
      case 'heartbeat-soft': this._heart(t, 0.02 * gainScale); break;
      case 'heartbeat':      this._heart(t, 0.05 * gainScale); break;
      case 'breath-fail-soft': this._breathFail(t, 0.02); break;
      case 'breath-fail':      this._breathFail(t, 0.035); break;
      case 'breath-in-fail':   this._breathSwell(t, true, 0.03); break;
      case 'breath-out-fail':  this._breathSwell(t, false, 0.03); break;
      case 'door':        this._creakSweep(t, 400, 900, 0.7, 0.04); break;
      case 'creak-door':  this._creakSweep(t, 300, 1100, 0.9, 0.05); break;
      case 'knock':       [0, 0.25, 0.5].forEach(d => this._thump(t + d, 110, 0.12, 0.05)); break;
      case 'zippo':       this._tick(t, 0.05); this._noiseBurst(t + 0.04, 2400, 0.3, 0.03); break;
      case 'extinguish':  this._noiseBurst(t, 1800, 0.2, 0.025, true); break;
      case 'crujido':     this._creakSweep(t, 200, 420, 0.5, 0.035 * gainScale); break;
      case 'tos':         [0, 0.35].forEach(d => this._noiseBurst(t + d, 300, 0.14, 0.015)); break;
      case 'intento':     this._intento(t); break;
      case 'mecedora':    this._startLoop('mecedora', 2.8, 0.03); break;
      case 'columpio':    this._startLoop('columpio', 3.6, 0.025); break;
      // ── Prologue art pass (v2: all cues dark, filtered, textural) ──
      case 'toques': // four muffled wooden taps under the UI-gesture words
        [0.6, 1.6, 3.2, 4.1].forEach(d => this._tick(t + d, 0.022));
        break;
      case 'tic-seco': this._tick(t + 0.3, 0.028); break; // habit: one dry tick
      case 'campana': { // the frosted cowbell: a dead gong, all lowpass, no shine
        const o = this.ctx.createOscillator();
        o.frequency.setValueAtTime(196, t);
        o.frequency.exponentialRampToValueAtTime(182, t + 2.4);
        const o2 = this.ctx.createOscillator();
        o2.frequency.value = 274; // rough, inharmonic partner
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 340;
        const gn = this.ctx.createGain();
        gn.gain.setValueAtTime(0.035, t);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
        o.connect(lp); o2.connect(lp); lp.connect(gn); gn.connect(this._sfxGain);
        this._noiseBurst(t, 500, 0.09, 0.02); // the strike, muffled
        o.start(t); o2.start(t); o.stop(t + 2.7); o2.stop(t + 2.7);
        break;
      }
      case 'roces': // three tiny scratches as the text corrects itself
        [0.4, 0.65, 0.9].forEach(d => this._creakSweep(t + d, 900, 500, 0.07, 0.012));
        break;
      case 'thud':  this._thump(t, 45, 0.35, 0.07); break; // the stone weight
      case 'scrape': this._creakSweep(t, 320, 170, 0.4, 0.03); break; // fricción
      case 'iface-hum': { // the luminous coffin hums — low dyad, no melody
        [90, 181].forEach(f => {
          const o = this.ctx.createOscillator();
          o.frequency.value = f;
          const gn = this.ctx.createGain();
          gn.gain.setValueAtTime(0.0001, t);
          gn.gain.exponentialRampToValueAtTime(0.009, t + 0.4);
          gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
          o.connect(gn); gn.connect(this._sfxGain);
          o.start(t); o.stop(t + 1.7);
        });
        break;
      }
      case 'sub': this._thump(t, 36, 0.3, 0.05); break; // the singularity feeds
      default:
        if (import.meta.env.DEV) console.debug(`[anatomia] sfx "${cue}" unmapped`);
    }
  }

  // A tick with no pitch: a muffled wooden click, not a beep. (Ruben: sounds
  // must never read as Game Boy — everything filtered, dark, textural.)
  _tick(t, g) {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 780; bp.Q.value = 4;
    const gn = this.ctx.createGain();
    gn.gain.setValueAtTime(g * 1.6, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    src.connect(bp); bp.connect(gn); gn.connect(this._sfxGain);
    src.start(t); src.stop(t + 0.05);
  }

  _thump(t, freq, dur, g, type = 'sine') {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.5), t + dur);
    const gn = this.ctx.createGain();
    gn.gain.setValueAtTime(g, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(this._sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // A real electric door buzzer, not a chiptune beep. Two detuned reeds around
  // 230 Hz, amplitude-modulated at ~52 Hz (the armature clapper), a bandpass
  // body, and a click of mechanical rattle at the strike. "No suena. Irrumpe."
  // `dead` = the muffled, resonance-robbed version (a buzzer through a wall).
  _doorbell(t, g, dead = false) {
    const dur = 0.85;
    const reedA = this.ctx.createOscillator();
    reedA.type = 'sawtooth'; reedA.frequency.value = dead ? 190 : 232;
    const reedB = this.ctx.createOscillator();
    reedB.type = 'sawtooth'; reedB.frequency.value = dead ? 193 : 236; // beating
    // Mechanical clapper: AM at ~52 Hz gives the classic angry-buzzer rasp.
    const am = this.ctx.createOscillator();
    am.type = 'square'; am.frequency.value = dead ? 44 : 52;
    const amDepth = this.ctx.createGain(); amDepth.gain.value = 0.5;
    const amBase = this.ctx.createGain(); amBase.gain.value = 0.5;
    const amSum = this.ctx.createGain();
    am.connect(amDepth); amDepth.connect(amSum.gain);
    amBase.connect(amSum.gain); // amSum.gain oscillates 0..1 around 0.5
    // constant source to bias the AM (WebAudio: use a DC via buffer)
    const dc = this.ctx.createConstantSource(); dc.offset.value = 1; dc.connect(amBase);
    const body = this.ctx.createBiquadFilter();
    body.type = 'bandpass'; body.frequency.value = dead ? 520 : 780; body.Q.value = dead ? 2 : 4.5;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(g, t + 0.012); // sharp attack — it bursts in
    env.gain.setValueAtTime(g, t + dur - 0.12);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    reedA.connect(amSum); reedB.connect(amSum);
    amSum.connect(body); body.connect(env); env.connect(this._sfxGain);
    reedA.start(t); reedB.start(t); am.start(t); dc.start(t);
    reedA.stop(t + dur); reedB.stop(t + dur); am.stop(t + dur); dc.stop(t + dur);
    // the strike rattle
    this._noiseBurst(t, dead ? 600 : 1400, 0.05, dead ? 0.015 : 0.03);
  }

  _buzz(t, freq, dur, g, lpFreq = 4000) {
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = freq;
    const sh = this.ctx.createWaveShaper();
    const curve = new Float32Array(64);
    for (let i = 0; i < 64; i++) curve[i] = Math.tanh((i / 32 - 1) * 3);
    sh.curve = curve;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = lpFreq;
    const gn = this.ctx.createGain();
    gn.gain.setValueAtTime(g, t);
    gn.gain.setValueAtTime(g, t + dur - 0.08);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(sh); sh.connect(lp); lp.connect(gn); gn.connect(this._sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  }

  _noiseBurst(t, bpFreq, dur, g, reverse = false) {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = bpFreq; bp.Q.value = 1;
    const gn = this.ctx.createGain();
    if (reverse) {
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(g, t + dur * 0.8);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    } else {
      gn.gain.setValueAtTime(g, t);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    src.connect(bp); bp.connect(gn); gn.connect(this._sfxGain);
    src.start(t); src.stop(t + dur + 0.05);
  }

  _heart(t, g) {
    this._thump(t, 55, 0.16, g);
    this._thump(t + 0.22, 50, 0.14, g * 0.7);
  }

  _breathFail(t, g) {
    this._breathSwell(t, true, g);
    this._breathSwell(t + 1.2, false, g);
  }

  // A breath that clips mid-release — the failure IS the envelope.
  _breathSwell(t, inhale, g) {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(inhale ? 500 : 800, t);
    bp.frequency.exponentialRampToValueAtTime(inhale ? 900 : 400, t + 0.8);
    bp.Q.value = 0.8;
    const gn = this.ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(g, t + 0.5);
    gn.gain.setValueAtTime(g, t + 0.68);
    gn.gain.setValueAtTime(0.0001, t + 0.7); // CUT. no release. no air.
    src.connect(bp); bp.connect(gn); gn.connect(this._sfxGain);
    src.start(t); src.stop(t + 0.8);
  }

  _intento(t) {
    // The worst sound: a small breath-in that clips to silence at 70 %.
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 1.2;
    const gn = this.ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(0.03, t + 0.28);
    gn.gain.setValueAtTime(0.0001, t + 0.29);
    src.connect(bp); bp.connect(gn); gn.connect(this._sfxGain);
    src.start(t); src.stop(t + 0.4);
  }

  _creakSweep(t, f0, f1, dur, g) {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 8;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const gn = this.ctx.createGain();
    gn.gain.setValueAtTime(g, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(gn); gn.connect(this._sfxGain);
    src.start(t); src.stop(t + dur + 0.05);
  }

  // Named creak loops (mecedora / columpio) with slow stereo drift — with
  // headphones the rocking chair crosses the room behind you. (Idea #6.)
  _startLoop(name, period, g) {
    if (this._loops[name]) return;
    const gain = this.ctx.createGain();
    gain.gain.value = g;
    let out = gain;
    let panner = null;
    if (this.ctx.createStereoPanner) {
      panner = this.ctx.createStereoPanner();
      const panLfo = this.ctx.createOscillator();
      panLfo.frequency.value = 1 / 17;
      const panDepth = this.ctx.createGain();
      panDepth.gain.value = 0.6;
      panLfo.connect(panDepth); panDepth.connect(panner.pan);
      panLfo.start();
      gain.connect(panner); panner.connect(this._sfxGain);
    } else {
      gain.connect(this._sfxGain);
    }
    const timer = setInterval(() => {
      if (!this.ctx || document.hidden) return;
      const t = this.ctx.currentTime;
      // two-part creak: forward... back.
      const sweep = (t0, f0, f1, dur) => {
        const src = this.ctx.createBufferSource();
        src.buffer = this._noise();
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.Q.value = 9;
        bp.frequency.setValueAtTime(f0, t0);
        bp.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
        const gn = this.ctx.createGain();
        gn.gain.setValueAtTime(g, t0);
        gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        src.connect(bp); bp.connect(gn); gn.connect(gain);
        src.start(t0); src.stop(t0 + dur + 0.05);
      };
      sweep(t, 260, 480, period * 0.32);
      sweep(t + period * 0.5, 440, 240, period * 0.36);
    }, period * 1000);
    this._loops[name] = { gain, src: { stop: () => {} }, timer, baseGain: g, panner };
  }
}
