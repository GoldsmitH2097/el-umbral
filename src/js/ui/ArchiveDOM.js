import { CHARACTERS, CATALOGUE } from '../core/StateManager.js';

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
    this._build(); this._bindEvents();
  }

  _build() {
    this._buildPillars();
    this._buildObras();
    this._buildContact();
  }

  _buildPillars() {
    const grid=document.querySelector('.pillar-grid'); if(!grid) return;
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

      // Only active characters open reading view
      if(char.status !== 'missing') {
        pillar.addEventListener('click',()=>this.openReading(i));
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

      // Get books for this archetype
      const books = CATALOGUE.filter(item => item.archetype === char.slug);

      if (books.length === 0) {
        // Empty column — Emperatriz or future archetype with no books yet
        col.innerHTML = `<div class="obra-empty"><span>—</span></div>`;
      } else {
        books.forEach(item => {
          const card = document.createElement('div');
          card.className = `obra-book obra-book--${item.status}`;

          const coverHtml = item.img
            ? `<div class="obra-cover"><img src="${item.img}" alt="${item.title}" loading="lazy" /></div>`
            : '';

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

          const subtitleHtml = item.subtitle ? `<p class="obra-subtitle">${item.subtitle}</p>` : '';

          card.innerHTML = `
            ${coverHtml}
            <div class="obra-meta">
              <h3 class="obra-title">${item.title}</h3>
              ${subtitleHtml}
              <p class="obra-desc">${item.desc}</p>
              ${ctaHtml}
            </div>
          `;
          col.appendChild(card);
        });
      }

      section.appendChild(col);
    });

    this._initCountdowns();
    this._bindColumnHover();
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

  _initCountdowns() {
    const timers = document.querySelectorAll('.countdown-timer');
    timers.forEach(el => {
      const target = new Date(el.dataset.release).getTime();
      const update = () => {
        const now = Date.now();
        const diff = target - now;
        if (diff <= 0) { el.textContent = 'Disponible ahora'; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerHTML = `<span>${d}<em>d</em></span><span>${h}<em>h</em></span><span>${m}<em>m</em></span><span>${s}<em>s</em></span>`;
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
        <form class="contact-form" id="contact-form" action="https://formspree.io/f/editorial@soulware.live" method="POST">
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
    setTimeout(()=>{ this._gridView.classList.add('archive-visible'); }, 200);
  }

  openReading(index) {
    const char=CHARACTERS[index]; if(!char) return;
    this._readTitle.innerText=char.title;

    // Build lore + social links at the bottom
    const socialHtml = char.social.length > 0
      ? `<div class="reading-social">
          ${char.social.map(s =>
            `<a href="${s.url}" target="_blank" rel="noopener" class="reading-social-link">
              ${ICONS[s.platform]} <span>${s.handle}</span>
            </a>`
          ).join('')}
        </div>`
      : '';

    this._readBody.innerHTML = char.lore + socialHtml;
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
        if(el.dataset.action==='scroll-obras') document.getElementById('obras-section')?.scrollIntoView({behavior:'smooth'});
        if(el.dataset.action==='open-pacto') this.openPacto();
      });
    });
    // Contact form
    document.getElementById('contact-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.textContent = 'Enviado'; btn.disabled = true;
    });
  }
}
