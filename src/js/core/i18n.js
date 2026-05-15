// i18n.js — language detection, persistence, and string lookup.
//
// Two-language site (es / en). Default is Spanish (no prefix); English lives
// under /en/. Detection rule on first visit (no stored preference):
//   - navigator.languages first match starting with 'es' → Spanish
//   - anything else                                      → English
// Once the user lands somewhere or explicitly toggles, the choice is
// persisted in localStorage and respected on every subsequent visit.
//
// Usage:
//   import { lang, t, getField, setLang } from './i18n.js';
//   t('skip-button')           → "Break the trance · Witness the works" (en)
//   getField(char, 'title')    → "The Nameless Knight" if char.title_en exists,
//                                else falls back to char.title
//
// Brand names (Soulware, book titles, author names) live in the source data
// as-is and are not translated — they are proper nouns of the universe.

import { STRINGS } from './translations.js';

const STORAGE_KEY = 'sw_lang';
const VALID = ['es', 'en'];

function _detectFromBrowser() {
  if (typeof navigator === 'undefined') return 'es';
  const langs = navigator.languages || [navigator.language || 'es'];
  for (const l of langs) {
    if (l && l.toLowerCase().startsWith('es')) return 'es';
  }
  return 'en';
}

function _detectFromUrl() {
  if (typeof window === 'undefined') return null;
  return window.location.pathname.startsWith('/en/') || window.location.pathname === '/en'
    ? 'en'
    : 'es';
}

// Dark-launch flag. While true, the active language is determined SOLELY by
// URL — /en/* renders English, everything else renders Spanish. Browser
// auto-detect and localStorage are ignored. Flip to false to enable the full
// behavior (auto-detect on first visit, remember choice across sessions).
// Toggling this off is the "publicly launch English" moment.
const DARK_LAUNCH = true;

// Resolve the active language with this precedence (when DARK_LAUNCH=false):
//   1. URL (/en/... → en) — wins on direct deep-links
//   2. Stored preference in localStorage
//   3. Browser language detection
function _resolveLang() {
  const urlLang = _detectFromUrl();
  if (DARK_LAUNCH) return urlLang; // URL is the only signal during dark launch
  if (urlLang === 'en') return 'en';
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    if (stored && VALID.includes(stored)) return stored;
  } catch {/* localStorage may be blocked — fall through */}
  return _detectFromBrowser();
}

export let lang = _resolveLang();

export function setLang(newLang) {
  if (!VALID.includes(newLang)) return;
  lang = newLang;
  try { window.localStorage?.setItem(STORAGE_KEY, newLang); } catch {/* ignore */}
}

// String lookup. Returns the key itself if missing — easy to spot in dev.
export function t(key) {
  return STRINGS[lang]?.[key] ?? STRINGS.es?.[key] ?? key;
}

// Object-field lookup with English-overlay convention:
//   { title: 'El Caballero…', title_en: 'The Nameless Knight' }
// getField(obj, 'title') returns the localized field if lang === 'en' AND
// the _en variant exists; otherwise the canonical Spanish field. Lets us
// keep CHARACTERS / CATALOGUE definitions as a single source with translations
// inline, rather than maintaining a parallel English-only data structure.
export function getField(obj, field) {
  if (!obj) return '';
  if (lang === 'en' && (field + '_en') in obj && obj[field + '_en']) {
    return obj[field + '_en'];
  }
  return obj[field] ?? '';
}

// URL helpers for routing. The /en/ prefix is added/removed without touching
// the rest of the path.
export function urlForLang(path, targetLang) {
  if (!path) path = '/';
  // Strip any existing /en prefix to get the canonical Spanish path
  const canonical = path.replace(/^\/en(\/|$)/, '/');
  if (targetLang === 'en') {
    return canonical === '/' ? '/en/' : '/en' + canonical;
  }
  return canonical;
}

// Walks the DOM applying translations to anything with data-i18n / data-i18n-html
// / data-i18n-attr-* attributes. Call once on boot + again whenever language flips.
//
//   <button data-i18n="scene1.umbral-button">…</button>
//   <h2 data-i18n-html="pacto.body">…</h2>     ← preserves embedded HTML
//   <input data-i18n-attr-placeholder="pacto.email-placeholder" />
//   <button data-i18n-attr-aria-label="ui.close">×</button>
export function applyTranslations(root = document) {
  // textContent — simple text replacement
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // innerHTML — keeps inner markup, used for strings with <span> separators etc
  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  // Attribute translations (aria-label, placeholder, title, alt …)
  root.querySelectorAll('*').forEach(el => {
    for (const name of el.getAttributeNames()) {
      if (!name.startsWith('data-i18n-attr-')) continue;
      const attrName = name.slice('data-i18n-attr-'.length);
      const key = el.getAttribute(name);
      if (key) el.setAttribute(attrName, t(key));
    }
  });
  // Set <html lang="…"> for accessibility / screen readers
  document.documentElement.lang = lang;
}

