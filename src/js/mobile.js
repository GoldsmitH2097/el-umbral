import { CHARACTERS, CATALOGUE, state } from './core/StateManager.js';

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

  const showNext = () => {
    if (currentIndex >= whispers.length) return;
    const w = whispers[currentIndex];
    w.classList.remove('mobile-found');
    w.classList.add('mobile-pending');
  };

  const findCurrent = () => {
    if (currentIndex >= whispers.length) return;
    const w = whispers[currentIndex];
    w.classList.remove('mobile-pending');
    w.classList.add('mobile-found');
    w.dataset.found = 'true';
    state.whispersFound++;
    currentIndex++;

    if (currentIndex >= whispers.length) {
      setTimeout(onAllFound, 800);
    } else {
      setTimeout(showNext, 500);
    }
  };

  whispers.forEach(w => {
    w.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      if (w.classList.contains('mobile-pending')) findCurrent();
    }, { passive: true });
    w.addEventListener('click', () => {
      if (w.classList.contains('mobile-pending')) findCurrent();
    });
  });

  // Show first whisper when scene 2 becomes active — with a short delay
  const observer = new MutationObserver(() => {
    const scene2 = document.getElementById('scene-2');
    if (scene2 && getComputedStyle(scene2).opacity > 0.5) {
      setTimeout(showNext, 1000);
      observer.disconnect();
    }
  });
  const scene2 = document.getElementById('scene-2');
  if (scene2) observer.observe(scene2, { attributes: true, attributeFilter: ['style'] });
}

// ── ARCHIVE MOBILE: Tap character to open full detail view ─────────────────
export function initMobileArchive() {
  if (!isMobile()) return;

  // Autoplay all pillar videos on mobile — loop at low opacity for ambient effect
  setTimeout(() => {
    document.querySelectorAll('.pillar video').forEach(v => {
      v.play().catch(() => {});
    });
  }, 600);

  const detail = document.getElementById('mobile-char-detail');
  const detailTitle = document.getElementById('mobile-detail-title');
  const detailLore = document.getElementById('mobile-detail-lore');
  const detailSocial = document.getElementById('mobile-detail-social');
  const detailObras = document.getElementById('mobile-detail-obras');
  const detailVideo = document.getElementById('mobile-char-video-bg');
  const closeBtn = document.getElementById('mobile-char-close');
  const mainSite = document.getElementById('main-site');

  const openDetail = (charIndex) => {
    const char = CHARACTERS[charIndex];
    if (!char) return;

    detailTitle.innerText = char.title;
    detailLore.innerHTML = char.lore;

    // Social links
    detailSocial.innerHTML = char.social.length > 0
      ? `<div class="reading-social">${char.social.map(s =>
          `<a href="${s.url}" target="_blank" rel="noopener" class="reading-social-link">
            ${ICONS[s.platform]} <span>${s.handle}</span>
          </a>`).join('')}</div>`
      : '';

    // Books for this archetype
    const books = CATALOGUE.filter(b => b.archetype === char.slug);
    if (books.length > 0) {
      detailObras.innerHTML = `<div class="mobile-detail-obras-list">` +
        books.map(item => {
          let cta = '';
          if (item.status === 'available' && item.buyUrl) {
            cta = `<a href="${item.buyUrl}" target="_blank" rel="noopener" class="obra-btn obra-btn--buy">${item.buyLabel}</a>`;
          } else if (item.status === 'countdown') {
            cta = `<div class="obra-countdown">
              <div class="countdown-timer" data-release="${item.releaseDate}"></div>
              <span class="obra-btn obra-btn--locked">${item.buyLabel}</span>
            </div>`;
          } else {
            cta = `<span class="obra-btn obra-btn--soon">Próximamente</span>`;
          }
          const sub = item.subtitle ? `<p class="obra-subtitle">${item.subtitle}</p>` : '';
          const seriesHtml = item.seriesInfo ? `<p class="obra-series-info">${item.seriesInfo}</p>` : '';
          const coverHtml = item.img
            ? `<img src="${item.img}" alt="${item.title}" class="mobile-book-cover obra-cover--clickable" data-id="${item.id}" style="cursor:pointer;" />`
            : '';
          return `<div class="mobile-detail-book">
            ${coverHtml}
            <div>
              <h3 class="obra-title">${item.title}</h3>${sub}${seriesHtml}
              <p class="obra-desc" style="opacity:1;max-height:none;">${item.desc}</p>
              ${cta}
            </div>
          </div>`;
        }).join('') + `</div>`;
      // Re-init countdowns for newly added timers
      detailObras.querySelectorAll('.countdown-timer').forEach(el => initCountdown(el));
      // Wire book covers to obra modal
      detailObras.querySelectorAll('.obra-cover--clickable').forEach(img => {
        img.addEventListener('click', () => {
          // Call ArchiveDOM's modal — it's exposed on window for cross-module access
          window._openObraModal?.(img.dataset.id);
        });
      });
    } else {
      detailObras.innerHTML = '';
    }

    // Background video
    detailVideo.src = char.src; detailVideo.load(); detailVideo.play().catch(()=>{});
    detail.classList.add('open');
    mainSite.style.overflow = 'hidden'; // prevent background scroll
  };

  const closeDetail = () => {
    detail.classList.remove('open');
    detailVideo.pause(); detailVideo.src = '';
    mainSite.style.overflow = 'auto';
  };

  closeBtn?.addEventListener('click', closeDetail);

  // Wire up pillar taps — added after a tick so ArchiveDOM has built the pillars
  setTimeout(() => {
    document.querySelectorAll('.pillar').forEach((pillar, i) => {
      pillar.addEventListener('click', (e) => {
        if (!isMobile()) return;
        e.stopPropagation();
        openDetail(i);
      });
    });
  }, 500);
}

function initCountdown(el) {
  const target = new Date(el.dataset.release).getTime();
  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) { el.textContent = 'Disponible ahora'; return; }
    const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
    el.innerHTML = `<span>${d}<em>d</em></span><span>${h}<em>h</em></span><span>${m}<em>m</em></span><span>${s}<em>s</em></span>`;
  };
  update(); setInterval(update, 1000);
}
