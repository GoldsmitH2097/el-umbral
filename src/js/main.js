import { state, transitionTo } from './core/StateManager.js';
import { Router } from './core/Router.js';
import { AudioEngine } from './engine/AudioEngine.js';
import { VisualEngine } from './engine/VisualEngine.js';
import { ArchiveDOM } from './ui/ArchiveDOM.js';
import { initMobileScene2, initMobileArchive } from './mobile.js';

const audio = new AudioEngine();

const visual = new VisualEngine({
  audio,
  onWhisperFound: (index) => audio.playCharacterSignature(index),
  onAllWhispersFound: () => triggerAwakening(),
});

const archive = new ArchiveDOM({
  router: null,
  onSceneChange: (target) => { target==='enterMainSite' ? enterMainSite() : transitionTo(target); },
});

const router = new Router({
  enterArchive: ({skipIntro=false}={}) => { if(skipIntro) skipIntroAndEnterArchive(); },
  openReading: (index) => archive.openReading(index),
});
archive._router = router;

// Show instruction hint after 2.5s if user hasn't touched anything
const inst = document.getElementById('instruccion');
setTimeout(()=>{ if(!state.isPressed&&!state.hasFinishedGallery) inst.style.opacity='0.6'; }, 2500);

// Skip button — visible after 3s, hidden once archive is reached
const skipBtn = document.getElementById('skip-btn');
setTimeout(()=>{ if(state.activeScene < 4) skipBtn.classList.add('visible'); }, 3000);
skipBtn?.addEventListener('click', ()=>{
  skipBtn.classList.remove('visible');
  skipIntroAndEnterArchive();
});

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

    // Hold character visible for 3.5s, then release
    setTimeout(() => {
      state.isIgnited = false;   // triggers ramp-down in RAF loop
      state.isSwapping = true;
      visual.primeNextVideo();

      setTimeout(() => {
        visual.setAutoAdvanceMode(false);
        _isAutoAdvancing = false;
        if(!state.hasFinishedGallery && !state.isPressed && state.activeScene === 1) {
          _autoTimer = setTimeout(_autoAdvanceNext, 500); // short dark gap between characters
        }
      }, 800); // ramp-down duration
    }, 3500); // show character for 3.5 seconds
  }, 900); // ignition build-up
}

// Start after 5s if no interaction
_autoTimer = setTimeout(() => {
  if(state.activeScene === 1 && !state.hasFinishedGallery && !state.isPressed) {
    _autoAdvanceNext();
  }
}, 5000);

// Check for deep link on boot; if clean URL, start normal intro
const isDeepLink = router.init();
if (!isDeepLink) visual.start();

function skipIntroAndEnterArchive() {
  transitionTo(4);
  visual.start();
  archive.showArchive({skipIntro:true});
  document.body.style.cursor='auto';
  document.querySelectorAll('*').forEach(el=>el.style.setProperty('cursor','auto','important'));
}

function enterScene2() {
  audio.playTransitionEcho(); transitionTo(0);
  state.isIgnited=false; visual.clearFlame(); audio.setFireVolume(0,false);
  document.getElementById('ambient-light').style.opacity='0';
  document.getElementById('gallery-container').style.opacity='0';
  const btn=document.getElementById('umbral-btn');
  btn.style.opacity='0'; btn.style.pointerEvents='none';
  setTimeout(()=>{
    transitionTo(2); document.getElementById('scene-2').style.opacity='1';
    audio.setWindVolume(0.04); visual.enterScene2();
    // Mobile: sequential tap mechanic instead of cursor-based discovery
    initMobileScene2(() => triggerAwakening());
    setTimeout(()=>{ document.getElementById('scene-2-light').style.opacity='1'; },2000);
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
    // Auto-advance to archive after 4s if user hasn't clicked ADENTRARSE
    setTimeout(()=>{ if(state.activeScene===3) enterMainSite(); }, 4000);
  },3000);
}

function enterMainSite() {
  const s3=document.getElementById('scene-3'); s3.style.opacity='0'; s3.style.pointerEvents='none';
  // DOM cleanup: remove invisible layers that can block events in Scene 4
  document.getElementById('scene-2').style.display='none';
  s3.style.display='none';
  document.getElementById('skip-btn')?.classList.remove('visible');
  archive.showArchive(); audio.playTransitionEcho(); audio.stopAwakening();
  audio.setAwakening(false); state.isAwakening=false; transitionTo(4);
  initMobileArchive();
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
  inst.style.opacity='0';
  const btn=document.getElementById('umbral-btn');
  if(state.activeScene===1&&e.target!==btn&&!state.hasFinishedGallery) state.isPressed=true;
}

function handleUp() {
  if(state.activeScene===1){
    state.isPressed=false;
    if(state.isIgnited&&!state.hasFinishedGallery&&!state.isSwapping){
      state.isIgnited=false;
      state.isSwapping=true;
      // iOS: prime next video src HERE in the gesture handler so iOS allows play()
      // RAF-based _swapToNextCharacter() runs later and is outside gesture context
      visual.primeNextVideo();
    }
    // Resume auto-advance 3s after user stops — keeps experience on rails
    if(!state.hasFinishedGallery && !_isAutoAdvancing) {
      if(_autoTimer) clearTimeout(_autoTimer);
      _autoTimer = setTimeout(() => {
        if(state.activeScene===1 && !state.hasFinishedGallery && !state.isPressed) {
          _autoAdvanceNext();
        }
      }, 3000);
    }
  }
}

document.addEventListener('mousemove',e=>visual.updateTarget(e.clientX,e.clientY));
document.addEventListener('mousedown',handleDown);
document.addEventListener('mouseup',handleUp);
document.addEventListener('touchstart',e=>{ visual.updateTarget(e.touches[0].clientX,e.touches[0].clientY); handleDown(e); },{passive:false});
document.addEventListener('touchmove',e=>{ if(state.activeScene<4) e.preventDefault(); visual.updateTarget(e.touches[0].clientX,e.touches[0].clientY); },{passive:false});
document.addEventListener('touchend',handleUp);
document.getElementById('umbral-btn').addEventListener('click',e=>{
  e.stopPropagation();
  audio.resumeIfSuspended(); // iOS Safari audio unlock on button click
  enterScene2();
});
