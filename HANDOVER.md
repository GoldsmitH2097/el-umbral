# HANDOVER.md — El Umbral / Soulware
*Last updated: April 23, 2026 — Session 2*

---

## Site status

**Live:** https://soulware.live
**Repo:** github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/ruben/Developer/el-umbral`
**Last commit:** `70e7974` — fix(ux): autoplay rework — Scene 2 mobile bug, idle-based advance, instruction timing
**Build:** ✅ Clean (no warnings)
**Deploy:** ✅ Netlify auto-deploy from `main`

---

## How to start a session

```
"Read CLAUDE.md and HANDOVER.md and tell me where we are."
```

Paste this file fresh at the start of every new chat.

---

## What was completed — Session 1 (April 23, 2026)

### Analytics & SEO
- **Google Analytics 4** — Property "Soulware" created: `G-VC5QW7C1CQ`, Spain timezone, Euro, Books & Literature. Tag live in `index.html`.
- **Google Search Console** — property `https://soulware.live/` verified via HTML file. Sitemap submitted, 8 URLs indexed. Keep `public/google8ac032f1f6add1da.html` forever.
- **Route metadata** — Router.js updates title/og:title/og:description/og:url/canonical per character slug. Sharing `/emperatriz` on WhatsApp shows character-specific data.

### Copy (Susana Azcona brief)
- All 4 archetype lore texts updated
- Anatomía del Vacío: "No entras a leer un relato. Entras para ser diseccionado por él."
- La Corte / Totalis Libertas: full vision + desc from brief
- All CTAs updated: "Reclamar mi Ejemplar", "Reclamar la Edición", "Entrar en la Corte", "Cruza el Umbral", "Entrar en la Sombra", "Iniciar mi Disección"
- ISBN 978-8409810345 added to Pulso JSON-LD

### Flame & smoke engine (critical fixes)
- **Smoke glitch fixed** — reverted to `createRadialGradient` per frame (Vela7.html approach). OffscreenCanvas sprite caused a Z-axis zoom artefact.
- **Flame flicker fixed** — delta-time physics. 8ms minimum guard, `dt = clamp(rawDelta, 8, 32) / 16.67`.
- **`forceIgnite()`** added to VisualEngine — instant ignite without buildup. Used by mobile tap.

### Mobile overhaul
- Scene 1 tap-to-reveal, instrucción hidden, videos edge-to-edge (cover in both load + swap)
- Arlequín iOS touchend fix, Scene 3 font-size reduced, Scene 2 typewriter whispers
- Skip button repositioned, overflow fixed, hero text wraps, Tizno hidden (temporary)
- CTAs use item.buyLabel, Pacto button focus ring fixed

### Tizno
- Asymmetric blink — each eye independent schedule. Left: 1.2-4.5s, 20% double. Right: 0.9-3.8s, 15% double.

---

## What was completed — Session 3 (April 24, 2026)

### Autoplay / UX timing overhaul
- **Scene 2 mobile bug fixed** — VisualEngine's proximity detection was running alongside mobile.js tap detection. Firefly wandering near whispers was triggering `dataset.found` independently of taps → caused early Scene 3 transition. Now mobile detection is disabled in `_updateScene2` (guard: `window.innerWidth >= 768`).
- **Scene 2 idle autoplay — desktop** — `_startScene2IdleWatch()` in main.js: polls every 500ms; after 4s of no mousemove, aims hint light at first unfound whisper for 2.5s. Natural proximity detection handles reveal. `mousemove` resets timer.
- **Scene 2 idle autoplay — mobile** — `initMobileScene2` now has a 4s idle timer. Auto-advances one whisper if no tap. Resets on every tap.
- **Scene 2 → Scene 3 pause** — `setTimeout 2500ms` (was 1000ms) after last whisper found. User reads last phrase before awakening.
- **Scene 3 auto-advance** — removed unconditional 12s. Replaced with `_startScene3IdleWatch()`: fires `enterMainSite()` after 5s of no mouse/touch. Resets on `mousemove`, `touchstart`, `touchmove`.
- **Instruction hint** — appears at 0.5s (was 2.5s).
- **Scene 1 resume** — auto-advance resumes 5s after user stops (was 3s).

### Catalogue
- **Pulso del Núcleo editions merged** — `pulso-blanda` + `pulso-dura` → single catalogue entry with `editions[]` array. One cover, two stacked CTAs: "Tapa Blanda — Comprar" (amber) + "Tapa Dura — Próximamente" (grey). Adding the hardcover later = just add `buyUrl` to editions[1] in StateManager.js.

### Other fixes
- **Desktop instruction** — "Haz clic y mantén pulsado" (was "Toca y mantén pulsado" — wrong on desktop)
- **iOS audio mute switch** — silent `<audio>` element with WAV data URI forces Safari to treat session as media playback → bypasses hardware ringer switch. Works iOS 15+.
- **Tizno safe-area** — `bottom: calc(64px + env(safe-area-inset-bottom))` on mobile
- **GDPR on Firma el Pacto** — required checkbox with link to privacy policy
- **localStorage `sw_crossed`** — returning visitors skip intro entirely
- **"Bienvenido al Archivo de Soulware"** — `white-space: nowrap` on `.site-hero-sub` (one line on desktop, wraps normally on mobile)
- **SEO: individual obra routes** — `/obras/pulso-del-nucleo` etc. with per-book meta
- **Sitemap** — 4 new obra URLs (12 total)
- **Ghost DOM** — 4 book articles for Googlebot
- **`_redirects`** — SPA catch-all for `/obras/*`
- **CLAUDE.md** — sitemap status updated

### SEO — Individual obra routes
- **Router.js** — `/obras/:slug` deep links with per-book meta (title, desc, canonical, OG)
  - `/obras/pulso-del-nucleo`, `/obras/filamentos-de-oscuridad`, `/obras/anatomia-del-vacio`, `/obras/totalis-libertas`
  - `_applyMeta()` helper extracted from `_updateMeta()` — shared by character + obra routes
- **sitemap.xml** — 4 new obra URLs added (priority 0.7, monthly)
- **index.html ghost DOM** — 4 new `<article>` elements for books (Googlebot crawl)
- **public/_redirects** — `/* /index.html 200` (SPA routing so /obras/* doesn't 404)

### Email capture
- **"Firma el Pacto"** — email-only Netlify Form (`name="el-pacto"`) in Tizno panel left col
- Copy: *"Recibe los ecos antes de que se extingan."* + button "Firmar el Pacto"
- Submissions appear in Netlify dashboard → Forms → el-pacto

### Tizno on mobile
- **Visible on mobile** — `bottom: 64px` (clears footer). Was `display: none !important`.
- Panel already collapses to 1-column on mobile (existing media query).

### CSS bugfix
- **mobile.css stray `}`** — extra closing brace after first `@media` block removed. CSS warning in Vite build eliminated.

### CLAUDE.md
- Sitemap status updated to ✅ Done

---

## Architecture — DO NOT REVERSE without reason

| Decision | Reason |
|----------|--------|
| No React | Canvas 60fps needs clean main thread |
| Canvas `destination-out` for spotlight | Not CSS mask-image on video (kills hardware acceleration → ~1fps) |
| **Smoke: `createRadialGradient` per frame** | OffscreenCanvas sprite caused Z-axis zoom artefact. |
| Flame: delta-time physics (no hard guard) | Hard 14ms guard caused frame skips and flicker |
| `position:fixed` on firefly container | Not absolute inside scrolling parent |
| `display:none` (not `opacity:0`) on overlays | opacity:0 doesn't hide `position:fixed` children in Safari |
| Root-relative video paths `/name.mp4` | Bare paths break deep links |
| `touch-action: none` scoped to intro layers only | Preserves scroll in archive |
| `object-fit: cover` on mobile — set via JS in both `_loadCharacterVideo()` AND `_swapToNextCharacter()` | CSS alone isn't enough: swap sets inline `objectFit = 'contain'` which overrides CSS |
| `.sr-only` for ghost DOM | Not `display:none` (Googlebot won't read hidden elements) |
| `public/_redirects` with `/* /index.html 200` | SPA routing for /obras/* deep links |

---

## Known pending / roadmap

### Bugs
| Bug | Notes |
|-----|-------|
| **Character video sizes on mobile** | Fix is in code. Verify on physical device. |

### Features / roadmap
| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| **Bunny.net CDN** — 4 MP4s off Netlify | P1 | Javier | Upload videos, send URLs → update 4 paths in 10 min |
| **Submit new obra URLs in Search Console** | P1 | Ruben | Go to Sitemaps → resubmit or wait for auto-crawl |
| **Anatomía del Vacío** build-out | P2 | Claude + Germán | Content exists (prologue + ep.1). See ANATOMIA.md |
| **Stateful intro bypass** | P2 | Claude | localStorage `hasCrossed` → skip link on repeat visits |
| **OffscreenCanvas worker** | P3 | Claude | TBT 18K→~0ms. Complex (2-3h). Safari fallback needed. |
| **Native Web Share API** | P3 | Claude | `navigator.share()` in reading view |
| **Cinematic Amazon handoff** | P3 | Claude | Fade to black → "Abriendo pasaje seguro..." → redirect |
| **Awwwards / FWA submission** | P4 | Ruben | After TBT performance pass |
| **Whispers as real book quotes** | P4 | Ruben | Choose one line per book |
| **Anatomía glitch teaser** | P4 | Claude | VHS glitch + dissonant chord on hover/tap |
| **Emperatriz obra title** | — | Alicia Sarel | TBD |
| **Totalis Libertas relatos** | — | Ruben/Javier | Content needed |
| **Goodreads author page** | — | Javier | WW. & Eidon |
| **Amazon author page** | — | Javier | Publisher name + bio + link |
| **Google Analytics access for Javier** | — | Ruben | GA Admin → Property access management → Add users |

---

## Key files

| File | Purpose |
|------|---------|
| `src/js/engine/VisualEngine.js` | Flame/smoke/dust/firefly + delta-time tick + forceIgnite() |
| `src/js/main.js` | Scene transitions, _doMobileTap(), umbral-btn listeners |
| `src/js/mobile.js` | Scene 1 tap, Scene 2 typewriter whispers, archive overlay |
| `src/js/core/StateManager.js` | CHARACTERS[], CATALOGUE[], CTAs, lore, vision, desc |
| `src/js/core/Router.js` | Character + obra route metadata, History API deep links |
| `src/js/ui/ArchiveDOM.js` | Archive grid, obras, contact, reading view, modals |
| `src/js/ui/TiznoTease.js` | Asymmetric blink, panel open/close, echo laugh |
| `src/css/global.css` | Reset, .sr-only, scene 3 mobile overrides, instruccion hidden |
| `src/css/canvas.css` | Scene 1 layer architecture |
| `src/css/archive.css` | Archive grid, reading view, footer, hero text |
| `src/css/mobile.css` | All mobile overrides, typewriter whispers, archive overlay |
| `src/css/tizno.css` | Tizno peek, eyes, panel, email capture (.tizno-pacto) |
| `public/_redirects` | SPA catch-all: `/* /index.html 200` |
| `public/google8ac032f1f6add1da.html` | Search Console verification — KEEP FOREVER |
