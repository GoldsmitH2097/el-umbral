import { CHARACTERS, CATALOGUE, state } from './core/StateManager.js';
import { t, getField } from './core/i18n.js';

const isMobile = () => window.innerWidth <= 768;

// ── ICONS (duplicated here to avoid circular import) ──────────────────────
const ICONS = {
  instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  threads: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.378-.887h-.018c-.852 0-1.953.254-2.692 1.61L7.436 8.98c.904-1.672 2.498-2.598 4.48-2.598h.023c3.019.014 4.822 1.913 5.153 5.33.17.056.34.117.508.183 1.305.52 2.297 1.338 2.869 2.37.77 1.397.982 3.552-.24 5.856-1.713 3.148-4.507 4.789-7.93 4.885H12.186z"/></svg>`
};

// ── SCENE 2 MOBILE: Sequential tap-to-reveal whispers ──────────────────────
export function initMobileScene2(onAllFound) {
  if (!isMobile()) return;

  const whispers = Array.from(document.querySelectorAll('.whisper'));
  let currentIndex = 0;

  // ── Lucecita follower ────────────────────────────────────────────────────
  // Glides #scene-2-light's radial gradient toward the current pending whisper
  // by interpolating --x / --y over ~1.4 s with an ease-out curve. Replaces
  // VisualEngine's cursor-driven update (no cursor on mobile, so the gradient
  // would otherwise sit frozen at the default 50% / 50% center).
  const root = document.documentElement;
  let glideRAF = null;
  const glideToWhisper = (w) => {
    if (!w) return;
    const r = w.getBoundingClientRect();
    const targetX = r.left + r.width / 2;
    const targetY = r.top + r.height / 2;
    const startX = parseFloat(getComputedStyle(root).getPropertyValue('--x')) || window.innerWidth / 2;
    const startY = parseFloat(getComputedStyle(root).getPropertyValue('--y')) || window.innerHeight / 2;
    const dur = 1400;
    const t0 = performance.now();
    cancelAnimationFrame(glideRAF);
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const x = startX + (targetX - startX) * eased;
      const y = startY + (targetY - startY) * eased;
      root.style.setProperty('--x', x + 'px');
      root.style.setProperty('--y', y + 'px');
      if (t < 1) glideRAF = requestAnimationFrame(tick);
    };
    glideRAF = requestAnimationFrame(tick);
  };

  const showNext = () => {
    if (currentIndex >= whispers.length) return;
    const w = whispers[currentIndex];
    w.classList.remove('mobile-found');
    w.classList.add('mobile-pending');
    // Lead the user's eye: glide the lucecita toward the new pending whisper
    glideToWhisper(w);
  };

  const findCurrent = () => {
    if (currentIndex >= whispers.length) return;
    const w = whispers[currentIndex];
    w.classList.remove('mobile-pending');
    w.classList.add('mobile-found');
    w.dataset.found = 'true';
    state.whispersFound++;
    // Fire the whisper-found audio — dispatch event picked up by main.js AudioEngine
    document.dispatchEvent(new CustomEvent('mobileWhisperFound', { detail: { index: currentIndex } }));
    currentIndex++;

    // Reset idle timer — next auto-advance waits another 4s
    resetIdleTimer();

    if (currentIndex >= whispers.length) {
      clearTimeout(idleTimer);
      // 3s pause on last whisper — let user read before awakening
      setTimeout(onAllFound, 3000);
    } else {
      setTimeout(() => {
        w.style.display = 'none';
        setTimeout(showNext, 200);
      }, 600);
    }
  };

  // Idle autoplay — if user hasn't tapped for 4s, advance one step automatically
  let idleTimer = null;
  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (currentIndex < whispers.length) findCurrent();
    }, 4000);
  };

  whispers.forEach(w => {
    w.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      if (w.classList.contains('mobile-pending')) { resetIdleTimer(); findCurrent(); }
    }, { passive: true });
    w.addEventListener('click', () => {
      if (w.classList.contains('mobile-pending')) { resetIdleTimer(); findCurrent(); }
    });
  });

  // Show first whisper, then start idle timer
  setTimeout(() => { showNext(); resetIdleTimer(); }, 1200);
}

// ── ARCHIVE MOBILE: Tap character to open full detail view ─────────────────
export function initMobileArchive() {
  if (!isMobile()) return;

  /* El arranque del vídeo ya no vive aquí. Esto reproducía los CUATRO
     pilares a la vez —cuatro descodificadores en un teléfono, tres de ellos
     fuera de pantalla en el carrusel—. Ahora ArchiveDOM monta uno solo: el
     primero al entrar en la escena 4, y el que toque al deslizar. */

  const detail = document.getElementById('mobile-char-detail');
  const detailTitle = document.getElementById('mobile-detail-title');
  const detailLore = document.getElementById('mobile-detail-lore');
  const detailSocial = document.getElementById('mobile-detail-social');
  const detailObras = document.getElementById('mobile-detail-obras');
  const detailVideo = document.getElementById('mobile-char-video-bg');
  const closeBtn = document.getElementById('mobile-char-close');
  const mainSite = document.getElementById('main-site');

  const openDetail = (charIndex, activeTab = 'autor') => {
    const char = CHARACTERS[charIndex];
    if (!char) return;

    detailTitle.innerText = getField(char, 'title');
    detailLore.innerHTML = getField(char, 'lore');

    // Social links
    detailSocial.innerHTML = char.social.length > 0
      ? `<div class="reading-social">${char.social.map(s =>
          `<a href="${s.url}" target="_blank" rel="noopener" class="reading-social-link">
            ${ICONS[s.platform]} <span>${s.handle}</span>
          </a>`).join('')}</div>`
      : '';

    // Books for this archetype
    const books = CATALOGUE.filter(b => b.archetype === char.slug);
    detailObras.innerHTML = books.length === 0
      ? `<p style="color:#333;letter-spacing:3px;font-size:10px;text-transform:uppercase;padding:20px 0;">${t('ui.in-preparation')}</p>`
      : books.map(item => {
          const itemTitle = getField(item, 'title');
          const itemSubtitle = getField(item, 'subtitle');
          const itemVision = getField(item, 'vision') || getField(item, 'desc');
          const itemBuyLabel = getField(item, 'buyLabel');
          let cta = item.status === 'available' && item.buyUrl
            ? `<a href="${item.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy">${itemBuyLabel}</a>`
            : item.status === 'countdown'
            ? `<div class="obra-countdown"><div class="countdown-timer" data-release="${item.releaseDate}"></div><span class="obra-btn obra-btn--locked">${itemBuyLabel}</span></div>`
            : `<span class="obra-btn obra-btn--soon">${t('cta.coming-soon')}</span>`;
          const coverHtml = item.img ? `<img src="${item.img}" alt="${itemTitle}" class="mobile-book-cover" />` : '';
          return `<div class="mobile-detail-book">
            ${coverHtml}
            <div>
              <h3 class="obra-title">${itemTitle}</h3>
              ${itemSubtitle ? `<p class="obra-subtitle">${itemSubtitle}</p>` : ''}
              <p style="font-style:italic;color:#666;font-size:13px;line-height:1.8;margin:8px 0 12px;">${itemVision}</p>
              ${cta}
            </div>
          </div>`;
        }).join('');

    // Init countdowns
    detailObras.querySelectorAll('.countdown-timer').forEach(el => initCountdown(el));

    // Background video
    detailVideo.src = char.src; detailVideo.load(); detailVideo.play().catch(()=>{});

    // Show overlay with proper transition — needs RAF between display:block and .open
    // Otherwise browser batches both changes and opacity transition never fires
    detail.style.display = 'flex';
    detail.style.opacity = '0';
    detail.style.pointerEvents = 'none';
    detail.removeAttribute('inert');
    detail.removeAttribute('aria-hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        detail.classList.add('open');
        detail.style.opacity = '';
        detail.style.pointerEvents = '';
      });
    });
    mainSite.style.overflow = 'hidden';

    // Switch to requested tab
    switchMobileTab(activeTab);

    // Wire mobile tabs
    document.querySelectorAll('#mobile-char-detail .reading-tab').forEach(b => {
      b.onclick = () => switchMobileTab(b.dataset.tab);
    });
  };

  const closeDetail = () => {
    detail.classList.remove('open');
    mainSite.style.overflow = '';
    detailVideo.pause(); detailVideo.src = '';
    // Wait for fade-out transition before hiding
    setTimeout(() => {
      detail.style.display = 'none';
      detail.setAttribute('inert', '');
      detail.setAttribute('aria-hidden', 'true');
    }, 400);
  };

  const switchMobileTab = (tab) => {
    document.querySelectorAll('#mobile-char-detail .reading-tab').forEach(b => {
      b.classList.toggle('reading-tab--active', b.dataset.tab === tab);
    });
    document.getElementById('mobile-panel-autor')?.classList.toggle('mobile-panel--active', tab === 'autor');
    document.getElementById('mobile-panel-libros')?.classList.toggle('mobile-panel--active', tab === 'libros');
    // Scroll content area to top when switching tabs
    document.querySelector('.mobile-detail-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  closeBtn?.addEventListener('click', closeDetail);

  // Single event delegation on the grid — reliable, no duplicates
  const grid = document.querySelector('.archive-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      if (!isMobile()) return;
      // Book cover click → open character detail (same as pillar tap)
      const cover = e.target.closest('.obra-cover--clickable');
      if (cover) {
        const col = cover.closest('.archive-col');
        const i = col ? parseInt(col.dataset.index, 10) : -1;
        if (i >= 0) { e.stopPropagation(); openDetail(i); }
        return;
      }
      // Pillar tap
      const pillar = e.target.closest('.archive-pillar');
      if (!pillar) return;
      const pillars = Array.from(document.querySelectorAll('.archive-pillar'));
      const i = pillars.indexOf(pillar);
      if (i >= 0) { e.stopPropagation(); openDetail(i); }
    });
    // No touchend preventDefault — touch-action:manipulation already handles 300ms delay
    // and preventDefault here was blocking the horizontal scroll-snap carousel
  }
}

const _mobileCountdownTimers = new WeakMap();
function initCountdown(el) {
  // Clear any prior timer attached to this element to avoid stacking on reopen
  const prior = _mobileCountdownTimers.get(el);
  if (prior) clearInterval(prior);
  const target = new Date(el.dataset.release).getTime();
  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) { el.textContent = t('countdown.now'); return; }
    const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
    el.innerHTML = `<span>${d}<em>d</em></span><span>${h}<em>h</em></span><span>${m}<em>m</em></span><span>${s}<em>s</em></span>`;
  };
  update();
  _mobileCountdownTimers.set(el, setInterval(update, 1000));
}
