import { state, CHARACTERS } from '../core/StateManager.js';
const root = document.documentElement;

class FlameParticle {
  constructor(x,y,wx,wy,o) { this.x=x+(Math.random()-0.5)*4;this.y=y;this.size=Math.random()*16+8;this.life=1.0;this.seed=Math.random()*100;this.decay=Math.random()*0.01+0.008+(1-o)*0.02;this.vy=-Math.random()*1.5-0.5;this.vx=wx*0.2+(Math.random()-0.5)*0.4; }
  update(wx) { this.x+=this.vx;this.y+=this.vy;this.x+=Math.sin(this.life*6+this.seed)*0.3;this.vx*=0.95;this.vx+=wx*0.02;this.life-=this.decay;this.size*=0.96; }
  draw(ctx) { const r=255,g=Math.floor(Math.max(0,190*(this.life*this.life))),b=this.life>0.92?80:Math.floor(Math.max(0,30*(this.life-0.7)*3)),a=this.life*0.5; const gr=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,Math.max(0.1,this.size)); gr.addColorStop(0,`rgba(${r},${g},${b},${a})`);gr.addColorStop(0.4,`rgba(${r},${g},${b},${a*0.6})`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`); ctx.beginPath();ctx.arc(this.x,this.y,Math.max(0.1,this.size),0,Math.PI*2);ctx.fillStyle=gr;ctx.fill(); }
}

// Pre-rendered smoke sprite removed — gradient per-frame avoids Z-axis scaling artefact
// (OffscreenCanvas sprite was causing particles to appear as if zooming toward the viewer)

class SmokeParticle {
  constructor(x,y,vx,vy) {
    this.x=x; this.y=y; this.life=1.0;
    this.size=Math.random()*8+4;
    this.vx=vx*0.15+(Math.random()-0.5)*0.5;
    this.vy=vy*0.15-Math.random()*1.0-0.5;
    this.decay=Math.random()*0.003+0.0015;  // slow — particles live long like Vela7
    this.angle=Math.random()*Math.PI*2;
    this.spin=(Math.random()-0.5)*0.15;
    this.cr=Math.random()*1.5+0.5;          // curl radius restored to Vela7 range
  }
  update() {
    this.vx*=0.96; this.vy*=0.97; this.vy-=0.03;
    this.angle+=this.spin;
    const c=this.cr*(1.2-this.life);
    this.x+=this.vx+Math.cos(this.angle)*c;
    this.y+=this.vy+Math.sin(this.angle)*c;
    this.size+=0.25;
    this.life-=this.decay;
  }
  draw(ctx) {
    // Gradient per-frame (not sprite) — avoids Z-axis zoom artefact when scaling
    const alpha = this.life * 0.12;
    const gr = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,Math.max(0.1,this.size));
    gr.addColorStop(0,   `rgba(140,150,160,${alpha})`);
    gr.addColorStop(0.5, `rgba(140,150,160,${alpha*0.5})`);
    gr.addColorStop(1,   'rgba(140,150,160,0)');
    ctx.beginPath(); ctx.arc(this.x,this.y,Math.max(0.1,this.size),0,Math.PI*2);
    ctx.fillStyle=gr; ctx.fill();
  }
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
    if(fade<=0) return;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    const op = this.opacity * fade;
    if(this.isMacro){
      // Macro particles (~4%) keep gradient — they're large and need soft falloff
      ctx.shadowBlur=this.blur;
      ctx.shadowColor=this.isLit?`rgba(255,160,50,${op*2})`:`rgba(180,200,255,${op})`;
      const gr=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size);
      if(this.isLit){gr.addColorStop(0,`rgba(255,200,100,${op*0.8})`);gr.addColorStop(0.5,`rgba(255,150,50,${op*0.4})`);gr.addColorStop(1,`rgba(255,100,0,0)`);}
      else{gr.addColorStop(0,`rgba(220,240,255,${op*0.6})`);gr.addColorStop(0.5,`rgba(180,200,255,${op*0.2})`);gr.addColorStop(1,`rgba(150,180,255,0)`);}
      ctx.fillStyle=gr;
    } else {
      // Micro particles (~96%): shadowBlur only — no gradient allocation.
      // Replaces createRadialGradient per particle, eliminating ~6000 gradient
      // objects/second at 60fps. shadowBlur achieves the same soft-glow look.
      if(this.blur>0){
        ctx.shadowBlur=this.blur;
        ctx.shadowColor=this.isLit?`rgba(255,180,80,${op})`:`rgba(200,210,230,${op})`;
      } else {
        ctx.shadowBlur=0;
      }
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
    this._ctx=this._canvas.getContext('2d', {alpha: true}); // alpha:true required for destination-out
    // Spotlight state — driven by canvas destination-out, NOT CSS vars
    this._radioInt=0; this._radioExt=0; this._intensidad=0;
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
    // Cache whisper positions once — getBoundingClientRect every 2 frames was costly.
    // Positions only change on resize; we re-cache there too.
    this._cacheWhisperPositions();
    this._startWhisperHint();
  }

  _cacheWhisperPositions() {
    this._whisperPos = Array.from(this._whispers).map(w => {
      const r = w.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  }

  _startWhisperHint() {
    // No-op — idle hint is now driven from main.js via setWhisperHint() after inactivity
  }

  /**
   * Called by main.js after detecting idle in Scene 2.
   * Temporarily moves the detection light to a specific whisper position so it
   * gets naturally revealed by _updateScene2, then releases back to cursor.
   */
  setWhisperHint(x, y, duration = 2000) {
    this._hintTarget = { x, y, until: Date.now() + duration };
  }
  clearFlame() {
    this._flameParticles=[]; this._smokeParticles=[]; state.isIgnited=false;
    this._radioInt=0; this._radioExt=0; this._intensidad=0;
  }

  /**
   * Mobile tap — instant ignite without press-and-hold.
   * Skips the ignitionProgress buildup, jumps directly to ignited state.
   */
  forceIgnite() {
    state.isIgnited = true;
    state.isPressed = false;
    state.ignitionProgress = 150;
    this._radioInt = 180;
    this._radioExt = 680;
    this._intensidad = 0.85;
    this._instEl.style.opacity = '0';
    document.body.style.cursor = 'none';
    this._audio.playCharacterSignature(state.currentCharIndex);
    window._onIgnitionComplete?.();
  }

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
    if (window.innerWidth <= 768) this._liveEl.style.objectFit = 'cover';
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
      nextEl.style.objectFit = window.innerWidth <= 768 ? 'cover' : 'contain';
      nextEl.style.transform = 'scale(1.05)';
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
  _resizeCanvas() {
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    // Re-cache whisper positions — they shift on resize
    if (this._whisperPos) this._cacheWhisperPositions();
  }
  start() { this._lastFrameTime = 0; this._tick(0); }
  setAutoAdvanceMode(v) { this._autoAdvanceMode = v; }

  _tick(timestamp) {
    requestAnimationFrame((ts) => this._tick(ts));

    // Delta-time: clamp to 16-32ms to handle tab-switch pauses and 144Hz screens.
    // This ensures physics are frame-rate independent without ever blocking the render.
    // No early return — canvas always redraws so there's no stale frame flicker.
    const rawDelta = timestamp - this._lastFrameTime;
    if (rawDelta < 8) return; // Absolute minimum: skip only at >125Hz to save CPU
    const dt = Math.min(rawDelta, 32) / 16.67; // Normalize to 60fps = 1.0
    this._lastFrameTime = timestamp;
    this._frameCount++;

    const ctx=this._ctx, W=this._canvas.width, H=this._canvas.height;

    // Scene 4+ — clear canvas and return (no spotlight needed)
    if(state.activeScene>=4){ ctx.clearRect(0,0,W,H); return; }

    // ── Cursor lerp — scaled by dt so speed is frame-rate independent ────────
    const lf = state.isAwakening ? 0.05 : 0.1;
    const lfDt = 1 - Math.pow(1 - lf, dt); // Exponential decay corrected for dt
    this._currentX+=(this._targetX-this._currentX)*lfDt;
    this._currentY+=(this._targetY-this._currentY)*lfDt;
    const vx=this._currentX-this._lastX, vy=this._currentY-this._lastY;
    const speed=Math.sqrt(vx*vx+vy*vy);
    this._lastX=this._currentX; this._lastY=this._currentY;

    // --x/--y still needed for #scene-2-light radial gradient
    if(!state.isAwakening){ root.style.setProperty('--x',this._currentX+'px'); root.style.setProperty('--y',this._currentY+'px'); this._awakeningFrames=0; }
    else { this._radioExt=Math.min(this._radioExt+10, W*1.5); this._awakeningFrames++; }

    const cx=this._currentX, cy=this._currentY;

    // ── CANVAS HOLE-PUNCH SPOTLIGHT (replaces CSS mask) ──────────────────────
    // Step 1: Paint solid black blanket over entire canvas
    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=1;
    ctx.fillStyle='#020202';
    ctx.fillRect(0,0,W,H);

    // Step 2: Erase spotlight hole — destination-out makes canvas transparent at cursor
    // The video (z-index 0) and char-text (z-index 1) show through the transparent area
    if(this._radioExt>0){
      ctx.globalCompositeOperation='destination-out';
      const hole=ctx.createRadialGradient(cx,cy,this._radioInt,cx,cy,this._radioExt);
      hole.addColorStop(0,'rgba(0,0,0,1)');   // fully erase center
      hole.addColorStop(1,'rgba(0,0,0,0)');   // keep edges black
      ctx.fillStyle=hole;
      ctx.beginPath(); ctx.arc(cx,cy,this._radioExt,0,Math.PI*2); ctx.fill();
    }

    // Step 3: Ambient warm glow (lighter blend — adds to transparent + black areas)
    if(this._intensidad>0 && this._radioExt>0){
      ctx.globalCompositeOperation='lighter';
      const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,this._radioExt);
      glow.addColorStop(0,`rgba(255,110,20,${(this._intensidad*0.45).toFixed(3)})`);
      const midStop=Math.min(0.99,this._radioInt/Math.max(1,this._radioExt));
      glow.addColorStop(midStop,`rgba(180,40,0,${(this._intensidad*0.28).toFixed(3)})`);
      glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow;
      ctx.beginPath(); ctx.arc(cx,cy,this._radioExt,0,Math.PI*2); ctx.fill();
    }

    // ── Dust particles ───────────────────────────────────────────────────────
    const runDustSim=(this._frameCount%2===0);
    ctx.globalCompositeOperation='lighter';
    const dustFade=state.isAwakening?Math.max(0,1-this._awakeningFrames/120):1;
    for(let i=0;i<this._dustParticles.length;i++){
      if(runDustSim) this._dustParticles[i].update(cx,cy,vx,vy,state.isIgnited,this._frameCount,W,H);
      this._dustParticles[i].draw(ctx,dustFade);
    }

    if(state.activeScene===1) this._updateScene1(ctx,vx,vy,speed,dt);
    if(state.activeScene===2||state.activeScene===3) this._updateScene2(ctx);
  }

  _updateScene1(ctx,vx,vy,speed,dt=1) {
    const wx=-vx*1.2, wy=-vy*1.2;
    const oxygenScale=state.isIgnited?Math.max(0.05,1-speed*0.025):0;
    this._audio.setFireVolume(oxygenScale,this._audio.isReady&&(state.isPressed||state.isIgnited)&&!state.hasFinishedGallery);
    if(state.isIgnited&&!state.hasFinishedGallery) this._audio.emitCrackle();
    if(state.isPressed&&!state.isIgnited&&!state.hasFinishedGallery){
      state.ignitionProgress+=4.0*dt; const sc=state.ignitionProgress/150;
      this._radioInt=state.ignitionProgress*1.2;
      this._radioExt=state.ignitionProgress*4.5;
      if(!this._autoAdvanceMode) {
        this._intensidad=0.8*sc;
        if(Math.random()<sc*0.5) this._flameParticles.push(new FlameParticle(this._currentX,this._currentY,wx,wy,sc));
      } else {
        this._intensidad=0;
      }
      if(state.ignitionProgress>=150){
        state.isIgnited=true;
        this._instEl.style.opacity='0';
        document.body.style.cursor='none';
        this._audio.playCharacterSignature(state.currentCharIndex);
        window._onIgnitionComplete?.();
      }
    } else if(!state.isPressed&&!state.isIgnited&&state.ignitionProgress>0){
      state.ignitionProgress-=4.0*dt;
      if(state.ignitionProgress<=0){ state.ignitionProgress=0; if(state.isSwapping) this._swapToNextCharacter(); }
      const sc=state.ignitionProgress/150;
      this._radioInt=state.ignitionProgress*1.2;
      this._radioExt=state.ignitionProgress*4.5;
      this._intensidad=this._autoAdvanceMode?0:0.8*sc;
    }
    if(state.isIgnited){
      const oxygenScale = Math.max(0.05, 1-speed*0.025);
      const fl=Math.random()*5-2.5;
      this._radioInt=Math.max(40,(180+fl)*oxygenScale);
      this._radioExt=Math.max(120,(480+fl*2)*oxygenScale);
      if(!this._autoAdvanceMode) {
        this._intensidad=0.85*oxygenScale;
        const pts=speed>10?1:Math.floor(Math.random()*3+3);
        if(this._flameParticles.length < 50) for(let i=0;i<pts;i++) this._flameParticles.push(new FlameParticle(this._currentX,this._currentY,wx,wy,oxygenScale));
        if(this._smokeParticles.length < 85) {
          if(speed>3&&this._frameCount%2===0) this._smokeParticles.push(new SmokeParticle(this._currentX,this._currentY-20,vx,vy));
          else if(this._frameCount%4===0) this._smokeParticles.push(new SmokeParticle(this._currentX+(Math.random()-0.5)*5,this._currentY-50,0,0));
        }
      } else {
        this._intensidad=0;
      }
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

      // Mobile: whisper detection is handled exclusively by tap handlers in mobile.js.
      // Skip proximity detection here to avoid the firefly triggering whispers on its own.
      if (window.innerWidth >= 768) {
      // Use hint target position if active (autonomous sweep) — falls back to cursor
      const hintActive = this._hintTarget && Date.now() < this._hintTarget.until;
      const lightX = hintActive ? this._hintTarget.x : this._currentX;
      const lightY = hintActive ? this._hintTarget.y : this._currentY;
      // Use cached positions — avoids getBoundingClientRect() every frame (layout thrash)
      const pos = this._whisperPos || [];
      this._whispers.forEach((w, idx) => {
        const p = pos[idx]; if (!p) return;
        const wx = p.x, wy = p.y;
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
            document.dispatchEvent(new Event('whisperFound'));
            if(state.whispersFound>=this._whispers.length) setTimeout(()=>this._onAllWhispersFound(),2500);
          }
        } else {
          if(w.dataset.found!=='true'){w.style.color='rgba(255,255,255,0)';w.style.textShadow='none';}
          else{w.style.color='rgba(220,240,255,0.3)';w.style.textShadow='0 0 10px rgba(150,200,255,0.2)';}
        }
      });
      } // end desktop-only whisper detection
    }
  }
}
