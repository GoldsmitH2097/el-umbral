# HANDOVER.md — El Umbral / Soulware
*Last updated: May 15, 2026 — Session 10 (bilingual ES/EN public launch + selector + skip resilience + footer polish)*

---

## Site status

**Live:** https://soulware.live · https://soulware.live/en/
**Repo:** github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/Ruben/Developer/el-umbral`
**Last commit:** `227ba13` — fix(i18n): wire remaining Spanish-leaking UI + prerender /en/ home (#30)
**Build:** ✅ Clean
**Deploy:** ✅ Netlify auto-deploy from `main`
**GA4:** ❌ Removed (PR #16) — no third-party tracking, no cookie banner
**Languages:** 🇪🇸 ES (default, `/`) · 🇬🇧 EN (`/en/`) — selector visible in footer, choice persisted in `localStorage('sw_lang')`, sync `<head>` redirect honours the saved preference on next visit

---

## What was completed — Session 10 (May 15, 2026)

Bilingual (ES/EN) shipped publicly. The site is now indexable in two languages with hreflang clusters, per-route prerender, a visible language selector, and persistent preference.

### PRs landed in this session — #27 through #30
| PR | Title | Summary |
|----|-------|---------|
| #27 | `feat(i18n): bilingual scaffold (ES/EN) — dark-launched` | `src/js/core/i18n.js` (`t`, `getField`, `setLang`, `urlForLang`, `applyTranslations`), `STRINGS` dict in `translations.js`, Router `/en/` prefix + character-slug translation map. Dark-launched (selector hidden). |
| #28 | `feat(i18n): full English translations + render layer wired` | Character lore + catalogue translated via `_en` overlay fields on `CHARACTERS` / `CATALOGUE`. ArchiveDOM / mobile.js use `getField()`. Bilingual prerender via `scripts/generate-og-pages.js` (10 ES + 10 EN). Sitemap with `xhtml:link` hreflang. |
| #29 | `fix(i18n): Scene 1 character text translates + #umbral-btn re-centred` | VisualEngine `_loadCharacterVideo` / `_swapToNextCharacter` use `getField()` (Scene 1 char-text was still ES on /en/). `#umbral-btn` got `text-indent: 5px` to compensate for letter-spacing trailing gap. |
| #30 | `fix(i18n+footer): EN body prerender, legal pages, skip resilience, footer polish` | Body content for /en/ routes pre-translated by the prerender script (kills FOUC). Sync `<head>` redirect honours stored `sw_lang` before first paint. `aviso-legal-en.html` / `privacidad-en.html` / `cookies-en.html` siblings; modal fetches the matching file by lang. Skip-intro now tears down in-flight scene state (was leaving Cm7 chord looping). Footer logo 120→72, replay+selector inline, watermark + hero copy translated. `text-wrap: pretty` extended to vision blocks / subtitles / pillar quotes; pillar max-width 250→290. `.obra-btn` `text-indent: 1.5px` (CLAIM YOUR COPY off-centre fix). Reading + modal book covers lock `aspect-ratio: 2/3` + `object-fit: cover`. Footer legal links blur active element on modal close (default blue focus ring fix). |

### Translation conventions established
- **Translated**: chrome (nav, hero, footer, modals, Tizno panel), CTAs, status pills, format labels, character archetype names ("El Caballero Sin Nombre" → "The Nameless Knight"), character lore + descriptions, catalogue vision / subtitle / format, legal pages.
- **NOT translated** (proper nouns of the universe): "Soulware", book titles (`Pulso del Núcleo`, `Filamentos de Oscuridad`, `Anatomía del Vacío`, `Totalis Libertas`), volume names (`Núcleo Eterno`, `Resonancia de la Penumbra`), author names, `editorial@soulware.live`. Same in both languages.
- **Character archetype canon (EN)**: The Throneless Empress · The Nameless Knight · The Shadowless Sibyl · The Flowerless Harlequin. EN slug routes: `/en/empress` · `/en/knight` · `/en/sibyl` · `/en/harlequin`. Book slugs stay Spanish in both languages.

### How the i18n system works
- **Source of truth = URL.** `/` is ES, `/en/*` is EN. `lang` is resolved in `i18n.js` from `location.pathname`.
- **Pre-render** (`scripts/generate-og-pages.js`) emits 20 static HTML files: `dist/index.html` (ES root), `dist/en/index.html` (EN root), and one subdir per route per language with patched `<title>`, `<meta description>`, canonical, OG/Twitter, `<html lang>`, and (NEW in #30) body text rewritten via `translateBody()` for EN routes so scrapers + first paint show English.
- **Runtime translation** (`applyTranslations()`) walks `[data-i18n]` / `[data-i18n-html]` / `[data-i18n-attr-*]` elements and rewrites textContent / innerHTML / attribute values from `STRINGS[lang]`. Runs once on boot; the pre-rendered EN HTML matches what it would output, so no FOUC.
- **`getField(obj, 'title')`** returns `obj.title_en` when `lang === 'en'` and the field exists, else falls back to `obj.title`. Lets CHARACTERS / CATALOGUE keep a single source with `_en` overlay fields.
- **Persistence**: clicking ES/EN in the footer calls `setLang()` (writes `localStorage.sw_lang`) and navigates to `urlForLang(path, target)`. On next visit, the sync `<head>` script reads `sw_lang` and `location.replace`s to the matching URL before any paint.
- **SEO**: hreflang in three layers — `<link rel="alternate" hreflang>` per page, `xhtml:link` per sitemap URL, self-pointing `<link rel="canonical">`. Both languages indexable; Google clusters them.

### Other UX/polish in #30
- **Skip-intro resilience**: previously a mid-transition skip (Scene 1→2 or 2→3) left the awakening chord (Cm7) looping forever, the gallery video painting under the archive, and pending timers firing. Fixed by tearing down audio (`stopAwakening`, `setAwakening(false)`, `state.isAwakening=false`), hiding `#gallery-container` + `#scene-2` + `#scene-3`, pausing `#char-video`, cancelling `_autoTimer` / `_s3IdleInterval` / `_s2HintInterval` before `transitionTo(4)`.
- **Widow lines**: pillar quotes were rendering "truth." on its own line. Widened `max-width 250→290px` and switched `text-wrap: balance` → `text-wrap: pretty` (better for short paragraphs — `pretty` pulls trailing words back; `balance` only equalises line widths). Extended to `.reading-obra-vision`, `.reading-obra-subtitle`, `.obra-subtitle`, `.tizno-pacto-label`, `#editorial-watermark`, `.site-hero-editorial`, modal descriptions.
- **Book cover stretching**: `.reading-obra-cover` and `#obra-modal-cover` had no explicit aspect-ratio; the IMG could grow unbounded under certain flex parent heights. Now both have `aspect-ratio: 2/3` + img `width: 100% height: 100% object-fit: cover`.
- **Footer**: logo `120→72px`, padding `6vh 5vw 5vh → 2vh 5vw 5vh`, replay button + lang selector share one row separated by `·`. Legal links: programmatic focus on modal close was leaving a default blue rectangle; closeLegal now `blur()`s the active element and `.footer-legal a:focus-visible` is on-brand amber.
- **Editorial watermark + hero copy translates.** EN copy drops the "Spanish" qualifier (Ruben call: "instead of Spanish Publisher of dark fiction, just say Dark Fiction Publisher"): watermark = "Independent publisher / of dark fiction and author-driven universes"; hero = "Soulware — an independent publisher of dark fiction and author-driven universes."

### Files touched
- `src/index.html` — data-i18n attrs across chrome + Tizno + modals, lang selector in footer, sync `<head>` redirect script, footer-replay-row, smaller logo.
- `src/js/core/translations.js` — full ES + EN dictionaries, including `editorial.watermark-html`, `tizno.*`, `nav.las-obras/contacto`, `site-hero.*`, `site-footer.tagline`, `reading-view.back/back-aria`, `mobile-detail.back`, `nav.author/books/vision/sheet`, `ui.close`.
- `src/js/core/StateManager.js` — `_en` overlay fields on every CHARACTERS + CATALOGUE entry (per-character: `slug_en`, `label_en`, `title_en`, `desc_en`, `lore_en`; per-catalogue: `title_en`, `subtitle_en`, `seriesInfo_en`, `vision_en`, `desc_en`, `buyLabel_en`, plus `editions[*].label_en/buyLabel_en/format_en/vision_en`).
- `src/js/core/Router.js` — `/en/` prefix handling, dual `OBRA_META`, SLUG_MAP accepts both languages.
- `src/js/engine/VisualEngine.js` — `getField(c, 'title')` / `getField(c, 'desc')` in char-text rendering.
- `src/js/ui/ArchiveDOM.js` — all renders + reading view + obra modal use `getField` + `t`. Legal modal fetches per-language file. btn-volver uses `t('reading-view.back')` + data-i18n hooks. Modal close blurs active element.
- `src/js/mobile.js` — `getField` in mobile detail view, `t()` for status labels.
- `src/css/global.css` — `text-wrap: pretty` extended.
- `src/css/archive.css` — pillar quote `max-width 290px` + `text-wrap: pretty`, footer redesign, `.lang-selector` styling with `aria-current` amber active state, `.footer-legal a:focus-visible`, `.reading-obra-cover` aspect-ratio.
- `src/css/obras.css` — `.obra-btn` `text-indent: 1.5px`, `#obra-modal-cover` aspect-ratio + object-fit.
- `src/css/canvas.css` — `#umbral-btn` `text-indent: 5px`.
- `scripts/generate-og-pages.js` — bilingual prerender (10 ES + 10 EN routes, including home), `translateBody()` for EN, hreflang alternates rewritten per page.
- `public/sitemap.xml` — 20 URLs with hreflang alternates.
- `public/aviso-legal-en.html` · `public/privacidad-en.html` · `public/cookies-en.html` — EN legal page siblings.

### Live-deploy verification (May 15 ~14:30 Madrid)
- `/` → 200 · `<html lang="es">` · ES title
- `/en/` → 200 · `<html lang="en">` · EN title + EN description
- `/caballero` → 301 → `/caballero/` → 200 (Netlify pretty-URL behavior, fine for SEO)
- `/en/knight` → 301 → `/en/knight/` → 200 · hreflang ES points back to `/caballero` ✓
- `/aviso-legal-en.html` · `/privacidad-en.html` · `/cookies-en.html` → 200
- Spanish-leak grep on `/en/`: 0 matches across the patterns we care about ✓

### Pending for Ruben / Javier (search visibility)
- [x] **GSC → URL Inspection → Request Indexing** on each of the 10 `/en/*` URLs. ✅ Done May 15 — all 10 EN URLs (/en/, /en/obras, /en/empress/knight/sibyl/harlequin, /en/obras/pulso-del-nucleo + 3 more obras) confirmed in priority crawl queue.
- [x] **PSI on /en/** ✅ Done May 15. Mobile: Perf 86, A11y/BP/SEO 100, LCP 1.3s, CLS 0. Desktop: Perf 70, A11y/BP/SEO 100, LCP 0.3s, CLS 0. Same budget as / (TBT is the cinematic intro — known constraint, not a regression).
- [x] **Bing Webmaster Tools** ✅ Done May 15. Imported from GSC (sitemap came over automatically). All 10 EN URLs submitted via URL Submission feature; quota 90/100 left for the day. Bing feeds DuckDuckGo + Yahoo + ChatGPT search citations as well.
- [ ] **External EN-language inbound links** (Goodreads author page, Amazon author page, etc.) will move the needle far more than any on-page tweak. The Amazon + Goodreads work was already pending in CLAUDE.md; same items.

### Tiny follow-up — PR #32 (May 15)
After Session 10 shipped, the post-deploy hardening pass caught one residual Spanish hardcode: the Pacto submit-success aria-label (`'Pacto firmado'`) was set inline in `ArchiveDOM.js`. Fixed via `t('pacto.signed-aria')`, both ES + EN dictionaries updated. PR #32 merged.

### SEO follow-up — PR #35 (May 15) — trailing-slash canonical fix
While reviewing GSC's "Why pages aren't indexed", Ruben spotted **8 pages flagged as "Redirect error"**. Root cause: the prerender writes `dist/<path>/index.html`, Netlify serves at `/<path>/` with a trailing slash, but our sitemap entries / `<link rel="canonical">` / hreflang alternates all referenced the **no-slash** version. The crawler's chain was: sitemap URL `/sortilega` → 301 → `/sortilega/` → canonical points back at `/sortilega` (the redirecting URL) → Google classified as canonical loop / redirect error.

Fix in `scripts/generate-og-pages.js` and `public/sitemap.xml`: every URL emitted carries the trailing slash on deep routes (`/sortilega/`, `/en/knight/`, `/obras/pulso-del-nucleo/`, etc.). The home routes `/` and `/en/` already had the slash and were unaffected.

After the fix shipped, re-submitted the 10 ES URLs to GSC via URL Inspection (priority crawl) and 10 to Bing via URL Submission. Counter for GSC indexing requests today: 20 (10 EN earlier + 10 ES now), no quota issues. Bing UI shows the most-recent submission set (10 ES); the earlier EN batch was accepted, also in queue.

The 5 "Server error (5xx)" entries in GSC are ghost paths (`/read`, `/saga`, `/contact.html`) that 301-redirect to `/`, plus two parameterized homepage variants (`/?brand=...`, `/?titulo=...`). All currently return correct codes — the 5xx flag was historical and Google's validation status is "Started" (already re-checking, will clear on its own).

---

## What was completed — Session 9 (May 14, 2026 — night → May 15)

A mega session — 17 PRs merged (#5 through #21) covering performance, SEO, accessibility, content, UX polish, and privacy.

### Headline numbers (before → after)
| Metric | Before | After |
|---|---|---|
| WAVE errors | 6 (4 empty headings + 2 form labels) | **0** |
| WAVE AIM | — | **9.8 / 10** |
| DebugBear suggestions met | ~15/30 | **26/30** |
| LCP (PSI mobile) | 3.6 s | **0.7 s** |
| TBT (Lighthouse) | 11–19 s | **~2.1 s** |
| CPU busy | 19 s | **5.96 s** |
| Total initial payload | 5.5 MB | ~1.5 MB |
| "Improve image delivery" flag | 1.57 MB savings | **114 KB savings** |
| Forced reflow from gtag | 2 × 47 ms | **0** (GTM removed) |
| Speed Index | 4.6 s | **0.9 s** |

### Performance — JS / canvas (PRs #9, #12)
- **Canvas RAF idle-pause** in Scenes 1–3: suspends after 3 s of no interaction. Wake-up listeners on `mousemove`/`mousedown`/`touchstart`/`touchmove`/`keydown`/`scroll`.
- **Particle physics @ 30 fps simulation, 60 fps render** — halved TBT.
- `_getTargets()` in ArchiveFireflies no longer fires `getBoundingClientRect()` every frame — gated to only fire near the idle threshold (120 reads/sec → ~10).
- Removed `filter:blur`, `mix-blend-mode`, heavy `text-shadow`, `cronicasGlow` keyframe (caused Chrome crashes on weaker devices).

### Performance — assets (PRs #13, #15, #17, #18, #20, #21)
- **Cover webps resized to 900 px max** at q82 (1.4 MB saved across 7 covers).
- **Mobile cover variants** at 318×450 in `/public/assets/mobile/` (-545 KB on mobile). All cover imgs ship `srcset="…/mobile/x.webp 320w, …/x.webp 600w" sizes="(max-width: 768px) 150px, 220px"`.
- **720p video variants** at `/public/720/<slug>.mp4` (-60%, ~397 KB each).
- **`pickVideoSrc()` helper** at `src/js/core/videoVariant.js` picks 1080p / 720p based on:
  - `state.skippedIntro` (force 720p — these users didn't watch the cinematic)
  - `navigator.connection.saveData` / `effectiveType` (2g / slow-2g / 3g → 720p)
  - viewport ≤ 768 → 720p
  - otherwise → 1080p
- **Video posters** (`.webp` from t=0 frame, 9–20 KB each) in `/public/posters/`. Set as `<video poster=...>` on all pillars and on `#char-video` for the gallery. t=0 matches the video's loop entry point so the static→playing handoff is seamless.
- **`width="600" height="900"`** explicitly set on every cover img + `width="120" height="120"` on the logos. CLS = 0.

### Loading strategy (PRs #15, #17, #18, #20, #21)
- All `<video>` start at `preload="none"` — Lighthouse never reaches Scene 4 so initial-load metrics are unaffected.
- `sceneChange→4` listener upgrades pillars to `preload="auto"` AND re-picks src via `pickVideoSrc(dataset.charSrc)` (handles skip-intro flag flipping post-construction).
- **IntersectionObserver belt-and-suspenders** in `_initPillarPreloadOnScroll()`: any pillar approaching viewport (`rootMargin: 200px`) with `preload="none"` is bumped to `auto`. Defense in depth for any future skip path that misses `sceneChange`.
- **LCP poster discoverable from initial HTML** (PR #21): hardcoded `poster="/posters/reina-sin-corona.webp"` on `#char-video` + `<link rel="preload" as="image" href="..." fetchpriority="high">` in `<head>`. Lighthouse LCP audit now passes "Request is discoverable in initial document" and "fetchpriority=high should be applied".
- Legal HTML cache warming (`requestIdleCallback`) moved to first user interaction (`pointerdown` / `touchstart` / `keydown` / `scroll`) or `sceneChange→4`. Was upstream of LCP in the critical chain on slow-4G.
- Removed `<link rel="prefetch">` for legal HTMLs from `<head>` (was serializing into critical path).

### SEO (PRs #12, #15)
- Per-route prerender (`scripts/generate-og-pages.js` postbuild): 8 deep routes get unique `<title>`, description, canonical, OG/Twitter, JSON-LD `Book` schema with `offers.price` + `priceCurrency`.
- Pulso JSON-LD: 22.44 EUR.
- Filamentos JSON-LD: 17.95 EUR.

### Accessibility (PRs #10, #11)
- 4 empty headings → sr-only placeholder spans.
- `<input id="contact-email">` → `aria-label="Email"`.
- Honeypot `bot-field2` → `aria-label` + `tabindex="-1"` + `autocomplete="off"`.
- All `<video>` decorative → `aria-hidden="true"`.

### Privacy (PR #16)
- **GA4 / GTM completely removed.** No `<script async src="googletagmanager.com/gtag/js">`, no `dataLayer`, no `gtag('config'...)`. No cookie banner required.
- Killed the only cross-origin script the site loaded.

### Catalogue + UI polish (PRs #6, #7, #8, #14, #19)
- Pacto button (Tizno panel): icon-only with check-on-send swap.
- "Cargando…" replaced with breathing **"Despertando…"** + cascading dots.
- Legal modal: synchronous open when cache-hit (no loading flash).
- Pulso del Núcleo card + modal + reading view: two editions render in a single stacked layout — buy CTA for Tapa Blanda (live), "Tapa Dura / Próximamente" combined button below.
- All coming-soon CTAs unified to **"Próximamente"**.
- Status pill removed on coming-soon cards (the button already says it).
- Emperatriz obra: title "En preparación" → **"Título Sellado"**. CTA → "Próximamente". (Placeholder title — real title sealed.)
- La Corte (Totalis Libertas) CTA: "Cruza el Umbral" → "Próximamente".
- Anatomía CTA: "Iniciar mi Disección" → "Próximamente".

### Audio (PR #3, continued)
- Cover-hover sound + button-hover sound (independent throttles).
- Reading view: master output goes through `BiquadFilter` lowpass at 22050 Hz baseline; muffles to ~800 Hz when reading view opens, restores on close.

### Security headers (PR #3, continued, in `netlify.toml`)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Permissions-Policy: geolocation=() microphone=() camera=()`

### Files added this session
- `public/720/{reina-sin-corona,caballero-sin-nombre,sortilega-sin-sombra,arlequin-sin-flores}.mp4` — 720p variants
- `public/posters/{…}.webp` — t=0 frame posters
- `public/assets/mobile/{…}.webp` — mobile cover variants
- `src/js/core/videoVariant.js` — variant picker

---

## What was completed — Session 8 (May 14, 2026 — evening)

A long polishing session covering visual, audio, performance, and content fixes. Three PRs merged: #3 (polish) and #4 (lighter videos); #2 was closed as superseded by #3.

### Audit cleanup (rolled into PR #3)
- **Filamentos JSON-LD**: was declared `PreOrder` with `availabilityStarts: 2026-05-12` for a book that's been shipping since May 12. Fixed to `InStock` with Amazon ES `url`.
- **Filamentos copy**: "Disponible el 12 de mayo de 2026" appeared in `src/index.html` (ghost DOM) and `Router.js`. Both surface in shares/crawlers. Now reads "Ya disponible" + Amazon link.
- **Pulso ASIN mismatch**: `scripts/generate-og-pages.js` was using `B0CQPCRCXP` for the Offer URL; everywhere else uses `8409810344`. Unified.
- **Dead code removed**: `_buildContact()` method + `<section id="contact-section">` (no UI path; scroll-contact opens Tizno). `#contact-form` from submit handler. `localStorage.removeItem('sw_crossed')` (flag never set). Production `console.warn('[AudioEngine] blocked')`.
- **Listener / interval leaks**: countdown `setInterval` now tracked + cleared (was dormant but would leak when next countdown launches). Reading-view obras-list click handler moved from per-call to one-time delegated binding. Global Escape `keydown` for obra modal now guarded with `modal.classList.contains('open')`.
- **A11y**: `h4` → `h3` for pillar headings (fixes Lighthouse `heading-order`). `<div id="main-site">` → `<main id="main-site">` (adds the missing `<main>` landmark). On-brand amber `:focus-visible` outline on `.archive-pillar` replaces default browser blue.
- **Security headers** in `netlify.toml`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy: geolocation=() microphone=() camera=()`.
- **Doc drift**: `CLAUDE.md` catalogue replaced `pulso-blanda`/`pulso-dura` with single `pulso` + `editions[]` to match `StateManager.js`.

### Tizno panel
- Restructured from awkward 2-column-half-empty grid to **single centered ~480px column**, then in a follow-up rebuilt as a **3-column wide-and-shallow grid** at desktop (1024px+) — col 1 contact CTA, col 2 brand block (social/email/identity), col 3 El Pacto form. Collapses to 2 cols at tablet, 1 col on mobile. Panel height went 396px → 196px on desktop.
- Reordered DOM: Contacto + Envíanos button on top, then social row, email, identity, El Pacto.
- Padding/max-height tightened (44px→28px, 85vh→70vh).
- Cursor: `pointer !important` + `user-select: none` on the mailto button (was text cursor).
- `:focus-visible` outline on the X close button (was default browser blue square on click).
- **Threads icon** replaced with the official Meta SVG (192×192 viewBox + `fill-rule="evenodd"` on its own subpath). Previous path was a single subpath that rendered as a solid blob.

### Archive fireflies
- **Spawn range** spread across full viewport (was clustered top-third with H*1.2 going off-screen).
- **More dynamic motion**: independent X and Y phase oscillators (the previous sine was Y-only — why they barely moved horizontally), bigger Brownian amplitude, per-firefly `speedMult` for variance.
- **Cursor repulsion**: fireflies now flee from the mouse within a 220px radius with strength scaling 1/distance — like dust avoiding a hand.
- **Scroll-direction wake nudge** with inertia decay — they catch scroll motion like dust in air.
- **Real viewport bounds** — soft boundary was `y > 3000` (way past screen). Now clamps to actual viewport edges.
- Count 4 → 6 for more presence.
- **30fps throttle** on the RAF (was 60fps) — halves CPU; motion is slow enough the difference isn't perceptible.
- **Page Visibility hook** — pause RAF when tab hidden, resume when visible.
- **Big perf win from trace analysis**: `_getTargets()` was calling `getBoundingClientRect()` twice every frame (forces synchronous layout). At 30fps that was 600 layout reads per 5s in the user's trace — the #1 `UpdateLayoutTree` contributor. Gated to fire only when `idle > INACTIVITY_OBRAS - 1500ms`. Next trace showed 12× reduction in layout reads.

### Las Crónicas heading
- Split into per-letter `<span>` tags via JS in `main.js`, with `--i` index custom prop. `aria-label="Las Crónicas"` preserved on h2; spans are `aria-hidden`.
- Per-letter subtle Y/X sine-wave drift (±1.5px Y, ±0.5px X) with phase offset per letter. Animation starts after the existing reveal completes (2.8s delay).
- Space character span gets explicit `width: 0.45em` so the gap between "LAS" and "CRÓNICAS" actually renders.
- Per Ruben's call: the original glow breath + Ó blink were removed — "shitty" and CPU-heavy (text-shadow with 50px blur radius is the most expensive single thing you can put on a heading). Only the drift remains.

### Scene 3 — entrance + Adentrarse departure
- **Entrance**: h1 and button now start invisible and fade in via opacity once `triggerAwakening` adds `.scene-3--awakened` (h1 at 0.3s, button at 2.2s). Pure opacity transitions — no scale, no letter-spacing, no blur (per Ruben's "lets simplify to fades" feedback).
- **Departure** (clicking ADENTRARSE or 7s idle auto-advance): scene fades over 1.4s, button + h1 fade in 0.7s. Simple, smooth, no glitch flicker.
- **VFX canvas fade**: the awakening spotlight (drawn on `#vfx-canvas` at z-index 3) was visible through the fading white scene-3 (z-index 10), making the circle appear to "linger" past the click. Now the canvas itself fades on the same trigger (`transition: opacity 0.4s` on the base canvas rule + sibling-selector rule sets opacity 0 when scene-3 has `.scene-3--departing`; JS belt-and-suspenders inside rAF).
- **Auto-advance idle bumped 5s → 7s** so the button is visible for >1s before auto-advance fires.

### Audio
- **Master output bus** added to `AudioEngine._buildGraph()`: all sources now route through `masterOut → masterFilter (lowpass) → ctx.destination`. New method `setReadingViewMuffle(open)` animates the master lowpass cutoff between 22050Hz (clear) and 700Hz (muffled) over ~150ms.
- **Reading-view muffle wired**: `ArchiveDOM.openReading()` muffles, `closeReading()` restores. Like a heavy door closing as the reader steps into a character bio.
- **Hover sounds**:
  - `playCoverHover(charIndex)` — two-harmonic chime (sine + triangle) tuned to `CHAR_FREQUENCIES[charIndex]`, ~50ms attack, 550ms exponential decay, ~0.04 gain. Each character's books carry that character's tonal fingerprint.
  - `playButtonHover()` — soft metallic shimmer on active buy buttons (bandpass-filtered noise sweeping 5200Hz → 1800Hz over 220ms).
  - Independent throttle timers (`_lastCoverHoverT` / `_lastBtnHoverT`) so a cover hover doesn't suppress a button hover when the cursor moves between them.
- **Wiring**: delegated `mouseover` handler on `document` with `relatedTarget` guard so each cover/button only chimes on actual entry. Reading-view `.reading-obra-cover` also fires the character-tuned chime (uses `_currentReadingIndex`).

### Performance
- Stripped every `filter: blur()` from transition/entrance keyframes (was up to `blur(30px)` — most expensive CSS filter). Removed `mix-blend-mode: multiply` (forces extra compositing layer). Removed `cronicasGlow` keyframe (50px text-shadow infinite was the biggest single ongoing cost). Replaced with vector-only transforms + opacity.
- Pillar videos no longer call `video.load()` eagerly — defers to `preload="metadata"` (~8MB saved on iOS Safari Archive entry).
- Audio context already suspends on Page Visibility hidden. Verified working.
- VisualEngine `_tick` already clamps delta-time during tab-switch pauses.

### Cursor consistency
- Previously `main.js` was forcing `cursor: auto !important` on every element when entering the archive, which suppressed anchor pointer defaults — that's why legal-link hovers showed text cursors.
- Now removes inline cursor styles only; explicit CSS rules: default arrow on body, pointer on a/button/`[role=button]`/`.archive-pillar`/`.obra-cover--clickable`/`.obra-btn`/`.footer-legal a`/etc., text only on `input[type=email]`/`input[type=text]:not([readonly])`/textarea.

### Active column / modal pure black
- `.archive-col` was `background: #050505` with `#080808` on hover — that bleed showed as gray. Now solid `#000`, no hover lift.
- `.archive-pillar` also explicitly `background: #000` (video opacity now renders onto pure black).
- `#obra-modal` was `rgba(2,2,2,0.97)` (3% transparency let underlying pillars show through). Now solid `#000`.

### Pillar typography
- All 4 character titles align at the same vertical height regardless of 1/2/3-line descriptions — reserved 5.1em `min-height` on `.pillar-content p`.
- `text-wrap: balance` on the same selector — prevents widow words ("verdad." dangling alone).

### Legal pages fast-load
- `<link rel="prefetch">` for `/aviso-legal.html`, `/privacidad.html`, `/cookies.html` in `<head>` — browser warms cache during idle.
- In-memory `legalCache` Map so second open is also instant (no re-fetch).

### Character videos — 50% smaller (PR #4)
- All 4 character pillar videos re-encoded from After Effects → Adobe Media Encoder at half the bitrate (1 Mbps target instead of ~2 Mbps).
- Same H.264 codec (universal browser support — no compat risk; HEVC was ruled out because Chrome on Linux/Windows decoding is unreliable).
- Same resolution (1080×1080), same 24fps, same 7.96s duration, same visual quality acceptable for ambient looping.
- Sizes: 1.9 MB each → ~980 KB each. **Total: 7.6 MB → 3.9 MB (-49%).**

### Performance numbers (start → end of session)

| Metric | Before | After |
|---|---|---|
| Total video weight | 7.6 MB | 3.9 MB (-49%) |
| TBT (mobile, throttled) | 100ms | 20ms (-80%) |
| TTI (mobile, throttled) | 18.3s | 3.8s (-79%) |
| Accessibility score | 97 | 100 |
| UpdateLayoutTree (per-sec, in 4× throttled trace) | 120/s | 9.5/s (12× better) |

---

## What was completed — Session 7 (May 14, 2026)

### SEO diagnosis
- GSC dashboard showed 1 indexed / 15 not indexed → investigated each of 4 error buckets
- **All 15 non-indexed URLs are ghosts from a pre-Vite site**, not current routes (`/read`, `/saga`, `/contact`, `/map`, `/universo`, `/thanks.html`, `/privacy`, `/terms`, `/?brand=`, `/?titulo=`)
- Confirmed per-route prerendering (`scripts/generate-og-pages.js`) is already working — live `/caballero/` serves unique title and `canonical → /caballero`

### Code changes (PR #1, merged)
- `public/sitemap.xml`: dropped `/aviso-legal`, `/privacidad`, `/cookies` (they carry `noindex` — contradictory to sitemap inclusion). Now 9 URLs.
- `public/_redirects`: 10 explicit `301` redirects for legacy ghost paths, ahead of SPA catch-all
- `CLAUDE.md`: refreshed SEO status section with accurate state; fixed stale Filamentos status (`countdown` → `available`)

### Google Search Console actions (May 14)
- "Validate Fix" submitted for 3 of 4 error buckets:
  - Server error (5xx)
  - Alternate page with proper canonical tag
  - Crawled - currently not indexed
- **Skipped** "Excluded by noindex" — the 3 legal pages are intentionally noindexed; validation would fail
- "Request Indexing" submitted for all 8 real routes via URL Inspection:
  - `/caballero` (was already indexed)
  - `/emperatriz`, `/sortilega`, `/arlequin` (not yet indexed)
  - `/obras/pulso-del-nucleo`, `/obras/filamentos-de-oscuridad`, `/obras/anatomia-del-vacio`, `/obras/totalis-libertas` (not yet indexed)

### Expected outcome
- Ghost URLs should drop from GSC reports over the next 1–2 weeks as Google re-crawls and sees the 301s
- Real routes should appear in indexed count over the next 1–4 weeks as Google processes the priority crawl queue
- Indexed count should climb from 1/9 toward 9/9. Re-check GSC weekly.

---

## Captured ideas (not yet scoped)

### Archetype-keyed ambient drone (Scene 4)
**Idea:** When focusing on one of the four character columns in the Archive, the ambient sound should subtly retune to that character's tonal signature (using the existing `CHAR_FREQUENCIES` chord set).

**Why it's interesting:** `playCharacterSignature` already exists for transitions. Extending the *continuous* ambient to also respond to focus would deepen the immersive feedback — each column gains a sonic identity, not just a visual one. Since `CHAR_FREQUENCIES` alternates per session (high vs grave), the same hover gesture sounds different across visits.

**Implementation sketch:**
- New ambient drone (fundamental + perfect 5th, gain ~0.005, slow LFO pulsation 6–12s)
- `audio.setArchetypeFocus(i | null)` — smooth pitch glide over 1–2s
- Desktop: pillar mouseenter/mouseleave; Mobile: carousel `.archive-col--active` detection
- Effort: ~1.5–2h, low risk (additive to AudioEngine)

**Open design questions:**
- Drone timbre (sine / filtered saw / resonant noise)
- Volume floor (atmospheric vs noticeable)
- Pulsation pattern (synced vs pseudo-random)

---

## How to start a session

```
"Lee CLAUDE.md y HANDOVER.md y dime en qué estamos."
```

Paste this file fresh at the start of every new chat.

---

## What was completed — Session 6 (May 12, 2026)

### Audio redesign
- Removed audio toggle button entirely — auto-unmute on first user gesture
- **Chord**: CHAR_FREQUENCIES now randomly alternates per session between:
  - Set 2: Am/maj7 high `[220.00, 261.63, 329.63, 415.30]`
  - Set 4: Am/maj7 grave `[110.00, 130.815, 164.815, 207.65]`
- Chord test HTML built and shared with Javier + musician Diego (5 options, intro + awakening modes)
- `resume()` moved before `_buildGraph()` in AudioEngine.init() — iOS gesture window fix
- Silent looping `<audio>` element: holds AVAudioSession in Playback category → bypasses iOS mute switch
- `touchend` also calls `resume()` + iosUnlock.play() — long presses don't fire synthetic mousedown, so single unlock wasn't enough
- `playCharacterSignature()` moved to start of `forceIgnite()` (gesture handler context)
- Signature volumes raised 0.08 → 0.14 for audibility
- Skip button no longer bleeds intro audio into archive
- Archive ambient: droplets continue past scene 4, crackle every 3–7s via `startArchiveAmbient()`, faint wind at 0.008

### Mobile fixes
- `forceIgnite()`: 600ms smoothstep spotlight animation (was instant jump)
- `_silentFlame` flag: tap = spotlight+glow only, hold >300ms = fire appears
- Fire particles cleared 200ms after finger release (was instant, then was 0ms)
- `_endMobileHold()`: `state.isPressed = false` added alongside `isIgnited = false`
- `_doMobileTap()` and `_autoAdvanceNext()` now hide `instMobile` — instruction text was overlapping during auto-advance
- `handleUp()`: `setSilentFlame(true)` + 200ms timer to `clearFireParticles()` on release
- `initMobileScene2`: off-by-one bug fixed — `index: currentIndex - 1` → `index: currentIndex` (first whisper had no sound, each sound was one tap behind)
- Awakening circle: `visual.snapCenter()` called in `triggerAwakening()` — no more off-center expansion on mobile

### Visual / CSS
- Watermark: `bottom: 80px` → `bottom: max(16px, env(safe-area-inset-bottom, 16px))`
- `#read-title:focus { outline: none }` — blue rectangle on reading view heading
- `.obra-btn--buy`: `cursor: pointer !important; user-select: none` — text cursor on hover fixed
- Filamentos buyLabel: `'Edición física: Reclamar mi Ejemplar'` — consistent with Pulso 2-line format
- ArchiveDOM: all 3 CTA render paths split buyLabel on `: ` for edition label + CTA
- Mobile carousel: `.archive-col--active .pillar-content h4 { color: #e8c87a !important }` — amber on active column
- Sortílega desc: `<br>` after first sentence so "Lo que crees..." starts on line 2
- `#char-desc`: `min-height: 4em` for consistent 2-line height across all characters
- `_descEl.innerText` → `innerHTML` to support `<br>` tags
- `.archive-pillar::before` gradient: dark vignette behind pillar text — critical for Emperatriz whose video has warm amber tones exactly where text sits
- `text-wrap: balance` on `#char-title, #char-desc` — prevents orphaned words
- `text-wrap: pretty` extended to `.read-body p, .mobile-detail-lore p`
- Mobile `reading-obra-cover`: 80px (was 120px)
- Mobile `obra-btn`: `letter-spacing: 2px` to prevent button text overflow
- Mobile `#btn-volver`: safe-area top for deep links
- `transition: all` replaced with specific properties in archive.css + obras.css

### Content
- Filamentos: status `countdown` → `available`, buyUrl set to amazon.es/dp/8409861771, releaseDate removed
- Filamentos + Pulso buy buttons: correct Amazon URLs verified
- SEO: all 9 routes audited, descriptions updated, sitemap lastmod 2026-05-12
- Book JSON-LD schema added to Pulso + Filamentos OG pages

### Tizno panel
- Contact form removed → replaced with `mailto:editorial@soulware.live` "Envíanos un mensaje" button
- Coming-soon / locked CTAs now open Tizno panel (event delegation on grid + reading view)
- Coming-soon fallback label: `'Próximamente'` → `'Recibir señal'`
- El Pacto email form: input + button same height (`align-self: stretch !important`)
- El Pacto button: text → checkmark SVG icon (52px wide)
- Checkbox: `appearance: none`, dark #111 background, amber when checked
- Email address: brighter on hover

### Catalogue
- Countdown module preserved in ArchiveDOM.js for future launches (triggered by `status: 'countdown'` + `releaseDate`)

---

## Current architecture decisions — DO NOT REVERSE

| Decision | Reason |
|----------|--------|
| No React | Canvas 60fps needs clean main thread |
| Canvas `destination-out` for spotlight | CSS mask-image on video kills hardware acceleration (~1fps) |
| Smoke: `createRadialGradient` per frame | OffscreenCanvas sprite caused Z-axis zoom artefact |
| `display:none` (not `opacity:0`) on overlays | opacity:0 doesn't hide `position:fixed` children in Safari |
| Root-relative video paths `/name.mp4` | Bare paths break deep links |
| `touch-action: none` scoped to intro layers | Preserves scroll in archive |
| `.sr-only` for ghost DOM | `display:none` blocks Googlebot |
| `public/_redirects` with `/* /index.html 200` | SPA routing for /obras/* deep links |
| `#mobile-char-detail { display: none }` in global.css | Must be outside media query or bleeds onto desktop |
| `.mobile-panel { display: none }` in mobile.css | Without this, both Autor/Libros tabs show simultaneously |
| `resume()` before `_buildGraph()` in AudioEngine.init() | iOS gesture window expires before heavy buffer allocation |
| Silent looping `<audio>` element | Forces AVAudioSession Playback category → bypasses mute switch all iOS versions |
| `touchend` also calls `resume()` | Long presses don't fire synthetic mousedown — needs second gesture event |

---

## Key files

| File | Purpose |
|------|---------|
| `src/js/engine/AudioEngine.js` | Flame/smoke/dust/firefly + spotlight + scroll impulse |
| `src/js/engine/VisualEngine.js` | forceIgnite (600ms anim), silentFlame flag, spotlight, snapCenter |
| `src/js/main.js` | Scene transitions, audio first-interaction, skip, touchend audio unlock |
| `src/js/core/StateManager.js` | CHARACTERS[], CATALOGUE[], lore, vision, desc, CTAs |
| `src/js/core/Router.js` | Character + obra route metadata, History API |
| `src/js/ui/ArchiveDOM.js` | Archive grid, reading view, obra modal, Tizno wiring, CTA event delegation |
| `src/js/ui/TiznoTease.js` | Asymmetric blink, panel toggle |
| `src/js/mobile.js` | Scene 2 tap (whisper index fix), archive overlay |
| `src/css/archive.css` | Archive grid, reading view, pillar gradient, mobile responsive |
| `src/css/mobile.css` | Mobile overrides, active column amber, safe-area padding |
| `src/css/obras.css` | Obra cards, modal, badges, CTA buttons |
| `src/css/tizno.css` | Tizno peek, eyes, panel, El Pacto form, mailto button |
| `src/css/typography.css` | Reading view body text, social links |
| `public/_redirects` | SPA catch-all |
| `public/google8ac032f1f6add1da.html` | Search Console verification — KEEP FOREVER |

---

## Pending work

### Javier-gated
| Item | Notes |
|------|-------|
| **Goodreads** | Author page for WW. & Eidon |
| **Amazon** | Publisher name + author bio + soulware.live link |
| **Privacy policy** | Update `public/privacidad.html` with Core Soulware S.L., NIF B26896795, Valladolid |
| ~~Bunny.net CDN~~ | Deferred — videos are 980KB each after re-encode, Netlify edge serves them globally, free up to 100GB/mo. Revisit if traffic exceeds 80GB/mo or buffering reports come in. See "Decisions made (deferred work)" below. |
| ~~Google Search Console — resubmit sitemap~~ | Already done in Session 7. Now waiting on Google's crawl pace (re-check May 20). |

### Ruben-gated
| Item | Notes |
|------|-------|
| **Emperatriz obra title** | TBD — Alicia Sarel |
| **Totalis Libertas relatos** | Content for anthology relatos array |
| **Editorial directories** | editorialesindependientes.es, letrasdeencuentro.es, coolt.com |
| **@soulware.editorial branded social** | Pending |

### Code (next session)
| Item | Priority | Notes |
|------|----------|-------|
| **Anatomía del Vacío build-out** | P1 | Prologue + ep.1 content from Germán ready. See ANATOMIA.md |
| **Tizno full implementation** | P1 | System prompt + Claude API + Stripe. See TIZNO.md |
| **Shop v1** | P2 | Stripe Checkout + custom buy buttons. Blocking: Javier brainstorm on fulfillment + digital format. See Captured ideas. |
| **Archetype-keyed ambient drone** | P3 | Scene 4 columns tinting ambient to each character's `CHAR_FREQUENCIES` tone. ~2h. See Captured ideas. |
| **OffscreenCanvas worker** | P3 | TBT fix. Safari fallback needed |
| **Cinematic Amazon handoff** | P3 | Fade to black → "Abriendo pasaje seguro..." → redirect |

### Decisions made (deferred work)
- **Video CDN migration** — deferred. Reasoning: site is already on Netlify (a CDN), free tier covers ≥12k visits/mo, current videos are now 980KB each (down from 1.9MB). Cost difference at current scale: a few dollars per month at most. The migration is meaningful engineering work for no immediate benefit. Trigger to revisit: traffic exceeds 80GB/mo on Netlify, OR users report video stutter on mobile.
- **HEVC / WebM for videos** — rejected. HEVC has spotty browser support (Chrome on Linux/Windows). WebM VP9 would only save ~10–15% more at this point and requires `<source>` fallback markup. Current H.264 at 1 Mbps is the right call.

---

## Catalogue summary

| ID | Title | Archetype | Status | CTA |
|----|-------|-----------|--------|-----|
| `emperatriz-obra` | Título Sellado (placeholder) | emperatriz | coming-soon | Próximamente → opens Tizno |
| `la-corte` | Totalis Libertas | emperatriz | coming-soon | Próximamente → opens Tizno |
| `pulso` (with `editions[]`) | Pulso del Núcleo | caballero | available | Tapa Blanda: Reclamar mi Ejemplar (live, Amazon ES 8409810344) · Tapa Dura: combined "Próximamente" button |
| `filamentos` | Filamentos de Oscuridad | sortilega | **available** (shipped 2026-05-12, Amazon ES 8409861771) | Reclamar mi Ejemplar |
| `anatomia` | Anatomía del Vacío | arlequin | coming-soon | Próximamente → opens Tizno |

---

## Audio — chord sets
Randomly alternates per session:
- **Set 2 (Am/maj7 high):** `[220.00, 261.63, 329.63, 415.30]`
- **Set 4 (Am/maj7 grave):** `[110.00, 130.815, 164.815, 207.65]`

Chord test HTML file: shared with Javier + Diego. 5 options tested (Actual, Set1-4).

## Known iOS audio behavior
- Mute switch: `<audio>` looping + `navigator.audioSession.type = 'playback'` (iOS17+) bypass it
- Long press doesn't fire synthetic mousedown → `touchend` handler also calls `resume()`
- First tap may still require the `touchend` to fully commit audio session on some devices
- Status: functional for most cases. Not 100% on all iOS versions with mute on.

---

## Session history

| Session | Date | Focus |
|---------|------|-------|
| 1 | Apr 23 | Analytics, SEO, copy brief, flame/smoke fixes, mobile overhaul |
| 2 | Apr 23 | Autoplay rework, catalogue editions, SEO obra routes, email capture |
| 3 | Apr 24 | Archive grid, reading view, mobile polish, bug hunt |
| 4 | Apr 24 | Carousel, audio toggle, reading layout, mobile fixes, docs |
| 5 | Apr 27 | a11y inert modals, Javier copy (7/10), GA mess + revert |
| 6 | May 12 | Audio redesign, mobile polish, chord test, Tizno panel, CSS audit, CTA wiring |
| 7 | May 14 (afternoon) | SEO investigation, ghost URL cleanup, GSC validate fixes + request indexing, audit cleanup landed (#3) |
| 8 | May 14 (evening) | Long polish: Tizno 3-col redesign, fireflies behavior + perf, transition simplified to fades, audio muffle + hover chimes, Threads icon fixed, video re-encode (-49%). PRs #3 (polish) and #4 (lighter videos) merged. |
| 9 | May 14 (night) → May 15 | Mega perf/SEO/a11y/privacy overhaul. 17 PRs (#5–#21). GA4/GTM removed. WAVE 6→0 errors. LCP 3.6s→0.7s. TBT ~15s→~2s. 720p mobile video variants + `pickVideoSrc()` + skip-intro flag. Poster `.webp` t=0 frames. IntersectionObserver pillar preload fallback. Mobile cover variants + `srcset`. LCP poster hardcoded in HTML with `fetchpriority="high"`. Catalogue: "Título Sellado" placeholder, all coming-soon CTAs unified to "Próximamente", status pills hidden when redundant. |
| 10 | May 15 | Bilingual ES/EN public launch. 4 PRs (#27–#30). Two-language sitemap (20 URLs) with hreflang clusters. Pre-render translates body for /en/ routes (no FOUC). Visible footer language selector + `localStorage('sw_lang')` persistence + sync `<head>` redirect on next visit. EN legal pages (`*-en.html`). Skip-intro made resilient: tears down Cm7 chord, gallery video, scene overlays, pending timers. Footer redesign: smaller logo, replay+selector inline. Widow-line + button-centring + cover-aspect-ratio polish. |
