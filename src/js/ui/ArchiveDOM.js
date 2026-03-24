import { CHARACTERS } from '../core/StateManager.js';

export class ArchiveDOM {
  constructor({router, onSceneChange}) {
    this._router=router; this._onSceneChange=onSceneChange;
    this._mainSite=document.getElementById('main-site');
    this._gridView=document.getElementById('grid-view');
    this._readingView=document.getElementById('reading-view');
    this._readTitle=document.getElementById('read-title');
    this._readBody=document.getElementById('read-body-content');
    this._readingBgVideo=document.getElementById('reading-bg-video');
    this._pactoModal=document.getElementById('pacto-modal');
    this._build(); this._bindEvents();
  }
  _build() {
    const grid=document.querySelector('.pillar-grid'); if(!grid) return;
    CHARACTERS.forEach((char,i)=>{
      const pillar=document.createElement('div'); pillar.className='pillar';
      pillar.setAttribute('role','button'); pillar.setAttribute('tabindex','0');
      const video=document.createElement('video');
      video.loop=true; video.muted=true; video.playsInline=true; video.preload='none';
      video.dataset.src=char.src;
      const content=document.createElement('div'); content.className='pillar-content';
      content.innerHTML=`<h4>${['I','II','III','IV'][i]}. ${char.label}</h4><p>${char.desc.split('.')[0]}.</p>`;
      pillar.appendChild(video); pillar.appendChild(content); grid.appendChild(pillar);
      let loaded=false;
      const loadAndPlay=()=>{
        if(!loaded){video.src=video.dataset.src;video.load();loaded=true;}
        video.play().catch(()=>{});
      };
      pillar.addEventListener('mouseenter',loadAndPlay);
      pillar.addEventListener('mouseleave',()=>video.pause());
      pillar.addEventListener('touchstart',loadAndPlay,{passive:true});
      pillar.addEventListener('click',()=>this.openReading(i));
      pillar.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')this.openReading(i);});
    });
  }

  showArchive({skipIntro=false}={}) {
    if(skipIntro) this._mainSite.style.transition='none';
    this._mainSite.style.opacity='1'; this._mainSite.style.pointerEvents='auto';
    if(skipIntro) requestAnimationFrame(()=>{this._mainSite.style.transition='opacity 3s ease';});
    // Trigger text reveal animations — small delay lets the opacity transition start first
    setTimeout(()=>{ this._gridView.classList.add('archive-visible'); }, 200);
  }
  openReading(index) {
    const char=CHARACTERS[index]; if(!char) return;
    this._readTitle.innerText=char.title; this._readBody.innerHTML=char.lore;
    this._readingBgVideo.src=char.src; this._readingBgVideo.load(); this._readingBgVideo.play().catch(()=>{});
    this._gridView.style.transform='scale(0.95)'; this._gridView.style.opacity='0';
    setTimeout(()=>{
      this._readingView.style.opacity='1'; this._readingView.style.pointerEvents='auto';
      this._readingView.scrollTo(0,0); this._onSceneChange(5);
    },500);
    if(this._router) this._router.navigateTo(index);
  }
  closeReading() {
    this._readingView.style.opacity='0'; this._readingView.style.pointerEvents='none';
    setTimeout(()=>{
      this._gridView.style.transform='scale(1)'; this._gridView.style.opacity='1';
      this._readingBgVideo.pause(); this._readingBgVideo.src=''; this._onSceneChange(4);
    },500);
    if(this._router) this._router.navigateToArchive();
  }
  openPacto() { this._pactoModal.style.opacity='1'; this._pactoModal.style.pointerEvents='auto'; }
  closePacto() { this._pactoModal.style.opacity='0'; this._pactoModal.style.pointerEvents='none'; }
  _bindEvents() {
    document.getElementById('final-btn')?.addEventListener('click',()=>this._onSceneChange('enterMainSite'));
    document.getElementById('btn-volver')?.addEventListener('click',()=>this.closeReading());
    document.getElementById('btn-cerrar-pacto')?.addEventListener('click',()=>this.closePacto());
    document.querySelectorAll('[data-action]').forEach(el=>{
      el.addEventListener('click',()=>{
        if(el.dataset.action==='scroll-top') document.getElementById('main-site').scrollTo({top:0,behavior:'smooth'});
        if(el.dataset.action==='open-pacto') this.openPacto();
      });
    });
  }
}
