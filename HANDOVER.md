# HANDOVER.md — El Umbral / Soulware
*Last updated: May 14, 2026 — Session 8 (long polish + perf + video re-encode)*

---

## Site status

**Live:** https://soulware.live
**Repo:** github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/Ruben/Developer/el-umbral`
**Last commit:** `0ff5732` — perf: re-encode character videos at half bitrate (~50% smaller) (#4)
**Build:** ✅ Clean
**Deploy:** ✅ Netlify auto-deploy from `main`
**GA4:** G-VC5QW7C1CQ (Ruben Websites account, Javier admin)

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

| ID | Archetype | Status | CTA |
|----|-----------|--------|-----|
| `emperatriz-obra` | emperatriz | coming-soon | Entrar en la Corte → opens Tizno |
| `la-corte` | emperatriz | coming-soon | Cruza el Umbral → opens Tizno |
| `pulso` (with `editions[]`) | caballero | available | Tapa Blanda: Reclamar mi Ejemplar (live, Amazon ES) · Tapa Dura: Próximamente |
| `filamentos` | sortilega | **available** (shipped 2026-05-12, Amazon ES 8409861771) | Reclamar mi Ejemplar |
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
| 7 | May 14 (afternoon) | SEO investigation, ghost URL cleanup, GSC validate fixes + request indexing, audit cleanup landed (#3) |
| 8 | May 14 (evening) | Long polish: Tizno 3-col redesign, fireflies behavior + perf, transition simplified to fades, audio muffle + hover chimes, Threads icon fixed, video re-encode (-49%). PRs #3 (polish) and #4 (lighter videos) merged. |
