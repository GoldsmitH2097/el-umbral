import { state, transitionTo } from './core/StateManager.js';
import { Router } from './core/Router.js';
import { AudioEngine } from './engine/AudioEngine.js';
import { VisualEngine } from './engine/VisualEngine.js';
import { ArchiveDOM } from './ui/ArchiveDOM.js';
import { ArchiveFireflies } from './ui/ArchiveFireflies.js';
import { TiznoTease } from './ui/TiznoTease.js';
import { initMobileScene2, initMobileArchive } from './mobile.js';

const isMobile = () => window.innerWidth <= 768;

const audio    = new AudioEngine();
const tizno    = new TiznoTease();
const fireflies = new ArchiveFireflies(tizno);

// ── prefers-reduced-motion: skip intro entirely ─────────────────────────────
// Respects OS-level accessibility setting. Also legally required (WCAG 2.3.3).
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('DOMContentLoaded', () => skipIntroAndEnterArchive(), { once: true });
}

const visual = new VisualEngine({
  audio,
  onWhisperFound: (index) => audio.playCharacterSignature(index),
  onAllWhispersFound: () => triggerAwakening(),
});

const archive = new ArchiveDOM({
  router: null,
  tizno: tizno,
  onSceneChange: (target) => { target==='enterMainSite' ? enterMainSite() : transitionTo(target); },
});

const router = new Router({
  enterArchive: ({skipIntro=false}={}) => { if(skipIntro) skipIntroAndEnterArchive(); },
  openReading: (index) => archive.openReading(index),
});
archive._router = router;

// Show instruction hint after 0.5s — appears near-immediately on first load
const inst = document.getElementById('instruccion');
const instMobile = document.getElementById('instruccion-mobile');
setTimeout(()=>{
  if(!state.isPressed&&!state.hasFinishedGallery) {
    inst.style.opacity='0.6';
    instMobile?.classList.add('visible');
  }
}, 500);

// Audio toggle — appears after first audio init, persists through all scenes
const audioToggle = document.getElementById('audio-toggle');
let _audioMuted = false;
let _audioToggleShown = false;

// Speaker SVG icons — compact, clear at small size
const _iconSoundOn  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
const _iconSoundOff = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

function _showAudioToggle() {
  if (!audioToggle) return;
  // First call only: paint muted state and zero volumes. Subsequent calls
  // (from later mousedowns) must NOT reset _audioMuted — that would undo any
  // unmute the user just made by clicking the toggle.
  if (_audioToggleShown) {
    audioToggle.classList.add('visible'); // keep visible if removed somehow
    return;
  }
  _audioToggleShown = true;
  _audioMuted = true;
  audioToggle.innerHTML = _iconSoundOff;
  audioToggle.setAttribute('aria-label', 'Activar audio');
  audioToggle.classList.add('muted', 'visible');
  // Match audio reality to muted visual: zero volumes until user opts in.
  audio.setFireVolume(0, false);
  audio.setWindVolume(0, 0.5);
}
function _updateAudioToggle() {
  if (!audioToggle) return;
  if (_audioMuted) {
    audioToggle.innerHTML = _iconSoundOff;
    audioToggle.setAttribute('aria-label', 'Activar audio');
    audioToggle.classList.add('muted');
  } else {
    audioToggle.innerHTML = _iconSoundOn;
    audioToggle.setAttribute('aria-label', 'Silenciar audio');
    audioToggle.classList.remove('muted');
  }
}
// Stop the toggle's own events from bubbling up to the document-level
// mousedown/touchstart listeners that drive flame ignition. Without this,
// every click on the toggle would also fire handleDown — which re-runs
// _showAudioToggle() and (in archive) zeros the wind volume, making the
// toggle appear broken.
audioToggle?.addEventListener('mousedown', e => e.stopPropagation());
audioToggle?.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });

audioToggle?.addEventListener('click', e => {
  e.stopPropagation();

  // The toggle click IS a user gesture — sufficient to initialize audio
  // even if the user never pressed-and-held Scene 1 (e.g., they hit
  // 'Romper el trance' first and now want sound from the archive).
  if (!audio.initialized) audio.init();

  _audioMuted = !_audioMuted;
  if (_audioMuted) {
    audio.setFireVolume(0, false);
    audio.setWindVolume(0, 0.3);
    if (audio.audioCtx) audio.audioCtx.suspend().catch(() => {});
  } else {
    // Resume context (browsers may have auto-suspended on inactivity)
    if (audio.audioCtx) audio.audioCtx.resume().then(() => audio._restartNoiseSources()).catch(() => {});
    // Restore wind to scene-appropriate level. Fire is driven by gestures, not toggle.
    const scene = state.activeScene;
    if (scene === 1)      audio.setWindVolume(0.015, 1);   // tomb — faint
    else if (scene === 2) audio.setWindVolume(0.04, 1);    // voces — louder, present
    else if (scene === 3) audio.setWindVolume(0.005, 1);   // awakening — barely there
    else                  audio.setWindVolume(0.012, 1);   // archive — faint, present
  }
  _updateAudioToggle();
});

// Replay intro — clear sw_crossed flag and reload
document.getElementById('replay-intro-btn')?.addEventListener('click', () => {
  localStorage.removeItem('sw_crossed');
  window.location.href = '/';
});

// Skip button — visible after 3s, persistent through all intro scenes until archive
const skipBtn = document.getElementById('skip-btn');
setTimeout(()=>{ if(state.activeScene < 4) skipBtn.classList.add('visible'); }, 3000);
skipBtn?.addEventListener('click', ()=>{
  skipBtn.classList.remove('visible');
  _stopHaptics();
  skipIntroAndEnterArchive();
});

// ── Scene 2 idle autoplay ───────────────────────────────────────────────────
// Tracks last user activity in Scene 2. After 4s of inactivity, the hint
// light sweeps toward the next unfound whisper for 2.5s, revealing it naturally
// via the VisualEngine proximity detector. Resets after each reveal.
let _s2LastActivity = 0;
let _s2HintInterval = null;

function _startScene2IdleWatch() {
  _s2LastActivity = Date.now();
  if (_s2HintInterval) clearInterval(_s2HintInterval);
  _s2HintInterval = setInterval(() => {
    if (state.activeScene !== 2 || state.isAwakening) { clearInterval(_s2HintInterval); return; }
    if (Date.now() - _s2LastActivity < 4000) return;
    // Find the first unfound whisper and aim the hint light at it
    const whispers = Array.from(document.querySelectorAll('.whisper'));
    const unfound = whispers.find(w => w.dataset.found !== 'true');
    if (!unfound) return;
    const rect = unfound.getBoundingClientRect();
    visual.setWhisperHint(rect.left + rect.width / 2, rect.top + rect.height / 2, 2500);
    _s2LastActivity = Date.now(); // wait another 4s before next auto-reveal
  }, 500);
}

// ── Scene 3 inactivity auto-advance ────────────────────────────────────────
// Replaces the old unconditional 12s timer. Only fires after 5s of NO interaction.
let _s3LastActivity = 0;
let _s3IdleInterval = null;

function _startScene3IdleWatch() {
  _s3LastActivity = Date.now();
  if (_s3IdleInterval) clearInterval(_s3IdleInterval);
  _s3IdleInterval = setInterval(() => {
    if (state.activeScene !== 3) { clearInterval(_s3IdleInterval); return; }
    if (Date.now() - _s3LastActivity >= 5000) {
      clearInterval(_s3IdleInterval);
      enterMainSite();
    }
  }, 500);
}

// Auto-advance — simulates the ignition cycle so characters reveal without user interaction.
// Starts after 5s. Holds for ~1s to ignite, then releases to swap to next character.
let _autoTimer = null;
let _isAutoAdvancing = false;

function _autoAdvanceNext() {
  if(state.activeScene !== 1 || state.hasFinishedGallery || state.isPressed) return;
  _isAutoAdvancing = true;
  inst.style.opacity = '0'; // hide "press and hold" before first character appears
  visual.setAutoAdvanceMode(true); // suppress flame + glow — reveal only through mask
  visual.updateTarget(window.innerWidth / 2, window.innerHeight * 0.55);
  state.isPressed = true; // build ignitionProgress to 150

  setTimeout(() => {
    if(!state.isIgnited) { state.isPressed = false; visual.setAutoAdvanceMode(false); _isAutoAdvancing = false; return; }
    state.isPressed = false; // stop building, isIgnited stays true — character stays revealed

    // Hold character visible for 5.5s (was 3.5s — too fast to see them all)
    setTimeout(() => {
      state.isIgnited = false;
      state.isSwapping = true;
      visual.primeNextVideo();

      setTimeout(() => {
        visual.setAutoAdvanceMode(false);
        _isAutoAdvancing = false;
        if(!state.hasFinishedGallery && !state.isPressed && state.activeScene === 1) {
          _autoTimer = setTimeout(_autoAdvanceNext, 1200); // was 500 — breathe between chars
        }
      }, 800);
    }, 5500); // was 3500
  }, 900); // ignition build-up
}

// Start after 5s if no interaction
_autoTimer = setTimeout(() => {
  if(state.activeScene === 1 && !state.hasFinishedGallery && !state.isPressed) {
    _autoAdvanceNext();
  }
}, 5000);

// ── Mobile tap-to-reveal (Scene 1) ─────────────────────────────────────────
// Replaces press-and-hold on touch devices. One tap = instant reveal for 3s,
// then spotlight closes and moves to next character.
let _mobileTapLock = false;
let _mobileHolding = false;
let _mobileTapMaxTimer = null;

function _endMobileHold() {
  if (!_mobileHolding) return;
  _mobileHolding = false;
  clearTimeout(_mobileTapMaxTimer);
  if (state.hasFinishedGallery) { _mobileTapLock = false; return; }
  state.isIgnited = false;
  state.isSwapping = true;
  visual.primeNextVideo();
  setTimeout(() => {
    _mobileTapLock = false;
    if (!state.hasFinishedGallery) {
      _autoTimer = setTimeout(() => {
        if (state.activeScene === 1 && !state.hasFinishedGallery && !_mobileTapLock) {
          _doMobileTap();
        }
      }, 4000);
    }
  }, 900);
}

function _doMobileTap() {
  if (_mobileTapLock || state.isIgnited || state.isSwapping || state.hasFinishedGallery) return;
  _mobileTapLock = true;
  if(_autoTimer) { clearTimeout(_autoTimer); _autoTimer = null; }
  if(_isAutoAdvancing) { _isAutoAdvancing = false; visual.setAutoAdvanceMode(false); }

  visual.forceIgnite();
  _mobileHolding = true;
  // Safety max: 8s hold without releasing
  _mobileTapMaxTimer = setTimeout(_endMobileHold, 8000);
}

// Haptic feedback — iOS/Android only, silently ignored on desktop
let _hapticInterval = null;
function _startHaptics() {
  if (!navigator.vibrate) return;
  navigator.vibrate(30);
  _hapticInterval = setInterval(() => {
    if (!state.isPressed && !state.isIgnited) { _stopHaptics(); return; }
    const intensity = state.isIgnited ? 80 : Math.floor((state.ignitionProgress / 150) * 60) + 10;
    navigator.vibrate(intensity);
  }, 150);
}
function _stopHaptics() {
  if (_hapticInterval) { clearInterval(_hapticInterval); _hapticInterval = null; }
}
// Called by VisualEngine when ignition completes
window._onIgnitionComplete = () => {
  _stopHaptics();
  if (navigator.vibrate) navigator.vibrate([0, 50, 120]);
};

const isDeepLink = router.init();
if (!isDeepLink) {
  // Always show the cinematic intro on every visit.
  // Returning visitors can press 'Romper el trance' to skip.
  visual.start();
}

function skipIntroAndEnterArchive() {
  transitionTo(4);
  visual.start();
  archive.showArchive({skipIntro:true});
  document.body.style.cursor='auto';
  document.querySelectorAll('*').forEach(el=>el.style.setProperty('cursor','auto','important'));
  initMobileArchive(); // was missing — mobile pillar taps never wired for returning visitors
  fireflies.init();
  tizno.init();
  setTimeout(() => document.dispatchEvent(new Event('archiveReady')), 400);
}
function enterScene2() {
  audio.playTransitionEcho(); transitionTo(0);
  state.isIgnited=false; visual.clearFlame(); audio.setFireVolume(0,false);
  // Restore crosshair cursor
  document.body.style.cursor = '';
  document.querySelectorAll('*').forEach(el => el.style.removeProperty('cursor'));
  // On mobile: reset cursor position to center so Scene 2 light starts centered,
  // not at whatever top position the finger last touched during Scene 1
  if (isMobile()) {
    visual.updateTarget(window.innerWidth / 2, window.innerHeight / 2);
  }
  document.getElementById('ambient-light').style.opacity='0';
  document.getElementById('gallery-container').style.opacity='0';
  const btn=document.getElementById('umbral-btn');
  btn.style.opacity='0'; btn.style.pointerEvents='none';
  setTimeout(()=>{
    transitionTo(2); document.getElementById('scene-2').style.opacity='1';
    audio.setWindVolume(0.04); visual.enterScene2();
    initMobileScene2(() => triggerAwakening());
    _startScene2IdleWatch(); // desktop idle autoplay — reveals one whisper every 4s of inactivity
    setTimeout(()=>{ document.getElementById('scene-2-light').style.opacity='1'; },2000);
    // Idle hint — fades in after 5s if no whisper found yet
    setTimeout(()=>{
      if(state.activeScene===2 && state.whispersFound===0) {
        document.getElementById('scene-2-hint')?.classList.add('visible');
      }
    }, 5000);
    // Hide hint once first whisper found
    const hideHint = () => document.getElementById('scene-2-hint')?.classList.remove('visible');
    document.addEventListener('whisperFound', hideHint, { once: true });
  },2000);
}

function triggerAwakening() {
  if(state.isAwakening) return;
  state.isAwakening=true; audio.setAwakening(true); transitionTo(3);
  const vt=document.getElementById('voces-title'); if(vt) vt.style.opacity='0';
  document.querySelectorAll('.whisper').forEach(w=>w.style.opacity='0');
  audio.playSpinningAwakening();
  setTimeout(()=>{
    const s3=document.getElementById('scene-3'); s3.style.opacity='1'; s3.style.pointerEvents='auto';
    document.body.style.cursor='auto';
    document.querySelectorAll('*').forEach(el=>el.style.setProperty('cursor','auto','important'));
    // Auto-advance only after 5s of INACTIVITY — resets on any interaction
    _startScene3IdleWatch();
  },3000);
}

function enterMainSite() {
  const s3=document.getElementById('scene-3'); s3.style.opacity='0'; s3.style.pointerEvents='none';
  document.getElementById('scene-2').style.display='none';
  s3.style.display='none';
  document.getElementById('editorial-watermark').style.display='none';
  document.getElementById('skip-btn')?.classList.remove('visible');
  archive.showArchive(); audio.playTransitionEcho(); audio.stopAwakening();
  audio.setAwakening(false); state.isAwakening=false;
  // Silence everything — fire and wind should be inaudible in the archive
  audio.setFireVolume(0, false);
  audio.setWindVolume(0, 0.8); // fast fade to silence
  transitionTo(4);
  initMobileArchive();
  fireflies.init();
  tizno.init();
  // Wire carousel scroll impulse after archive grid is built
  setTimeout(() => document.dispatchEvent(new Event('archiveReady')), 400);
}

function handleDown(e) {
  if(state.isSwapping||state.isAwakening) return;
  if(_autoTimer) { clearTimeout(_autoTimer); _autoTimer = null; }
  if(_isAutoAdvancing) {
    _isAutoAdvancing = false;
    visual.setAutoAdvanceMode(false);
    state.isPressed = false;
  }
  audio.init();
  audio.resumeIfSuspended();
  _showAudioToggle(); // reveal toggle once audio is initialized
  // In archive scenes, only force silence when the toggle is muted.
  // Without this guard, every mousedown undoes a user-initiated unmute.
  if (state.activeScene >= 4 && _audioMuted) { audio.setFireVolume(0, false); audio.setWindVolume(0, 1); }
  inst.style.opacity='0';
  instMobile?.classList.remove('visible');
  const btn=document.getElementById('umbral-btn');
  if(state.activeScene===1&&e.target!==btn&&!state.hasFinishedGallery) {
    if (isMobile()) {
      // Mobile: tap = instant reveal, no press-and-hold
      _doMobileTap();
    } else {
      state.isPressed=true;
      _startHaptics();
    }
  }
}

function handleUp() {
  _stopHaptics();
  // Mobile Scene 1: user lifted finger — end the hold, start swap
  if (isMobile() && state.activeScene === 1 && _mobileHolding) {
    _endMobileHold();
    return;
  }
  if(state.activeScene===1 && !isMobile()){
    state.isPressed=false;
    if(state.isIgnited&&!state.hasFinishedGallery&&!state.isSwapping){
      state.isIgnited=false;
      state.isSwapping=true;
      // iOS: prime next video src HERE in the gesture handler so iOS allows play()
      // RAF-based _swapToNextCharacter() runs later and is outside gesture context
      visual.primeNextVideo();
    }
    // Resume auto-advance 5s after user stops — keeps experience on rails
    if(!state.hasFinishedGallery && !_isAutoAdvancing) {
      if(_autoTimer) clearTimeout(_autoTimer);
      _autoTimer = setTimeout(() => {
        if(state.activeScene===1 && !state.hasFinishedGallery && !state.isPressed) {
          _autoAdvanceNext();
        }
      }, 5000);
    }
  }
}

// Mobile Scene 2: play whisper audio when a whisper is found via tap
document.addEventListener('mobileWhisperFound', e => {
  audio.resumeIfSuspended();
  audio.playCharacterSignature(e.detail.index);
});

// Scroll impulse — particles react to vertical scroll in archive and horizontal swipe in carousel
let _lastScrollTop = 0;
let _lastScrollLeft = 0;
document.getElementById('main-site')?.addEventListener('scroll', e => {
  const dy = e.target.scrollTop - _lastScrollTop;
  _lastScrollTop = e.target.scrollTop;
  if (Math.abs(dy) > 0.5) visual.addScrollImpulse(0, dy * 0.4);
}, { passive: true });
// Wire after archive builds (carousel exists at that point)
document.addEventListener('archiveReady', () => {
  document.getElementById('obras-section')?.addEventListener('scroll', e => {
    const dx = e.target.scrollLeft - _lastScrollLeft;
    _lastScrollLeft = e.target.scrollLeft;
    if (Math.abs(dx) > 0.5) visual.addScrollImpulse(dx * 0.4, 0);
  }, { passive: true });
});

document.addEventListener('mousemove',e=>{
  visual.updateTarget(e.clientX,e.clientY);
  if (state.activeScene === 2) _s2LastActivity = Date.now();
  if (state.activeScene === 3) _s3LastActivity = Date.now();
});
document.addEventListener('mousedown',handleDown);
document.addEventListener('mouseup',handleUp);
document.addEventListener('touchstart',e=>{ visual.updateTarget(e.touches[0].clientX,e.touches[0].clientY); handleDown(e); if(state.activeScene===3) _s3LastActivity=Date.now(); },{passive:false});
document.addEventListener('touchmove',e=>{ if(state.activeScene<4) e.preventDefault(); visual.updateTarget(e.touches[0].clientX,e.touches[0].clientY); if(state.activeScene===3) _s3LastActivity=Date.now(); },{passive:false});
document.addEventListener('touchend',handleUp);
const _umbralBtn = document.getElementById('umbral-btn');
_umbralBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  this.style.pointerEvents = 'none';
  this.style.opacity = '0';
  audio.resumeIfSuspended();
  archive.openPacto(() => enterScene2());
});
// iOS fix: touchend on the button directly ensures it fires even when document
// touchend handler runs first. Prevents Arlequín getting stuck after last character.
_umbralBtn.addEventListener('touchend', function(e) {
  e.preventDefault();
  e.stopPropagation();
  if (this.style.pointerEvents === 'none') return;
  this.style.pointerEvents = 'none';
  this.style.opacity = '0';
  audio.resumeIfSuspended();
  archive.openPacto(() => enterScene2());
}, { passive: false });
