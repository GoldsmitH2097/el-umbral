import { state, CHARACTERS } from '../core/StateManager.js';
const root = document.documentElement;

class FlameParticle {
  constructor(x,y,wx,wy,o) { this.x=x+(Math.random()-0.5)*4;this.y=y;this.size=Math.random()*16+8;this.life=1.0;this.seed=Math.random()*100;this.decay=Math.random()*0.01+0.008+(1-o)*0.02;this.vy=-Math.random()*1.5-0.5;this.vx=wx*0.2+(Math.random()-0.5)*0.4; }
  update(wx) { this.x+=this.vx;this.y+=this.vy;this.x+=Math.sin(this.life*6+this.seed)*0.3;this.vx*=0.95;this.vx+=wx*0.02;this.life-=this.decay;this.size*=0.96; }
  draw(ctx) { const r=255,g=Math.floor(Math.max(0,190*(this.life*this.life))),b=this.life>0.92?80:Math.floor(Math.max(0,30*(this.life-0.7)*3)),a=this.life*0.5; const gr=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,Math.max(0.1,this.size)); gr.addColorStop(0,`rgba(${r},${g},${b},${a})`);gr.addColorStop(0.4,`rgba(${r},${g},${b},${a*0.6})`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`); ctx.beginPath();ctx.arc(this.x,this.y,Math.max(0.1,this.size),0,Math.PI*2);ctx.fillStyle=gr;ctx.fill(); }
}

class SmokeParticle {
  constructor(x,y,vx,vy) { this.x=x;this.y=y;this.life=1.0;this.size=Math.random()*8+4;this.vx=vx*0.15+(Math.random()-0.5)*0.5;this.vy=vy*0.15-Math.random()*1.0-0.5;this.decay=Math.random()*0.003+0.0015;this.angle=Math.random()*Math.PI*2;this.spin=(Math.random()-0.5)*0.15;this.cr=Math.random()*1.5+0.5; }
  update() { this.vx*=0.96;this.vy*=0.97;this.vy-=0.03;this.angle+=this.spin;const c=this.cr*(1.2-this.life);this.x+=this.vx+Math.cos(this.angle)*c;this.y+=this.vy+Math.sin(this.angle)*c;this.size+=0.25;this.life-=this.decay; }
  draw(ctx) { const a=this.life*0.15;const gr=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,Math.max(0.1,this.size));gr.addColorStop(0,`rgba(140,150,160,${a})`);gr.addColorStop(0.5,`rgba(140,150,160,${a*0.5})`);gr.addColorStop(1,`rgba(140,150,160,0)`);ctx.beginPath();ctx.arc(this.x,this.y,Math.max(0.1,this.size),0,Math.PI*2);ctx.fillStyle=gr;ctx.fill(); }
}

class DustParticle {
  constructor(cW, cH) {
    this.x=Math.random()*cW; this.y=Math.random()*cH; this.z=Math.random();
    this.isMacro=Math.random()<0.04; this.seed=Math.random()*100; this.isLit=false;
    if (this.isMacro) {
      this.size=Math.random()*10+5; this.baseVy=0.2+Math.random()*0.3;
      this.opacity=Math.random()*0.05+0.02; this.blur=Math.random()*15+10;
    } else {
      this.size=Math.random()*1.5+0.5+this.z*1.0; this.baseVy=0.03+this.z*0.2;
      this.opacity=Math.random()*0.2+0.05; if(this.z>0.8) this.opacity*=0.2;
      this.blur=this.z>0.8?this.size*1.5:0;
    }
    this.vy=this.baseVy; this.vx=(Math.random()-0.5)*0.1;
  }
  update(cx,cy,vx,vy,isIgnited,fc,cW,cH) {
    this.vy=this.baseVy; let cvx=this.vx+Math.sin(fc*0.01+this.seed)*0.2;
    const dx=this.x-cx,dy=this.y-cy,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<150&&!state.isAwakening&&state.activeScene<4){
      const pf=this.isMacro?2.0:0.2+this.z*0.8, force=((150-dist)/150)*pf;
      cvx+=vx*force*0.04; this.vy+=vy*force*0.04;
    }
    this.isLit=false;
    if(state.activeScene===1&&isIgnited&&dist<180){
      const hf=(180-dist)/180; this.vy-=hf*(this.isMacro?3.0:2.0); this.isLit=true;
    }
    this.x+=cvx; this.y+=this.vy;
    if(this.y>cH+40){this.y=-40;this.x=Math.random()*cW;}
    if(this.y<-40){this.y=cH+40;this.x=Math.random()*cW;}
    if(this.x>cW+40) this.x=-40;
    if(this.x<-40) this.x=cW+40;
  }
  draw(ctx, fade=1) {
    if(fade<=0) return; // Already invisible — skip draw entirely
    ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    const op = this.opacity * fade; // Apply awakening fade multiplier
    if(this.isMacro){
      ctx.shadowBlur=this.blur;
      ctx.shadowColor=this.isLit?`rgba(255,160,50,${op*2})`:`rgba(180,200,255,${op})`;
      const gr=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size);
      if(this.isLit){gr.addColorStop(0,`rgba(255,200,100,${op*0.8})`);gr.addColorStop(0.5,`rgba(255,150,50,${op*0.4})`);gr.addColorStop(1,`rgba(255,100,0,0)`);}
      else{gr.addColorStop(0,`rgba(220,240,255,${op*0.6})`);gr.addColorStop(0.5,`rgba(180,200,255,${op*0.2})`);gr.addColorStop(1,`rgba(150,180,255,0)`);}
      ctx.fillStyle=gr;
    } else {
      if(this.blur>0){ctx.shadowBlur=this.blur;ctx.shadowColor=this.isLit?`rgba(255,180,80,${op})`:`rgba(200,210,230,${op})`;}
      else ctx.shadowBlur=0;
      // During awakening: fade toward invisible (no white boost — that was making them pop)
      ctx.fillStyle=this.isLit?`rgba(255,180,80,${op*2.5})`:`rgba(200,210,230,${op})`;
    }
    ctx.fill(); ctx.shadowBlur=0;
  }
}

class FireflyParticle {
  constructor(sx,sy) { this.x=sx;this.y=sy;this.history=[];this.seed=Math.random()*100;this.angle=0;this.wanderX=0;this.wanderY=0;this.speedMult=1; }
  update(cx,cy,fc) {
    if(state.isAwakening){
      this.speedMult+=0.05; this.angle+=0.1*this.speedMult;
      const r=Math.max(0,160-this.speedMult*2); this.x=cx+Math.cos(this.angle)*r; this.y=cy+Math.sin(this.angle)*r;
    } else {
      this.wanderX+=(Math.random()-0.5)*3; this.wanderY+=(Math.random()-0.5)*3;
      this.wanderX*=0.94; this.wanderY*=0.94;
      this.angle+=0.03+Math.sin(fc*0.02+this.seed)*0.02;
      const r=160+Math.sin(fc*0.04+this.seed)*120;
      const tfx=cx+Math.cos(this.angle)*r+this.wanderX*20, tfy=cy+Math.sin(this.angle)*r+this.wanderY*20;
      this.x+=(tfx-this.x)*0.06+(Math.random()-0.5)*2; this.y+=(tfy-this.y)*0.06+(Math.random()-0.5)*2;
    }
    this.history.push({x:this.x,y:this.y}); if(this.history.length>8) this.history.shift();
  }
  draw(ctx) {
    for(let i=0;i<this.history.length-1;i++){
      const p1=this.history[i],p2=this.history[i+1],a=(i/this.history.length)*0.8;
      ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);
      ctx.strokeStyle=state.isAwakening?`rgba(255,255,255,${a})`:`rgba(255,230,150,${a})`;
      ctx.lineWidth=1.0;ctx.stroke();
    }
    ctx.beginPath();ctx.arc(this.x,this.y,1.5,0,Math.PI*2);
    ctx.fillStyle=state.isAwakening?'#fff':'rgba(255,250,200,1)';
    ctx.shadowBlur=40;ctx.shadowColor=state.isAwakening?'rgba(255,255,255,1)':'rgba(255,160,50,0.9)';
    ctx.fill();ctx.shadowBlur=0;
  }
}

export class VisualEngine {
  constructor({audio,onWhisperFound,onAllWhispersFound}) {
    this._audio=audio; this._onWhisperFound=onWhisperFound; this._onAllWhispersFound=onAllWhispersFound;
    this._canvas=document.getElementById('vfx-canvas');
    this._ctx=this._canvas.getContext('2d');
    this._videoEl=document.getElementById('char-video');
    this._preloadEl=document.getElementById('char-video-preload');
    // Track which element is currently "live" vs "preloading"
    this._liveEl=this._videoEl;
    this._titleEl=document.getElementById('char-title');
    this._descEl=document.getElementById('char-desc');
    this._instEl=document.getElementById('instruccion');
    this._whispers=document.querySelectorAll('.whisper');
    this._targetX=window.innerWidth/2; this._targetY=window.innerHeight/2;
    this._currentX=this._targetX; this._currentY=this._targetY;
    this._lastX=this._targetX; this._lastY=this._targetY;
    this._flameParticles=[]; this._smokeParticles=[]; this._dustParticles=[]; this._fireflies=[]; this._frameCount=0;
    this._awakeningFrames=0; // Increments during awakening — used to fade dust out progressively
    this._resizeCanvas(); window.addEventListener('resize',()=>this._resizeCanvas());
    for(let i=0;i<100;i++) this._dustParticles.push(new DustParticle(this._canvas.width,this._canvas.height));
    this._loadCharacterVideo(0);
  }

  updateTarget(x,y) {
    if(state.isAwakening){this._targetX=window.innerWidth/2;this._targetY=window.innerHeight/2;}
    else{this._targetX=x;this._targetY=y;}
  }
  enterScene2() {
    this._fireflies.push(new FireflyParticle(this._currentX,this._currentY));
    // Start autonomous hint sweep after 5s — drifts near each whisper in sequence
    this._startWhisperHint();
  }

  _startWhisperHint() {
    const whispers = Array.from(document.querySelectorAll('.whisper'));
    let idx = 0;
    const visitNext = () => {
      if(state.activeScene !== 2 || state.whispersFound >= whispers.length) return;
      const unfound = whispers.filter(w => w.dataset.found !== 'true');
      if(unfound.length === 0) return;
      // Pick next unfound whisper
      const target = unfound[idx % unfound.length]; idx++;
      const rect = target.getBoundingClientRect();
      // Nudge the cursor target toward the whisper to illuminate it briefly
      const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
      this._hintTarget = { x: cx, y: cy, until: Date.now() + 2000 };
      setTimeout(visitNext, 6000 + Math.random() * 4000);
    };
    setTimeout(visitNext, 5000);
  }
  clearFlame() { this._flameParticles=[];this._smokeParticles=[];state.isIgnited=false; }

  /**
   * Called from touchend/mouseup gesture handler in main.js — inside gesture context.
   * Loads next video into the HIDDEN preload element so iOS unlocks play() permission,
   * without changing the visible video (which would flash the new character early).
   * _swapToNextCharacter() transfers it to the visible element once screen is dark.
   */
  primeNextVideo() {
    const nextIndex = state.currentCharIndex + 1;
    if (nextIndex >= CHARACTERS.length) return;
    // Load into whichever element is currently hidden — keep the live element untouched.
    // This stays in gesture context so iOS grants play() permission.
    const hiddenEl = this._liveEl === this._videoEl ? this._preloadEl : this._videoEl;
    hiddenEl.src = CHARACTERS[nextIndex].src;
    hiddenEl.load();
    hiddenEl.play().catch(()=>{});
  }
  _loadCharacterVideo(index) {
    if(index>=CHARACTERS.length) return;
    const c=CHARACTERS[index];
    this._liveEl.src=c.src; this._liveEl.load(); this._liveEl.play().catch(()=>{});
    this._titleEl.innerText=c.title; this._descEl.innerText=c.desc;
  }
  _swapToNextCharacter() {
    state.currentCharIndex++;
    if(state.currentCharIndex<CHARACTERS.length){
      const char = CHARACTERS[state.currentCharIndex];
      // Swap visibility — don't touch src. The next video is already playing in the
      // hidden element from gesture context. Showing it avoids a new autoplay trigger.
      const nextEl = this._liveEl === this._videoEl ? this._preloadEl : this._videoEl;
      const prevEl = this._liveEl;
      // Show next, hide previous
      nextEl.style.display = '';
      nextEl.style.opacity = '0.8';
      nextEl.style.position = 'absolute';
      nextEl.style.top = '0'; nextEl.style.left = '0';
      nextEl.style.width = '100vw'; nextEl.style.height = '100vh';
      nextEl.style.objectFit = 'contain'; nextEl.style.transform = 'scale(1.05)';
      prevEl.style.display = 'none';
      nextEl.play().catch(()=>{});
      this._liveEl = nextEl;
      // Update text
      this._titleEl.innerText = char.title;
      this._descEl.innerText = char.desc;
      state.isSwapping=false;
    } else {
      state.hasFinishedGallery=true; state.isSwapping=false;
      setTimeout(()=>{const b=document.getElementById('umbral-btn');b.style.opacity='1';b.style.pointerEvents='auto';},500);
    }
  }
  _resizeCanvas() { this._canvas.width=window.innerWidth; this._canvas.height=window.innerHeight; }
  start() { this._tick(); }
  _tick() {
    this._frameCount++;
    const ctx=this._ctx;
    // KILL-SWITCH: zero GPU work when archive is covering the canvas
    if(state.activeScene>=4){ ctx.clearRect(0,0,this._canvas.width,this._canvas.height); requestAnimationFrame(()=>this._tick()); return; }
    ctx.clearRect(0,0,this._canvas.width,this._canvas.height);
    const lf=state.isAwakening?0.05:0.1;
    this._currentX+=(this._targetX-this._currentX)*lf; this._currentY+=(this._targetY-this._currentY)*lf;
    const vx=this._currentX-this._lastX, vy=this._currentY-this._lastY, speed=Math.sqrt(vx*vx+vy*vy);
    this._lastX=this._currentX; this._lastY=this._currentY;
    if(!state.isAwakening){ root.style.setProperty('--x',this._currentX+'px'); root.style.setProperty('--y',this._currentY+'px'); this._awakeningFrames=0; }
    else { const le=parseFloat(root.style.getPropertyValue('--radio-exterior')||350); root.style.setProperty('--radio-exterior',le+10+'px'); this._awakeningFrames++; }
    ctx.globalCompositeOperation='lighter';
    // Dust fades out during awakening — fully invisible by frame 120 (~2 seconds at 60fps)
    const dustFade = state.isAwakening ? Math.max(0, 1 - this._awakeningFrames/120) : 1;
    for(let i=0;i<this._dustParticles.length;i++){
      this._dustParticles[i].update(this._currentX,this._currentY,vx,vy,state.isIgnited,this._frameCount,this._canvas.width,this._canvas.height);
      this._dustParticles[i].draw(ctx, dustFade);
    }
    if(state.activeScene===1) this._updateScene1(ctx,vx,vy,speed);
    if(state.activeScene===2||state.activeScene===3) this._updateScene2(ctx);
    requestAnimationFrame(()=>this._tick());
  }

  _updateScene1(ctx,vx,vy,speed) {
    const wx=-vx*1.2, wy=-vy*1.2;
    const oxygenScale=state.isIgnited?Math.max(0.05,1-speed*0.025):0;
    this._audio.setFireVolume(oxygenScale,this._audio.isReady&&(state.isPressed||state.isIgnited)&&!state.hasFinishedGallery);
    if(state.isIgnited&&!state.hasFinishedGallery) this._audio.emitCrackle();
    if(state.isPressed&&!state.isIgnited&&!state.hasFinishedGallery){
      state.ignitionProgress+=4.0; const sc=state.ignitionProgress/150;
      root.style.setProperty('--radio-interior',state.ignitionProgress*0.8+'px');
      root.style.setProperty('--radio-exterior',state.ignitionProgress*2.5+'px');
      root.style.setProperty('--intensidad',0.8*sc);
      if(Math.random()<sc*0.5) this._flameParticles.push(new FlameParticle(this._currentX,this._currentY,wx,wy,sc));
      if(state.ignitionProgress>=150){ state.isIgnited=true; this._instEl.style.opacity='0'; this._audio.playCharacterSignature(state.currentCharIndex); }
    } else if(!state.isPressed&&!state.isIgnited&&state.ignitionProgress>0){
      state.ignitionProgress-=4.0;
      if(state.ignitionProgress<=0){ state.ignitionProgress=0; if(state.isSwapping) this._swapToNextCharacter(); }
      const sc=state.ignitionProgress/150;
      root.style.setProperty('--radio-interior',state.ignitionProgress*0.8+'px');
      root.style.setProperty('--radio-exterior',state.ignitionProgress*2.5+'px');
      root.style.setProperty('--intensidad',0.8*sc);
    }
    if(state.isIgnited){
      // Recompute oxygenScale here — the value computed at the top of this function
      // was 0 if isIgnited was just set true this frame. Recomputing avoids a dark flash.
      const oxygenScale = Math.max(0.05, 1-speed*0.025);
      // Base radii match the ramp-up PEAK values (progress=150 → interior=120, exterior=375)
      // so there is zero visual jump at the ignition threshold.
      // Flicker is smoothed: ±1.5px instead of ±2.5px to reduce frame noise.
      const fl=Math.random()*3-1.5;
      root.style.setProperty('--radio-interior',Math.max(30,(120+fl)*oxygenScale)+'px');
      root.style.setProperty('--radio-exterior',Math.max(100,(375+fl*2)*oxygenScale)+'px');
      root.style.setProperty('--intensidad',0.85*oxygenScale);
      const pts=speed>10?1:Math.floor(Math.random()*3+4);
      for(let i=0;i<pts;i++) this._flameParticles.push(new FlameParticle(this._currentX,this._currentY,wx,wy,oxygenScale));
      if(speed>3&&this._frameCount%2===0) this._smokeParticles.push(new SmokeParticle(this._currentX,this._currentY-20,vx,vy));
      else if(this._frameCount%6===0) this._smokeParticles.push(new SmokeParticle(this._currentX+(Math.random()-0.5)*5,this._currentY-50,0,0));
      const ox=(this._currentX-this._canvas.width/2)*0.02, oy=(this._currentY-this._canvas.height/2)*0.02;
      this._liveEl.style.transform=`scale(1.05) translate(${ox}px,${oy}px)`;
    } else { this._liveEl.style.transform='scale(1.05) translate(0px,0px)'; }
    ctx.globalCompositeOperation='source-over';
    for(let i=this._smokeParticles.length-1;i>=0;i--){const p=this._smokeParticles[i];p.update();p.draw(ctx);if(p.life<=0)this._smokeParticles.splice(i,1);}
    ctx.globalCompositeOperation='lighter';
    for(let i=this._flameParticles.length-1;i>=0;i--){const p=this._flameParticles[i];p.update(wx);p.draw(ctx);if(p.life<=0)this._flameParticles.splice(i,1);}
  }

  _updateScene2(ctx) {
    ctx.globalCompositeOperation='lighter';
    this._fireflies.forEach(f=>{f.update(this._currentX,this._currentY,this._frameCount);f.draw(ctx);});
    if(this._frameCount%2===0&&this._fireflies.length>0&&!state.isAwakening){
      const f=this._fireflies[0];
      const detectionRadius = window.innerWidth < 768 ? 300 : 220;
      // Use hint target position if active (autonomous sweep) — falls back to cursor
      const hintActive = this._hintTarget && Date.now() < this._hintTarget.until;
      const lightX = hintActive ? this._hintTarget.x : this._currentX;
      const lightY = hintActive ? this._hintTarget.y : this._currentY;
      this._whispers.forEach(w=>{
        const rect=w.getBoundingClientRect(), wx=rect.left+rect.width/2, wy=rect.top+rect.height/2;
        const dc=Math.hypot(wx-lightX,wy-lightY), df=Math.hypot(wx-f.x,wy-f.y);
        const cl=dc<df?{x:lightX,y:lightY,dist:dc}:{x:f.x,y:f.y,dist:df};
        if(cl.dist<detectionRadius){
          const intensity=1-cl.dist/detectionRadius;
          w.style.color=`rgba(220,240,255,${intensity*0.9})`;
          const sx=(wx-cl.x)*0.08, sy=(wy-cl.y)*0.08;
          w.style.textShadow=`${sx}px ${sy}px 6px rgba(0,0,0,0.9),0 0 15px rgba(150,200,255,${intensity*0.5})`;
          if(intensity>0.4&&w.dataset.found!=='true'){
            w.dataset.found='true'; state.whispersFound++;
            this._onWhisperFound(parseInt(w.dataset.index));
            if(state.whispersFound>=this._whispers.length) setTimeout(()=>this._onAllWhispersFound(),1000);
          }
        } else {
          if(w.dataset.found!=='true'){w.style.color='rgba(255,255,255,0)';w.style.textShadow='none';}
          else{w.style.color='rgba(220,240,255,0.3)';w.style.textShadow='0 0 10px rgba(150,200,255,0.2)';}
        }
      });
    }
  }
}
