# HANDOVER.md — El Umbral / Soulware
*Last updated: April 23, 2026*

---

## Site status

**Live:** https://soulware.live
**Repo:** github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/ruben/Developer/el-umbral`
**Last commit:** `a6ffcdd` — fix(mobile): last whisper delay, pacto outline, video cover on swap
**Build:** ✅ Clean
**Deploy:** ✅ Netlify auto-deploy from `main`

---

## How to start a session

```
"Read CLAUDE.md and HANDOVER.md and tell me where we are."
```

Paste this file fresh at the start of every new chat.

---

## What was completed in this session (April 23, 2026)

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
- **Smoke glitch fixed** — reverted to `createRadialGradient` per frame (Vela7.html approach). OffscreenCanvas sprite caused a Z-axis zoom artefact as drawImage scaled a fixed 80px image. Gradient per-frame draws at exact size each frame — no artefact. Restored Vela7 params: decay 0.0015-0.003, curl radius 0.5-2.0.
- **Flame flicker fixed** — replaced hard 14ms frame guard with delta-time physics. Guard was causing irregular timing (skipped frame at 13.8ms → next at 30ms = visible stutter). Now: 8ms minimum guard, `dt = clamp(rawDelta, 8, 32) / 16.67`. ignitionProgress and cursor lerp scale with dt. Smooth at any refresh rate.
- **`forceIgnite()`** added to VisualEngine — instant ignite without progressive buildup. Used by mobile tap mechanic.

### Mobile overhaul
- **Scene 1 — tap-to-reveal** replaces broken press-and-hold. `_doMobileTap()` calls `forceIgnite()`, holds character for 3s, then swaps. Auto-advance resumes 4s after tap.
- **Instrucción hidden on mobile** — "MANTÉN PULSADO" doesn't apply on mobile.
- **Videos edge-to-edge** — `object-fit: cover` on mobile. Applied in `_loadCharacterVideo()` AND `_swapToNextCharacter()` — both needed or subsequent characters revert to `contain` (inline style beats CSS).
- **Arlequín iOS fix** — added `touchend` directly on `#umbral-btn`. Prevents last character getting stuck when document touchend races the button.
- **Scene 3 "EL UMBRAL"** — reduced `font-size: 20px` and `letter-spacing: 12px` on mobile (was 36px/30px, cut off left side of viewport). Auto-advance 7s → 12s.
- **Scene 2 Voces del Umbral** — typewriter mode: one whisper at a time, fixed center (`50vh`). "VOCES DEL UMBRAL" title moved to `top: 18vh fixed` so it doesn't overlap whispers.
- **Whispers JS** — replaced MutationObserver (fired after attribute already changed) with `setTimeout(1200)`. Found whisper hides before next appears (600ms). Last whisper delay 800ms → 3000ms (time to read).
- **Skip button** — moved to `top: 20px` on mobile (was `bottom: 30px`, overlapped footer/watermark).
- **Scroll overflow** — `#main-site { overflow-x: hidden }` + `archive-grid max-width: 100vw`. Fixed double horizontal scroll.
- **Hero text** — removed `white-space: nowrap` from `.site-hero-sub`. Text now wraps on mobile.
- **Tizno hidden on mobile** — no hover mechanic, was covering footer. `display: none !important` on mobile.
- **Footer** — `word-break: break-word` prevents text overflow.
- **Empty space under Arlequín** — `.archive-books { flex: none }` on mobile.
- **CTAs** — 3 hardcoded "Próximamente" in ArchiveDOM.js now use `item.buyLabel`.
- **Pacto button** — `outline: none` + `focus-visible` amber on `#btn-cerrar-pacto`. Removes blue browser focus ring.

### Tizno
- **Asymmetric blink** — each eye has completely independent schedule. Left: 1.2-4.5s, 20% double-blink. Right: 0.9-3.8s, 15% double-blink. Different initial delays so they never sync on load.

---

## Architecture — DO NOT REVERSE without reason

| Decision | Reason |
|----------|--------|
| No React | Canvas 60fps needs clean main thread |
| Canvas `destination-out` for spotlight | Not CSS mask-image on video (kills hardware acceleration → ~1fps) |
| **Smoke: `createRadialGradient` per frame** | OffscreenCanvas sprite caused Z-axis zoom artefact. Gradient draws at exact size each frame. |
| Flame: delta-time physics (no hard guard) | Hard 14ms guard caused frame skips and flicker |
| `position:fixed` on firefly container | Not absolute inside scrolling parent |
| `display:none` (not `opacity:0`) on overlays | opacity:0 doesn't hide `position:fixed` children in Safari |
| Root-relative video paths `/name.mp4` | Bare paths break deep links |
| `touch-action: none` scoped to intro layers only | Preserves scroll in archive |
| `object-fit: cover` on mobile — set via JS in both `_loadCharacterVideo()` AND `_swapToNextCharacter()` | CSS alone isn't enough: swap sets inline `objectFit = 'contain'` which overrides CSS |
| `.sr-only` for ghost DOM | Not `display:none` (Googlebot won't read hidden elements) |

---

## Known pending bugs / items for next session

### Mobile bugs still open
| Bug | Notes |
|-----|-------|
| **Tizno not visible on mobile** | Hidden intentionally (no hover, was covering footer), but Ruben wants it shown. Needs a mobile-appropriate trigger and position. |
| **Character video sizes may still vary** | Cover applied in loadCharacterVideo + swapToNextCharacter. Verify on device. |

### Features / roadmap
| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| **Bunny.net CDN** — 4 MP4s off Netlify | P1 | Javier | Upload videos, send URLs → I update 4 paths in 10 min |
| **Email capture in Tizno** | P1 | Claude | "Firma el pacto" — Netlify Forms, in drawer |
| **Tizno on mobile** | P1 | Claude | Needs design decision: trigger, position, UX |
| **Anatomía del Vacío** build-out | P2 | Claude + Germán | Content exists (prologue + ep.1). See ANATOMIA.md |
| **Stateful intro bypass** | P2 | Claude | localStorage `hasCrossed` → skip link on repeat visits |
| **Native Web Share API** | P3 | Claude | `navigator.share()` in reading view, deep link + character quote |
| **Cinematic Amazon handoff** | P3 | Claude | Fade to black → "Abriendo pasaje seguro..." → redirect |
| **OffscreenCanvas worker** | P3 | Claude | TBT → ~0ms. Complex (2-3h). Safari fallback needed. |
| **Awwwards / FWA submission** | P4 | Ruben | After performance pass |
| **Whispers as real book quotes** | P4 | Ruben | Choose one line per book |
| **Anatomía glitch teaser** | P4 | Claude | VHS glitch + dissonant chord on hover/tap |
| **Emperatriz obra title** | — | Alicia Sarel | TBD |
| **Totalis Libertas relatos** | — | Ruben/Javier | Content needed |
| **Goodreads author page** | — | Javier | WW. & Eidon |
| **Amazon author page** | — | Javier | Publisher name + bio + link |
| **Google Analytics access for Javier** | — | Ruben | GA Admin → Property access management → Add users |
| **Submit sitemap in Search Console** | ✅ DONE | — | 8 URLs, Status: Success |

---

## Key files

| File | Purpose |
|------|---------|
| `src/js/engine/VisualEngine.js` | Flame/smoke/dust/firefly + delta-time tick + forceIgnite() |
| `src/js/main.js` | Scene transitions, _doMobileTap(), umbral-btn listeners |
| `src/js/mobile.js` | Scene 1 tap, Scene 2 typewriter whispers, archive overlay |
| `src/js/core/StateManager.js` | CHARACTERS[], CATALOGUE[], CTAs, lore, vision, desc |
| `src/js/core/Router.js` | Route metadata per character slug |
| `src/js/ui/ArchiveDOM.js` | Archive grid, obras, contact, reading view, modals |
| `src/js/ui/TiznoTease.js` | Asymmetric blink, panel open/close, echo laugh |
| `src/css/global.css` | Reset, .sr-only, scene 3 mobile overrides, instruccion hidden |
| `src/css/canvas.css` | Scene 1 layer architecture |
| `src/css/archive.css` | Archive grid, reading view, footer, hero text |
| `src/css/mobile.css` | All mobile overrides, typewriter whispers, archive overlay |
| `src/css/tizno.css` | Tizno peek, eyes, panel |
| `public/google8ac032f1f6add1da.html` | Search Console verification — KEEP FOREVER |
