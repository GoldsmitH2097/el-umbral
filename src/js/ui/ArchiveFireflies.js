/**
 * ArchiveFireflies.js
 * Ambient fireflies in Scene 4. After inactivity they guide toward obras, then contact.
 * Particles (C): sparse dust — only runs on capable hardware.
 */

const FIREFLY_COUNT = 4;
const INACTIVITY_OBRAS = 18000;   // 18s idle → drift toward obras
const INACTIVITY_CONTACT = 36000; // 36s idle → drift toward contact
const CAPABLE = navigator.hardwareConcurrency >= 4
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    this.x  = 80 + Math.random() * (W - 160);
    this.y  = 200 + Math.random() * (H * 1.2);
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.phase = Math.random() * Math.PI * 2 + index * 1.3;
    this.size  = 2.5 + Math.random() * 1.5;
    this.el.style.width  = this.size + 'px';
    this.el.style.height = this.size + 'px';
  }

  update(targetX, targetY, attraction) {
    this.phase += 0.018 + Math.random() * 0.006;

    // Brownian drift
    this.vx += (Math.random() - 0.5) * 0.08;
    this.vy += (Math.random() - 0.5) * 0.06 + Math.sin(this.phase) * 0.04;

    // Attraction toward guide target
    if (attraction > 0) {
      this.vx += (targetX - this.x) * attraction;
      this.vy += (targetY - this.y) * attraction;
    }

    // Damping
    this.vx *= 0.96;
    this.vy *= 0.96;

    // Speed cap
    const spd = Math.hypot(this.vx, this.vy);
    if (spd > 1.8) { this.vx = this.vx / spd * 1.8; this.vy = this.vy / spd * 1.8; }

    this.x += this.vx;
    this.y += this.vy;

    // Soft boundary
    const W = window.innerWidth;
    if (this.x < 40)       this.vx += 0.25;
    if (this.x > W - 40)   this.vx -= 0.25;
    if (this.y < 80)        this.vy += 0.25;
    if (this.y > 3000)      this.vy -= 0.25;

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

  _resize() {
    this.W = this.canvas.width  = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight * 2.5;
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
  constructor() {
    this._container = null;
    this._fireflies = [];
    this._particles = null;
    this._raf = null;
    this._lastActivity = Date.now();
    this._running = false;
    this._obrasY    = 0;
    this._contactY  = 0;
  }

  init() {
    const mainSite = document.getElementById('main-site');
    if (!mainSite) return;

    // Firefly container — fixed overlay inside archive
    this._container = document.createElement('div');
    this._container.className = 'archive-firefly-container';
    this._container.setAttribute('aria-hidden', 'true');
    mainSite.appendChild(this._container);

    // Spawn fireflies
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      this._fireflies.push(new Firefly(this._container, i));
    }

    // Ambient particles — capable hardware only
    if (CAPABLE) {
      this._particles = new AmbientParticles(this._container);
    }

    // Track user activity
    const reset = () => { this._lastActivity = Date.now(); };
    mainSite.addEventListener('mousemove', reset, { passive: true });
    mainSite.addEventListener('scroll',    reset, { passive: true });
    mainSite.addEventListener('touchstart',reset, { passive: true });
    mainSite.addEventListener('click',     reset, { passive: true });

    this._running = true;
    this._loop();
  }

  _getTargets() {
    const obrasEl   = document.getElementById('obras-section');
    const contactEl = document.getElementById('contact-section');
    const mainSite  = document.getElementById('main-site');
    const scroll    = mainSite?.scrollTop || 0;

    if (obrasEl) {
      const r = obrasEl.getBoundingClientRect();
      this._obrasY = r.top + scroll + r.height * 0.4;
    }
    if (contactEl) {
      const r = contactEl.getBoundingClientRect();
      this._contactY = r.top + scroll + 80;
    }
  }

  _loop() {
    if (!this._running) return;
    this._raf = requestAnimationFrame(() => this._loop());

    const idle = Date.now() - this._lastActivity;
    this._getTargets();

    const W2 = window.innerWidth / 2;

    this._fireflies.forEach((ff, i) => {
      let tx = W2, ty = this._obrasY, att = 0;

      if (idle > INACTIVITY_CONTACT) {
        // Guide toward contact
        tx = W2 + (i % 2 === 0 ? -60 : 60);
        ty = this._contactY + i * 20;
        att = 0.0008;
      } else if (idle > INACTIVITY_OBRAS) {
        // Guide toward obras
        tx = W2 + (i % 2 === 0 ? -80 : 80);
        ty = this._obrasY + i * 30;
        att = 0.0006;
      }

      ff.update(tx, ty, att);
    });

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
