import { CHARACTERS } from './StateManager.js';
import { lang, setLang } from './i18n.js';

// Build slug maps for BOTH languages → character index. English slugs
// (empress/knight/sibyl/harlequin) live alongside Spanish (emperatriz/
// caballero/sortilega/arlequin) so /en/knight and /caballero both resolve.
const SLUG_MAP = {};
CHARACTERS.forEach((c, i) => {
  SLUG_MAP[c.slug] = i;
  if (c.slug_en) SLUG_MAP[c.slug_en] = i;
});

// Individual obra routes — each gets its own canonical URL + meta for SEO.
// Book slugs stay Spanish in BOTH language paths (they're the published
// titles — Amazon links and ISBNs point to those names).
//
// ESTAS CADENAS SON UN ESPEJO, NO UNA FUENTE. La verdad vive en las ROUTES de
// scripts/generate-og-pages.js, que es lo que Google indexa como HTML
// estático. La auditoría del 6-ago encontró que las dos copias ya habían
// divergido (títulos y descripciones distintos por ruta): el título de la
// pestaña cambiaba delante del usuario al arrancar el JS, y la instantánea
// renderizada contradecía el HTML servido. Si tocas un título o una
// descripción, tócalo en LOS DOS ficheros o el bug renace.
const OBRA_META = {
  'pulso-del-nucleo': {
    es: {
      title: 'Pulso del Núcleo — Núcleo Eterno · Soulware',
      desc:  'Primera de tres novelas de la trilogía Pulso del Núcleo. Por WW. & Eidon. Ya en Casa del Libro, El Corte Inglés, Fnac y Amazon. Editorial Soulware.',
    },
    en: {
      title: 'Pulso del Núcleo — Núcleo Eterno · Soulware',
      desc:  'First of three novels in the Pulso del Núcleo trilogy. By WW. & Eidon. Available at Casa del Libro, El Corte Inglés, Fnac and Amazon. Soulware Publishing.',
    },
  },
  'filamentos-de-oscuridad': {
    es: {
      title: 'Filamentos de Oscuridad — Irina M. · Soulware',
      desc:  'Primera de dos novelas de terror psicológico. Por Irina M. Disponible ahora en Amazon España. Editorial Soulware.',
    },
    en: {
      title: 'Filamentos de Oscuridad — Irina M. · Soulware',
      desc:  'First of two novels in psychological horror. By Irina M. Now available on Amazon Spain. Soulware Publishing.',
    },
  },
  'anatomia-del-vacio': {
    es: {
      title: 'Anatomía del Vacío · Soulware',
      desc:  'No entras a leer un relato. Entras para ser diseccionado por él. Experiencia web interactiva de terror psicológico. Por Germán Ferri. Editorial Soulware.',
    },
    en: {
      title: 'Anatomía del Vacío · Soulware',
      desc:  'You do not enter to read a story. You enter to be dissected by it. An interactive web experience in psychological horror. By Germán Ferri. Soulware Publishing.',
    },
  },
  'totalis-libertas': {
    es: {
      title: 'Totalis Libertas — Antología · Soulware',
      desc:  'Antología de relatos breves e intensos sobre la Historia de España. Varios autores. En preparación. Editorial Soulware.',
    },
    en: {
      title: 'Totalis Libertas — Anthology · Soulware',
      desc:  'An anthology of brief, intense tales drawn from the history of Spain. Various authors. In preparation. Soulware Publishing.',
    },
  },
};

// Strip a leading "/en" segment; return URL-implied language.
function _parsePath() {
  let p = window.location.pathname.replace(/^\/+/, '');
  let urlLang = 'es';
  if (p === 'en' || p.startsWith('en/')) {
    urlLang = 'en';
    p = p.replace(/^en\/?/, '');
  }
  return { segments: p.split('/').filter(Boolean), urlLang };
}

function _updateMeta(char, urlLang) {
  // Sufijo por idioma como en el prerender ('Soulware Editorial' /
  // 'Soulware Publishing'), no el genérico '— Soulware' que divergió.
  const sufijo = urlLang === 'en' ? ' — Soulware Publishing' : ' — Soulware Editorial';
  const title = (urlLang === 'en' ? (char.title_en || char.title) : char.title) + sufijo;
  const desc  = urlLang === 'en' ? (char.desc_en || char.desc) : char.desc;
  const slug  = urlLang === 'en' ? (char.slug_en || char.slug) : char.slug;
  /* CON BARRA FINAL, SIEMPRE. La URL sin barra recibe un 301 de Netlify, y
     Google archivaba «canonical que apunta a una URL que redirige» como
     Redirect error — es el fix del 27-jul en generate-og-pages.js (withSlash,
     línea ~152). Este fichero lo estaba deshaciendo en el DOM renderizado. */
  const url   = urlLang === 'en'
    ? `https://soulware.live/en/${slug}/`
    : `https://soulware.live/${slug}/`;
  _applyMeta(title, desc, url, urlLang);
}

function _applyMeta(title, desc, url, urlLang = 'es') {
  document.title = title;
  document.documentElement.lang = urlLang;
  _setMeta('property', 'og:title',       title);
  _setMeta('property', 'og:description', desc);
  _setMeta('property', 'og:url',         url);
  _setMeta('name',     'twitter:title',  title);
  _setMeta('name',     'twitter:description', desc);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = url;
}

function _setMeta(attr, val, content) {
  const el = document.querySelector(`meta[${attr}="${val}"]`);
  if (el) el.setAttribute('content', content);
}

export class Router {
  constructor({ enterArchive, openReading }) {
    this._enterArchive = enterArchive;
    this._openReading = openReading;
    /* EN LA PRIMERA RESOLUCIÓN NO SE TOCAN LOS METADATOS. Cada ruta se sirve
       como HTML prerenderizado con su title, canonical, hreflang y OG ya
       perfectos — reescribirlos al arrancar solo podía empeorarlos, y de
       hecho los empeoraba (barra final perdida, títulos divergidos). El
       runtime solo debe escribir metadatos cuando navega DE VERDAD en
       cliente: pushState o popstate, donde el head heredado ya no describe
       la ruta actual. */
    this._primeraResolucion = true;
    window.addEventListener('popstate', () => this._resolve());
  }

  init() { return this._resolve(); }

  navigateTo(index) {
    const char = CHARACTERS[index];
    if (!char) return;
    const slug = lang === 'en' ? (char.slug_en || char.slug) : char.slug;
    // Con barra: si el visitante copia esta URL, el que la abra aterriza en
    // el fichero estático directamente, sin pagar el 301 de Netlify.
    const url  = lang === 'en' ? `/en/${slug}/` : `/${slug}/`;
    window.history.pushState({ slug, index }, char.title, url);
    _updateMeta(char, lang);
  }

  navigateToArchive() {
    const url = lang === 'en' ? '/en/' : '/';
    window.history.pushState({}, 'El Umbral', url);
    // Espejo del título de portada del prerender — no otra variante más.
    document.title = lang === 'en'
      ? 'Soulware — Spanish Dark Fiction Publisher'
      : 'Soulware — Editorial Española de Ficción Oscura';
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = lang === 'en' ? 'https://soulware.live/en/' : 'https://soulware.live/';
  }

  _resolve() {
    const { segments, urlLang } = _parsePath();
    // El head prerenderizado manda en la carga inicial; ver constructor.
    const escribirMeta = !this._primeraResolucion;
    this._primeraResolucion = false;

    // /en/... URLs persist the English preference for next visit too.
    if (urlLang === 'en') setLang('en');

    // /[en/]obras — generic catalog landing
    if (segments[0] === 'obras' && !segments[1]) {
      if (escribirMeta) {
        const url = urlLang === 'en' ? 'https://soulware.live/en/obras/' : 'https://soulware.live/obras/';
        const m = urlLang === 'en'
          ? { title: 'The Works — Soulware Publishing',
              desc:  'The Soulware catalogue: novels and experiences in dark fiction. Pulso del Núcleo, Filamentos de Oscuridad, Anatomía del Vacío, Totalis Libertas. Independent Spanish publisher.' }
          : { title: 'Las Obras — Soulware Editorial',
              desc:  'Catálogo de Soulware: novelas y experiencias de ficción oscura. Pulso del Núcleo, Filamentos de Oscuridad, Anatomía del Vacío, Totalis Libertas. Editorial independiente española.' };
        _applyMeta(m.title, m.desc, url, urlLang);
      }
      this._enterArchive({ skipIntro: true });
      return true;
    }

    // /[en/]obras/:slug — individual book deep link (book slugs stay Spanish)
    if (segments[0] === 'obras' && segments[1] && OBRA_META[segments[1]]) {
      if (escribirMeta) {
        const m = OBRA_META[segments[1]][urlLang] || OBRA_META[segments[1]].es;
        const url = urlLang === 'en'
          ? `https://soulware.live/en/obras/${segments[1]}/`
          : `https://soulware.live/obras/${segments[1]}/`;
        _applyMeta(m.title, m.desc, url, urlLang);
      }
      this._enterArchive({ skipIntro: true });
      return true;
    }

    // /[en/]:characterSlug — character deep link, accepts EN or ES slugs
    const path = segments[0];
    if (path && SLUG_MAP[path] !== undefined) {
      const char = CHARACTERS[SLUG_MAP[path]];
      if (escribirMeta) _updateMeta(char, urlLang);
      this._enterArchive({ skipIntro: true });
      this._openReading(SLUG_MAP[path]);
      return true;
    }
    return false;
  }
}
