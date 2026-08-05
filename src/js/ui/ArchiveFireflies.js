/**
 * ArchiveFireflies.js
 * Ambient fireflies in Scene 4. After inactivity they guide toward obras, then contact.
 * Particles (C): sparse dust — only runs on capable hardware.
 */

const FIREFLY_COUNT = 6;
const INACTIVITY_OBRAS   = 18000;  // 18s → drift toward obras
const INACTIVITY_CONTACT = 36000;  // 36s → drift toward contact
const INACTIVITY_TIZNO   = 55000;  // 55s → orbit Tizno tease
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CAPABLE = navigator.hardwareConcurrency >= 4 && !REDUCED_MOTION;
// Throttle to ~30fps — halves CPU vs 60fps. Fireflies move slowly; you won't notice.
const FRAME_MS = 33;

// ── Firefly class ─────────────────────────────────────────────────────────────
class Firefly {
  constructor(container, index) {
    this.el = document.createElement('div');
    this.el.className = 'archive-firefly';
    this.el.setAttribute('aria-hidden', 'true');
    container.appendChild(this.el);
    this._reset(index);
  }

  _reset(index) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    // Spread across the full viewport (was clustered top-third with H*1.2 going off-screen)
    this.x  = 60 + Math.random() * (W - 120);
    this.y  = 80 + Math.random() * (H - 160);
    // More dynamic motion than before
    this.vx = (Math.random() - 0.5) * 1.0;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.phase = Math.random() * Math.PI * 2 + index * 1.3;
    this.size  = 2.5 + Math.random() * 1.5;
    // Per-firefly speed multiplier — adds variance, some drift lazily, others wander faster
    this.speedMult = 0.7 + Math.random() * 0.6;
    this.el.style.width  = this.size + 'px';
    this.el.style.height = this.size + 'px';
  }

  update(targetX, targetY, attraction, scrollDY = 0, cursor = null) {
    this.phase += 0.018 + Math.random() * 0.006;
    // Independent X/Y sine phases for less correlated horizontal/vertical drift
    this._phaseX = (this._phaseX || (Math.random() * Math.PI * 2)) + 0.012;
    this._phaseY = (this._phaseY || (Math.random() * Math.PI * 2)) + 0.014;

    // Erratic Brownian drift — equally weighted X and Y, like Scene 1 fireflies
    this.vx += (Math.random() - 0.5) * 0.18 * this.speedMult + Math.sin(this._phaseX) * 0.06;
    this.vy += (Math.random() - 0.5) * 0.16 * this.speedMult + Math.sin(this._phaseY) * 0.06;

    // Scroll-direction nudge — fireflies catch the wake of scroll like dust in air
    if (scrollDY !== 0) {
      this.vy += scrollDY * 0.04;
    }

    // Cursor REPULSION — fireflies flee from the mouse, fearful.
    // Force falls off with distance² so they only react when the cursor is near.
    if (cursor) {
      const dx = this.x - cursor.x;
      const dy = this.y - cursor.y;
      const distSq = dx * dx + dy * dy + 1;
      const repelRadius = 220;
      if (distSq < repelRadius * repelRadius) {
        const dist = Math.sqrt(distSq);
        const strength = (1 - dist / repelRadius) * 1.4;
        this.vx += (dx / dist) * strength;
        this.vy += (dy / dist) * strength;
      }
    }

    // Attraction toward guide target (Tizno orbit, obras section, etc.)
    if (attraction > 0) {
      this.vx += (targetX - this.x) * attraction;
      this.vy += (targetY - this.y) * attraction;
    }

    // Damping
    this.vx *= 0.95;
    this.vy *= 0.95;

    // Speed cap (let them flee fast when escaping the cursor)
    const spd = Math.hypot(this.vx, this.vy);
    if (spd > 3.2) { this.vx = this.vx / spd * 3.2; this.vy = this.vy / spd * 3.2; }

    this.x += this.vx;
    this.y += this.vy;

    // Soft viewport boundary — keep them on screen
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (this.x < 40)       this.vx += 0.25;
    if (this.x > W - 40)   this.vx -= 0.25;
    if (this.y < 60)       this.vy += 0.25;
    if (this.y > H - 60)   this.vy -= 0.25;

    // Blink: slow organic pulse
    const blink = 0.3 + 0.7 * Math.abs(Math.sin(this.phase * 0.55));
    this.el.style.transform = `translate(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px)`;
    this.el.style.opacity = (blink * 0.75).toFixed(3);
  }

  destroy() { this.el.remove(); }
}

// ── Ambient particles (C) — only on capable hardware ─────────────────────────
class AmbientParticles {
  constructor(container) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'archive-particles';
    this.canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this._resize();
    this._spawn();
    window.addEventListener('resize', () => this._resize(), { passive: true });
  }

  /* Lienzo a MEDIA resolución interna, estirado por CSS al tamaño completo.
     Son motas doradas difuminadas de 0,4-1,2 px de radio: nadie distingue la
     diferencia, pero el trabajo de rasterizado cae a la cuarta parte (y con
     él la textura que sube a la GPU). El contexto se escala, así que todo el
     código de dibujo sigue pensando en píxeles CSS. */
  _resize() {
    const ESC = 0.5;
    this.W = window.innerWidth;
    this.H = window.innerHeight;   // alto fijo del viewport (el contenedor es position:fixed)
    this.canvas.width  = Math.max(1, Math.round(this.W * ESC));
    this.canvas.height = Math.max(1, Math.round(this.H * ESC));
    this.canvas.style.width  = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    // cambiar width/height resetea el contexto: la escala se reaplica aquí
    this.ctx.setTransform(ESC, 0, 0, ESC, 0, 0);
  }

  _spawn() {
    const count = Math.floor(this.W / 80); // ~12-18 particles
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x:  Math.random() * this.W,
        y:  Math.random() * this.H,
        vy: 0.12 + Math.random() * 0.18,   // drift upward
        vx: (Math.random() - 0.5) * 0.08,
        r:  0.4 + Math.random() * 0.8,
        a:  Math.random() * 0.12 + 0.04,   // max opacity
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    for (const p of this.particles) {
      p.phase += 0.015;
      p.y  -= p.vy;
      p.x  += p.vx;
      if (p.y < -10) { p.y = this.H + 10; p.x = Math.random() * this.W; }

      const alpha = p.a * (0.4 + 0.6 * Math.abs(Math.sin(p.phase)));
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(200,146,42,${alpha.toFixed(3)})`;
      this.ctx.fill();
    }
  }

  destroy() { this.canvas.remove(); }
}

// ── Main export ───────────────────────────────────────────────────────────────
export class ArchiveFireflies {
  constructor(tiznoTease = null) {
    this._tizno     = tiznoTease;
    this._container = null;
    this._fireflies = [];
    this._particles = null;
    this._raf       = null;
    this._lastActivity = Date.now();
    this._running   = false;
    this._obrasY    = 0;
    this._contactY  = 0;
    this._orbitAngle = 0;
    this._lastFrame = 0;
    this._lastScrollY = 0;
    this._scrollDY = 0;
    this._scrollDecay = 0;
    // Cursor tracking — fireflies gently drift toward where you're looking
    this._cursorX = window.innerWidth / 2;
    this._cursorY = window.innerHeight / 2;
    this._cursorActive = false;
  }

  init() {
    // Attach to body (not #main-site) so position:fixed works correctly on scroll.
    // Build the entire subtree DETACHED first, then attach once — appending each
    // firefly to an already-attached container caused per-firefly forced reflows
    // (verified via Lighthouse: 62 ms of layout thrash in the bundled init).
    this._container = document.createElement('div');
    this._container.className = 'archive-firefly-container';
    this._container.setAttribute('aria-hidden', 'true');

    // Spawn fireflies INTO the detached container (no DOM = no layout cost)
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      this._fireflies.push(new Firefly(this._container, i));
    }

    // Ambient particles — capable hardware only (also adds to detached container)
    if (CAPABLE) {
      this._particles = new AmbientParticles(this._container);
    }

    // Single attach — flushes layout exactly once for the whole subtree
    document.body.appendChild(this._container);

    // Track user activity + scroll velocity on mainSite
    const mainSite = document.getElementById('main-site');
    if (!mainSite) return;
    const reset = () => { this._lastActivity = Date.now(); };
    mainSite.addEventListener('mousemove', e => {
      this._lastActivity = Date.now();
      // Track cursor in viewport coords (container is position:fixed)
      this._cursorX = e.clientX;
      this._cursorY = e.clientY;
      this._cursorActive = true;
    }, { passive: true });
    mainSite.addEventListener('mouseleave', () => { this._cursorActive = false; }, { passive: true });
    mainSite.addEventListener('touchstart',reset, { passive: true });
    mainSite.addEventListener('click',     reset, { passive: true });
    mainSite.addEventListener('scroll', () => {
      this._lastActivity = Date.now();
      const y = mainSite.scrollTop;
      // Capture instantaneous delta — applied to fireflies as a "wake" force
      this._scrollDY = (y - this._lastScrollY) * 0.5;
      this._lastScrollY = y;
      this._scrollDecay = 0.9; // ~20 frames of inertia decay
    }, { passive: true });

    // Page Visibility — pause when tab hidden, resume when visible (saves CPU)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this._pause();
      else if (this._running === false) this._resume();
    });

    this._running = true;
    this._loop(0);
  }

  _pause() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this._running = false;
  }

  _resume() {
    this._running = true;
    this._lastFrame = 0;
    this._loop(0);
  }

  _getTargets() {
    // Container is position:fixed — use viewport-relative coords (no scroll offset needed)
    const obrasEl   = document.getElementById('obras-section');
    const contactEl = document.getElementById('contact-section');

    if (obrasEl) {
      const r = obrasEl.getBoundingClientRect();
      this._obrasY = r.top + r.height * 0.4;
    } else {
      this._obrasY = window.innerHeight * 0.42;
    }
    if (contactEl) {
      const r = contactEl.getBoundingClientRect();
      this._contactY = r.top + 80;
    } else {
      /* #contact-section ya no existe (el contacto vive en la cabecera):
         sin este respaldo la coordenada quedaba undefined, la luciérnaga
         se evaporaba en NaN y le retransmitía NaN a Tizno — congelado. */
      this._contactY = window.innerHeight * 0.62;
    }
  }

  _loop(t) {
    if (!this._running) return;
    this._raf = requestAnimationFrame((nt) => this._loop(nt));

    // ~30fps throttle (FRAME_MS = 33ms)
    if (t - this._lastFrame < FRAME_MS) return;
    this._lastFrame = t;

    const idle = Date.now() - this._lastActivity;
    // Only refresh layout-reading targets when we're about to need them (idle approaching).
    // Calling getBoundingClientRect every frame forces synchronous layout — verified as
    // the main UpdateLayoutTree contributor in the 2026-05-14 perf trace.
    if (idle > INACTIVITY_OBRAS - 1500) this._getTargets();

    const W2 = window.innerWidth / 2;

    // Scroll-delta decay (the "wake" effect fades over ~20 frames)
    const scrollDY = this._scrollDY;
    this._scrollDY *= this._scrollDecay;
    if (Math.abs(this._scrollDY) < 0.01) this._scrollDY = 0;

    // Cursor object passed to each firefly so they can flee from it
    const cursor = this._cursorActive ? { x: this._cursorX, y: this._cursorY } : null;

    this._fireflies.forEach((ff, i) => {
      let tx = W2, ty = this._obrasY, att = 0;

      if (this._tizno?.estaLibre?.() && i === 0) {
        /* LA POLILLA (Ruben): vaga libre por TODA la página, y cada cierto
           tiempo hace una visita — se lanza hacia Tizno un par de segundos
           (él se encoge al verla cerca) y vuelve a su vagabundeo (él la
           sigue con la mirada si el ratón calla). */
        const ahora = Date.now();
        if (!this._proximaVisita) {
          this._proximaVisita = ahora + 6000 + Math.random() * 8000;
          this._vagarX = Math.random() * window.innerWidth;
          this._vagarY = Math.random() * window.innerHeight * 0.8;
          this._vagarHasta = 0;
        }
        if (ahora < this._visitaHasta) {
          const tp = this._tizno.posicionDeTizno?.();
          if (tp) { tx = tp.x + (Math.random() - 0.5) * 50; ty = tp.y + (Math.random() - 0.5) * 30; att = 0.004; }
        } else if (ahora > this._proximaVisita) {
          this._visitaHasta = ahora + 2200 + Math.random() * 1300;
          this._proximaVisita = ahora + 9000 + Math.random() * 9000;
        } else {
          if (ahora > this._vagarHasta) {
            this._vagarHasta = ahora + 4000 + Math.random() * 3500;
            /* Territorio de Tizno (Ruben): vaga alrededor DE ÉL (±350 px),
               no por toda la página — viviendo lejos, él quedaba con
               tortícolis eterna mirando arriba-izquierda. */
            const tp = this._tizno.posicionDeTizno?.() || { x: window.innerWidth * 0.75, y: window.innerHeight * 0.6 };
            this._vagarX = Math.max(40, Math.min(window.innerWidth - 40, tp.x + (Math.random() - 0.5) * 700));
            this._vagarY = Math.max(60, Math.min(window.innerHeight - 80, tp.y + (Math.random() - 0.72) * 520));
          }
          tx = this._vagarX; ty = this._vagarY; att = 0.0009;
        }
      } else if (idle > INACTIVITY_TIZNO && this._tizno && i === 0 && !this._tizno.estaLibre?.()) {
        /* Solo la COMPAÑERA (la primera) ronda el candado de Tizno como
           invitación a pulsarlo. Seis luciérnagas acosando un botón sería
           ruido; una que insiste es una señal (Ruben, 4-ago). */
        this._orbitAngle += 0.008;
        const tPos = this._tizno.getPosition();
        if (tPos) {
          const radius = 26;
          tx = tPos.x + Math.cos(this._orbitAngle) * radius;
          ty = tPos.y + Math.sin(this._orbitAngle) * radius * 0.5;
          att = 0.003;
        }
      } else if (idle > INACTIVITY_CONTACT) {
        tx = W2 + (i % 2 === 0 ? -60 : 60);
        ty = this._contactY + i * 20;
        att = 0.0008;
      } else if (idle > INACTIVITY_OBRAS) {
        tx = W2 + (i % 2 === 0 ? -80 : 80);
        ty = this._obrasY + i * 30;
        att = 0.0006;
      }

      ff.update(tx, ty, att, scrollDY, cursor);
    });

    // Tizno libre: la compañera le retransmite su posición — él la mira
    // cuando el ratón calla (y ella deja de rondar el candado).
    if (this._tizno?.estaLibre?.()) {
      const c = this._fireflies[0];
      if (c) this._tizno.enviarLuciernaga?.(c.x, c.y);
    }

    if (this._particles) this._particles.draw();
  }

  destroy() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._fireflies.forEach(ff => ff.destroy());
    this._particles?.destroy();
    this._container?.remove();
  }
}
