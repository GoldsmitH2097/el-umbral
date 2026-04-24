import { CHARACTERS, CATALOGUE, state } from '../core/StateManager.js';

// Social platform SVG icons
const ICONS = {
  instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  threads: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.378-.887h-.018c-.852 0-1.953.254-2.692 1.61L7.436 8.98c.904-1.672 2.498-2.598 4.48-2.598h.023c3.019.014 4.822 1.913 5.153 5.33.17.056.34.117.508.183 1.305.52 2.297 1.338 2.869 2.37.77 1.397.982 3.552-.24 5.856-1.713 3.148-4.507 4.789-7.93 4.885H12.186z"/></svg>`
};

export class ArchiveDOM {
  constructor({router, onSceneChange, tizno=null}) {
    this._router=router; this._onSceneChange=onSceneChange; this._tizno=tizno;
    this._mainSite=document.getElementById('main-site');
    this._gridView=document.getElementById('grid-view');
    this._readingView=document.getElementById('reading-view');
    this._readTitle=document.getElementById('read-title');
    this._readBody=document.getElementById('read-body-content');
    this._readingBgVideo=document.getElementById('reading-bg-video');
    this._pactoModal=document.getElementById('pacto-modal');
    // Focus tracking — for returning focus on modal/reading close
    this._lastObraFocus = null;
    this._lastReadingFocus = null;
    this._pactoCallback = null; // called when user accepts El Pacto
    this._build(); this._bindEvents();
  }

  _build() {
    this._buildArchiveGrid();
    this._buildContact();
    this._bindObraModal();
  }

  _buildArchiveGrid() {
    const grid = document.getElementById('obras-section');
    if (!grid) return;
    grid.classList.add('archive-grid');

    // Scroll-indicator dots (mobile)
    const dotsBar = document.createElement('div');
    dotsBar.className = 'archive-scroll-dots';
    dotsBar.setAttribute('aria-hidden', 'true');

    CHARACTERS.forEach((char, i) => {
      // ── Column: one per archetype ──────────────────────────────────────
      const col = document.createElement('div');
      col.className = 'archive-col' + (char.status === 'missing' ? ' archive-col--missing' : '');
      col.dataset.index = i;
      col.dataset.archetype = char.slug;

      // ── Pillar section (video + character info) ────────────────────────
      const pillar = document.createElement('div');
      pillar.className = 'archive-pillar';
      pillar.setAttribute('role', 'button');
      pillar.setAttribute('tabindex', '0');

      const video = document.createElement('video');
      video.loop = true; video.muted = true; video.playsInline = true; video.preload = 'metadata';
      video.src = char.src; video.load();

      // Social links only in reading/detail view — NOT on the grid pillar
      const content = document.createElement('div');
      content.className = 'pillar-content';
      content.innerHTML = `<h4>${['I','II','III','IV'][i]}. ${char.label}</h4><p>${char.desc}</p>`;

      pillar.appendChild(video);
      pillar.appendChild(content);

      pillar.addEventListener('mouseenter', () => video.play().catch(() => {}));
      pillar.addEventListener('mouseleave', () => video.pause());
      pillar.addEventListener('touchstart', () => video.play().catch(() => {}), { passive: true });

      if (char.status !== 'missing') {
        pillar.addEventListener('click', () => { if (window.innerWidth > 768) this.openReading(i); });
        pillar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') this.openReading(i); });
      }

      col.appendChild(pillar);

      // ── Books section ──────────────────────────────────────────────────
      const books = document.createElement('div');
      books.className = 'archive-books';

      // Mobile archetype header
      const header = document.createElement('div');
      header.className = 'obra-archetype-header';
      header.innerHTML = `<span class="obra-archetype-label">${char.label}</span><span class="obra-archetype-author">${char.author || ''}</span>`;
      books.appendChild(header);

      const catalogue = CATALOGUE.filter(item => item.archetype === char.slug);

      if (catalogue.length === 0) {
        books.innerHTML += `<div class="obra-empty"><span>—</span></div>`;
      } else {
        catalogue.forEach(item => {
          const card = document.createElement('div');

          if (item.type === 'anthology') {
            card.className = `obra-book obra-book--${item.status}`;
            const coverHtml = item.img
              ? `<div class="obra-cover obra-cover--clickable obra-cover--anthology" data-id="${item.id}" role="button" tabindex="0" aria-label="Ver detalles de ${item.title}"><img src="${item.img}" alt="${item.title}" loading="lazy" decoding="async" /></div>`
              : `<div class="obra-cover obra-cover--empty"></div>`;
            card.innerHTML = `
              ${coverHtml}
              <div class="obra-meta">
                <div class="obra-badges">
                  <span class="obra-status-pill obra-status-pill--coming-soon">En preparación</span>
                  <span class="obra-format-badge">Antología</span>
                </div>
                <h3 class="obra-title">${item.title}</h3>
                ${item.subtitle ? `<p class="obra-subtitle">${item.subtitle}</p>` : ''}
                <p class="obra-desc">${item.desc}</p>
                <span class="obra-btn obra-btn--soon">${item.buyLabel || 'Próximamente'}</span>
              </div>`;
            books.appendChild(card); return;
          }

          card.className = `obra-book obra-book--${item.status}`;
          const coverHtml = item.img
            ? `<div class="obra-cover obra-cover--clickable" data-id="${item.id}" role="button" tabindex="0" aria-label="Ver detalles de ${item.title}"><img src="${item.img}" alt="${item.title}" loading="lazy" decoding="async" /></div>`
            : `<div class="obra-cover obra-cover--clickable obra-cover--empty" data-id="${item.id}" role="button" tabindex="0" aria-label="Ver detalles de ${item.title}"></div>`;

          let ctaHtml = '';
          if (item.editions) {
            // Multi-edition card — one cover, edition buttons below
            const editionBtns = item.editions.map(ed => {
              if (ed.status === 'available' && ed.buyUrl) {
                return `<a href="${ed.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy obra-edition-btn">
                  <span class="obra-edition-label">${ed.label}</span>${ed.buyLabel}
                </a>`;
              }
              return `<span class="obra-btn obra-btn--soon obra-edition-btn">
                <span class="obra-edition-label">${ed.label}</span>${ed.buyLabel}
              </span>`;
            }).join('');
            ctaHtml = `<div class="obra-editions">${editionBtns}</div>`;
          } else if (item.status === 'available' && item.buyUrl) {
            ctaHtml = `<a href="${item.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy">${item.buyLabel}</a>`;
          } else if (item.status === 'countdown') {
            ctaHtml = `<div class="obra-countdown"><div class="countdown-timer" data-release="${item.releaseDate}"></div><span class="obra-btn obra-btn--locked">${item.buyLabel}</span></div>`;
          } else {
            ctaHtml = `<span class="obra-btn obra-btn--soon">${item.buyLabel || 'Próximamente'}</span>`;
          }

          const statusLabels = { 'available': 'Disponible', 'coming-soon': 'Próximamente', 'countdown': 'Preventa' };
          const formatLabels = { 'Novela': 'Edición Física', 'Novela — Edición de coleccionista': 'Edición Física', 'Experiencia web interactiva': 'Experiencia Digital', 'Antología': 'Antología' };

          card.innerHTML = `
            ${coverHtml}
            <div class="obra-meta">
              <div class="obra-badges">
                <span class="obra-status-pill obra-status-pill--${item.status}">${statusLabels[item.status] || item.status}</span>
                ${item.format ? `<span class="obra-format-badge">${formatLabels[item.format] || item.format}</span>` : ''}
              </div>
              <h3 class="obra-title">${item.title}</h3>
              ${item.subtitle ? `<p class="obra-subtitle">${item.subtitle}</p>` : ''}
              <p class="obra-desc">${item.desc}</p>
              ${ctaHtml}
            </div>`;
          books.appendChild(card);

          const charIdx = CHARACTERS.findIndex(c => c.slug === item.archetype);
          const coverEl = card.querySelector('.obra-cover--clickable');
          if (coverEl) {
            // Clicking a book opens the author panel on "Libros" tab
            const openLibros = () => { if (window.innerWidth > 768) this.openReading(charIdx, 'libros'); };
            coverEl.addEventListener('click', openLibros);
            coverEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLibros(); });
          }
        });
      }

      col.appendChild(books);
      grid.appendChild(col);

      // Dot per column
      const dot = document.createElement('div');
      dot.className = 'archive-scroll-dot' + (i === 0 ? ' active' : '');
      dotsBar.appendChild(dot);
    });

    // Dots above the grid — better scroll affordance on mobile
    grid.insertAdjacentElement('beforebegin', dotsBar);

    // Mobile: update dots on scroll
    // Mobile: mark first column active by default
    if (window.innerWidth <= 768) {
      const firstCol = grid.querySelector('.archive-col');
      firstCol?.classList.add('archive-col--active');
    }

    grid.addEventListener('scroll', () => {
      const idx = Math.round(grid.scrollLeft / grid.offsetWidth);
      dotsBar.querySelectorAll('.archive-scroll-dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
      });
      // Mobile: active column = full-color video
      if (window.innerWidth <= 768) {
        document.querySelectorAll('.archive-col').forEach((col, i) => {
          col.classList.toggle('archive-col--active', i === idx);
        });
      }
    }, { passive: true });

    this._initCountdowns();
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this._initCoverTilt();
    }
    this._initScrollReveal();
  }

  _initScrollReveal() {
    const cards = document.querySelectorAll('.archive-books .obra-book');
    if (!cards.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    cards.forEach((card, i) => {
      const col = card.closest('.archive-col');
      const colIndex = col ? [...document.querySelectorAll('.archive-col')].indexOf(col) : 0;
      card.style.transitionDelay = `${colIndex * 80}ms`;
      observer.observe(card);
    });
  }

  _initCoverTilt() {
    const MAP_W = 24, MAP_H = 36;
    document.querySelectorAll('.obra-cover--clickable').forEach(cover => {
      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.className = 'cover-bump-canvas';
      bumpCanvas.width = MAP_W; bumpCanvas.height = MAP_H;
      cover.appendChild(bumpCanvas);
      const bctx = bumpCanvas.getContext('2d');
      const imgData = bctx.createImageData(MAP_W, MAP_H);

      let heightMap = null, rafId = null;
      let targetX = 0.5, targetY = 0.5, currentX = 0.5, currentY = 0.5;
      let isHovering = false;

      const buildHeightMap = () => {
        if (heightMap) return;
        const img = cover.querySelector('img');
        if (!img || !img.complete || !img.naturalWidth) return;
        try {
          const off = document.createElement('canvas'); off.width = MAP_W; off.height = MAP_H;
          const ctx = off.getContext('2d'); ctx.drawImage(img, 0, 0, MAP_W, MAP_H);
          const px = ctx.getImageData(0, 0, MAP_W, MAP_H).data;
          const raw = new Float32Array(MAP_W * MAP_H);
          for (let i = 0; i < MAP_W * MAP_H; i++) raw[i] = (0.299*px[i*4]+0.587*px[i*4+1]+0.114*px[i*4+2])/255;
          heightMap = new Float32Array(MAP_W * MAP_H);
          for (let y=1;y<MAP_H-1;y++) for (let x=1;x<MAP_W-1;x++) { const i=y*MAP_W+x; heightMap[i]=(raw[i]*4+raw[i-1]+raw[i+1]+raw[i-MAP_W]+raw[i+MAP_W])/8; }
        } catch(_) {}
      };

      const renderBump = (lx, ly) => {
        if (!heightMap) return;
        const lz=0.7, lLen=Math.sqrt(lx*lx+ly*ly+lz*lz), nlx=lx/lLen, nly=ly/lLen, nlz=lz/lLen, d=imgData.data;
        for (let y=1;y<MAP_H-1;y++) for (let x=1;x<MAP_W-1;x++) {
          const i=y*MAP_W+x, nx=(heightMap[i-1]-heightMap[i+1])*4, ny=(heightMap[i-MAP_W]-heightMap[i+MAP_W])*4, nz=1.0;
          const nLen=Math.sqrt(nx*nx+ny*ny+nz*nz), dot=Math.max(0,(nx/nLen)*nlx+(ny/nLen)*nly+(nz/nLen)*nlz), idx=i*4;
          d[idx]=Math.min(255,dot*320); d[idx+1]=Math.min(255,dot*260); d[idx+2]=Math.min(255,dot*160); d[idx+3]=Math.min(55,dot*85);
        }
        bctx.putImageData(imgData, 0, 0);
      };

      // LERP loop — decouples mousemove from DOM writes (layout thrashing fix)
      const lerpLoop = () => {
        if (!isHovering) return;
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        const rotY = (currentX-0.5)*18, rotX = -(currentY-0.5)*18;
        cover.style.transform = `perspective(600px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        cover.style.filter = `drop-shadow(${((currentX-0.5)*16).toFixed(1)}px ${((currentY-0.5)*16).toFixed(1)}px 16px rgba(0,0,0,0.7))`;
        renderBump((0.5-currentX)*1.6, (0.5-currentY)*1.6);
        rafId = requestAnimationFrame(lerpLoop);
      };

      cover.addEventListener('mouseenter', () => {
        isHovering = true;
        const img = cover.querySelector('img');
        if (img && !img.complete) img.addEventListener('load', buildHeightMap, {once:true}); else buildHeightMap();
        if (!rafId) rafId = requestAnimationFrame(lerpLoop);
      });
      cover.addEventListener('mousemove', (e) => {
        // Only store target — RAF loop applies the actual transform
        const rect = cover.getBoundingClientRect();
        targetX = (e.clientX - rect.left) / rect.width;
        targetY = (e.clientY - rect.top) / rect.height;
      });
      cover.addEventListener('mouseleave', () => {
        isHovering = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        cover.style.transition = 'transform 0.45s cubic-bezier(0.25,1,0.5,1), filter 0.45s ease';
        cover.style.transform = ''; cover.style.filter = '';
        bctx.clearRect(0, 0, MAP_W, MAP_H);
        currentX = 0.5; currentY = 0.5;
        setTimeout(() => { cover.style.transition = ''; }, 450);
      });
    });
  }

  _initCountdowns() {
    const timers = document.querySelectorAll('.countdown-timer');
    timers.forEach(el => {
      const target = new Date(el.dataset.release).getTime();
      let prevS = -1;
      const update = () => {
        const now = Date.now();
        const diff = target - now;
        if (diff <= 0) { el.textContent = 'Disponible ahora'; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const slide = s !== prevS ? ' countdown-slide' : '';
        prevS = s;
        el.innerHTML = `<span>${d}<em>d</em></span><span>${h}<em>h</em></span><span>${m}<em>m</em></span><span class="countdown-seconds${slide}">${s}<em>s</em></span>`;
      };
      update();
      setInterval(update, 1000);
    });
  }

  _buildContact() {
    const section = document.getElementById('contact-section');
    if (!section) return;
    section.innerHTML = `
      <div class="contact-inner">
        <h2 class="contact-title">Contacto</h2>
        <p class="contact-sub">Prensa, colaboraciones y preguntas sobre el universo Soulware.</p>
        <form class="contact-form" id="contact-form" name="contacto-soulware" data-netlify="true" netlify-honeypot="bot-field">
          <input type="hidden" name="form-name" value="contacto-soulware" />
          <input type="text" name="bot-field" style="display:none" aria-hidden="true" />
          <input type="text" name="name" placeholder="Nombre" required autocomplete="name" />
          <input type="email" name="email" placeholder="Email" required autocomplete="email" />
          <textarea name="message" placeholder="Mensaje" rows="4" required></textarea>
          <button type="submit" class="obra-btn obra-btn--buy">Enviar</button>
        </form>
        <div class="contact-footer">
          <p class="contact-email"><a href="mailto:editorial@soulware.live">editorial@soulware.live</a></p>
          <a href="https://www.instagram.com/core.soulware" target="_blank" rel="noopener" class="contact-social-link">
            ${ICONS.instagram} <span>@core.soulware</span>
          </a>
        </div>
      </div>
    `;
  }

  showArchive({skipIntro=false}={}) {
    if(skipIntro) this._mainSite.style.transition='none';
    this._mainSite.style.opacity='1'; this._mainSite.style.pointerEvents='auto';
    if(skipIntro) requestAnimationFrame(()=>{this._mainSite.style.transition='opacity 3s ease';});
    setTimeout(()=>{
      this._gridView.classList.add('archive-visible');
      // Archetype persistence: pre-highlight the column for the last active character in Scene 1
      const idx = state.currentCharIndex;
      const cols = document.querySelectorAll('.archive-col');
      if (idx >= 0 && idx < cols.length) {
        cols[idx]?.classList.add('archive-col--highlighted');
        // Remove after 4s — transient welcome highlight, not a permanent state
        setTimeout(() => cols[idx]?.classList.remove('archive-col--highlighted'), 4000);
      }
      // Focus management: move keyboard focus to archive heading (WCAG 2.4.3)
      setTimeout(()=>{ this._gridView.querySelector('h2[tabindex]')?.focus(); }, 100);
    }, 200);
  }

  openReading(index, activeTab = 'autor') {
    const char=CHARACTERS[index]; if(!char) return;
    this._lastReadingFocus = document.activeElement;
    this._readTitle.innerText=char.title;
    // Add section label above bio
    const sectionLabel = '<p class="reading-section-label">Autor</p>';
    const socialHtml = char.social.length > 0
      ? `<div class="reading-social">${char.social.map(s =>
          `<a href="${s.url}" target="_blank" rel="noopener" class="reading-social-link">
            ${ICONS[s.platform]} <span>${s.handle}</span>
          </a>`).join('')}</div>`
      : '';
    this._readBody.innerHTML = sectionLabel + char.lore + socialHtml;
    this._readingBgVideo.src=char.src; this._readingBgVideo.load(); this._readingBgVideo.play().catch(()=>{});

    // Populate Libros panel
    const obrasList = document.getElementById('reading-obras-list');
    if (obrasList) {
      const obras = CATALOGUE.filter(c => c.archetype === char.slug);
      const librosLabel = '<p class="reading-section-label">Obras</p>';
      if (obras.length === 0) {
        obrasList.innerHTML = librosLabel + '<p style="color:#333;letter-spacing:3px;font-size:10px;text-transform:uppercase;text-align:center;padding:40px 0;">En preparación</p>';
      } else {
        obrasList.innerHTML = librosLabel + obras.map(item => {
          const coverHtml = item.img
            ? `<div class="reading-obra-cover"><img src="${item.img}" alt="${item.title}" loading="lazy" decoding="async" /></div>`
            : `<div class="reading-obra-cover"><div class="reading-obra-cover-empty">${item.type==='anthology'?'Antología':'—'}</div></div>`;
          let ctaHtml = '';
          if (item.editions) {
            const edBtns = item.editions.map(ed => ed.status === 'available' && ed.buyUrl
              ? `<a href="${ed.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy obra-edition-btn"><span class="obra-edition-label">${ed.label}</span>${ed.buyLabel}</a>`
              : `<span class="obra-btn obra-btn--soon obra-edition-btn"><span class="obra-edition-label">${ed.label}</span>${ed.buyLabel}</span>`
            ).join('');
            ctaHtml = `<div class="obra-editions">${edBtns}</div>`;
          } else if (item.status === 'available' && item.buyUrl)
            ctaHtml = `<a href="${item.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy">${item.buyLabel}</a>`;
          else if (item.status === 'countdown')
            ctaHtml = `<div class="obra-countdown"><div class="countdown-timer" data-release="${item.releaseDate}"></div><span class="obra-btn obra-btn--locked">${item.buyLabel}</span></div>`;
          else
            ctaHtml = `<span class="obra-btn obra-btn--soon">${item.buyLabel || 'Próximamente'}</span>`;
          return `<div class="reading-obra-card">
            ${coverHtml}
            <div class="reading-obra-info">
              <h3 class="reading-obra-title">${item.title}</h3>
              ${item.subtitle ? `<p class="reading-obra-subtitle">${item.subtitle}</p>` : ''}
              ${item.author ? `<p class="reading-obra-author">${item.author}</p>` : ''}
              <p class="reading-obra-vision">${item.vision || item.desc}</p>
              <div class="reading-obra-meta">
                ${item.format ? `<span class="reading-obra-format">${item.format}</span>` : ''}
                ${item.seriesInfo ? `<span class="reading-obra-format">${item.seriesInfo}</span>` : ''}
                ${ctaHtml}
              </div>
            </div>
          </div>`;
        }).join('');
        // Init countdowns inside panel
        obrasList.querySelectorAll('.countdown-timer').forEach(el => this._initSingleCountdown(el));
      }
    }

    this._gridView.style.transform='scale(0.95)'; this._gridView.style.opacity='0';
    setTimeout(()=>{
      this._readingView.style.display='block';
      this._readingView.style.opacity='1'; this._readingView.style.pointerEvents='auto';
      this._readingView.scrollTo(0,0); this._onSceneChange(5);
      // Switch to requested tab
      this._switchReadingTab(activeTab);
      this._readTitle?.focus();
      if (!document.getElementById('btn-volver')) {
        const btn = document.createElement('button');
        btn.id = 'btn-volver';
        btn.textContent = '← Volver';
        btn.addEventListener('click', () => this.closeReading());
        document.body.appendChild(btn);
      }
      // Wire tab buttons
      document.querySelectorAll('#reading-view .reading-tab').forEach(b => {
        b.onclick = () => this._switchReadingTab(b.dataset.tab);
      });
    },500);
  }

  _switchReadingTab(tab) {
    document.querySelectorAll('#reading-view .reading-tab').forEach(b => {
      b.classList.toggle('reading-tab--active', b.dataset.tab === tab);
      b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
    });
    const autor = document.getElementById('reading-panel-autor');
    const libros = document.getElementById('reading-panel-libros');
    autor?.classList.toggle('reading-panel--active', tab === 'autor');
    libros?.classList.toggle('reading-panel--active', tab === 'libros');
  }

  closeReading() {
    // Remove button from DOM entirely — no CSS hiding, no ghost rendering
    document.getElementById('btn-volver')?.remove();
    this._readingView.style.opacity='0'; this._readingView.style.pointerEvents='none';
    setTimeout(()=>{
      this._readingView.style.display='none';
      this._gridView.style.transform='scale(1)'; this._gridView.style.opacity='1';
      this._readingBgVideo.pause(); this._readingBgVideo.src=''; this._onSceneChange(4);
      // Return focus to the pillar that triggered reading view
      setTimeout(()=>{ this._lastReadingFocus?.focus(); this._lastReadingFocus = null; }, 50);
    },500);
    if(this._router) this._router.navigateToArchive();
  }

  openPacto(cb) {
    this._pactoCallback = cb || null;
    this._pactoModal.style.opacity='1';
    this._pactoModal.style.pointerEvents='auto';
    setTimeout(()=>{ document.getElementById('btn-cerrar-pacto')?.focus(); }, 100);
  }
  closePacto() {
    // Step 1: text vanishes immediately (feels decisive)
    this._pactoModal.querySelectorAll('h2, p').forEach(el => {
      el.style.transition = 'opacity 0.2s ease';
      el.style.opacity = '0';
    });
    const btn = document.getElementById('btn-cerrar-pacto');
    if (btn) { btn.style.transition='opacity 0.1s'; btn.style.opacity='0'; }

    // Step 2: backdrop fades after 200ms
    setTimeout(() => {
      this._pactoModal.style.opacity='0';
      this._pactoModal.style.pointerEvents='none';
    }, 200);

    // Step 3: hide completely after fade (display:none prevents Safari compositing ghost)
    setTimeout(() => {
      this._pactoModal.style.display='none';
    }, 1100);

    // Step 3: callback fires after full fade (0.8s transition + 200ms offset)
    if (this._pactoCallback) {
      const cb = this._pactoCallback;
      this._pactoCallback = null;
      setTimeout(cb, 900);
    }
  }

  _bindObraModal() {
    const modal = document.getElementById('obra-modal');
    const closeBtn = document.getElementById('obra-modal-close');
    if (!modal) return;
    closeBtn?.addEventListener('click', () => this._closeObraModal());
    modal.addEventListener('click', (e) => { if (e.target === modal) this._closeObraModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._closeObraModal(); });
    // Tab switching
    document.querySelectorAll('.obra-tab').forEach(btn => {
      btn.addEventListener('click', () => this._switchModalTab(btn.dataset.tab));
    });
    window._openObraModal = (id) => this.openObraModal(id);
  }

  openObraModal(itemId) {
    const item = CATALOGUE.find(c => c.id === itemId); if (!item) return;
    this._lastObraFocus = document.activeElement;
    const char = CHARACTERS.find(c => c.slug === item.archetype);
    const modal = document.getElementById('obra-modal');

    // Always reset to "La Visión" tab on open
    this._switchModalTab('vision');

    document.getElementById('obra-modal-archetype').textContent =
      char ? `Arquetipo: ${char.title}` : '';

    // La Visión — atmospheric pitch
    document.getElementById('obra-modal-vision').textContent =
      item.vision || item.desc;

    // El Manuscrito — practical info
    document.getElementById('obra-modal-title').textContent = item.title;
    document.getElementById('obra-modal-subtitle').textContent = item.subtitle || '';
    document.getElementById('obra-modal-author').textContent =
      item.author ? `Autor: ${item.author}` : '';
    document.getElementById('obra-modal-series').textContent = item.seriesInfo || '';
    document.getElementById('obra-modal-format').textContent = item.format || '';
    document.getElementById('obra-modal-desc').textContent = item.desc;

    const coverEl = document.getElementById('obra-modal-cover');
    coverEl.innerHTML = item.img
      ? `<img src="${item.img}" alt="${item.title}" />`
      : `<div class="obra-modal-no-cover">${item.type === 'anthology' ? 'Antología' : 'Sin portada'}</div>`;

    let ctaHtml = '';
    if (item.type === 'anthology') {
      const relatosHtml = item.relatos && item.relatos.length > 0
        ? `<ul class="obra-modal-relatos">${item.relatos.map(r =>
            `<li><span class="obra-relato-title">${r.title}</span> <span class="obra-relato-author">${r.author}</span></li>`
          ).join('')}</ul>`
        : `<p style="font-size:12px;color:#444;letter-spacing:2px;font-style:italic;">Relatos en preparación.</p>`;
      ctaHtml = relatosHtml;
    } else if (item.status === 'available' && item.buyUrl) {
      ctaHtml = `<a href="${item.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy">${item.buyLabel}</a>`;
    } else if (item.status === 'countdown') {
      ctaHtml = `<div class="obra-countdown">
        <div class="countdown-timer" data-release="${item.releaseDate}"></div>
        <span class="obra-btn obra-btn--locked">${item.buyLabel}</span>
      </div>`;
      setTimeout(() => {
        const timer = modal.querySelector('.countdown-timer');
        if (timer) this._initSingleCountdown(timer);
      }, 50);
    } else {
      ctaHtml = `<span class="obra-btn obra-btn--soon">${item.buyLabel || 'Próximamente'}</span>`;
    }
    document.getElementById('obra-modal-cta').innerHTML = ctaHtml;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(()=>{ document.getElementById('obra-modal-close')?.focus(); }, 50);
  }

  _switchModalTab(tab) {
    document.querySelectorAll('.obra-tab').forEach(btn => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('obra-tab--active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    document.querySelectorAll('.obra-tab-panel').forEach(panel => {
      panel.classList.toggle('obra-tab-panel--active', panel.id === `obra-panel-${tab}`);
    });
  }

  _closeObraModal() {
    const modal = document.getElementById('obra-modal');
    modal?.classList.remove('open');
    document.body.style.overflow = '';
    // Return focus to the cover that triggered the modal
    setTimeout(()=>{ this._lastObraFocus?.focus(); this._lastObraFocus = null; }, 50);
  }

  _initSingleCountdown(el) {
    const target = new Date(el.dataset.release).getTime();
    let prevS = -1;
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) { el.textContent = 'Disponible ahora'; return; }
      const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000);
      const m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
      const slide = s !== prevS ? ' countdown-slide' : '';
      prevS = s;
      el.innerHTML = `<span>${d}<em>d</em></span><span>${h}<em>h</em></span><span>${m}<em>m</em></span><span class="countdown-seconds${slide}">${s}<em>s</em></span>`;
    };
    update(); setInterval(update, 1000);
  }

  _bindEvents() {
    document.getElementById('final-btn')?.addEventListener('click',()=>this._onSceneChange('enterMainSite'));
    document.getElementById('btn-cerrar-pacto')?.addEventListener('click',()=>this.closePacto());
    document.querySelectorAll('[data-action]').forEach(el=>{
      el.addEventListener('click',()=>{
        if(el.dataset.action==='scroll-top') document.getElementById('main-site').scrollTo({top:0,behavior:'smooth'});
        if(el.dataset.action==='scroll-obras') document.getElementById('obras-section')?.scrollIntoView({behavior:'smooth'});
        if(el.dataset.action==='scroll-contact') this._tizno ? this._tizno.toggle() : document.getElementById('contact-section')?.scrollIntoView({behavior:'smooth'});
        if(el.dataset.action==='open-pacto') this.openPacto();
      });
    });

    // Legal modals — intercept footer links, fetch & display inline
    const legalModal  = document.getElementById('legal-modal');
    const legalClose  = document.getElementById('legal-modal-close');
    const legalTitle  = document.getElementById('legal-modal-title');
    const legalBody   = document.getElementById('legal-modal-body');
    const openLegal = async (slug, title) => {
      legalTitle.textContent = title;
      legalBody.innerHTML = '<p style="color:#444;letter-spacing:2px;">Cargando...</p>';
      legalModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      try {
        const res = await fetch(`/${slug}.html`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        // Strip elements that don't belong in the modal overlay
        doc.querySelectorAll('img, .legal-logo, .legal-back, nav, header, style, script').forEach(el => el.remove());
        // Remove the "← Volver" and "Soulware" navigation links
        doc.querySelectorAll('a').forEach(a => {
          const t = a.textContent.trim();
          if (t === 'Soulware' || t.includes('Volver') || a.classList.contains('legal-logo') || a.classList.contains('legal-back')) {
            a.remove();
          }
        });
        const wrap = doc.querySelector('.legal-wrap, main, article, body');
        legalBody.innerHTML = wrap ? wrap.innerHTML : '';
      } catch {
        legalBody.innerHTML = '<p style="color:#555;">No se pudo cargar el contenido.</p>';
      }
      setTimeout(()=>{ legalClose?.focus(); }, 100);
    };
    const closeLegal = () => {
      legalModal?.classList.remove('open');
      document.body.style.overflow = '';
    };
    document.querySelectorAll('[data-legal]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        openLegal(a.dataset.legal, a.dataset.legalTitle || a.textContent);
      });
    });
    legalClose?.addEventListener('click', closeLegal);
    legalModal?.addEventListener('click', e => { if(e.target===legalModal) closeLegal(); });
    document.addEventListener('keydown', e => { if(e.key==='Escape' && legalModal?.classList.contains('open')) closeLegal(); });

    // Contact form submit (Netlify)
    document.addEventListener('submit', async e => {
      if (!e.target.matches('#contact-form, #tizno-contact-form, #tizno-pacto-form')) return;
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Enviando...'; btn.disabled = true;
      try {
        const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(e.target)).toString() });
        btn.textContent = res.ok ? 'Enviado ✓' : 'Error — inténtalo de nuevo';
        if (res.ok) e.target.reset();
        else { btn.disabled = false; setTimeout(() => { btn.textContent = original; }, 3000); }
      } catch { btn.textContent = 'Error'; btn.disabled = false; setTimeout(() => { btn.textContent = original; }, 3000); }
    });
  }
}
