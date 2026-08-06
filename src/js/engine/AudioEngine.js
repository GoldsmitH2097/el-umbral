import { state } from '../core/StateManager.js';

// Random chord per session — Am/maj7 high or grave octave
const _CHORD_HIGH = [220.00, 261.63, 329.63, 415.30]; // Am/maj7
const _CHORD_LOW  = [110.00, 130.815, 164.815, 207.65]; // Am/maj7 grave
const CHAR_FREQUENCIES = Math.random() < 0.5 ? _CHORD_HIGH : _CHORD_LOW;

export class AudioEngine {
  constructor() {
    this.audioCtx = null; this.fireGain = null; this.windGain = null;
    this.windFilter = null; this.masterDelay = null; this.masterFeedback = null;
    this.awakeningLFO = null; this.awakeningOscillators = []; this.initialized = false;
    this._awakeningActive = false;
    this._windInterval = null; // Captured for clean teardown on scene 4
    document.addEventListener('visibilitychange', () => {
      /* El <audio> mudo de iOS vive fuera del AudioContext: suspender el
         contexto no lo paraba, así que la pestaña seguía contando como
         "reproduciendo medios" —exenta del estrangulamiento de segundo
         plano— y seguía gastando con la web oculta. */
      const mudo = document.getElementById('ios-audio-unlock');
      if (mudo && mudo.getAttribute('src')) {
        if (document.hidden) { try { mudo.pause(); } catch (_) {} }
        else if (this.initialized) { mudo.play().catch(() => {}); }
      }
      if (!this.audioCtx) return;
      if (document.hidden) {
        this.audioCtx.suspend();
      } else {
        // After tab becomes visible again, resume AND restart looping sources
        // iOS drops looping BufferSourceNodes during suspend
        this.audioCtx.resume().then(() => this._restartNoiseSources()).catch(() => {});
      }
    });
  }

  init() {
    if (this.initialized || this._initializing) return;
    this._initializing = true;
    try {
      // iOS mute-switch bypass — play the hidden <audio> element on first gesture.
      // iOS treats <audio> playback as 'media' session even before AudioContext resumes,
      // which forces the category to 'playback' and bypasses the hardware ringer switch.
      // This works reliably on iOS 15+ regardless of navigator.audioSession support.
      // iOS mute switch bypass: keep the silent <audio> looping after first gesture.
      // A looping <audio> holds AVAudioSession in Playback category for the whole
      // WebView lifetime — WebAudio inherits it, bypassing the mute switch on ALL
      // iOS versions (not just 17+ where navigator.audioSession works).
      //
      // DOS CORRECCIONES CARAS DE APRENDER (agosto 2026):
      // 1. El WAV que llevaba incrustado declaraba un chunk `data` de CERO
      //    bytes. Con loop=true, Chrome se pasaba la vida intentando
      //    completar y reiniciar un medio de duración cero: medido en el
      //    Administrador de tareas, la pestaña saltaba de ~39% a ~186% de
      //    CPU en el instante de inicializar el audio, con TODOS los vídeos
      //    pausados. Ahora la fuente se genera aquí, con duración real.
      // 2. Es un apaño para el interruptor de silencio de iOS: en el resto
      //    de navegadores no pinta nada, así que ni se toca.
      const iosUnlock = document.getElementById('ios-audio-unlock');
      if (iosUnlock && this._esIOS()) {
        if (!iosUnlock.src) iosUnlock.src = this._wavSilencioso(2);
        iosUnlock.loop = true; iosUnlock.volume = 0; iosUnlock.play().catch(() => {});
      }

      if ('audioSession' in navigator) {
        navigator.audioSession.type = 'playback';
      }
      /* Ver sesionDeAudio() al final del fichero: este 'playback' es lo que
         hace que suene con el interruptor de silencio puesto, y también lo que
         impedía grabar. Hay que devolverlo aquí después de cada llamada. */

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

      // Step 2: resume() FIRST — iOS gesture window closes fast.
      // _createPinkNoise() allocates a large buffer synchronously; doing that work
      // before resume() can consume the gesture window and leave the context locked.
      // Call resume() immediately, then do the heavy sync work while it resolves.
      const _rp = this.audioCtx.resume().catch(() => {});

      // Step 3: Build graph synchronously (context starts running in parallel)
      this._buildGraph();
      this._scheduleDroplet();
      this._scheduleWhisperBreath();
      this.initialized = true;
      this._initializing = false;

      // Step 4: After resume confirms running, restart any sources iOS may have dropped
      _rp.then(() => this._restartNoiseSources()).catch(() => {});

    } catch(e) {
      this._initializing = false;
    }
  }

  /** ¿iPhone/iPad? (incluye el iPad que se hace pasar por Mac). */
  _esIOS() {
    return /iP(hone|ad|od)/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /** WAV mudo de duración real (8 kHz, 8 bits, mono) como data URI. */
  _wavSilencioso(segundos) {
    const sr = 8000, n = sr * segundos;
    const buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const txt = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    txt(0, 'RIFF'); v.setUint32(4, 36 + n, true); txt(8, 'WAVE');
    txt(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    txt(36, 'data'); v.setUint32(40, n, true);
    const b = new Uint8Array(buf);
    b.fill(128, 44);            // 128 = silencio en PCM de 8 bits sin signo
    let s = '';
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return 'data:audio/wav;base64,' + btoa(s);
  }

  /** Detiene y desconecta las fuentes de ruido vivas. */
  _pararRuidos() {
    (this._ruidos || []).forEach(f => {
      try { f.stop(); } catch (_) {}
      try { f.disconnect(); } catch (_) {}
    });
    this._ruidos = [];
  }

  // Restart looping noise sources — called after iOS resume() in case they were dropped
  // Also public so audio toggle can restore sources after unmute
  _restartNoiseSources() {
    try {
      const ctx = this.audioCtx;
      if (!ctx || ctx.state !== 'running' || !this.fireGain || !this.windFilter) return;
      /* PRIMERO SE APAGAN LAS ANTERIORES. Esto corre tras cada vuelta a la
         pestaña, y creaba dos fuentes de ruido nuevas sin detener las viejas:
         cada ida y vuelta dejaba dos generadores más sonando a la vez, para
         siempre. Una sesión con varios cambios de pestaña acumulaba una pila
         de ruido rosa que nadie paraba. */
      this._pararRuidos();
      const noise = this._createPinkNoise(ctx);
      const fireFilter = ctx.createBiquadFilter(); fireFilter.type = 'lowpass'; fireFilter.frequency.value = 250;
      const fireSrc = ctx.createBufferSource(); fireSrc.buffer = noise; fireSrc.loop = true;
      fireSrc.connect(fireFilter); fireFilter.connect(this.fireGain); fireSrc.start();
      const windSrc = ctx.createBufferSource(); windSrc.buffer = noise; windSrc.loop = true;
      windSrc.connect(this.windFilter); windSrc.start();
      this._ruidos = [fireSrc, windSrc];
    } catch(_) {}
  }

  _buildGraph() {
    const ctx = this.audioCtx;
    // Master output bus — everything routes through here so we can muffle the whole mix
    // (e.g. when the reading view opens — like a club door closing).
    this.masterOut = ctx.createGain(); this.masterOut.gain.value = 1.0;
    this.masterFilter = ctx.createBiquadFilter();
    this.masterFilter.type = 'lowpass'; this.masterFilter.frequency.value = 22050; this.masterFilter.Q.value = 0.7;
    this.masterOut.connect(this.masterFilter); this.masterFilter.connect(ctx.destination);

    this.masterDelay = ctx.createDelay(); this.masterDelay.delayTime.value = 0.5;
    this.masterFeedback = ctx.createGain(); this.masterFeedback.gain.value = 0.6;
    const caveFilter = ctx.createBiquadFilter(); caveFilter.type = 'lowpass'; caveFilter.frequency.value = 800;
    this.masterDelay.connect(caveFilter); caveFilter.connect(this.masterFeedback);
    this.masterFeedback.connect(this.masterDelay); this.masterDelay.connect(this.masterOut);
    const noise = this._createPinkNoise(ctx);
    const fireFilter = ctx.createBiquadFilter(); fireFilter.type = 'lowpass'; fireFilter.frequency.value = 250;
    this.fireGain = ctx.createGain(); this.fireGain.gain.value = 0;
    const fireSrc = ctx.createBufferSource(); fireSrc.buffer = noise; fireSrc.loop = true;
    fireSrc.connect(fireFilter); fireFilter.connect(this.fireGain); this.fireGain.connect(this.masterOut); fireSrc.start();
    this.windFilter = ctx.createBiquadFilter(); this.windFilter.type = 'bandpass'; this.windFilter.frequency.value = 120; this.windFilter.Q.value = 0.8;
    this.windGain = ctx.createGain(); this.windGain.gain.value = 0.04;
    const windSrc = ctx.createBufferSource(); windSrc.buffer = noise; windSrc.loop = true;
    windSrc.connect(this.windFilter); this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterOut); this.windGain.connect(this.masterDelay); windSrc.start();
    // se anotan para que _restartNoiseSources las apague antes de sustituirlas
    this._ruidos = [fireSrc, windSrc];
    this._windInterval = setInterval(() => { if (this.windGain.gain.value > 0 && !this._awakeningActive) this.windFilter.frequency.setTargetAtTime(80 + Math.random()*200, ctx.currentTime, 4); }, 3000);
  }

  /**
   * Muffle the entire ambient mix as if a heavy door has closed.
   * Used when the reading view opens — atmosphere stays present but recedes.
   * @param {boolean} open  true = muffle (lowpass to ~700Hz), false = clear
   */
  setReadingViewMuffle(open) {
    if (!this.audioCtx || !this.masterFilter) return;
    const now = this.audioCtx.currentTime;
    const target = open ? 700 : 22050;
    this.masterFilter.frequency.setTargetAtTime(target, now, 0.15);
  }

  _createPinkNoise(ctx) {
    const size = ctx.sampleRate * 2; const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const out = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < size; i++) { const w = Math.random()*2-1; out[i] = (last + 0.02*w)/1.02; last = out[i]; out[i] *= 3.5; }
    return buf;
  }

  /* !document.hidden EN LOS DOS PROGRAMADORES: al ocultar la pestaña el
     contexto se suspende y su reloj se CONGELA — pero estas cadenas de
     setTimeout seguían creando osciladores y búferes (el del susurro, ~384 KB
     cada 7-19 s) conectados a un grafo parado, cuyos stop()/onended viven en
     ese reloj congelado y por tanto no liberan nada. Una pestaña abandonada
     en la tumba unas horas acumulaba cientos de megas que solo se soltaban al
     volver. Con la guarda no se fabrica nada que no vaya a sonar. */
  _scheduleDroplet() {
    if (this.audioCtx && !this._awakeningActive && !document.hidden) {
      try {
        const osc = this.audioCtx.createOscillator(), g = this.audioCtx.createGain(), now = this.audioCtx.currentTime;
        osc.type = 'sine'; osc.frequency.setValueAtTime(400+Math.random()*200, now); osc.frequency.exponentialRampToValueAtTime(100, now+0.08);
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.03+Math.random()*0.02, now+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+0.15);
        osc.connect(g); g.connect(this.masterOut || this.audioCtx.destination); g.connect(this.masterDelay); osc.onended = () => { osc.disconnect(); g.disconnect(); }; osc.start(); osc.stop(now+0.2);
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
      src.connect(f); f.connect(g); g.connect(this.masterOut || this.audioCtx.destination); src.start();
    } catch(_) {}
  }

  _scheduleWhisperBreath() {
    if (this.audioCtx && !this._awakeningActive && state.activeScene < 4 && !document.hidden) {
      try {
        const ctx = this.audioCtx, size = ctx.sampleRate*2, buf = ctx.createBuffer(1, size, ctx.sampleRate);
        const d = buf.getChannelData(0); for (let i=0;i<size;i++) d[i]=Math.random()*2-1;
        const noise = ctx.createBufferSource(); noise.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type='bandpass'; f.Q.value=2;
        const now = ctx.currentTime;
        f.frequency.setValueAtTime(800+Math.random()*1500, now); f.frequency.exponentialRampToValueAtTime(300, now+2);
        const g = ctx.createGain(); g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.02, now+0.5); g.gain.linearRampToValueAtTime(0, now+2);
        noise.connect(f); f.connect(g); g.connect(this.masterOut || ctx.destination); g.connect(this.masterDelay); noise.start();
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
        const vol = h===1?0.14:0.07; // raised for audibility on first tap
        g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(vol,now+0.4); g.gain.exponentialRampToValueAtTime(0.001,now+3.5);
        osc.connect(g); g.connect(this.masterOut || this.audioCtx.destination);
        if (this.masterDelay) g.connect(this.masterDelay); // null-safe: graph may not be ready
        osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch(_){} };
        osc.start(); osc.stop(now+4);
      });
    } catch(_) {}
  }

  /**
   * Brief character-tuned chime on book-cover hover.
   * @param {number} charIndex 0=emperatriz, 1=caballero, 2=sortilega, 3=arlequin
   */
  playCoverHover(charIndex) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    // Independent throttle so a cover hover doesn't suppress a button hover that
    // immediately follows when the cursor moves from cover to its buy button.
    const t = performance.now();
    if (t - (this._lastCoverHoverT || 0) < 180) return;
    this._lastCoverHoverT = t;
    try {
      const ctx = this.audioCtx, now = ctx.currentTime;
      const freq = CHAR_FREQUENCIES[charIndex];
      if (!freq) return;
      [1, 2].forEach(h => {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = h === 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * h, now);
        const vol = h === 1 ? 0.04 : 0.018;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(vol, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(g); g.connect(this.masterOut || ctx.destination);
        if (this.masterDelay) g.connect(this.masterDelay);
        osc.onended = () => { osc.disconnect(); g.disconnect(); }; osc.start(); osc.stop(now + 0.7);
      });
    } catch(_) {}
  }

  /**
   * Warm, quiet swell on active buy-button hover.
   * Two sines (root + fifth of the session chord) with a slow attack and a
   * long tail — replaces the old filtered-noise shimmer, which read as hiss.
   */
  playButtonHover() {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    const t = performance.now();
    if (t - (this._lastBtnHoverT || 0) < 180) return;
    this._lastBtnHoverT = t;
    try {
      const ctx = this.audioCtx, now = ctx.currentTime;
      [[CHAR_FREQUENCIES[0], 0.014], [CHAR_FREQUENCIES[2], 0.008]].forEach(([f, vol]) => {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f * 2, now);   // una octava arriba: presencia sin peso
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(vol, now + 0.07);
        g.gain.exponentialRampToValueAtTime(0.0006, now + 0.55);
        osc.connect(g); g.connect(this.masterOut || ctx.destination);
        if (this.masterDelay) g.connect(this.masterDelay);
        osc.start(); osc.stop(now + 0.6);
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
        pan.connect(this.masterOut || ctx.destination); pan.connect(this.masterDelay);
      }
      CHAR_FREQUENCIES.forEach(f => [1,2].forEach(h => {
        const osc=ctx.createOscillator(), g=ctx.createGain();
        osc.type=h===1?'triangle':'sine'; osc.frequency.setValueAtTime(f*h,now);
        g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(0.06,now+2);
        osc.connect(g); pan ? g.connect(pan) : (g.connect(this.masterOut || ctx.destination),g.connect(this.masterDelay));
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
      osc.connect(g); g.connect(this.masterDelay); osc.onended = () => { osc.disconnect(); g.disconnect(); }; osc.start(); osc.stop(now+1.0);
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
    if (this.windGain&&this.windFilter) { this.windFilter.frequency.setValueAtTime(60,now); this.windGain.gain.setTargetAtTime(0.008,now,2); } // settle at archive ambient
    if (this._windInterval) { clearInterval(this._windInterval); this._windInterval = null; }
  }

  setAwakening(v) { this._awakeningActive = v; }
  /** iOS Safari: call on every touch. Restarts noise sources after any suspension. */
  resumeIfSuspended() {
    if (this.audioCtx && this.audioCtx.state !== 'running') {
      return this.audioCtx.resume().then(() => {
        this._restartNoiseSources();
      }).catch(() => {});
    }
    return Promise.resolve();
  }
  /** Start archive ambient: occasional crackle every 3-7s */
  startArchiveAmbient() {
    if (this._archiveAmbientStarted) return;
    this._archiveAmbientStarted = true;
    const tick = () => {
      if (this.audioCtx && state.activeScene >= 4) {
        if (Math.random() < 0.5) this.emitCrackle();
      }
      this._archiveTimer = setTimeout(tick, 3000 + Math.random() * 4000);
    };
    this._archiveTimer = setTimeout(tick, 2500);
  }

  get isReady() { return this.initialized; }
}

/**
 * LA SESIÓN DE AUDIO DE iOS: por qué el micrófono nunca llegó a preguntar.
 *
 * iOS 17+ deja declarar para qué usa el audio una página. Nosotros pedimos
 * 'playback' para que la cueva suene aunque el visitante lleve el interruptor
 * de silencio puesto — sin eso, la mitad de la gente entraría en El Umbral
 * sin banda sonora y sin saber por qué.
 *
 * El precio no estaba escrito en ninguna parte: una sesión declarada como
 * SOLO REPRODUCIR no puede capturar. iOS no niega el permiso —ni siquiera
 * llega a preguntarlo— y rechaza getUserMedia con InvalidStateError. Ese es
 * el error que llevábamos días persiguiendo dentro del iframe, y por eso
 * ninguna de las dos mudanzas que planteamos lo habría arreglado: el muro no
 * estaba en la frontera entre marcos, estaba en la propia sesión de audio.
 *
 * 'play-and-record' es la única modalidad que permite las dos cosas a la vez.
 * Se pone justo antes de pedir el micro y se devuelve a 'playback' al colgar,
 * porque grabando iOS baja el volumen de salida y cambia el enrutado: dejarlo
 * puesto para siempre le quitaría cuerpo a la cueva el resto de la visita.
 */
export function sesionDeAudio(modo) {
  if (!('audioSession' in navigator)) return;
  try {
    navigator.audioSession.type = modo === 'grabar' ? 'play-and-record' : 'playback';
  } catch (_) { /* navegador que lo expone pero no acepta el valor */ }
}
