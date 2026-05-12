# HANDOVER.md — El Umbral / Soulware
*Last updated: May 12, 2026 — Session 6 (long polishing + audio + mobile + Tizno)*

---

## Site status

**Live:** https://soulware.live
**Repo:** github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/Ruben/Developer/el-umbral`
**Last commit:** `fabbb44` — fix(tizno): button full height + checkmark icon
**Build:** ✅ Clean (no warnings)
**Deploy:** ✅ Netlify auto-deploy from `main`
**GA4:** G-VC5QW7C1CQ (Ruben Websites account, Javier admin)

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
| **Bunny.net CDN** | 4 × MP4 videos off Netlify. Upload → send URLs → 10 min code change |
| **Goodreads** | Author page for WW. & Eidon |
| **Amazon** | Publisher name + author bio + soulware.live link |
| **Privacy policy** | Update `public/privacidad.html` with Core Soulware S.L., NIF B26896795, Valladolid |
| **Google Search Console** | Resubmit sitemap (SEO changes from this session) |

### Ruben-gated
| Item | Notes |
|------|-------|
| **Emperatriz obra title** | TBD — Alicia Sarel |
| **Totalis Libertas relatos** | Content for anthology relatos array |
| **Editorial directories** | editorialesindependientes.es, letrasdeencuentro.es, coolt.com |

### Code (next session)
| Item | Priority | Notes |
|------|----------|-------|
| **Anatomía del Vacío build-out** | P1 | Prologue + ep.1 content from Germán ready. See ANATOMIA.md |
| **Tizno full implementation** | P1 | System prompt + Claude API + Stripe. See TIZNO.md |
| **OffscreenCanvas worker** | P3 | TBT fix. Safari fallback needed |
| **Cinematic Amazon handoff** | P3 | Fade to black → "Abriendo pasaje seguro..." → redirect |

---

## Catalogue summary

| ID | Archetype | Status | CTA |
|----|-----------|--------|-----|
| `emperatriz-obra` | emperatriz | coming-soon | Entrar en la Corte → opens Tizno |
| `la-corte` | emperatriz | coming-soon | Cruza el Umbral → opens Tizno |
| `pulso-blanda` | caballero | available | Tapa Blanda: Reclamar mi Ejemplar |
| `pulso-dura` | caballero | coming-soon | Próximamente → opens Tizno |
| `filamentos` | sortilega | available | Edición física: Reclamar mi Ejemplar |
| `anatomia` | arlequin | coming-soon | Iniciar mi Disección → opens Tizno |

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
