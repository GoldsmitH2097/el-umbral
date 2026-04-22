import { CHARACTERS } from './StateManager.js';

const SLUG_MAP = Object.fromEntries(CHARACTERS.map((c, i) => [c.slug, i]));

// Update <title>, canonical, og:title, og:description, og:url, twitter:title for character routes
function _updateMeta(char) {
  const title = `${char.title} — Soulware`;
  const desc  = char.desc;
  const url   = `https://soulware.live/${char.slug}`;

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
    const path = window.location.pathname.replace(/^\//, '').split('/')[0].toLowerCase();
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
