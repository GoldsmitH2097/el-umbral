import { CHARACTERS, CATALOGUE, state, Events } from '../core/StateManager.js';
import { pickVideoSrc, pickPillarSrc } from '../core/videoVariant.js';
import { t, getField, lang } from '../core/i18n.js';
import { retailer } from '../core/retailers.js';

// ── Buy CTAs ────────────────────────────────────────────────────────────────
// One implementation, used by BOTH the Las Obras grid card and the reading-view
// obra card. These were duplicated line-for-line; a third copy was one feature
// away, so they now share this.

// A shop. The logo is painted via CSS mask (see retailers.js) so its colour is
// pure CSS and the hover is a real colour transition; until the asset exists we
// render a styled wordmark instead. Never a broken image.
function retailerLink(r) {
  const meta = retailer(r.id);
  const inner = meta.logo
    ? `<span class="retailer-mark" aria-hidden="true" style="--logo:url('${meta.logo}');${meta.w ? `--logo-w:${meta.w}px;` : ''}${meta.brand ? `--brand:${meta.brand};` : ''}"></span>`
    : `<span class="retailer-wordmark">${meta.name}</span>`;
  return `<a href="${r.url}" target="_blank" rel="noopener"
             class="retailer-logo retailer-logo--${r.id}"
             aria-label="${t('cta.buyAt')} ${meta.name}">${inner}</a>`;
}

// An edition = a label, an invitation, and the shops that carry it.
function editionBlock(ed) {
  const label   = getField(ed, 'label');
  const shops   = (ed.retailers || []).filter(r => r.url); // no link, no logo
  const soonLbl = getField(ed, 'buyLabel') || t('cta.coming-soon');

  // Available but nothing linkable yet (e.g. a URL we're still waiting on)
  // degrades to the coming-soon treatment rather than rendering a dead row.
  if (ed.status !== 'available' || !shops.length) {
    return `<div class="obra-edition-row">
      <span class="obra-btn obra-btn--soon obra-edition-btn">
        <span class="obra-edition-label">${label}</span>${soonLbl}
      </span></div>`;
  }

  // compact: the label itself is the link. For a single-shop edition (the
  // ebook) a logo strip holding one mark reads as an accident, and an
  // invitation line above one word is noise.
  if (ed.compact) {
    const r = shops[0];
    return `<div class="obra-edition-block obra-edition-block--compact">
      <a href="${r.url}" target="_blank" rel="noopener" class="obra-edition-link"
         aria-label="${label} — ${t('cta.buyAt')} ${retailer(r.id).name}">${label}</a>
    </div>`;
  }

  // Full edition: label, one line of dry fact, then the shops. No invitation
  // line — the shops are self-evidently the way to buy, and the card is
  // stronger for saying less.
  const meta = getField(ed, 'meta');
  return `<div class="obra-edition-block">
    <p class="obra-edition-head">${label}</p>
    ${meta ? `<p class="obra-edition-meta">${meta}</p>` : ''}
    <div class="retailer-strip">${shops.map(retailerLink).join('')}</div>
  </div>`;
}

// Ficha técnica — the dry publication facts, shown only in the detail view
// (the grid card stays deliberately minimal). Every row is optional, so a book
// with partial data renders just what it has instead of empty labels.
function fichaBlock(item) {
  const f = item.ficha;
  if (!f) return '';
  // Values only, no label column — a label per row read as a spec sheet and
  // took six lines to say four things. ISBN keeps its prefix because a bare
  // 13-digit number means nothing without it. Page count is deliberately
  // absent: it's already stated directly above, under the edition it belongs to.
  const parts = [
    getField(f, 'binding'),
    getField(f, 'language'),
    f.publisher,
    f.published,
    f.isbn ? `${t('ficha.isbn')} ${f.isbn}` : '',
  ].filter(Boolean);
  if (!parts.length) return '';
  return `<p class="obra-ficha">${parts.map(v => `<span class="obra-ficha-item">${v}</span>`).join('<span class="obra-ficha-sep">·</span>')}</p>`;
}

// The full CTA area for a catalogue item, whatever shape it is.
function renderCta(item) {
  if (item.editions) {
    return `<div class="obra-editions">${item.editions.map(editionBlock).join('')}</div>`;
  }
  if (item.status === 'available' && item.retailers?.some(r => r.url)) {
    return `<div class="obra-editions">${editionBlock(item)}</div>`;
  }
  const buyLabel = getField(item, 'buyLabel');
  const [edLabel, ...rest] = (buyLabel || '').split(': ');
  const lbl = rest.length
    ? `<span class="obra-edition-label">${edLabel}</span>${rest.join(': ')}`
    : buyLabel;
  if (item.status === 'available' && item.buyUrl) {
    return `<a href="${item.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy${rest.length ? ' obra-edition-btn' : ''}">${lbl}</a>`;
  }
  if (item.status === 'countdown') {
    return `<div class="obra-countdown"><div class="countdown-timer" data-release="${item.releaseDate}"></div><button class="obra-btn obra-btn--locked obra-btn--notify${rest.length ? ' obra-edition-btn' : ''}">${lbl}</button></div>`;
  }
  return `<span class="obra-btn obra-btn--soon">${buyLabel || t('cta.notify')}</span>`;
}

// Social platform SVG icons
const ICONS = {
  instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  threads: `<svg width="16" height="16" viewBox="0 0 192 192" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.1095 97.0132 16.9405C119.988 17.1108 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/></svg>`
};

export class ArchiveDOM {
  constructor({router, onSceneChange, tizno=null, audio=null}) {
    this._router=router; this._onSceneChange=onSceneChange; this._tizno=tizno; this._audio=audio;
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
    this._countdownTimers = new Set(); // track setInterval handles for cleanup
    this._build(); this._bindEvents();
  }

  _build() {
    this._buildArchiveGrid();
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
      // preload='none' on init: defer ~4×100 KB of video metadata until the
      // user actually reaches Scene 4. Switched to 'metadata' on sceneChange→4.
      // poster = the t≈1.5s character reveal frame (~10-20 KB webp). Gives the
      // pillar a beautiful frozen-portrait look on mobile / slow connections
      // before any video bytes load, instead of pure-black panels.
      video.loop = true; video.muted = true; video.playsInline = true; video.preload = 'none';
      video.poster = char.src.replace(/^\/(.+)\.mp4$/, '/posters/$1.webp');
      video.setAttribute('aria-hidden', 'true'); // decorative ambient — no captions needed
      // Pillars ALWAYS use 720p — see pickPillarSrc(). They display at ~250 px
      // wide in the carousel, so 1080p is invisible-quality overkill, and
      // four concurrent ~1 MB downloads were stalling on flaky networks
      // (caught in May-21 Chrome trace: arlequin requested 3× over 38 s).
      // Stash the canonical char.src on dataset for any future re-pick path.
      video.dataset.charSrc = char.src;
      video.src = pickPillarSrc(char.src);

      // Social links only in reading/detail view — NOT on the grid pillar
      const content = document.createElement('div');
      content.className = 'pillar-content';
      content.innerHTML = `<h3>${['I','II','III','IV'][i]}. ${getField(char, 'label')}</h3><p>${getField(char, 'desc')}</p>`;

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
      header.innerHTML = `<span class="obra-archetype-label">${getField(char, 'label')}</span><span class="obra-archetype-author">${char.author || ''}</span>`;
      books.appendChild(header);

      const catalogue = CATALOGUE.filter(item => item.archetype === char.slug);

      if (catalogue.length === 0) {
        books.innerHTML += `<div class="obra-empty"><span>—</span></div>`;
      } else {
        catalogue.forEach(item => {
          const card = document.createElement('div');

          const itemTitle = getField(item, 'title');
          const itemSubtitle = getField(item, 'subtitle');

          if (item.type === 'anthology') {
            card.className = `obra-book obra-book--${item.status}`;
            const coverHtml = item.img
              ? `<div class="obra-cover obra-cover--clickable obra-cover--anthology" data-id="${item.id}" role="button" tabindex="0" aria-label="${itemTitle}"><img src="${item.img}" srcset="${item.img.replace('/assets/','/assets/mobile/')} 280w, ${item.img} 500w" sizes="(max-width: 768px) 150px, 220px" alt="${itemTitle}" width="600" height="900" loading="lazy" decoding="async" /></div>`
              : `<div class="obra-cover obra-cover--empty"></div>`;
            card.innerHTML = `
              ${coverHtml}
              <div class="obra-meta">
                <div class="obra-badges">
                  <span class="obra-format-badge">${t('format.anthology')}</span>
                </div>
                <h3 class="obra-title">${itemTitle}</h3>
                ${itemSubtitle ? `<p class="obra-subtitle">${itemSubtitle}</p>` : ''}
                <span class="obra-btn obra-btn--soon">${getField(item, 'buyLabel') || t('cta.notify')}</span>
              </div>`;
            books.appendChild(card); return;
          }

          card.className = `obra-book obra-book--${item.status}`;
          const coverHtml = item.img
            ? `<div class="obra-cover obra-cover--clickable" data-id="${item.id}" role="button" tabindex="0" aria-label="${itemTitle}"><img src="${item.img}" srcset="${item.img.replace('/assets/','/assets/mobile/')} 280w, ${item.img} 500w" sizes="(max-width: 768px) 150px, 220px" alt="${itemTitle}" width="600" height="900" loading="lazy" decoding="async" /></div>`
            : `<div class="obra-cover obra-cover--clickable obra-cover--empty" data-id="${item.id}" role="button" tabindex="0" aria-label="${itemTitle}"></div>`;

          const ctaHtml = renderCta(item);

          const statusLabels = { 'available': t('pill.available'), 'coming-soon': t('pill.coming-soon'), 'countdown': t('pill.countdown') };
          const formatLabels = { 'Novela': t('format.book'), 'Novela — Edición de coleccionista': t('format.book'), 'Experiencia web interactiva': t('format.experience'), 'Antología': t('format.anthology') };

          card.innerHTML = `
            ${coverHtml}
            <div class="obra-meta">
              <div class="obra-badges">
                ${item.status === 'available' ? `<span class="obra-status-pill obra-status-pill--${item.status}">${statusLabels[item.status]}</span>` : ''}
                ${item.status !== 'available' && item.format ? `<span class="obra-format-badge">${formatLabels[item.format] || item.format}</span>` : ''}
              </div>
              <h3 class="obra-title">${itemTitle}</h3>
              ${itemSubtitle ? `<p class="obra-subtitle">${itemSubtitle}</p>` : ''}
              ${ctaHtml}
            </div>`;
          books.appendChild(card);

          const charIdx = CHARACTERS.findIndex(c => c.slug === item.archetype);
          const coverEl = card.querySelector('.obra-cover--clickable');
          // Clicking a book opens its detail view (the author panel on "Libros",
          // which carries the full ficha técnica). The WHOLE card is the target,
          // not just the cover — but never steal a click that landed on a real
          // link or button, or the shop logos would stop working.
          const openLibros = () => { if (window.innerWidth > 768) this.openReading(charIdx, 'libros'); };
          if (coverEl) {
            card.addEventListener('click', (e) => {
              if (e.target.closest('a, button')) return;
              openLibros();
            });
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

    // Coming-soon / locked CTAs → open Tizno panel for email capture
    grid.addEventListener('click', e => {
      const btn = e.target.closest('.obra-btn--soon, .obra-btn--notify, .obra-btn--locked');
      if (btn) { e.preventDefault(); this._tizno?.open(); }
    });

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
    this._initPillarPreloadOnScroll();
  }

  // Belt-and-suspenders for pillar video preloading. Primary trigger is the
  // sceneChange→4 listener in _bindEvents() (fires on Adentrarse / skip-btn /
  // reduced-motion / deep-link). This observer catches any future path that
  // might miss that event, by upgrading preload when a pillar approaches view.
  //
  // CRITICAL: gated on state.activeScene >= 4. Scene 4 is rendered in-flow
  // BENEATH the fixed Scene 1 overlay at y ~1240 px — within IntersectionObserver
  // range even on initial page load. Without the scene gate, the observer would
  // start downloading pillar videos *during the intro*, on top of the gallery
  // video. (Caught by Uptrends, May 14: 1080p Emperatriz + 720p Emperatriz both
  // fetching in the same waterfall.)
  _initPillarPreloadOnScroll() {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(entries => {
      if (state.activeScene < 4) return;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const v = entry.target.querySelector('video');
        if (v && v.preload !== 'auto') v.preload = 'auto';
        io.unobserve(entry.target);
      });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('.archive-pillar').forEach(p => io.observe(p));
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
        if (diff <= 0) { el.textContent = t('countdown.now'); return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const slide = s !== prevS ? ' countdown-slide' : '';
        prevS = s;
        el.innerHTML = `<span>${d}<em>d</em></span><span>${h}<em>h</em></span><span>${m}<em>m</em></span><span class="countdown-seconds${slide}">${s}<em>s</em></span>`;
      };
      update();
      const handle = setInterval(update, 1000);
      this._countdownTimers.add(handle);
    });
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
    this._currentReadingIndex = index; // used by hover-sound handler for reading-view covers
    // "Door closes" — muffle the ambient while the user reads
    this._audio?.setReadingViewMuffle(true);
    this._readTitle.innerText=getField(char, 'title');
    // Add section label above bio
    const sectionLabel = `<p class="reading-section-label">${t('nav.author')}</p>`;
    const socialHtml = char.social.length > 0
      ? `<div class="reading-social">${char.social.map(s =>
          `<a href="${s.url}" target="_blank" rel="noopener" class="reading-social-link">
            ${ICONS[s.platform]} <span>${s.handle}</span>
          </a>`).join('')}</div>`
      : '';
    this._readBody.innerHTML = sectionLabel + getField(char, 'lore') + socialHtml;
    this._readingBgVideo.src=char.src; this._readingBgVideo.load(); this._readingBgVideo.play().catch(()=>{});

    // Populate Libros panel
    const obrasList = document.getElementById('reading-obras-list');
    if (obrasList) {
      const obras = CATALOGUE.filter(c => c.archetype === char.slug);
      const librosLabel = `<p class="reading-section-label">${t('ui.books')}</p>`;
      if (obras.length === 0) {
        obrasList.innerHTML = librosLabel + `<p style="color:#333;letter-spacing:3px;font-size:10px;text-transform:uppercase;text-align:center;padding:40px 0;">${t('ui.in-preparation')}</p>`;
      } else {
        obrasList.innerHTML = librosLabel + obras.map(item => {
          const itemTitle = getField(item, 'title');
          const itemSubtitle = getField(item, 'subtitle');
          const itemAuthor = getField(item, 'author');
          const itemVision = getField(item, 'vision') || getField(item, 'desc');
          const itemFormat = getField(item, 'format');
          const coverHtml = item.img
            ? `<div class="reading-obra-cover"><img src="${item.img}" srcset="${item.img.replace('/assets/','/assets/mobile/')} 280w, ${item.img} 500w" sizes="(max-width: 768px) 150px, 220px" alt="${itemTitle}" width="600" height="900" loading="lazy" decoding="async" /></div>`
            : `<div class="reading-obra-cover"><div class="reading-obra-cover-empty">${item.type==='anthology'?t('format.anthology'):'—'}</div></div>`;
          const ctaHtml = renderCta(item);
          return `<div class="reading-obra-card">
            ${coverHtml}
            <div class="reading-obra-info">
              <h3 class="reading-obra-title">${itemTitle}</h3>
              ${itemSubtitle ? `<p class="reading-obra-subtitle">${itemSubtitle}</p>` : ''}
              ${itemAuthor ? `<p class="reading-obra-author">${itemAuthor}</p>` : ''}
              <p class="reading-obra-vision">${itemVision}</p>
              <div class="reading-obra-meta">
                ${itemFormat && !item.editions ? `<span class="reading-obra-format">${({ 'Novela': t('format.book'), 'Edición de coleccionista': t('format.book'), 'Experiencia web interactiva': t('format.experience'), 'Antología': t('format.anthology') })[itemFormat] || itemFormat}</span>` : ''}
                ${ctaHtml}
                ${fichaBlock(item)}
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
      this._readingView.removeAttribute('inert');
      this._readingView.removeAttribute('aria-hidden');
      this._readingView.scrollTo(0,0); this._onSceneChange(5);
      // Switch to requested tab
      this._switchReadingTab(activeTab);
      this._readTitle?.focus();
      if (!document.getElementById('btn-volver')) {
        const btn = document.createElement('button');
        btn.id = 'btn-volver';
        btn.textContent = t('reading-view.back');
        btn.setAttribute('data-i18n', 'reading-view.back');
        btn.setAttribute('aria-label', t('reading-view.back-aria'));
        btn.setAttribute('data-i18n-attr-aria-label', 'reading-view.back-aria');
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
    // "Door reopens" — restore ambient brightness
    this._audio?.setReadingViewMuffle(false);
    this._readingView.style.opacity='0'; this._readingView.style.pointerEvents='none';
    setTimeout(()=>{
      this._readingView.style.display='none';
      this._readingView.setAttribute('inert', '');
      this._readingView.setAttribute('aria-hidden', 'true');
      this._gridView.style.transform='scale(1)'; this._gridView.style.opacity='1';
      this._readingBgVideo.pause(); this._readingBgVideo.src=''; this._onSceneChange(4);
      // Return focus to the pillar that triggered reading view
      setTimeout(()=>{ this._lastReadingFocus?.focus(); this._lastReadingFocus = null; }, 50);
    },500);
    if(this._router) this._router.navigateToArchive();
  }

  openPacto(cb) {
    this._pactoCallback = cb || null;
    this._pactoModal.style.display = '';
    this._pactoModal.style.opacity='1';
    this._pactoModal.style.pointerEvents='auto';
    this._pactoModal.removeAttribute('inert');
    this._pactoModal.removeAttribute('aria-hidden');
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
      this._pactoModal.setAttribute('inert', '');
      this._pactoModal.setAttribute('aria-hidden', 'true');
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
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) this._closeObraModal(); });
    // Tab switching
    document.querySelectorAll('.obra-tab').forEach(btn => {
      btn.addEventListener('click', () => this._switchModalTab(btn.dataset.tab));
    });
    // Reading-view obras list — delegated once. Coming-soon CTAs open the Tizno panel.
    document.getElementById('reading-obras-list')?.addEventListener('click', e => {
      const btn = e.target.closest('.obra-btn--soon, .obra-btn--notify, .obra-btn--locked');
      if (btn) { e.preventDefault(); this._tizno?.open(); }
    });

    // Hover sounds — character-tuned chime on book covers, soft metallic
    // shimmer on active buy buttons. Uses mouseover + relatedTarget check
    // so each fires exactly once per element entry (mouseenter doesn't bubble).
    document.addEventListener('mouseover', e => {
      // Archive-grid cover → look up archetype from data-id
      const gridCover = e.target.closest('.obra-cover--clickable');
      if (gridCover && !gridCover.contains(e.relatedTarget)) {
        const item = CATALOGUE.find(c => c.id === gridCover.dataset.id);
        if (item) {
          const charIndex = CHARACTERS.findIndex(c => c.slug === item.archetype);
          if (charIndex >= 0) this._audio?.playCoverHover(charIndex);
        }
        return;
      }
      // Reading-view cover → use the currently-open character's archetype
      const readCover = e.target.closest('.reading-obra-cover');
      if (readCover && !readCover.contains(e.relatedTarget)) {
        if (this._currentReadingIndex >= 0) {
          this._audio?.playCoverHover(this._currentReadingIndex);
        }
        return;
      }
      // Active buy button hover → metallic shimmer (real links only)
      const btn = e.target.closest('a.obra-btn--buy[href]');
      if (btn && !btn.contains(e.relatedTarget)) {
        this._audio?.playButtonHover();
      }
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
      char ? `${t('ui.archetype')}: ${getField(char, 'title')}` : '';

    // La Visión — atmospheric pitch
    const modalTitle = getField(item, 'title');
    document.getElementById('obra-modal-vision').textContent =
      getField(item, 'vision') || getField(item, 'desc');

    // El Manuscrito — practical info
    document.getElementById('obra-modal-title').textContent = modalTitle;
    document.getElementById('obra-modal-subtitle').textContent = getField(item, 'subtitle') || '';
    document.getElementById('obra-modal-author').textContent =
      item.author ? `${t('ui.author')}: ${getField(item, 'author') || item.author}` : '';
    document.getElementById('obra-modal-series').textContent = getField(item, 'seriesInfo') || '';
    const _fmt = getField(item, 'format');
    document.getElementById('obra-modal-format').textContent =
      ({ 'Novela': t('format.book'), 'Edición de coleccionista': t('format.book'), 'Experiencia web interactiva': t('format.experience'), 'Antología': t('format.anthology') })[_fmt] || _fmt || '';
    document.getElementById('obra-modal-desc').textContent = getField(item, 'desc');

    const coverEl = document.getElementById('obra-modal-cover');
    coverEl.innerHTML = item.img
      ? `<img src="${item.img}" srcset="${item.img.replace('/assets/','/assets/mobile/')} 280w, ${item.img} 500w" sizes="(max-width: 768px) 150px, 220px" alt="${modalTitle}" width="600" height="900" />`
      : `<div class="obra-modal-no-cover">${item.type === 'anthology' ? t('format.anthology') : t('ui.no-cover')}</div>`;

    let ctaHtml = '';
    if (item.type === 'anthology') {
      const relatosHtml = item.relatos && item.relatos.length > 0
        ? `<ul class="obra-modal-relatos">${item.relatos.map(r =>
            `<li><span class="obra-relato-title">${r.title}</span> <span class="obra-relato-author">${r.author}</span></li>`
          ).join('')}</ul>`
        : `<p style="font-size:12px;color:#444;letter-spacing:2px;font-style:italic;">${t('ui.tales-in-preparation')}</p>`;
      ctaHtml = relatosHtml;
    } else if (item.editions) {
      const edBtns = item.editions.map(ed => {
        const edBuyLabel = getField(ed, 'buyLabel');
        const edLabel    = getField(ed, 'label');
        return ed.status === 'available' && ed.buyUrl
          ? `<div class="obra-edition-row"><a href="${ed.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy">${edBuyLabel}</a></div>`
          : `<div class="obra-edition-row"><span class="obra-btn obra-btn--soon obra-edition-btn"><span class="obra-edition-label">${edLabel}</span>${edBuyLabel}</span></div>`;
      }).join('');
      ctaHtml = `<div class="obra-editions">${edBtns}</div>`;
    } else if (item.status === 'available' && item.buyUrl) {
      const buyLabel = getField(item, 'buyLabel');
      const [edLabel, ...rest] = (buyLabel||'').split(': ');
      const lbl = rest.length ? `<span class="obra-edition-label">${edLabel}</span>${rest.join(': ')}` : buyLabel;
      ctaHtml = `<a href="${item.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy${rest.length?' obra-edition-btn':''}">${lbl}</a>`;
    } else if (item.status === 'countdown') {
      ctaHtml = `<div class="obra-countdown">
        <div class="countdown-timer" data-release="${item.releaseDate}"></div>
        <span class="obra-btn obra-btn--locked">${getField(item, 'buyLabel')}</span>
      </div>`;
      setTimeout(() => {
        const timer = modal.querySelector('.countdown-timer');
        if (timer) this._initSingleCountdown(timer);
      }, 50);
    } else {
      ctaHtml = `<span class="obra-btn obra-btn--soon">${getField(item, 'buyLabel') || t('cta.notify')}</span>`;
    }
    document.getElementById('obra-modal-cta').innerHTML = ctaHtml;

    modal.classList.add('open');
    modal.removeAttribute('inert');
    modal.removeAttribute('aria-hidden');
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
    modal?.setAttribute('inert', '');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to the cover that triggered the modal
    setTimeout(()=>{ this._lastObraFocus?.focus(); this._lastObraFocus = null; }, 50);
  }

  _initSingleCountdown(el) {
    const target = new Date(el.dataset.release).getTime();
    let prevS = -1;
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) { el.textContent = t('countdown.now'); return; }
      const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000);
      const m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
      const slide = s !== prevS ? ' countdown-slide' : '';
      prevS = s;
      el.innerHTML = `<span>${d}<em>d</em></span><span>${h}<em>h</em></span><span>${m}<em>m</em></span><span class="countdown-seconds${slide}">${s}<em>s</em></span>`;
    };
    update();
    const handle = setInterval(update, 1000);
    this._countdownTimers.add(handle);
  }

  _bindEvents() {
    // Pillar videos init with preload='none' to keep the mobile initial-load
    // payload light (Lighthouse never reaches Scene 4 → its score is unaffected).
    // Once a REAL user reaches Scene 4 (Adentrarse / skip-btn / deep-link),
    // upgrade to preload='auto' — the videos buffer in the background, so
    // hover/tap plays without any load wait.
    //
    // STAGGERED by 250 ms per pillar to avoid four simultaneous video fetches
    // saturating Chrome's low-priority queue. Without the stagger, all four
    // arrived at the network layer in the same tick and any one could stall
    // for tens of seconds, leaving its pillar stuck on the poster frame.
    // Combined with pickPillarSrc() forcing 720p (~400 KB each), total
    // background buffer is ~1.6 MB — comfortable even on weak connections.
    Events.on('sceneChange', ({ to }) => {
      if (to !== 4) return;
      const pillars = document.querySelectorAll('.archive-pillar video');
      pillars.forEach((v, i) => {
        setTimeout(() => {
          // Ensure 720p src (idempotent — pickPillarSrc was already set at
          // build time, but a stale dataset / external reset would re-correct).
          const want = pickPillarSrc(v.dataset.charSrc || v.src);
          if (!v.src.endsWith(want)) v.src = want;
          if (v.preload !== 'auto') v.preload = 'auto';
        }, i * 250); // 0, 250, 500, 750 ms — first pillar starts immediately
      });
    });

    // Adentrarse — stylized 1.4s transition (CSS choreography), THEN actually enter the Archive
    document.getElementById('final-btn')?.addEventListener('click', () => {
      const s3 = document.getElementById('scene-3');
      if (!s3 || s3.classList.contains('scene-3--departing')) return; // ignore double-click
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      s3.classList.add('scene-3--departing');
      // Explicitly fade the VFX canvas in JS as a belt-and-suspenders alongside
      // the CSS sibling rule — guarantees the awakening spotlight doesn't linger
      // behind the fading scene regardless of stylesheet cascade quirks.
      const vfx = document.getElementById('vfx-canvas');
      if (vfx && !reducedMotion) {
        requestAnimationFrame(() => { vfx.style.opacity = '0'; });
      }
      this._audio?.playTransitionEcho?.();
      const delay = reducedMotion ? 0 : 1400;
      setTimeout(() => this._onSceneChange('enterMainSite'), delay);
    });
    document.getElementById('btn-cerrar-pacto')?.addEventListener('click',()=>this.closePacto());
    document.querySelectorAll('[data-action]').forEach(el=>{
      el.addEventListener('click',()=>{
        if(el.dataset.action==='scroll-top') document.getElementById('main-site').scrollTo({top:0,behavior:'smooth'});
        if(el.dataset.action==='scroll-obras') document.getElementById('obras-section')?.scrollIntoView({behavior:'smooth'});
        if(el.dataset.action==='scroll-contact') this._tizno?.toggle();
        if(el.dataset.action==='open-pacto') this.openPacto();
      });
    });

    // Legal modals — intercept footer links, fetch & display inline
    const legalModal  = document.getElementById('legal-modal');
    const legalClose  = document.getElementById('legal-modal-close');
    const legalTitle  = document.getElementById('legal-modal-title');
    const legalBody   = document.getElementById('legal-modal-body');
    const legalCache = new Map();
    // Per-language URL: ES → /aviso-legal.html, EN → /aviso-legal-en.html.
    // Cache key includes lang so toggling language doesn't serve stale content.
    const _legalUrl = (slug) => lang === 'en' ? `/${slug}-en.html` : `/${slug}.html`;
    const _cacheKey = (slug) => `${lang}:${slug}`;
    // Parse a fetched legal HTML page into the clean inner content we display.
    const _parseLegal = (html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('img, .legal-logo, .legal-back, nav, header, style, script').forEach(el => el.remove());
      doc.querySelectorAll('a').forEach(a => {
        const t = a.textContent.trim();
        if (t === 'Soulware' || t.includes('Volver') || t.includes('Back') || a.classList.contains('legal-logo') || a.classList.contains('legal-back')) {
          a.remove();
        }
      });
      const wrap = doc.querySelector('.legal-wrap, main, article, body');
      return wrap ? wrap.innerHTML : '';
    };
    // Warm the cache after first user interaction — by the time anyone clicks
    // a legal link, the content is already in memory and the modal opens
    // synchronously. The previous version fired at first paint and showed up
    // in the Lighthouse critical-path chain (~4 s upstream of LCP on slow-4G).
    const _warmLegal = () => {
      ['aviso-legal','privacidad','cookies'].forEach(slug => {
        const key = _cacheKey(slug);
        if (legalCache.has(key)) return;
        fetch(_legalUrl(slug)).then(r => r.text()).then(html => {
          legalCache.set(key, _parseLegal(html));
        }).catch(() => {});
      });
    };
    let _warmed = false;
    const _onFirstInteraction = () => {
      if (_warmed) return;
      _warmed = true;
      ['pointerdown','touchstart','keydown','scroll'].forEach(ev =>
        window.removeEventListener(ev, _onFirstInteraction, { passive: true }));
      _warmLegal();
    };
    ['pointerdown','touchstart','keydown','scroll'].forEach(ev =>
      window.addEventListener(ev, _onFirstInteraction, { passive: true }));
    // Also warm when the user reaches the Archive — the footer with legal
    // links is in Scene 4, so this guarantees coverage even for keyboardless
    // users who somehow scroll there without firing any of the above.
    Events.on('sceneChange', ({ to }) => { if (to === 4) _onFirstInteraction(); });

    const _showLegal = (title, content) => {
      legalTitle.textContent = title;
      legalBody.innerHTML = content;
      legalModal.classList.add('open');
      legalModal.removeAttribute('inert');
      legalModal.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
    };

    const openLegal = async (slug, title) => {
      const key = _cacheKey(slug);
      // Cache hit → render synchronously. No loading flash.
      if (legalCache.has(key)) { _showLegal(title, legalCache.get(key)); return; }
      // Cache miss → fetch in the background, modal stays unopened until ready.
      try {
        const html = await (await fetch(_legalUrl(slug))).text();
        const content = _parseLegal(html);
        legalCache.set(key, content);
        _showLegal(title, content);
      } catch {
        _showLegal(title, `<p style="color:#555;">${lang === 'en' ? 'Content could not be loaded.' : 'No se pudo cargar el contenido.'}</p>`);
      }
      setTimeout(()=>{ legalClose?.focus(); }, 100);
    };
    const closeLegal = () => {
      legalModal?.classList.remove('open');
      legalModal?.setAttribute('inert', '');
      legalModal?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      // Move focus off the modal close button without programmatically focusing
      // the originating link — re-focusing the link triggers :focus-visible
      // (browser treats JS focus as keyboard-like) and leaves a blue ring on
      // the footer legal links until the user clicks elsewhere.
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    document.querySelectorAll('[data-legal]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        // Modal title follows the current language — read the live text of the
        // footer link (already translated by applyTranslations) so the heading
        // matches the click target rather than the hardcoded ES attribute.
        openLegal(a.dataset.legal, a.textContent.trim() || a.dataset.legalTitle);
      });
    });
    legalClose?.addEventListener('click', closeLegal);
    legalModal?.addEventListener('click', e => { if(e.target===legalModal) closeLegal(); });
    document.addEventListener('keydown', e => { if(e.key==='Escape' && legalModal?.classList.contains('open')) closeLegal(); });

    // Tizno pacto form submit (Netlify) — icon button: up-arrow → check on success
    const PACTO_ICON_UP = '<svg class="tizno-pacto-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    const PACTO_ICON_CHECK = '<svg class="tizno-pacto-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    document.addEventListener('submit', async e => {
      if (!e.target.matches('#tizno-pacto-form')) return;
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.classList.add('tizno-pacto-btn--sending');
      try {
        const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(e.target)).toString() });
        btn.classList.remove('tizno-pacto-btn--sending');
        if (res.ok) {
          btn.innerHTML = PACTO_ICON_CHECK;
          btn.classList.add('tizno-pacto-btn--sent');
          btn.setAttribute('aria-label', t('pacto.signed-aria'));
          e.target.reset();
        } else {
          btn.innerHTML = PACTO_ICON_UP;
          btn.classList.add('tizno-pacto-btn--error');
          btn.disabled = false;
          setTimeout(() => btn.classList.remove('tizno-pacto-btn--error'), 3000);
        }
      } catch {
        btn.classList.remove('tizno-pacto-btn--sending');
        btn.innerHTML = PACTO_ICON_UP;
        btn.classList.add('tizno-pacto-btn--error');
        btn.disabled = false;
        setTimeout(() => btn.classList.remove('tizno-pacto-btn--error'), 3000);
      }
    });
  }
}
