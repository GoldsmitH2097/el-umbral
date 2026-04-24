# HANDOVER.md — El Umbral / Soulware
*Last updated: April 24, 2026 — Session 4 (long polishing + docs session)*

---

## Site status

**Live:** https://soulware.live
**Repo:** github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/ruben/Developer/el-umbral`
**Last commit:** `58c53f4` — fix: remove desc from grid cards, fix broken format badges
**Build:** ✅ Clean (no warnings)
**Deploy:** ✅ Netlify auto-deploy from `main`
**GA4:** G-G3Y9ZSRZY9 (Soulware account, Javier added as Admin)

---

## How to start a session

```
"Lee CLAUDE.md y HANDOVER.md y dime en qué estamos."
```

Paste this file fresh at the start of every new chat.

---

## What was completed — Session 4 (April 24, 2026)

### Mobile carousel
- Reverted to 100vw full-width cards (removed 88vw peek + gradient wrapper)
- Scroll indicator dots: 4 animated dots above the grid
  - Active dot: amber pill (16×5px, glow pulse animation)
  - Inactive dots: phase-shifted breathing animation (4s offset between each)
  - Removed SVG goo filter (was eating low-alpha dots — feColorMatrix threshold bug)

### Text & copy
- Footer: "Soulware © MMXXVI." and "Nada es lo que parece." split to separate `<p>` tags
- Hero sub: `<br>` before "Bienvenido al Archivo de Soulware" (second line)
- `white-space: nowrap` on `.site-footer p` (desktop), reverts to normal on mobile
- Fixed broken `#editorial-watermark` CSS selector (missing `{` was floating properties)
- Archive grid cards: removed `<p class="obra-desc">` — description only visible in detail view
- Reading view obra cards: removed `seriesInfo` from format badge area — long strings like "Experiencia de relato inmersivo e interactivo" were wrapping and looking like broken buttons

### Audio toggle
- Inverted logic: **bright amber = muted** (prompts user to enable), **dim = sound on** (stays out of way)
- Starts in muted/bright state (`_audioMuted = true` on first show)
- SVG speaker icons replace "SND ON/OFF" text
  - Muted: crossed speaker (amber, prominent)
  - Unmuted: speaker + waves (dim, unobtrusive)
- Moved from top-left to bottom-left — mirrors "Romper el trance" at bottom-right

### Desktop reading view (full layout overhaul)
- `#read-title` now spans full width above both columns
- `.reading-content`: flex-direction: column
- `.reading-panels`: grid 1.1fr 1fr — **obras on left, author lore on right**
- Drop cap `::first-letter` removed — was confusing large "A" capital
- `.read-body`: 18px → 15px, line-height 2.2 → 1.95

### Mobile
- `initMobileArchive()` added to `skipIntroAndEnterArchive()` — was missing, caused returning mobile visitors to have non-functional character taps
- Book covers on mobile now open character detail overlay (same as tapping the pillar)
- Archive book cards: `align-items: flex-start; text-align: left` on mobile (row layout) — was incorrectly center-aligned
- `.obra-badges { justify-content: flex-start }` on mobile
- `.mobile-panel { display: none }` + `.mobile-panel--active { display: block }` — CSS was missing entirely; Libros tab now actually switches content
- `switchMobileTab()` scrolls `.mobile-detail-content` to top on tab switch
- Mobile whispers fade: `.mobile-found` now transitions color to transparent (0.5s) before `display:none` fires

### Tizno panel
- Removed horizontal drag handle bar (`::before` pseudo-element)
- Added `×` close button (top-right, `top: 16px; right: 20px`)
- Removed wrapper overflow that was clipping carousel

### Scroll particle inertia
- `VisualEngine.addScrollImpulse(dx, dy)` — nudges dust and firefly particles on scroll
- Vertical scroll → `#main-site` scroll listener → particles drift upward/downward
- Horizontal swipe → `#obras-section` scroll listener → particles drift sideways
- Exponential decay: 0.85/frame (~20 frame inertia tail)
- Z-depth weighted for dust particles (far particles drift more)

### Social links (reading view)
- `margin-top` reduced: 60px → 32px, `padding-top`: 40px → 24px
- `justify-content: flex-start` (was center)
- Threads SVG: restored to clean working path (replacement had typo)

### Buy buttons in reading view
- `.reading-obra-meta { justify-content: center }` — CTA buttons now centered under vision text

### Obra badges (desktop)
- `.obra-badges { justify-content: center }` globally — all badges centered
- Mobile override: `justify-content: flex-start` (row layout)

---

## Current architecture decisions — DO NOT REVERSE

| Decision | Reason |
|----------|--------|
| No React | Canvas 60fps needs clean main thread |
| Canvas `destination-out` for spotlight | CSS mask-image on video kills hardware acceleration (~1fps) |
| Smoke: `createRadialGradient` per frame | OffscreenCanvas sprite caused Z-axis zoom artefact |
| Flame: delta-time physics | Hard guard caused frame skips |
| `display:none` (not `opacity:0`) on overlays | opacity:0 doesn't hide `position:fixed` children in Safari |
| Root-relative video paths `/name.mp4` | Bare paths break deep links |
| `touch-action: none` scoped to intro layers | Preserves scroll in archive |
| `object-fit: cover` on mobile set in JS (both `_loadCharacterVideo` and `_swapToNextCharacter`) | CSS alone overridden by inline objectFit on swap |
| `.sr-only` for ghost DOM | `display:none` blocks Googlebot |
| `public/_redirects` with `/* /index.html 200` | SPA routing for /obras/* deep links |
| `#mobile-char-detail { display: none }` in global.css | Must be outside media query or bleeds onto desktop |
| `.mobile-panel { display: none }` in mobile.css | Without this, both Autor/Libros tabs show simultaneously |

---

## Key files

| File | Purpose |
|------|---------|
| `src/js/engine/VisualEngine.js` | Flame/smoke/dust/firefly + spotlight + scroll impulse |
| `src/js/main.js` | Scene transitions, audio toggle, skip, scroll impulse wiring |
| `src/js/mobile.js` | Scene 1 tap, Scene 2 typewriter, archive overlay (openDetail/switchTab) |
| `src/js/core/StateManager.js` | CHARACTERS[], CATALOGUE[], lore, vision, desc, CTAs |
| `src/js/core/Router.js` | Character + obra route metadata, History API |
| `src/js/ui/ArchiveDOM.js` | Archive grid, reading view, obra modal, Tizno wiring |
| `src/js/ui/TiznoTease.js` | Asymmetric blink, panel toggle |
| `src/css/archive.css` | Archive grid layout, reading view, dots, footer, hero |
| `src/css/mobile.css` | Mobile overrides, typewriter whispers, detail overlay, panel show/hide |
| `src/css/obras.css` | Audio toggle, skip btn, obra cards, modal, badges |
| `src/css/tizno.css` | Tizno peek, eyes, panel, close button |
| `src/css/typography.css` | Reading view body text, social links |
| `public/_redirects` | SPA catch-all |
| `public/google8ac032f1f6add1da.html` | Search Console verification — KEEP FOREVER |

---

## Pending work

### Javier-gated
| Item | Notes |
|------|-------|
| **Bunny.net CDN** | 4 × MP4 videos off Netlify. Upload → send URLs → 10 min code change |
| **Goodreads** | Author page for WW. & Eidon |
| **Amazon** | Publisher name + author bio + soulware.live link |

### Ruben-gated
| Item | Notes |
|------|-------|
| **Search Console** | Submit new /obras/* sitemap URLs |
| **Editorial directories** | editorialesindependientes.es, letrasdeencuentro.es, coolt.com |
| **Emperatriz obra title** | TBD — Alicia Sarel |
| **Totalis Libertas relatos** | Content for anthology relatos list |

### Code (next session)
| Item | Priority | Notes |
|------|----------|-------|
| **Reading view refinement** | P1 | Desktop layout was overhauled. May need further polish after seeing it in context |
| **Anatomía del Vacío build-out** | P2 | Prologue + ep.1 content from Germán exists. See ANATOMIA.md |
| **Tizno full implementation** | P2 | System prompt + Claude API + Stripe. See TIZNO.md |
| **OffscreenCanvas worker** | P3 | TBT 18K→~0ms. 2-3h. Safari fallback needed |
| **Cinematic Amazon handoff** | P3 | Fade to black → "Abriendo pasaje seguro..." → redirect |
| **Whispers as real book quotes** | P4 | 4 lines from catalogue books |

---

## Catalogue summary

| ID | Archetype | Status | CTA |
|----|-----------|--------|-----|
| `emperatriz-obra` | emperatriz | coming-soon | Entrar en la Corte |
| `la-corte` | emperatriz | coming-soon | Cruza el Umbral |
| `pulso` | caballero | available (editions) | Tapa Blanda: Reclamar mi Ejemplar |
| `filamentos` | sortilega | countdown (2026-05-12) | Entrar en la Sombra |
| `anatomia` | arlequin | coming-soon | Iniciar mi Disección |

---

## Session history

| Session | Date | Focus |
|---------|------|-------|
| 1 | Apr 23 | Analytics, SEO, copy brief, flame/smoke fixes, mobile overhaul |
| 2 | Apr 23 | Autoplay rework, catalogue editions, SEO obra routes, email capture |
| 3 | Apr 24 | Archive grid, reading view, mobile polish, bug hunt |
| 4 | Apr 24 | Carousel, audio toggle, reading layout, mobile fixes, docs |
