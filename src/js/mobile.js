import { CHARACTERS, CATALOGUE, state } from './core/StateManager.js';
import { t, getField } from './core/i18n.js';
/* ICONS viene de ArchiveDOM, no de una copia local. La copia decía
   «duplicated here to avoid circular import», pero el ciclo nunca existió
   (ArchiveDOM no importa nada de aquí) y las dos copias ya habían divergido:
   el glifo de Threads del detalle móvil no era el de la vista de lectura.
   Dos verdades que deben decir lo mismo acaban separándose; que haya una. */
import { renderCta, ICONS } from './ui/ArchiveDOM.js';

const isMobile = () => window.innerWidth <= 768;

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
let _archivoMovilListo = false;
export function initMobileArchive() {
  if (!isMobile()) return;
  /* PESTILLO: la puerta del skip re-ejecuta esta init en cada popstate de
     ruta profunda. Sin él, el click delegado del grid y el del botón de
     cierre se apilaban — cada toque abría el detalle dos veces. */
  if (_archivoMovilListo) return;
  _archivoMovilListo = true;

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
          /* LA MISMA FUNCIÓN QUE EL ESCRITORIO, NO UNA COPIA PARECIDA.
             Aquí vivía una versión simplificada que solo entendía la forma
             antigua del catálogo (`status` + `buyUrl` planos). Cuando Pulso
             pasó a tener `editions[]` con sus `retailers[]`, esta copia dejó
             de reconocerlo como disponible y lo enseñaba como PRÓXIMAMENTE:
             en el móvil desaparecía el botón de comprar de los dos únicos
             libros a la venta, justo en el sitio donde más gente entra.
             Dos funciones que tienen que decir lo mismo acaban divergiendo
             siempre; la única defensa es que haya una. */
          const cta = renderCta(item, { detail: true });
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
      // La copia de escritorio siempre lo hizo; esta lo perdió al divergir.
      b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
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
    /* UN ARRASTRE NO ES UN TOQUE. En el audit de Chrome (emulación iPhone),
       deslizar el carrusel sobre un pilar disparaba el click al soltar y
       abría la ficha en vez de avanzar de columna. Los navegadores suelen
       suprimir ese click tras un scroll, pero «suelen» no es una garantía —
       aquí se mide el dedo de verdad: si entre que baja y sube se ha movido
       más de 12 px, eso fue un arrastre y el click que lo siga se ignora. */
    let _toqueX = 0, _toqueY = 0, _fueArrastre = false;
    grid.addEventListener('touchstart', (e) => {
      const t0 = e.touches[0];
      if (!t0) return;
      _toqueX = t0.clientX; _toqueY = t0.clientY; _fueArrastre = false;
    }, { passive: true });
    grid.addEventListener('touchmove', (e) => {
      const t0 = e.touches[0];
      if (!t0 || _fueArrastre) return;
      if (Math.hypot(t0.clientX - _toqueX, t0.clientY - _toqueY) > 12) _fueArrastre = true;
    }, { passive: true });
    grid.addEventListener('click', (e) => {
      if (!isMobile()) return;
      if (_fueArrastre) { _fueArrastre = false; return; }
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
    /* AUTOLIMPIEZA, como la copia de escritorio (_initSingleCountdown). El
       WeakMap de arriba solo protege si se re-inicializa el MISMO nodo — pero
       cada apertura del detalle reconstruye innerHTML y crea nodos NUEVOS:
       el intervalo del nodo viejo quedaba vivo para siempre, escribiendo en
       un elemento desmontado, uno más por reapertura. Es literalmente el
       mismo patrón del bug de renderCta que motivó la auditoría. Latente hoy
       (ningún libro usa 'countdown'), armado para el primero que lo use. */
    const handle = _mobileCountdownTimers.get(el);
    if (!document.contains(el)) { if (handle) clearInterval(handle); return; }
    const diff = target - Date.now();
    if (diff <= 0) { el.textContent = t('countdown.now'); if (handle) clearInterval(handle); return; }
    const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
    el.innerHTML = `<span>${d}<em>d</em></span><span>${h}<em>h</em></span><span>${m}<em>m</em></span><span>${s}<em>s</em></span>`;
  };
  _mobileCountdownTimers.set(el, setInterval(update, 1000));
  update();
}

// ── MENÚ DE MÓVIL ───────────────────────────────────────────────────────────
/**
 * La barra de abajo tenía que sostener en un teléfono lo mismo que en un
 * monitor: volver al umbral, cuatro enlaces legales y Tizno. No cabía, y se
 * desparramaba en tres líneas encima del contenido.
 *
 * Aquí la cabecera se queda con una hamburguesa que abre el MISMO panel de
 * enlaces que en escritorio va en línea; dentro se recolocan, MOVIENDO los
 * nodos (no copiándolos), el «volver al umbral» y los legales. Al mover en
 * vez de duplicar, sus escuchadores, sus ids y sus traducciones siguen
 * siendo los mismos: no hay dos verdades que mantener sincronizadas.
 *
 * Y la barra inferior queda con un único propósito: Tizno.
 */
export function initMenuMovil() {
  const burger = document.getElementById('nav-burger');
  const panel  = document.getElementById('nav-panel');
  if (!burger || !panel) return;
  /* PESTILLO: con dos ejecuciones (popstate sobre ruta profunda), el burger
     tenía dos listeners y cada toque hacía toggle('abierto') DOS veces — el
     panel se abría y se cerraba en el mismo gesto: menú inutilizado hasta
     recargar. El pestillo vive en el nodo, no en el módulo, para que un
     hipotético rebuild de la cabecera vuelva a cablearse solo. */
  if (burger.dataset.menuLigado) return;
  burger.dataset.menuLigado = '1';

  const legales = document.querySelector('.footer-legal');
  const volver  = document.getElementById('replay-intro-btn');
  const idioma  = document.getElementById('lang-selector');
  const cunaLegales = legales?.parentElement;   // de dónde salieron, para devolverlos
  const cunaVolver  = volver?.parentElement;
  const cunaIdioma  = idioma?.parentElement;
  const estrecho = window.matchMedia('(max-width: 768px)');

  const nav = burger.parentElement;   // la cabecera, que marca el estado abierto
  const cerrar = () => {
    panel.classList.remove('abierto');
    burger.classList.remove('abierto');
    nav.classList.remove('menu-abierto');
    burger.setAttribute('aria-expanded', 'false');
  };

  /* Los nodos viven en la cabecera o en el pie según el ancho. Se sincroniza
     en los dos sentidos para que girar el teléfono no deje el menú a medias. */
  const recolocar = () => {
    if (estrecho.matches) {
      if (volver && volver.parentElement !== panel) panel.appendChild(volver);
      if (legales && legales.parentElement !== panel) panel.appendChild(legales);
      /* El idioma NO va dentro del panel sino en la propia cabecera, junto a
         la X (Ruben): cambiar de idioma no debería obligar a abrir un menú. */
      if (idioma && idioma.parentElement !== burger.parentElement) {
        burger.parentElement.insertBefore(idioma, burger);
      }
    } else {
      cerrar();
      if (volver && cunaVolver && volver.parentElement !== cunaVolver) cunaVolver.prepend(volver);
      if (legales && cunaLegales && legales.parentElement !== cunaLegales) cunaLegales.appendChild(legales);
      if (idioma && cunaIdioma && idioma.parentElement !== cunaIdioma) cunaIdioma.appendChild(idioma);
    }
  };

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const abierto = panel.classList.toggle('abierto');
    burger.classList.toggle('abierto', abierto);
    nav.classList.toggle('menu-abierto', abierto);
    // el panel desplaza aire: las luciérnagas lo notan (ver ArchiveFireflies)
    document.dispatchEvent(new CustomEvent('menuSopla', { detail: { abierto } }));
    burger.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  });

  // un toque fuera, la tecla de escape o elegir algo: se cierra
  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('abierto')) return;
    if (e.target.closest('#nav-panel, #nav-burger')) return;
    cerrar();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
  panel.addEventListener('click', (e) => {
    // el desplegable de contacto vive dentro del panel: no cierra el menú
    if (e.target.closest('#contact-popover, #nav-contacto, #lang-selector')) return;
    if (e.target.closest('a, [role="button"], button')) cerrar();
  });

  estrecho.addEventListener('change', recolocar);
  recolocar();
}
