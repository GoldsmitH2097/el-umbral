# HANDOVER.md — El Umbral / Soulware
*Last updated: April 27, 2026 — Session 5 (a11y + Javier copy + GA mess + audio still broken)*

---

## Site status

**Live:** https://soulware.live
**Repo:** github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/ruben/Developer/el-umbral`
**Last commit:** `758010e` — chore(analytics): revert GA4 tag to G-VC5QW7C1CQ
**Build:** ✅ Clean (no warnings)
**Deploy:** ✅ Netlify auto-deploy from `main`
**GA4:** `G-VC5QW7C1CQ` (Soulware property in **Ruben Websites** account, restored from trash; Javier shared as Admin). The earlier `G-G3Y9ZSRZY9` (separate SoulWare account) was retired — see Session 5 notes.

---

## How to start a session

```
"Lee CLAUDE.md y HANDOVER.md y dime en qué estamos."
```

Paste this file fresh at the start of every new chat.

---

## What was completed — Session 5 (April 27, 2026)

### Accessibility hardening (commit `94fc790`)
- 6 modal dialogs are now `inert` + `aria-hidden="true"` by default and toggled on open/close: `#obra-modal`, `#pacto-modal`, `#legal-modal`, `#tizno-panel`, `#reading-view`, `#mobile-char-detail`.
- Fixes empty headings (`#obra-modal-title`, `#read-title`, `#mobile-detail-title`) leaking to screen readers when modals were closed.
- Fixes tab labels (Autor/Libros, La Visión/La Ficha) being exposed outside of dialog context.
- `#pacto-modal` gained the missing `role="dialog"` + `aria-modal="true"` + `aria-labelledby="pacto-modal-title"`.
- `#ambient-light` and `#scene-2-light` marked `aria-hidden="true"` (decorative layers).
- Symmetric open/close: `openPacto` now resets `style.display = ''` so a second open works after a prior close.

### Javier copy decisions — partial application (commit `d3dd6b0`)
Applied items **2, 4, 5, 6, 7, 8, 9** from the copy decisions PDF Javier returned:
- **#2** Book modal tab labels: `El Manuscrito` → `La Ficha`
- **#4** Arlequín: `La disrupción pura` → `La grieta que aprende a reír`
- **#5** Whispers fourth line: `Ya cruzaste la línea` → `La sombra ya sabe tu nombre`
- **#6** Pulso atmospheric line in Caballero ghost DOM: added *"Veinte años después de la Catástrofe, los artefactos vuelven a llamar a quienes nunca debieron tocarlos. Y cuando el Núcleo despierta, ningún reino permanece inocente."*
- **#7** Removed redundant `CRUZAR` span from `#umbral-btn`; kept `ADENTRARSE` as the single passage verb.
- **#8** Totalis Libertas: prepended `Ficción histórica oscura.` genre tag.
- **#9** Pulso teaser: `un destino que no pide permiso` → `un poder antiguo que no concede victoria: exige precio`.

**NOT applied yet (Session 6):**
- **#1** Editorial tagline + "Ver libros" shortcut button on Scene 1 — Javier picked B (Medium). Watermark text is updated; the second skip button (`#skip-to-books-btn`) is not yet in the DOM, no CSS, no JS handler.
- **#3** Pacto scope (B): keep at threshold only, remove from conversion contexts. No code action yet — needs audit of Pacto references near forms / Tizno.
- **#10** Notify CTAs ("Recibir la señal") for all coming-soon obras — full feature, not started. See pending Code list below.

### Intro + audio fixes (commits `91b2cae`, `68ba5eb`)
- `localStorage.sw_crossed` skip-on-revisit logic removed. Intro now runs every visit; returning users use `Romper el trance` to skip. Comment in `main.js:280` makes this explicit.
- Audio toggle event handler hardened: `stopPropagation` on click + idempotent `_showAudioToggle` so repeat ignitions don't re-show the toggle and re-mute.
- **STILL BROKEN per Rubén** — see Outstanding bugs below. The toggle UI flips correctly (icon swap from amber-X to dim-waves) but no actual sound plays on desktop, and mobile remains silent. Needs investigation Session 6.

### Google Analytics — long story, short finale (commit `758010e`)
**TL;DR: site is back on `G-VC5QW7C1CQ`, Javier added as Admin, working again.**

Full sequence of events:
1. Original tag `G-VC5QW7C1CQ` was in *Ruben Websites* GA account from day one.
2. On Apr 24 commit `3ea7dc0` swapped the site to `G-G3Y9ZSRZY9` in a fresh dedicated *SoulWare* account, intending a clean separation from Rubén's personal portfolio.
3. The fresh property's Google Tag at the account level remained pinned to `G-VC5QW7C1CQ` (an alias setup), so GA's "Install instructions" panel kept showing the OLD ID even though the stream's Measurement ID was `G-G3Y9ZSRZY9`. Mismatch → GA's tag detector said "tag not detected" → "Data collection isn't active" warning → no data ever landed.
4. Decision: revert. Restored the original `G-VC5QW7C1CQ` property from trash, trashed the SoulWare-account property, shared the restored one with Javier as Admin, reverted the site code to use `G-VC5QW7C1CQ`.
5. Site verified live with `G-VC5QW7C1CQ` after deploy.

**Lesson learned, do not repeat:** when "swapping GA accounts", don't change the Measurement ID in code — just add/remove destinations on the existing Google Tag. Changing the ID requires that the new ID actually be a Measurement ID OR a configured Google Tag alias on the receiving property; otherwise the tag tester rejects it. We learned this the hard way.

### GA cleanup status
- Old SoulWare-account property (`G-G3Y9ZSRZY9`, ID `534455162`) — moved to trash this session.
- Original Ruben Websites property (`G-VC5QW7C1CQ`, ID `534064149`) — restored.
- Javier (`franjacasanova@gmail.com`) — added as Admin to the restored property.

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

### Audio toggle (Session 4 baseline — see Session 5 for status)
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

## Outstanding bugs (priority for Session 6)

| Bug | Severity | Notes |
|---|---|---|
| **Audio toggle plays no sound** | 🔥 P0 | Toggle UI flips correctly. `audio.audioCtx.resume()` and `_restartNoiseSources()` are called on click but no audible output, both desktop + mobile. Investigate: is `audioCtx.state` actually `running` after resume? Are the noise BufferSourceNodes alive after restart? Console-log inside `_restartNoiseSources` to verify. |

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
| All 6 modal dialogs default to `inert aria-hidden="true"` in HTML | Without this, empty headings + tab labels leak to screen readers when modals are closed |
| Site uses GA Measurement ID `G-VC5QW7C1CQ` (not the stream-level alias) | The Google Tag at the account level expects `G-VC5QW7C1CQ`. Changing the site to a stream-level Measurement ID breaks GA's tag detector and stops data collection. Lesson from Session 5. |

---

## Key files

| File | Purpose |
|------|---------|
| `src/js/engine/VisualEngine.js` | Flame/smoke/dust/firefly + spotlight + scroll impulse |
| `src/js/engine/AudioEngine.js` | Web Audio: Cm7 leitmotif, cave ambience, iOS unlock, fire/wind gains |
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
| `scripts/generate-og-pages.js` | Postbuild: writes per-route HTML with custom title/desc/canonical/OG |
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

### Code (Session 6)
| Item | Priority | Notes |
|------|----------|-------|
| **Audio toggle silent** | 🔥 P0 | See Outstanding bugs above |
| **Item #1 — Editorial tagline + "Ver libros" button** | P1 | Watermark text done. Need: `#skip-to-books-btn` element next to `#skip-btn`, CSS to mirror skip-btn position (bottom-left vs bottom-right), JS handler that calls `skipIntroAndEnterArchive()` then scrolls to `#obras-section`. |
| **Item #3 — Pacto copy scoping** | P2 | Audit Pacto references; remove "no devoluciones / no garantías" voice from anywhere near newsletter, Tizno, contact, purchase flows. Keep at threshold modal only. |
| **Item #10 — "Recibir la señal" notify CTAs** | P2 | Full feature: new Netlify form `recibir-senal` with hidden `source` field per book; modify `openObraModal` so coming-soon/countdown statuses render an inline email form; per-book support lines (Pulso tapa dura, Filamentos, Anatomía, Totalis, Emperatriz obra); shared confirmation message. CSS for inline form. |
| **Privacy policy update** | P1 | Javier-approved replacement text for `public/privacidad.html` is in chat thread (Core Soulware S.L., NIF B26896795, Valladolid address, Netlify Forms reference, 72h/30d retention promises). Just needs HTML drop-in. |
| **Reading view refinement** | P3 | Desktop layout was overhauled in Session 4. May still need polish. |
| **Anatomía del Vacío build-out** | P3 | Prologue + ep.1 content from Germán exists. See ANATOMIA.md |
| **Tizno full implementation** | P3 | System prompt + Claude API + Stripe. See TIZNO.md |
| **OffscreenCanvas worker** | P4 | TBT 18K→~0ms. 2-3h. Safari fallback needed |
| **Cinematic Amazon handoff** | P4 | Fade to black → "Abriendo pasaje seguro..." → redirect |
| **Whispers as real book quotes** | P4 | 4 lines from catalogue books — supersedes the Session 5 placeholder |

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
| 5 | Apr 27 | a11y inert modals, Javier copy decisions (7 of 10 applied), GA mess + revert, audio toggle still broken |
