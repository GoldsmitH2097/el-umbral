# El Umbral — Project Reference

> Canonical documentation for AI-assisted development.
> Read this before touching any file.

---

## What this is

El Umbral is the cinematic digital front door for **Soulware**, a Spanish independent publishing house.
It replaces soulware.live entirely. It is an immersive web experience — not a traditional site.

**Live URL:** https://soulware.live
**Backup URL:** https://el-umbral.netlify.app
**Repo:** https://github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/ruben/Developer/el-umbral`
**Deploy:** `git push origin main` → Netlify auto-builds in ~10s

---

## The team

| Person | Role | Handle |
|--------|------|--------|
| Rubén | Creative Director, Soulware | — |
| Javier | Writer (El Caballero), infra access | @wwyeid0n |
| Irina | Writer (La Sortílega) | @irina_mlk_ |
| Germán | Writer (El Arlequín Sin Flores) | @germyto |
| La Emperatriz | Writer (status: missing — narrative, not technical) | — |

Netlify account: **franjacasanova's team** (Javier)
Publisher Instagram: @core.soulware
Editorial email: editorial@soulware.live

---

## Stack

- **Vite + Vanilla JS** — no React (canvas 60fps stutter with VDOM GC)
- **Netlify** — hosting, CDN, auto-deploy from GitHub main
- **Formspree** — contact form (v1 API, email-based)
- CSS custom properties for GPU-composited flame mask

```
src/
├── index.html              # Ghost DOM (SEO) + scene scaffolding
├── css/
│   ├── global.css          # Reset, .sr-only, touch-action scoped
│   ├── canvas.css          # Scene 1: gallery, ambient light, UI
│   ├── archive.css         # Scene 4/5: pillars, reading, pacto
│   ├── obras.css           # Las Obras grid, countdown, contact
│   ├── typography.css      # Reading view, drop cap, social links
│   └── mobile.css          # All mobile styles (≤768px)
└── js/
    ├── main.js             # Entry, input handling, scene transitions
    ├── mobile.js           # Mobile Scene 2 tap + archive tap-to-detail
    ├── core/
    │   ├── StateManager.js # CHARACTERS[], CATALOGUE[], state, Events
    │   └── Router.js       # History API, deep link bypass
    ├── engine/
    │   ├── AudioEngine.js  # Web Audio: Cm7 leitmotif, cave ambience
    │   └── VisualEngine.js # Canvas: flame, smoke, dust, firefly
    └── ui/
        └── ArchiveDOM.js   # Archive grid, obras, contact, reading view
```

---

## Scene map

| Scene | Name | Description |
|-------|------|-------------|
| 1 | The Tomb | Press-and-hold flame ignition gallery, 4 characters |
| 2 | Voces del Umbral | Whisper hunt (cursor/firefly desktop; tap mobile) |
| 3 | The Awakening | Binaural whiteout, auto-advances to archive after 4s |
| 4 | The Archive | Characters + Las Obras (same scroll page) |
| 5 | Reading | Full lore article per character (desktop only) |

---

## Characters (StateManager.js — CHARACTERS[])

| Index | Slug | Title | Status | Video |
|-------|------|-------|--------|-------|
| 0 | emperatriz | La Emperatriz Sin Reino | active | /reina-sin-corona.mp4 | Alicia Sarel | @aliciasarel (IG) |
| 1 | caballero | El Caballero Sin Nombre | active | /caballero-sin-nombre.mp4 | WW. & Eidon | @wwyeid0n (IG+Threads) |
| 2 | sortilega | La Sortílega Sin Sombra | active | /sortilega-sin-sombra.mp4 | Irina M. | @irina_mlk_ (IG+Threads) |
| 3 | arlequin | El Arlequín Sin Flores | active | /arlequin-sin-flores.mp4 | Germán Ferri | @germyto (Threads) |

La Emperatriz is "en paradero desconocido" — this is narrative, not a code flag.
She has full video, lore, and pillar. No social links. No books. No click-block.

---

## Catalogue (StateManager.js — CATALOGUE[])

| ID | Title | Archetype | Status |
|----|-------|-----------|--------|
| pulso-blanda | Pulso del Núcleo (Tapa Blanda) | caballero | available → Amazon ES |
| pulso-dura | Pulso del Núcleo (Tapa Dura) | caballero | coming-soon |
| filamentos | Filamentos de Oscuridad | sortilega | countdown → 2026-05-12 |
| anatomia | Anatomía del Vacío | arlequin | coming-soon (web experience) |

---

## Key architecture decisions — DO NOT REVERSE without reason

- **No React** — canvas 60fps stutter with VDOM GC pauses
- **CSS custom props drive flame mask** — GPU compositing, not canvas redraw
- **.sr-only for ghost DOM** — not aria-hidden (breaks screen readers) or display:none (blocks Googlebot)
- **Root-relative video paths** `/name.mp4` — bare paths break on deep-linked URLs
- **touch-action:none scoped** to `#gallery-container #scene-2 #scene-3 #vfx-canvas` — NOT body
- **box-shadow over border-right** for pillar dividers — borders cause white line artifacts
- **brightness(0.9) contrast(1.5)** on archive pillar videos — crushes lifted blacks, preserves smoke highlights
- **preload="metadata"** on archive videos — loads first frame for static display without full download

---

## Commit convention

```
type(scope): plain English description
```

Types: `feat` / `fix` / `seo` / `perf` / `style` / `refactor` / `content` / `chore`

Examples:
- `fix(mobile): scope touch-action to intro layers`
- `feat(audio): iOS resume on touch`
- `seo(ghost-dom): add anchor links for crawling`

Never: "update", "fix bug", "changes"

---

## Auto-advance (Scene 1)

Starts 5s after load if no interaction. Simulates press-hold-release cycle:
- 900ms ramp-up → ignition → 3.5s display → 800ms ramp-down → 500ms gap → next character
- `visual.setAutoAdvanceMode(true)` suppresses flame particles AND glow (mask-only reveal)
- User interaction cancels auto-advance immediately
- After user releases, auto-advance resumes 3s later (experience stays on rails)

---

## iOS audio — known behaviour

- `navigator.audioSession.type = 'playback'` bypasses mute switch (iOS 17+)
- Silent buffer unlock + synchronous `_buildGraph()` in gesture context
- `_restartNoiseSources()` called after every `resume()` — iOS drops looping BufferSourceNodes on suspend
- Oscillator-based sounds (notes, leitmotif) work reliably; looping noise sources are fragile

---

## Mobile architecture

**Scene 2:** Sequential tap mechanic — whispers appear one by one, tap to reveal, all 4 → awakening
**Archive:** `initMobileArchive()` in mobile.js
- Pillars: 200px tall, video autoplays (0.5 opacity), description always visible
- Tap pillar → `#mobile-char-detail` overlay (video bg, lore, social, books)
- ArchiveDOM `openReading()` blocked on mobile (`window.innerWidth <= 768` guard)

---

## SEO

- Canonical + OG + Twitter meta → `https://soulware.live/`
- Ghost DOM in index.html with `.sr-only` for Googlebot crawlability
- `sitemap.xml` and `robots.txt` in `/public/` → reference soulware.live
- No `aria-hidden` or `display:none` on crawlable content

---

## Rollback

Netlify Deploys panel → click any past deploy → "Publish deploy" — takes 10s, no terminal needed.

---

## Roadmap

### Immediate
- [ ] Legal pages: Aviso Legal, Privacidad, Cookies (required in Spain)
- [ ] Formspree: Javier clicks verification email sent to editorial@soulware.live on first form submission
- [ ] Video CDN migration (Bunny.net / Cloudflare R2) before real traffic — MP4s will hit Netlify bandwidth

### Phase 2 — Identity
- [ ] ES/EN language toggle
- [ ] Color/iconography system linking archetypes to books
- [ ] La Emperatriz new video when writer is signed

### Phase 3 — Anatomía del Vacío
- [ ] Immersive web experience, sentence-by-sentence, procedural sound
- [ ] Two chapters written, needs visual identity first
- [ ] No voice — pure text + ambient sound + animation

### Phase 4 — Tizno
- [ ] Narrative entity linked to El Arlequín. Small, soot and ink. Never corporate.
- [ ] Phase 1: predefined guided paths widget
- [ ] Phase 2: Claude API + system prompt + admin panel (no-deploy prompt updates)

### Phase 5 — Commerce
- [ ] Shopify + Stripe (Spain-first: Bizum, tarjeta, SEPA)
- [ ] Shop abstraction layer already in CATALOGUE (buyUrl field)

---

## Assets

All optimized assets live in `/public/assets/`:
- Book covers: WebP, 111–162KB
- Logo: `soulware-logo.webp` 5.3KB, 120×120px (nav: 36×36px display)
- Source files (unoptimized): `/assets/` folder in repo root

Video files (in `/public/`): ~10–20MB each — migrate to CDN before launch traffic
