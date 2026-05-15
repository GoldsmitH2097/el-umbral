import { CHARACTERS } from './StateManager.js';

const SLUG_MAP = Object.fromEntries(CHARACTERS.map((c, i) => [c.slug, i]));

// Individual obra routes — each gets its own canonical URL + meta for SEO
const OBRA_META = {
  'pulso-del-nucleo': {
    title: 'Pulso del Núcleo — Soulware',
    desc: 'Primera de tres novelas de fantasía oscura épica. El mundo quebrado, cuatro artefactos ancestrales y un destino que no pide permiso. Por WW. & Eidon.',
    url: 'https://soulware.live/obras/pulso-del-nucleo',
  },
  'filamentos-de-oscuridad': {
    title: 'Filamentos de Oscuridad — Soulware',
    desc: 'Primera de dos novelas. Cuando los hilos que no deberían conectarse se tensan, la percepción se convierte en trampa. Por Irina M. Ya disponible en Amazon España.',
    url: 'https://soulware.live/obras/filamentos-de-oscuridad',
  },
  'anatomia-del-vacio': {
    title: 'Anatomía del Vacío — Soulware',
    desc: 'No entras a leer un relato. Entras para ser diseccionado por él. Experiencia web interactiva de terror psicológico. Por Germán Ferri.',
    url: 'https://soulware.live/obras/anatomia-del-vacio',
  },
  'totalis-libertas': {
    title: 'Totalis Libertas — Soulware',
    desc: 'Antología de relatos breves e intensos sobre la Historia de España. La historia oficial es el relato de los que ganaron. Varios autores.',
    url: 'https://soulware.live/obras/totalis-libertas',
  },
};

// Update <title>, canonical, og:title, og:description, og:url, twitter:title for character routes
function _updateMeta(char) {
  const title = `${char.title} — Soulware`;
  const desc  = char.desc;
  const url   = `https://soulware.live/${char.slug}`;
  _applyMeta(title, desc, url);
}

function _applyMeta(title, desc, url) {
  document.title = title;
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
    window.history.pushState({ slug: char.slug, index }, char.title, `/${char.slug}`);
    _updateMeta(char);
  }

  navigateToArchive() {
    window.history.pushState({}, 'El Umbral', '/');
    document.title = 'Soulware — Editorial Independiente Española | Ficción Oscura y Universos de Autor';
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://soulware.live/';
  }

  _resolve() {
    const segments = window.location.pathname.replace(/^\//, '').toLowerCase().split('/');

    // /obras — generic "catalog landing" — skip the intro, land in the Archive grid
    if (segments[0] === 'obras' && !segments[1]) {
      _applyMeta(
        'Las Obras — Soulware',
        'Catálogo de Soulware: novelas y experiencias de ficción oscura. Pulso del Núcleo, Filamentos de Oscuridad, Anatomía del Vacío, Totalis Libertas.',
        'https://soulware.live/obras'
      );
      this._enterArchive({ skipIntro: true });
      return true;
    }

    // /obras/:slug — individual book deep link
    if (segments[0] === 'obras' && segments[1] && OBRA_META[segments[1]]) {
      const m = OBRA_META[segments[1]];
      _applyMeta(m.title, m.desc, m.url);
      this._enterArchive({ skipIntro: true });
      return true;
    }

    // /:characterSlug — character deep link
    const path = segments[0];
    if (path && SLUG_MAP[path] !== undefined) {
      const char = CHARACTERS[SLUG_MAP[path]];
      _updateMeta(char);
      this._enterArchive({ skipIntro: true });
      this._openReading(SLUG_MAP[path]);
      return true;
    }
    return false;
  }
}
