# SOULWARE.LIVE — Full Site Audit Brief v2
*Updated April 9, 2026. For use with Gemini Deep Think, GPT-4o, Claude Opus.*
*Previous audit: April 9, 2026 (same day, this is a follow-up after major development sprint)*

---

## What this site is

**soulware.live** is the digital front door for Soulware, a Spanish independent publishing house
specialising in dark fiction. It is a cinematic, immersive web experience — atmosphere is the brand.
Four literary archetypes, procedural audio, particle animation, progressive scene transitions.

The goal of this audit is to evaluate current state AFTER a major development sprint, identify
remaining issues, and suggest next improvements — without stripping the site's cinematic identity.

**Live URL:** https://soulware.live
**Stack:** Vite + Vanilla JS (no frameworks), Netlify hosting, Web Audio API
**Repo:** github.com/GoldsmitH2097/el-umbral (private)

---

## What was fixed since the previous audit brief

This is critical context. The previous brief identified these issues — here's what happened:

### ✅ RESOLVED

**Performance (Desktop TBT was 18,790ms)**
- Canvas particle physics now runs at full 60fps (was throttled to 30fps — looked "half off")
- 144Hz fast-forward protection added (timestamp clamping — was double-speed on ProMotion screens)
- CSS mask on #gallery-container REPLACED with canvas destination-out technique:
  - Old: CSS mask-image applied directly over playing video → browser composited mask with
    decoded video frames every frame → CPU bottleneck, destroys hardware acceleration
  - New: Canvas paints solid black blanket, then destination-out erases transparent spotlight hole.
    Video plays clean at z-index:0. Canvas composites purely on GPU. Zero CSS layout recalculation.
- Smoke particles now use pre-rendered OffscreenCanvas sprite + drawImage (was createRadialGradient
  per particle per frame — ~10x more expensive)
- Hard caps on particle arrays (50 flame / 85 smoke) prevent accumulation lag

**Mobile experience**
- Archive refactored to unified horizontal scroll-snap carousel (one full-width slide per character)
- Mobile character pillars now 50vh video / 50vh books (no nested scroll)
- Mobile character tap-to-detail: fixed (.pillar → .archive-pillar class update)
- overflow-x: hidden on #main-site prevented mobile horizontal scroll — fixed
- touch-action: manipulation on pillars removes 300ms iOS tap delay
- Event delegation on .archive-grid for belt-and-suspenders reliability

**Character/Book reading view**
- Fully working reading view with author bio + books side by side (desktop)
- Stacked on mobile/small screens
- Clicking a book cover opens the author's reading panel on the "Obras" tab
- Books show: cover image, vision text, format, author, series info, buy button

**Archive grid architecture**
- Pillar + Books unified into single .archive-col column per archetype
- Vertical amber dividers: organic staggered pulse animation (0s/2.3s/4.6s phase offset)
- Both adjacent lines illuminate together on hover (CSS sibling selector)

**Visual + UX**
- Tizno panel: backdrop overlay closes drawer on outside click
- Tizno silhouette static (no bounce), eyes wiggle independently with eyeFloat animation
- Social links removed from archive pillars — only shown in reading view
- Contact form moved entirely into Tizno drawer
- Footer: Soulware logo (golden phoenix), copyright, legal links with :visited fix
- Legal pages displayed as in-site modal (fetches HTML, strips nav/logo before injection)
- Totalis Libertas anthology card: fixed text overflow (long uppercase strings exceeded column width)
- New book covers: alicia-cover.webp (Emperatriz placeholder), anatomia-del-vacio.webp

**Audio**
- Audio properly silenced when entering archive (fire + wind gains zeroed)
- Audio sizzle bug fixed (windGain was playing after deep-link archive entry)
- BiquadFilter pop fix: exponentialRampToValueAtTime instead of direct value assignment
- prefers-reduced-motion: skips intro entirely, goes straight to archive

**SEO**
- availabilityStarts: 2026-05-12T00:00:00Z added to Filamentos JSON-LD
- decoding="async" on all book cover images

**Code quality**
- Button spam protection: pointerEvents = 'none' on first EL UMBRAL click
- Cursor hides on flame ignition (cursor: none — flame IS the cursor)
- Removed duplicate requestAnimationFrame call that was spawning two loops
- Legal modal content filtering (strips logo, nav, .legal-back links before inject)
- Deep link URL tracking: Router correctly detects /slug paths and navigates to character

### ❌ STILL OPEN (known issues going into this audit)

1. **Desktop TBT** — Still elevated (canvas RAF during Scenes 1-3). OffscreenCanvas worker
   implementation is the remaining fix. Needs profiling to confirm current state.
2. **Video CDN** — 4x ~2.4MB MP4s still on Netlify. Pre-scale bandwidth issue. Needs Bunny.net.
3. **Smoke glitch** — Minor visual artifact in smoke particles. Source not identified.
4. **Mobile reading view tabs** — Autor/Libros tabs exist but need verification on real devices.
5. **Cookie consent banner** — Still not implemented. Legally grey (no tracking cookies, but LOPD).
6. **Google Search Console** — Sitemap submitted? Indexing status unconfirmed.
7. **Tizno system prompt admin panel** — Not built yet.
8. **Stripe/Shopify integration** — Architecture placeholder ready, not implemented.
9. **Anatomía del Vacío engine** — Content exists (Germán), engine not built.

---

## Current site structure

Five sequential scenes, same as before but with improvements:

**Scene 1 — The Tomb (intro)**
Press-and-hold ignites a flame (CSS destination-out spotlight). Auto-advances through 4 character
reveals. Uses: canvas destination-out for spotlight, canvas particles (flame, smoke, dust),
Web Audio procedural ambience, video backgrounds (no CSS mask on video — GPU clean).

**Scene 2 — Voces del Umbral**
Hunt 4 whispered phrases. Desktop: cursor proximity. Mobile: sequential tap.
Uses: canvas firefly rendering, DOM text reveal.

**Scene 3 — The Awakening**
Binaural white flash, text reveal, "EL UMBRAL" button. Auto-advances after 7s.

**Scene 4 — The Archive**
Main content section. 4-column archive grid. Each column = 1 archetype with their pillar (video)
and books below. Horizontal scroll-snap on mobile. Character click opens reading view.
Sub-sections: reading view (character lore + books), obra details, Tizno drawer (contact + social).

**Scene 5 — Reading View**
Author bio + books side by side. Character video as blurred background.

---

## Current technical architecture

```
src/
├── index.html              — SPA shell + ghost DOM (SEO)
├── css/
│   ├── global.css          — Reset, .sr-only, scene transitions
│   ├── canvas.css          — Scene 1 layer stack, spotlight, char-text
│   ├── archive.css         — Archive grid, reading view, modals, footer
│   ├── obras.css           — Book cards, anthology, firefly container
│   ├── tizno.css           — Tizno peek + panel
│   └── mobile.css          — Mobile-specific styles
└── js/
    ├── main.js             — Scene transitions, input, auto-advance
    ├── mobile.js           — Mobile mechanics
    ├── core/
    │   ├── StateManager.js — Characters[], Catalogue[], state
    │   └── Router.js       — History API, deep link bypass
    ├── engine/
    │   ├── AudioEngine.js  — Web Audio graph, iOS unlock
    │   └── VisualEngine.js — Canvas: destination-out spotlight + particles
    └── ui/
        ├── ArchiveDOM.js   — Archive grid, reading view, modals, legal
        ├── ArchiveFireflies.js — Ambient fireflies + particles (position:fixed)
        └── TiznoTease.js   — Tizno peek + blink + panel
```

**Canvas layer architecture (Scene 1):**
```
z-index 0: #gallery-container (video — no CSS mask, GPU hardware-accelerated)
z-index 1: #char-text (character name/desc — revealed through canvas hole)
z-index 3: #vfx-canvas (black blanket → destination-out hole → glow → particles)
z-index 5: #ui (instruction text, always visible)
z-index 6: #umbral-btn
```

**CSS custom properties still in use:**
- `--x`, `--y`: Scene 2 light position (still CSS-driven)
- Spotlight radii/intensity: Now pure JS instance variables on VisualEngine (no CSS vars)

---

## Lighthouse scores (target for audit comparison)

Previous scores from the original brief:
| Metric | Mobile | Desktop |
|--------|--------|---------|
| Performance | 98 | 60 |
| TBT | 50ms | 18,790ms ⚠️ |

**Request:** Run new PageSpeed Insights on https://soulware.live and compare.
Focus especially on whether desktop TBT has improved after the canvas refactor.

---

## What we want from this audit

Please review https://soulware.live thoroughly. Navigate through all 5 scenes on both desktop
and mobile (use Chrome DevTools device emulation if needed).

### 1. Performance (critical)
- Run PageSpeed Insights on https://soulware.live and report all metrics
- Has desktop TBT improved? What remains?
- Is the canvas destination-out approach performing as expected?
- Any render-blocking resources remaining?
- Memory profile: do particles leak over time?
- Is the RAF loop correctly terminating in Scene 4+?

### 2. Mobile UX (critical)
- iPhone SE, iPhone 14, Android mid-range — how does Scene 1 feel?
- Does the horizontal carousel in Scene 4 scroll and snap correctly?
- Are character pillars tappable to open reading view?
- Do book covers show and are they well-sized on mobile?
- Is the Tizno drawer usable on mobile (can it open/close)?
- Does the mobile reading view (Autor + Libros stacked) read clearly?
- Is there any horizontal overflow or layout breakage on narrow screens?

### 3. Scene 1 — Flame experience
- Does the spotlight/flame feel cinematic and smooth at 60fps?
- Is the smoke + flame particle system visually satisfying?
- Does the auto-advance feel paced correctly (5s before starting)?
- Is there a "half off" or stuttery quality to the animation?
- Does the ambient warm glow around the flame look correct?
- Does the cursor disappear correctly on ignition?

### 4. Archive (Scene 4) — Content clarity
- Is the relationship between archetypes and their books immediately clear?
- Does clicking a character open their bio + books in a readable way?
- Is the side-by-side layout (Author | Books) working on desktop?
- Is the book information (cover, title, vision text, format, buy button) complete?
- Does the Filamentos de Oscuridad countdown timer display correctly?
- Is the Totalis Libertas anthology card formatted correctly now?
- Is the Tizno element (peek + drawer) atmospheric and functional?

### 5. Reading view (Scene 5)
- Click any character from the archive. Does the reading view open correctly?
- Is there a back button (← Volver)?
- Is author bio on the left and books on the right? Or stacked correctly on smaller screens?
- Do social links appear in the reading view (not in the archive pillars)?
- Can you close the reading view and return to the archive?
- Is the background video visible as a blurred ambient layer?

### 6. Audio
- Does the cave ambience play correctly after interaction?
- Is it silent in the archive (no wind/fire hiss)?
- Do whisper effects trigger in Scene 2?
- Does the binaural awakening sound work in Scene 3?
- Any audio clicks, pops, or sizzling sounds?

### 7. SEO & technical quality
- Run Lighthouse SEO audit — is the score still 100?
- Check Structured Data at https://search.google.com/test/rich-results for soulware.live
- Are all 4 character routes (/emperatriz, /caballero, /sortilega, /arlequin) working?
- Do they load the correct character reading view?
- Check og:image and twitter:card are present and correct
- Any broken links or 404s?
- Is the sitemap at https://soulware.live/sitemap.xml correct?

### 8. Cross-browser testing
- Safari (desktop): Does the spotlight work? Does iOS audio behave?
- Firefox: Any canvas rendering differences?
- Chrome on Android: Does the horizontal carousel work without a scrollbar?
- Edge: Any layout issues?

### 9. Remaining code quality concerns
- Dead CSS from the old CSS mask approach (--radio-interior, --radio-exterior, --intensidad
  are no longer set — any CSS still referencing them?)
- Any CSS specificity conflicts visible in the computed styles?
- Event listener accumulation across scene transitions?
- Is the prefers-reduced-motion skip working correctly?

### 10. UX gaps and suggested improvements
Given the current state, what are the 5 most impactful improvements that could be made
without breaking the cinematic atmosphere? Consider:
- Content discoverability: does the user understand what Soulware is quickly enough?
- Purchase path: is the path from "character" to "buy book" clear?
- Return visit value: is there anything that rewards coming back?
- Social sharing: are there any natural sharing moments?
- Email capture / newsletter: is there an opportunity before the user leaves?

---

## Catalogue (current book status)

| ID | Title | Archetype | Status |
|----|-------|-----------|--------|
| emperatriz-obra | En preparación | Emperatriz | coming-soon |
| la-corte | Totalis Libertas | Emperatriz | coming-soon (anthology) |
| pulso-blanda | Pulso del Núcleo (Tapa Blanda) | Caballero | **AVAILABLE** — Amazon ES |
| pulso-dura | Pulso del Núcleo (Tapa Dura) | Caballero | coming-soon |
| filamentos | Filamentos de Oscuridad | Sortílega | countdown (May 12 2026) |
| anatomia | Anatomía del Vacío | Arlequín | coming-soon (web experience) |

---

## Constraints — do not suggest changing these

- Keep Vanilla JS (no React/Vue) — canvas 60fps requires clean main thread
- Keep the cinematic intro experience — atmosphere is the brand
- Keep the dark aesthetic (#020202 background)
- Keep the single-page architecture with History API deep links
- Stack is Vite + Netlify — no server-side rendering
- No advertising, no tracking pixels, no Google Analytics
- Spanish first — this is a Spanish publisher for the Spanish market

---

## Signals to watch for (known edge cases)

- **URL state**: If you reach a character reading view (/emperatriz etc.) and refresh,
  the Router should detect the slug and skip intro correctly. This is intentional.
- **First load black screen**: Normal — canvas paints black blanket while awaiting interaction.
  Instruction text appears after 2.5s. This is the intended UX.
- **Auto-advance**: If you wait 5s without touching anything, the site auto-reveals characters.
  This is intentional — the experience doesn't require interaction.
- **Mobile audio**: On iOS, audio requires a gesture to initialize. The first tap unlocks it.

---

*Source code: github.com/GoldsmitH2097/el-umbral (private — available on request)*
*Full architecture: CLAUDE.md at repo root*
*Previous audit date: April 9, 2026*
