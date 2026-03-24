import { state, transitionTo } from './core/StateManager.js';
import { Router } from './core/Router.js';
import { AudioEngine } from './engine/AudioEngine.js';
import { VisualEngine } from './engine/VisualEngine.js';
import { ArchiveDOM } from './ui/ArchiveDOM.js';

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
  },3000);
}

function enterMainSite() {
  const s3=document.getElementById('scene-3'); s3.style.opacity='0'; s3.style.pointerEvents='none';
  archive.showArchive(); audio.playTransitionEcho(); audio.stopAwakening();
  audio.setAwakening(false); state.isAwakening=false; transitionTo(4);
}

function handleDown(e) {
  if(state.isSwapping||state.isAwakening) return;
  audio.init(); inst.style.opacity='0';
  const btn=document.getElementById('umbral-btn');
  if(state.activeScene===1&&e.target!==btn&&!state.hasFinishedGallery) state.isPressed=true;
}

function handleUp() {
  if(state.activeScene===1){
    state.isPressed=false;
    if(state.isIgnited&&!state.hasFinishedGallery&&!state.isSwapping){ state.isIgnited=false; state.isSwapping=true; }
  }
}

document.addEventListener('mousemove',e=>visual.updateTarget(e.clientX,e.clientY));
document.addEventListener('mousedown',handleDown);
document.addEventListener('mouseup',handleUp);
document.addEventListener('touchstart',e=>{ visual.updateTarget(e.touches[0].clientX,e.touches[0].clientY); handleDown(e); },{passive:false});
document.addEventListener('touchmove',e=>{ if(state.activeScene<4) e.preventDefault(); visual.updateTarget(e.touches[0].clientX,e.touches[0].clientY); },{passive:false});
document.addEventListener('touchend',handleUp);
document.getElementById('umbral-btn').addEventListener('click',e=>{ e.stopPropagation(); enterScene2(); });
