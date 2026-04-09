# SOULWARE.LIVE — Full Site Audit Brief
*Prepared April 9, 2026. For use with Gemini Deep Think, GPT-4o, Claude Opus.*

---

## What this site is

**soulware.live** is the digital front door for Soulware, a Spanish independent publishing house.
It is a cinematic, immersive web experience — not a conventional editorial site. It deliberately uses
atmospheric storytelling, procedural audio, particle animation, and progressive scene transitions
to introduce four literary archetypes and their associated books.

The site replaces a previous conventional site entirely. Atmosphere is intentional and non-negotiable.
The goal of this audit is to find where it's clunky, broken, slow, unclear, or improvable — without
stripping its identity.

**Live URL:** https://soulware.live
**Stack:** Vite + Vanilla JS (no frameworks), Netlify hosting
**Repo context:** Available on request

---

## Lighthouse scores (PageSpeed Insights, April 9 2026)

| Metric | Mobile | Desktop |
|--------|--------|---------|
| Performance | 98 | 60 |
| Accessibility | 93 | 93 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| First Contentful Paint | 1.0s | 0.3s |
| Largest Contentful Paint | 1.0s | 0.3s |
| Total Blocking Time | 50ms | **18,790ms** ⚠️ |
| Cumulative Layout Shift | 0 | 0.005 |

The 18,790ms TBT on desktop is caused by the canvas animation RAF loop.
Mobile performs well because the canvas is lighter on those simulated conditions.

---

## Site structure

The site is a single-page application with five sequential scenes:

1. **Scene 1 — The Tomb** (intro): Press-and-hold mechanic ignites a flame revealing one of four
   characters. Auto-advances after 5s if no interaction. Users can also skip entirely.
   Uses: canvas particles (flame, smoke, dust, fireflies), CSS mask with custom properties,
   Web Audio API (procedural C minor cave ambience), video background.

2. **Scene 2 — Voces del Umbral**: Hunt 4 whispered phrases scattered across the screen
   (desktop: cursor/firefly proximity; mobile: sequential tap).
   Uses: canvas firefly rendering, DOM text manipulation.

3. **Scene 3 — The Awakening**: Binaural white flash, text reveal ("EL UMBRAL"), button to enter.
   Auto-advances after 4s if not clicked.

4. **Scene 4 — The Archive**: Main content section. Navigation bar, hero text, 4 character
   pillars (hover expands + plays video), Las Obras section (book grid with countdown timer),
   contact form, footer with legal links.
   Sub-features: reading view for character lore (Scene 5), obra modal (book details popup).

5. **Scene 5 — Reading View**: Full lore article per character, social links.

---

## Technical implementation notes

- Canvas animation runs at 60fps via requestAnimationFrame — always active in Scenes 1–3
- Scene 4+ kills the canvas loop entirely (performance kill-switch)
- Videos: 4 × ~2.4MB MP4 files served directly from Netlify (bandwidth risk at scale)
- Audio: Web Audio API graph (oscillators + noise generators). iOS requires special unlock handling.
- CSS custom properties drive the flame mask (GPU compositing, not canvas redraws)
- No React/Vue — vanilla JS for canvas performance
- Mobile: separate tap mechanic for Scene 2, tap-to-detail overlay for Scene 4 archive
- All overlays now use display:none (not just opacity:0) after bugs with fixed children

---

## JS bundle breakdown

- Main JS bundle: 54KB gzipped (16KB)
- CSS bundle: 23KB gzipped (5KB)
- Total JS source: ~2000 lines across 7 modules

Key modules:
- `AudioEngine.js` — Web Audio API, procedural ambience, iOS unlock
- `VisualEngine.js` — Canvas: flame/smoke/dust/firefly particles
- `StateManager.js` — Characters[], Catalogue[], global state
- `ArchiveDOM.js` — Archive section, obra modal, reading view
- `mobile.js` — Mobile-specific mechanics
- `main.js` — Scene transitions, input handling, auto-advance logic

---

## Known issues / areas of concern

1. **Desktop TBT 18,790ms** — RAF loop blocks main thread. Canvas is active during Scenes 1–3.
   Even with the kill-switch, Lighthouse measures the intro phase. Needs profiling.

2. **Mobile experience is functional but feels heavy** — The intro (Scene 1) uses
   press-and-hold which is not natural on mobile. Scene 4 archive is stacked vertically
   but may feel cramped. Video autoplay behavior varies by iOS version.

3. **iOS audio** — Web Audio looping nodes are unreliable on iOS Safari. Leitmotif notes
   work (oscillators created on demand), but ambient fire/wind sounds drop and need
   restart on every AudioContext resume. Partially fixed; still inconsistent.

4. **Overlay ghosts** — Multiple past bugs where fixed-position children escaped
   opacity:0 parent containers. Patched with display:none. Confirm no regressions.

5. **Scene 2 desktop UX** — Whisper hunt requires cursor proximity to reveal text.
   Not obvious what to do. No instruction text.

6. **Content clarity** — The intro is atmospheric but gives no immediate signal about
   what Soulware is or what's being sold. Users must complete the full experience
   before seeing books. This is intentional but may need softening.

7. **Contact form** — Uses Formspree v1. Requires email verification on first submission
   (Javier hasn't confirmed yet). Form may be silently failing.

8. **Video bandwidth** — 4 × 2.4MB MP4s served from Netlify. No CDN. Will hit
   bandwidth limits under real traffic. Needs migration to Bunny.net or Cloudflare R2.

---

## Accessibility concerns (score: 93)

- The canvas-based experience has no accessible alternative path
- Ghost DOM (.sr-only) provides crawlable text for Googlebot but not a full skip-to-content
- The flame instruction text is low contrast
- Some buttons lack sufficient aria labels
- Color contrast in the obras section (dark text on dark background) may be insufficient

---

## SEO status (score: 100)

- Canonical tag: ✅ https://soulware.live/
- OG/Twitter meta: ✅ with 1200×630 image
- Sitemap: ✅ /sitemap.xml
- robots.txt: ✅
- Ghost DOM with semantic h1/h2/nav/article: ✅
- Structured data (Schema.org): ❌ NOT IMPLEMENTED
- No individual page URLs for book listings (single-page app)

---

## Content structure

**Four archetypes (characters):**
- La Emperatriz Sin Reino — Alicia Sarel (@aliciasarel)
- El Caballero Sin Nombre — WW. & Eidon (@wwyeid0n)
- La Sortílega Sin Sombra — Irina M. (@irina_mlk_)
- El Arlequín Sin Flores — Germán Ferri (@germyto)

**Books / projects in catalogue:**
- Emperatriz: "En preparación" (Tragedia lírica, no cover yet)
- Emperatriz: "Totalis Libertas — Antología de la Verdad Histórica de España" (anthology, TBD)
- Caballero: "Pulso del Núcleo — Núcleo Eterno" (Tapa Blanda, available on Amazon)
- Caballero: "Pulso del Núcleo — Núcleo Eterno" (Tapa Dura, coming soon)
- Sortílega: "Filamentos de Oscuridad — Resonancia de la Penumbra" (countdown: May 12 2026)
- Arlequín: "Anatomía del Vacío" (interactive web experience, coming soon)

---

## Legal / compliance status

- Aviso Legal: ✅ /aviso-legal.html
- Política de Privacidad: ✅ /privacidad.html
- Política de Cookies: ✅ /cookies.html
- Cookie consent banner: ❌ NOT IMPLEMENTED (site doesn't use tracking cookies, but banner may be legally required)
- GDPR/LOPD compliance: Partial — no consent management platform

---

## What we want from this audit

Please review https://soulware.live thoroughly and provide specific, actionable feedback on:

### 1. Performance
- The desktop TBT of 18,790ms is critical. What's causing it and how to fix it without
  abandoning the canvas animation?
- Video loading strategy — lazy loading, preload optimizations?
- Any render-blocking resources?
- Memory leaks from the canvas RAF loop?

### 2. Mobile UX
- Is the mobile experience smooth and intuitive?
- Does Scene 1 (press-and-hold) work acceptably on mobile or does it need a different mechanic?
- Is the archive section (Scene 4) clear and navigable?
- Are book covers and text readable on small screens?
- Is the tap-to-detail overlay for characters working correctly?

### 3. UX / Navigation
- Is the overall flow (intro → whispers → awakening → archive) intuitive or confusing?
- Does a first-time visitor understand what Soulware is within 10 seconds?
- Is the relationship between archetypes and their books clear?
- Is there any moment where the user gets stuck or lost?
- Does the "Saltar experiencia" (skip) button work well?

### 4. Accessibility
- What are the specific accessibility failures in the 93 score?
- Screen reader experience?
- Keyboard navigation?
- Color contrast issues?

### 5. SEO / Discoverability
- Missing structured data opportunities (Book schema, Organization schema)?
- Are the meta descriptions compelling?
- Is the ghost DOM content sufficient for crawling?
- Any technical SEO issues not caught by Lighthouse?

### 6. Code quality
- Dead code, redundant CSS, unused variables?
- CSS specificity conflicts?
- Event listener leaks?
- iOS/Safari-specific fragility?
- Anything that would break on specific browsers or devices?

### 7. Content / copywriting
- Is the Spanish copy clear and compelling?
- Does the tone match a premium literary publisher?
- Any confusing or ambiguous text?
- Does the obra descriptions sell the books effectively?

### 8. Design / visual
- Does the dark visual identity work consistently across sections?
- Does the obras section (books grid) have sufficient visual hierarchy?
- Are there any layout issues on non-standard screen sizes?

---

## Constraints — do not suggest changing these

- Keep Vanilla JS (no React/Vue) — canvas 60fps requires this
- Keep the cinematic intro experience — atmosphere is the brand
- Keep the dark aesthetic — this is intentional
- Keep the single-page architecture — deep links work via History API
- Stack is Vite + Netlify — no server-side rendering

---

*Source code available at github.com/GoldsmitH2097/el-umbral (private)*
*Full architecture documentation in CLAUDE.md at repo root*
