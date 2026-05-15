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
const OBRA_META = {
  'pulso-del-nucleo': {
    es: {
      title: 'Pulso del Núcleo — Soulware',
      desc:  'Primera de tres novelas de fantasía oscura épica. El mundo quebrado, cuatro artefactos ancestrales y un destino que no pide permiso. Por WW. & Eidon.',
    },
    en: {
      title: 'Pulso del Núcleo — Soulware',
      desc:  'First of three novels of epic dark fantasy. A shattered world, four ancestral artefacts, and a fate that asks no permission. By WW. & Eidon.',
    },
  },
  'filamentos-de-oscuridad': {
    es: {
      title: 'Filamentos de Oscuridad — Soulware',
      desc:  'Primera de dos novelas. Cuando los hilos que no deberían conectarse se tensan, la percepción se convierte en trampa. Por Irina M. Ya disponible en Amazon España.',
    },
    en: {
      title: 'Filamentos de Oscuridad — Soulware',
      desc:  'First of two novels. When threads that should not connect pull taut, perception itself becomes a trap. By Irina M. Now available on Amazon Spain.',
    },
  },
  'anatomia-del-vacio': {
    es: {
      title: 'Anatomía del Vacío — Soulware',
      desc:  'No entras a leer un relato. Entras para ser diseccionado por él. Experiencia web interactiva de terror psicológico. Por Germán Ferri.',
    },
    en: {
      title: 'Anatomía del Vacío — Soulware',
      desc:  'You do not enter to read a story. You enter to be dissected by it. An interactive web experience in psychological horror. By Germán Ferri.',
    },
  },
  'totalis-libertas': {
    es: {
      title: 'Totalis Libertas — Soulware',
      desc:  'Antología de relatos breves e intensos sobre la Historia de España. La historia oficial es el relato de los que ganaron. Varios autores.',
    },
    en: {
      title: 'Totalis Libertas — Soulware',
      desc:  'An anthology of brief, intense tales drawn from the history of Spain. Official history is the story of those who won. Various authors.',
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
  const title = `${urlLang === 'en' ? (char.title_en || char.title) : char.title} — Soulware`;
  const desc  = urlLang === 'en' ? (char.desc_en || char.desc) : char.desc;
  const slug  = urlLang === 'en' ? (char.slug_en || char.slug) : char.slug;
  const url   = urlLang === 'en'
    ? `https://soulware.live/en/${slug}`
    : `https://soulware.live/${slug}`;
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
    window.addEventListener('popstate', () => this._resolve());
  }

  init() { return this._resolve(); }

  navigateTo(index) {
    const char = CHARACTERS[index];
    if (!char) return;
    const slug = lang === 'en' ? (char.slug_en || char.slug) : char.slug;
    const url  = lang === 'en' ? `/en/${slug}` : `/${slug}`;
    window.history.pushState({ slug, index }, char.title, url);
    _updateMeta(char, lang);
  }

  navigateToArchive() {
    const url = lang === 'en' ? '/en/' : '/';
    window.history.pushState({}, 'El Umbral', url);
    document.title = lang === 'en'
      ? 'Soulware — Spanish Dark Fiction Publisher'
      : 'Soulware — Editorial Independiente Española | Ficción Oscura y Universos de Autor';
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = lang === 'en' ? 'https://soulware.live/en/' : 'https://soulware.live/';
  }

  _resolve() {
    const { segments, urlLang } = _parsePath();

    // /en/... URLs persist the English preference for next visit too.
    if (urlLang === 'en') setLang('en');

    // /[en/]obras — generic catalog landing
    if (segments[0] === 'obras' && !segments[1]) {
      const url = urlLang === 'en' ? 'https://soulware.live/en/obras' : 'https://soulware.live/obras';
      const m = urlLang === 'en'
        ? { title: 'The Works — Soulware',
            desc:  'The Soulware catalogue: novels and experiences of dark fiction. Pulso del Núcleo, Filamentos de Oscuridad, Anatomía del Vacío, Totalis Libertas.' }
        : { title: 'Las Obras — Soulware',
            desc:  'Catálogo de Soulware: novelas y experiencias de ficción oscura. Pulso del Núcleo, Filamentos de Oscuridad, Anatomía del Vacío, Totalis Libertas.' };
      _applyMeta(m.title, m.desc, url, urlLang);
      this._enterArchive({ skipIntro: true });
      return true;
    }

    // /[en/]obras/:slug — individual book deep link (book slugs stay Spanish)
    if (segments[0] === 'obras' && segments[1] && OBRA_META[segments[1]]) {
      const m = OBRA_META[segments[1]][urlLang] || OBRA_META[segments[1]].es;
      const url = urlLang === 'en'
        ? `https://soulware.live/en/obras/${segments[1]}`
        : `https://soulware.live/obras/${segments[1]}`;
      _applyMeta(m.title, m.desc, url, urlLang);
      this._enterArchive({ skipIntro: true });
      return true;
    }

    // /[en/]:characterSlug — character deep link, accepts EN or ES slugs
    const path = segments[0];
    if (path && SLUG_MAP[path] !== undefined) {
      const char = CHARACTERS[SLUG_MAP[path]];
      _updateMeta(char, urlLang);
      this._enterArchive({ skipIntro: true });
      this._openReading(SLUG_MAP[path]);
      return true;
    }
    return false;
  }
}
