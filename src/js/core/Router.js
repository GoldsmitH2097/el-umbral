import { CHARACTERS } from './StateManager.js';

const SLUG_MAP = Object.fromEntries(CHARACTERS.map((c, i) => [c.slug, i]));

export class Router {
  constructor({ enterArchive, openReading }) {
    this._enterArchive = enterArchive;
    this._openReading = openReading;
    window.addEventListener('popstate', () => this._resolve());
  }

  init() { return this._resolve(); }

  navigateTo(index) {
    const slug = CHARACTERS[index]?.slug;
    if (!slug) return;
    window.history.pushState({ slug, index }, CHARACTERS[index].title, `/${slug}`);
  }

  navigateToArchive() {
    window.history.pushState({}, 'El Umbral', '/');
  }

  _resolve() {
    const path = window.location.pathname.replace(/^\//, '').split('/')[0].toLowerCase();
    if (path && SLUG_MAP[path] !== undefined) {
      this._enterArchive({ skipIntro: true });
      this._openReading(SLUG_MAP[path]);
      return true;
    }
    return false;
  }
}
