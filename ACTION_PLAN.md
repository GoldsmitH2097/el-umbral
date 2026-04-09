# Soulware.live — Consolidated Action Plan
*Synthesized from Claude Opus, GPT-4o, Gemini Deep Think — April 9 2026*
*Signals flagged by 2+ auditors marked ⚡. Flagged by all 3 marked 🔥*

Legend: [CODE] = I build | [YOU] = needs your decision/content | [JAVIER] = needs Javier

---

## ALREADY DONE ✅
- sitemap.xml (exists at /sitemap.xml)
- robots.txt (exists, references sitemap)
- OG/Twitter meta tags
- Favicons (PNG + apple-touch-icon)
- Legal pages (Aviso Legal, Privacidad, Cookies)
- Ghost DOM with .sr-only (correct implementation — position:absolute, not display:none)
- Contact form (pending Formspree verification)
- Countdown timer for Filamentos
- Book cover modals with author/archetype/series info

---

## PHASE 0 — YOU DON'T EXIST ON GOOGLE 🔥
*All 3 auditors flagged this. site:soulware.live = 0 results. This is the emergency.*


### 0.1 Google Search Console [JAVIER — do today]
1. Go to https://search.google.com/search-console/
2. Add property → URL prefix → https://soulware.live
3. Verify via HTML tag (paste into index.html) OR DNS TXT record in Netlify DNS panel
4. Once verified: Sitemaps → add → https://soulware.live/sitemap.xml → Submit
Without this Google doesn't know soulware.live exists. Everything else is irrelevant until this is done.

### 0.2 Title tag fix [CODE]
Current: "Soulware — Crónicas de la Oscuridad" (tells Google nothing)
New: "Soulware — Editorial Independiente Española | Ficción Oscura y Universos de Autor"

### 0.3 Meta description fix [CODE]
New: "Soulware es una editorial independiente española de ficción oscura. Cuatro arquetipos,
cuatro universos literarios. Descubre el catálogo, los autores y sus mundos."

### 0.4 JSON-LD Structured Data [CODE] ⚡
Three schemas to inject in <head>:
- Organization: name, url, logo, sameAs (links to all social accounts)
- Book x4: each catalogue entry with title, author, publisher, ISBN (where available),
  url, offers (Amazon link for Pulso), availability status
- WebSite: enables sitelinks search potential
*Flagged by Claude, GPT, and Gemini as mandatory.*

### 0.5 Sitemap: add book URLs [CODE]
Add individual obra routes to sitemap once they exist:
/obras/pulso-del-nucleo, /obras/filamentos, etc.


---

## PHASE 1 — Performance (The 18,790ms Problem) 🔥
*All 3 auditors flagged TBT. Desktop score is 60. This hurts SEO and real users.*

### 1.1 Cap Device Pixel Ratio [CODE — 10 min]
`const dpr = Math.min(window.devicePixelRatio, 1.5)` in VisualEngine
Prevents 4K Macs drawing particles at 3x resolution. Immediate impact.

### 1.2 Decouple simulation rate from render rate [CODE — 30 min]
Particle physics runs at 30fps, canvas renders at 60fps.
Halves main thread load with zero visible difference.

### 1.3 OffscreenCanvas worker [CODE — 2-3 hrs, complex] 🔥
Move VisualEngine to Web Worker via canvas.transferControlToOffscreen().
TBT drops from 18,790ms to ~0ms. Needs Safari fallback.
*Highest impact fix in the entire audit. All 3 auditors agree.*

### 1.4 Video CDN migration [JAVIER]
4 × 2.4MB MP4s on Netlify = ~10MB per load, bandwidth timebomb.
Sign up for Bunny.net (cheapest) or Cloudflare R2 (free egress).
Upload the 4 videos, send me the CDN URLs → I update paths in 10 mins.

### 1.5 Pause loop when tab is hidden [CODE — 15 min]
Hook visibilitychange: suspend AudioContext + cancel RAF when tab is hidden.
Resume on visible. Prevents CPU drain for background tabs.

---

## PHASE 2 — Quick Technical Wins [CODE — all small]

### 2.1 font-variant-numeric: tabular-nums on countdown [2 min]
Stops layout jumping when "1" changes to "9" in the Filamentos timer.

### 2.2 100dvh on all overlays [5 min]
Replace 100vh with 100dvh on #reading-view, #mobile-char-detail, #obra-modal.
Fixes iOS bottom bar covering close buttons.

### 2.3 prefers-reduced-motion bypass [20 min] ⚡
If OS has reduced motion set: skip directly to Scene 4 on load.
WCAG legal requirement. Affects vestibular disorder users.

### 2.4 ARIA labels on icon buttons [5 min]
Modal close "×" buttons need aria-label="Cerrar".

### 2.5 Netlify Forms — replace Formspree [20 min] ⚡
Formspree v1 requires Javier to click a verification email.
If he hasn't: every contact form submission is failing silently.
Netlify Forms: add data-netlify="true" to form tag. Zero JS, built-in spam filter.

### 2.6 AbortController for scene transition listeners [30 min]
Attach all Scene 1/2 event listeners to an AbortController signal.
On scene exit: controller.abort() clears everything cleanly.
Prevents listener accumulation across scene transitions.

### 2.7 Skip button — make it first focusable element [10 min]
Move skip button to first DOM position + tabindex="0".
WCAG 2.4.1 compliance. Also: keep it visible through Scenes 2 and 3.

### 2.8 Focus management on scene transitions [15 min]
Scene 4 loads → focus h2 title
Reading view opens → focus h1 title
Modal opens → focus close button
Modal/reading closes → return focus to triggering element


---

## PHASE 3 — UX Clarity: The 10-Second Problem 🔥
*All 3 auditors: visitors don't know what Soulware is within 10 seconds.*

### 3.1 One anchoring editorial line [CODE — 5 min] 🔥
Add below the Scene 1 flame instruction AND in Scene 4 hero:
"Soulware es una editorial independiente de ficción oscura y universos de autor."
This single sentence resolves the mystery vs commercial ambiguity.
*Flagged by all 3 auditors as the single highest-ROI copy change.*

### 3.2 Scene 4 hero text pivot [CODE — 5 min] ⚡
Current: "Has cruzado la línea. La historia se escribe con sangre..." (still narrative mode)
New: "Cuatro arquetipos. Cuatro universos. Bienvenido al archivo de Soulware."

### 3.3 Scene 2 idle hint [CODE — 15 min] ⚡
After 4s of no whisper found, fade in at bottom:
"Busca las voces en la oscuridad..."
Prevents users from thinking the site is broken or frozen.

### 3.4 Archetype persistence from Scene 1 → Scene 4 [CODE — 30 min]
The last character ignited in Scene 1 should be pre-highlighted in Scene 4.
Validates the intro as a "sorting" experience, not just decoration.
Store ignited character index in state, apply .pillar--active class on archive load.

### 3.5 "Romper el trance" skip button copy [CODE — 2 min]
Replace "Saltar experiencia" with "Romper el trance".
Keeps the skip button atmospherically consistent while remaining obvious.

---

## PHASE 4 — Commercial Clarity: The Archive Layer ⚡

### 4.1 Status pills on obra cards [CODE — 20 min]
Add visible badges: [DISPONIBLE], [PRÓXIMAMENTE], [EN PREPARACIÓN], [EXPERIENCIA DIGITAL]
Makes scannable at a glance. Sets buyer expectations immediately.

### 4.2 Accent color on the ONE buyable item [CODE — 10 min]
Pulso del Núcleo tapa blanda is the only thing purchasable right now.
Its "Comprar en Amazon" button gets the only warm color on the page (amber/gold).
One warm accent in a sea of monochrome says "this one is real, this one you can buy."

### 4.3 Dual-layer book modal: La Visión / El Manuscrito [CODE — 45 min] ⚡
When a cover is clicked, modal has two tabs:
- "La Visión" — atmospheric pitch, archetype connection, poetic description
- "El Manuscrito" — format, ISBN, status, CTA, plain language synopsis
Serves both the lore-seeker and the practical buyer.

### 4.4 Format tags [CODE — 10 min]
Explicit format badges on each obra:
[EDICIÓN FÍSICA], [EXPERIENCIA DIGITAL], [ANTOLOGÍA]
Removes ambiguity about what is being sold.

### 4.5 Book descriptions — commercial hooks [YOU] ⚡
Current descriptions are atmospheric but don't sell.
Need: 1 commercial sentence + 1 atmospheric sentence per book.
I can draft — you approve. Format:
"Primera novela de una trilogía de fantasía oscura épica. [atmospheric line]"

### 4.6 "En preparación" → notify CTA [CODE — 10 min]
Add "Notificarme su llegada" link to contact form for unpublished obras.
Turns dead ends into list-building moments.

---

## PHASE 5 — Mobile Polish ⚡

### 5.1 touch-action + -webkit-touch-callout on Scene 1 [CODE — 5 min]
Native iOS interprets press-and-hold as "select text" or "save image".
Scope -webkit-touch-callout: none and user-select: none to Scene 1 container only.

### 5.2 Mobile haptics on Scene 1 [CODE — 10 min]
navigator.vibrate([30, 80, 150]) synced with flame growing.
Costs nothing, adds physical texture to the ritual.

### 5.3 3D tilt on book covers [CODE — 30 min] ⚡
JS cursor tracking + CSS transform: rotateX() rotateY() + radial-gradient glare.
Makes covers feel physical. Flagged by Gemini and GPT.

### 5.4 Mobile archive layout decision [YOU — decision needed]
GPT suggests horizontal CSS scroll-snap carousel for character pillars.
Currently vertical stack. Horizontal would feel more like a native app.
Your call: keep vertical or switch to horizontal swipe?

### 5.5 Audio muffling when modal opens [CODE — 20 min]
Web Audio API: route master through BiquadFilterNode (lowpass) when modal opens.
Makes ambient sound feel like it's happening outside a closed door.
Creates psychological focus on reading material.

---

## PHASE 6 — SEO: Deep Links & Social Sharing

### 6.1 Individual book URLs + meta [CODE — 1 hr]
/obras/pulso-del-nucleo, /obras/filamentos, etc.
Each with unique title tag, meta description, OG image (the cover).
These are the pages that rank when someone searches the book by name.

### 6.2 Netlify Edge Functions for social sharing OG [CODE — complex]
When a social scraper hits /caballero, it currently gets the homepage OG image.
Edge Function intercepts the request and injects the character-specific OG data.
Result: sharing a character URL on WhatsApp shows their image, not the homepage flame.

### 6.3 vite-plugin-prerender [CODE — 1 hr]
Generates static HTML files for deep links during Netlify build.
Googlebot gets pre-rendered content with correct meta. Human gets the JS experience.
Clean solution that doesn't require server-side rendering.

---

## PHASE 7 — You & Javier Do These (No Code)

### 7.1 Google Search Console [JAVIER — URGENT]
Already described in Phase 0. Do this first above everything else.

### 7.2 Editorial directories [YOU + JAVIER]
Submit to: editorialesindependientes.es, letrasdeencuentro.es, coolt.com, culturamas.es
Each = high-DA backlink + discoverability for people searching indie Spanish publishers.

### 7.3 Goodreads author page [JAVIER]
Create author page for WW. & Eidon.
List Pulso del Núcleo with cover, ISBN, description, link to soulware.live.
Goodreads has its own search — people search for books there before Google.

### 7.4 Amazon publisher page cleanup [JAVIER]
Ensure "Soulware" appears as publisher in the Pulso listing.
Add author bio + link to soulware.live in Amazon author page.
Both create backlinks from Amazon's very high domain authority.

### 7.5 Branded social account [YOU]
@wwyeid0n posts in character as ECSN, not as Soulware.
Need a @soulware.editorial (or similar) account for press/brand discovery.
Pin the editorial manifesto. Link to site. Cross-link all author accounts.

### 7.6 Video CDN [JAVIER]
Sign up for Bunny.net. Upload the 4 MP4s. Send me URLs. I update in 10 min.

---

## PHASE 8 — Nice to Have / Long Game

### 8.1 Newsletter as "El Pacto" [CODE — 30 min]
Replace contact form with newsletter signup framed as an inner circle invitation.
"Únete al Pacto — recibe los ecos antes de que se extingan."
Integrate with Mailchimp or Resend (free tier).

### 8.2 Press kit / Dossier de Prensa [YOU]
Google Drive folder with: high-res covers, character PNGs, looping flame MP4s.
Discreet footer link. Makes it effortless for BookTokers to feature your books.

### 8.3 Ambient audio on YouTube/Spotify [YOU]
Export the procedural cave ambience as a 1-hour loop.
"Soulware: Ambientes de Lectura — El Umbral (Dark Academia Ambient)"
Massive passive discovery funnel in dark academia/studying niche. Zero dev cost.

### 8.4 Scene 2 whispers as book quotes [YOU + CODE]
Current whispers ("La piedra recuerda", etc.) are atmospheric but empty.
Replace each with a real line from a catalogue book.
When all 4 are found they assemble into something.
*Needs actual quote selections from you.*

### 8.5 Awwwards / FWA submission [YOU — after Phase 1 perf fix]
Fix TBT first (60 → 90+ desktop), then submit.
Nomination = high-DA backlink + design community discovery.

### 8.6 Google Business Profile [JAVIER]
If Soulware has a registered address, create a GBP profile.
Legitimizes the business entity for Google's knowledge graph.

---

## BUILD ORDER — What I Start Immediately

### Session 1 — today:
1. Title + meta description
2. JSON-LD (Organization + Book schemas)
3. Editorial anchoring line (Scene 1 + Scene 4)
4. Scene 4 hero text
5. DPR cap in VisualEngine
6. tabular-nums countdown
7. 100dvh on overlays
8. prefers-reduced-motion bypass
9. ARIA labels
10. Netlify Forms (replace Formspree — pending your confirmation)

### Session 2:
- Scene 2 idle hint
- Skip button improvements (first focusable, copy, persistent)
- Focus management
- Status pills + accent color on buy button
- Format tags
- Archetype persistence Scene 1 → Scene 4
- touch-action Scene 1 mobile fix
- Mobile haptics

### Session 3:
- OffscreenCanvas worker (complex, 2-3 hrs)
- Dual-layer book modal (La Visión / El Manuscrito)
- 3D tilt on book covers
- Individual book URLs + prerender
- Notify CTA on coming-soon obras

### Needs your input before building:
- Book descriptions commercial rewrite (I draft, you approve)
- Whispers as real book quotes (you choose the lines)
- Mobile archive: vertical vs horizontal scroll decision
- Netlify Forms switch: confirm OK to remove Formspree dependency

---

## Summary: What Each AI Agreed On (All 3 = Do First)

| Issue | All 3 Flagged | Priority |
|-------|--------------|----------|
| Google doesn't know you exist | 🔥 | P0 |
| JSON-LD structured data missing | 🔥 | P0 |
| 18,790ms TBT on desktop | 🔥 | P1 |
| No editorial identity visible in 10s | 🔥 | P2 |
| Archetype↔book relationship unclear | ⚡ | P2 |
| Video bandwidth on Netlify | ⚡ | P1 |
| prefers-reduced-motion bypass | ⚡ | P1 |
| Scene 2 needs affordance | ⚡ | P2 |
| Book descriptions need commercial hooks | ⚡ | P3 |
