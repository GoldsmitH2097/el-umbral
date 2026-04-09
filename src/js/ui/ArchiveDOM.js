import { CHARACTERS, CATALOGUE, state } from '../core/StateManager.js';

// Social platform SVG icons
const ICONS = {
  instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  threads: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.378-.887h-.018c-.852 0-1.953.254-2.692 1.61L7.436 8.98c.904-1.672 2.498-2.598 4.48-2.598h.023c3.019.014 4.822 1.913 5.153 5.33.17.056.34.117.508.183 1.305.52 2.297 1.338 2.869 2.37.77 1.397.982 3.552-.24 5.856-1.713 3.148-4.507 4.789-7.93 4.885H12.186z"/></svg>`
};

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
    // Focus tracking — for returning focus on modal/reading close
    this._lastObraFocus = null;
    this._lastReadingFocus = null;
    this._pactoCallback = null; // called when user accepts El Pacto
    this._build(); this._bindEvents();
  }

  _build() {
    this._buildPillars();
    this._buildObras();
    this._buildContact();
    this._bindObraModal();
  }

  _buildPillars() {
    const grid=document.querySelector('.pillar-grid'); if(!grid) return;
    // Horizontal swipe on mobile — remove class to revert to vertical stack
    grid.classList.add('pillar-grid--swipe');
    CHARACTERS.forEach((char,i)=>{
      const pillar=document.createElement('div');
      pillar.className='pillar' + (char.status==='missing' ? ' pillar--missing' : '');
      pillar.dataset.index = i;
      pillar.setAttribute('role','button'); pillar.setAttribute('tabindex','0');

      const video=document.createElement('video');
      video.loop=true; video.muted=true; video.playsInline=true; video.preload='metadata';
      // Load src immediately so first frame shows as static — plays on hover
      video.src=char.src; video.load();

      const content=document.createElement('div'); content.className='pillar-content';
      const socialHtml = char.social.length > 0
        ? `<div class="pillar-social">${char.social.map(s =>
            `<a href="${s.url}" target="_blank" rel="noopener" class="pillar-social-link" aria-label="${s.handle} on ${s.platform}">${ICONS[s.platform]}</a>`
          ).join('')}</div>`
        : '';
      const statusBadge = char.status === 'missing'
        ? `<span class="pillar-status">En paradero desconocido</span>` : '';

      content.innerHTML=`
        <h4>${['I','II','III','IV'][i]}. ${char.label}</h4>
        <p>${char.desc}</p>
      `;

      pillar.appendChild(video); pillar.appendChild(content); grid.appendChild(pillar);

      pillar.addEventListener('mouseenter', () => video.play().catch(()=>{}));
      pillar.addEventListener('mouseleave', () => video.pause());
      pillar.addEventListener('touchstart', () => video.play().catch(()=>{}), {passive:true});

      // Desktop only — mobile uses its own tap-to-detail overlay in mobile.js
      if(char.status !== 'missing') {
        pillar.addEventListener('click', (e) => {
          if(window.innerWidth <= 768) return;
          this.openReading(i);
        });
        pillar.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')this.openReading(i);});
      }
    });
  }

  _buildObras() {
    const section = document.getElementById('obras-section');
    if (!section) return;

    // Build one column per archetype, matching pillar positions
    CHARACTERS.forEach((char, i) => {
      const col = document.createElement('div');
      col.className = 'obra-column';
      col.dataset.index = i;
      col.dataset.archetype = char.slug;

      // Archetype header — always visible on mobile, hidden on desktop (alignment handles it there)
      const archetypeHeader = document.createElement('div');
      archetypeHeader.className = 'obra-archetype-header';
      archetypeHeader.innerHTML = `
        <span class="obra-archetype-label">${char.label}</span>
        <span class="obra-archetype-author">${char.author || ''}</span>
      `;
      col.appendChild(archetypeHeader);

      // Get books for this archetype
      const books = CATALOGUE.filter(item => item.archetype === char.slug);

      if (books.length === 0) {
        // Empty column — Emperatriz or future archetype with no books yet
        col.innerHTML = `<div class="obra-empty"><span>—</span></div>`;
      } else {
        books.forEach(item => {
          const card = document.createElement('div');

          // Anthology (La Corte) gets distinct visual treatment
          if (item.type === 'anthology') {
            card.className = `obra-book obra-book--anthology obra-book--${item.status}`;
            const relatosHtml = item.relatos && item.relatos.length > 0
              ? `<ul class="obra-relatos-list">${item.relatos.map(r =>
                  `<li class="obra-relato-item">
                    <span class="obra-relato-title">${r.title}</span>
                    <span class="obra-relato-author">${r.author}</span>
                  </li>`).join('')}</ul>`
              : '';
            card.innerHTML = `
              <div class="obra-anthology-header">
                <span class="obra-anthology-tag">Antología</span>
                <h3 class="obra-title">${item.title}</h3>
                ${item.subtitle ? `<p class="obra-subtitle">${item.subtitle}</p>` : ''}
              </div>
              <div class="obra-meta">
                <p class="obra-series-info">${item.seriesInfo || ''}</p>
                <p class="obra-desc">${item.desc}</p>
                ${relatosHtml}
                <span class="obra-btn obra-btn--soon">${item.buyLabel}</span>
              </div>
            `;
            col.appendChild(card);
            return; // skip standard card logic
          }

          // Standard obra card
          card.className = `obra-book obra-book--${item.status}`;

          const coverHtml = item.img
            ? `<div class="obra-cover obra-cover--clickable" data-id="${item.id}" role="button" tabindex="0" aria-label="Ver detalles de ${item.title}"><img src="${item.img}" alt="${item.title}" loading="lazy" /></div>`
            : `<div class="obra-cover obra-cover--clickable obra-cover--empty" data-id="${item.id}" role="button" tabindex="0" aria-label="Ver detalles de ${item.title}"></div>`;

          let ctaHtml = '';
          if (item.status === 'available' && item.buyUrl) {
            ctaHtml = `<a href="${item.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy">${item.buyLabel}</a>`;
          } else if (item.status === 'countdown') {
            ctaHtml = `<div class="obra-countdown">
              <div class="countdown-timer" data-release="${item.releaseDate}"></div>
              <span class="obra-btn obra-btn--locked">${item.buyLabel}</span>
            </div>`;
          } else {
            ctaHtml = `<span class="obra-btn obra-btn--soon">Próximamente</span>`;
          }

          const statusLabels = {
            'available': 'Disponible',
            'coming-soon': 'Próximamente',
            'countdown': 'Preventa',
          };
          const formatLabels = {
            'Novela': 'Edición Física',
            'Novela — Edición de coleccionista': 'Edición Física',
            'Experiencia web interactiva': 'Experiencia Digital',
            'Antología': 'Antología',
          };
          const statusPill = `<span class="obra-status-pill obra-status-pill--${item.status}">${statusLabels[item.status] || item.status}</span>`;
          const formatBadge = item.format ? `<span class="obra-format-badge">${formatLabels[item.format] || item.format}</span>` : '';

          const subtitleHtml = item.subtitle ? `<p class="obra-subtitle">${item.subtitle}</p>` : '';

          card.innerHTML = `
            ${coverHtml}
            <div class="obra-meta">
              <div class="obra-badges">${statusPill}${formatBadge}</div>
              <h3 class="obra-title">${item.title}</h3>
              ${subtitleHtml}
              <p class="obra-desc">${item.desc}</p>
              ${ctaHtml}
            </div>
          `;
          col.appendChild(card);

          // Cover click → open modal
          const coverEl = card.querySelector('.obra-cover--clickable');
          if (coverEl) {
            coverEl.addEventListener('click', () => this.openObraModal(item.id));
            coverEl.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') this.openObraModal(item.id); });
          }
        });
      }

      section.appendChild(col);
    });

    this._initCountdowns();
    this._bindColumnHover();
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this._initCoverTilt();
    }
    this._initScrollReveal();
  }

  // Pillars and obra-columns animate together as one block
  _bindColumnHover() {
    const pillars = document.querySelectorAll('.pillar');
    const cols = document.querySelectorAll('.obra-column');

    pillars.forEach((pillar, i) => {
      const col = cols[i];
      if (!col) return;
      pillar.addEventListener('mouseenter', () => col.classList.add('obra-column--highlighted'));
      pillar.addEventListener('mouseleave', () => col.classList.remove('obra-column--highlighted'));
      col.addEventListener('mouseenter', () => pillar.classList.add('pillar--highlighted'));
      col.addEventListener('mouseleave', () => pillar.classList.remove('pillar--highlighted'));
    });
  }

  _initScrollReveal() {
    const cards = document.querySelectorAll('.obra-book');
    if (!cards.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    cards.forEach((card, i) => {
      // Stagger: column index × 80ms
      const col = card.closest('.obra-column');
      const colIndex = col ? [...document.querySelectorAll('.obra-column')].indexOf(col) : 0;
      card.style.transitionDelay = `${colIndex * 80}ms`;
      observer.observe(card);
    });
  }

  _initCoverTilt() {
    document.querySelectorAll('.obra-cover--clickable').forEach(cover => {
      // Inject glare div — one per cover, reused on every move
      const glare = document.createElement('div');
      glare.className = 'obra-cover-glare';
      cover.appendChild(glare);

      cover.addEventListener('mousemove', (e) => {
        const rect = cover.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;   // 0–1 left to right
        const y = (e.clientY - rect.top)  / rect.height;  // 0–1 top to bottom
        const rotY =  (x - 0.5) * 22;   // –11° to +11° horizontal
        const rotX = -(y - 0.5) * 22;   // –11° to +11° vertical (inverted)
        cover.style.transform =
          `perspective(550px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`;
        glare.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        glare.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      });

      cover.addEventListener('mouseleave', () => {
        // Smooth spring back — override transition only for reset
        cover.style.transition = 'transform 0.4s cubic-bezier(0.25,1,0.5,1), box-shadow 0.4s ease';
        cover.style.transform = '';
        // Restore snappy transition after spring finishes
        setTimeout(() => {
          cover.style.transition = '';
        }, 400);
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
      // Archetype persistence: pre-highlight the character last active in Scene 1
      const idx = state.currentCharIndex;
      const pillars = document.querySelectorAll('.pillar');
      const cols = document.querySelectorAll('.obra-column');
      if(idx >= 0 && idx < pillars.length) {
        pillars[idx]?.classList.add('pillar--highlighted');
        cols[idx]?.classList.add('obra-column--highlighted');
      }
      // Focus management: move keyboard focus to archive heading (WCAG 2.4.3)
      setTimeout(()=>{ this._gridView.querySelector('h2[tabindex]')?.focus(); }, 100);
    }, 200);
  }

  openReading(index) {
    const char=CHARACTERS[index]; if(!char) return;
    this._lastReadingFocus = document.activeElement; // save for return focus on close
    this._readTitle.innerText=char.title;
    const socialHtml = char.social.length > 0
      ? `<div class="reading-social">${char.social.map(s =>
          `<a href="${s.url}" target="_blank" rel="noopener" class="reading-social-link">
            ${ICONS[s.platform]} <span>${s.handle}</span>
          </a>`).join('')}</div>`
      : '';
    this._readBody.innerHTML = char.lore + socialHtml;
    this._readingBgVideo.src=char.src; this._readingBgVideo.load(); this._readingBgVideo.play().catch(()=>{});
    this._gridView.style.transform='scale(0.95)'; this._gridView.style.opacity='0';
    setTimeout(()=>{
      this._readingView.style.display='block';
      this._readingView.style.opacity='1'; this._readingView.style.pointerEvents='auto';
      this._readingView.scrollTo(0,0); this._onSceneChange(5);
      this._readTitle?.focus(); // focus management (WCAG 2.4.3)
      // Create the Volver button only when reading view is open — injecting prevents ghost rendering
      if (!document.getElementById('btn-volver')) {
        const btn = document.createElement('button');
        btn.id = 'btn-volver';
        btn.textContent = '← Volver';
        btn.addEventListener('click', () => this.closeReading());
        document.body.appendChild(btn);
      }
    },500);
    if(this._router) this._router.navigateTo(index);
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
    // Focus "Acepto" button for keyboard users
    setTimeout(()=>{ document.getElementById('btn-cerrar-pacto')?.focus(); }, 100);
  }
  closePacto() {
    this._pactoModal.style.opacity='0';
    this._pactoModal.style.pointerEvents='none';
    // Execute callback (e.g. enterScene2) if set — then clear it
    if (this._pactoCallback) {
      const cb = this._pactoCallback;
      this._pactoCallback = null;
      cb();
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
      ctaHtml = `<span class="obra-btn obra-btn--soon">Próximamente</span>`;
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
        if(el.dataset.action==='scroll-contact') document.getElementById('contact-section')?.scrollIntoView({behavior:'smooth'});
        if(el.dataset.action==='open-pacto') this.openPacto();
      });
    });
    // Contact form — fetch submit to Formspree, show feedback without navigating away
    document.getElementById('contact-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Enviando...'; btn.disabled = true;
      try {
        const formData = new FormData(e.target);
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
        if (res.ok) {
          btn.textContent = 'Enviado ✓';
          e.target.reset();
        } else {
          btn.textContent = 'Error — inténtalo de nuevo';
          btn.disabled = false;
          setTimeout(() => { btn.textContent = original; }, 3000);
        }
      } catch {
        btn.textContent = 'Error — inténtalo de nuevo';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = original; }, 3000);
      }
    });
  }
}
