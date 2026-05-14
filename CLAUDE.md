# CLAUDE.md — Soulware / El Umbral
## Canonical project reference. Read this before every session.

---

## The project

**soulware.live** is the digital front door for Soulware, a Spanish independent publishing house specialising in dark fiction. It is a cinematic, immersive web experience — not a conventional editorial site. The experience is the brand.

**Live:** https://soulware.live
**Repo:** https://github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/ruben/Developer/el-umbral`
**Deploy:** `git push origin main` → Netlify auto-builds (~10s)
**Rollback:** Netlify Deploys panel → click any past deploy → Publish

---

## The team

| Person | Role | Handle | Notes |
|--------|------|--------|-------|
| Rubén | Creative Director, client | — | Decisions, content, vision |
| Javier (Casanova) | Co-founder, El Caballero Sin Nombre, infra | @wwyeid0n | Netlify account owner, repo access |
| Irina | La Sortílega Sin Sombra | @irina_mlk_ | IG + Threads |
| Germán | El Arlequín Sin Flores | @germyto | Threads only |
| Alicia Sarel | La Emperatriz Sin Reino | @aliciasarel | IG only |

**Publisher:** @core.soulware (IG)
**Editorial email:** editorial@soulware.live
**Netlify team:** franjacasanova's team

---

## How we work

- Claude is senior lead developer and project manager
- Rubén is the client — present ideas for approval, flag decisions clearly
- Every session ends with HANDOVER.md updated
- Commit convention: `type(scope): description` — types: feat/fix/seo/perf/style/refactor/content/chore
- Never vague commits ("fix bug", "update") — always specific

---

## Stack

- **Vite + Vanilla JS** — no React (canvas 60fps stutter with VDOM GC)
- **Netlify** — hosting, CDN, auto-deploy, Netlify Forms
- **No server-side rendering** — SPA with History API deep links

```
src/
├── index.html              # Ghost DOM (SEO) + scene scaffolding
├── css/
│   ├── global.css          # Reset, .sr-only, touch-action, mobile-only overlay rules
│   ├── canvas.css          # Scenes 1-3: gallery, ambient light, hints
│   ├── archive.css         # Scene 4/5: pillars, reading, modals, footer
│   ├── obras.css           # Las Obras: grid, countdown, status pills, modal
│   ├── typography.css      # Reading view, drop cap, social links
│   └── mobile.css          # All mobile styles (≤768px) + horizontal swipe
└── js/
    ├── main.js             # Entry, scene transitions, auto-advance, haptics
    ├── mobile.js           # Mobile Scene 2 tap + archive tap-to-detail
    ├── core/
    │   ├── StateManager.js # CHARACTERS[], CATALOGUE[], state, Events
    │   └── Router.js       # History API, deep link bypass
    ├── engine/
    │   ├── AudioEngine.js  # Web Audio: Cm7 leitmotif, cave ambience, iOS unlock
    │   └── VisualEngine.js # Canvas: flame, smoke, dust, firefly (30fps sim / 60fps render)
    └── ui/
        └── ArchiveDOM.js   # Archive grid, obras, contact, reading view, modals
```

---

## Scene map

| Scene | Name | Description |
|-------|------|-------------|
| 1 | The Tomb | Press-hold flame ignition. Auto-advances after 5s. |
| 2 | Voces del Umbral | Whisper hunt. Desktop: cursor proximity. Mobile: sequential tap. |
| 3 | The Awakening | Binaural flash. "ADENTRARSE" button + auto-advance after 4s. |
| 4 | The Archive | Characters + Las Obras on one scroll page. |
| 5 | Reading View | Full lore per character + social links. Desktop only. |

---

## Characters (StateManager.js — CHARACTERS[])

| Slug | Title | Author | Social | Video |
|------|-------|--------|--------|-------|
| emperatriz | La Emperatriz Sin Reino | Alicia Sarel | @aliciasarel (IG) | /reina-sin-corona.mp4 |
| caballero | El Caballero Sin Nombre | WW. & Eidon | @wwyeid0n (IG+Threads) | /caballero-sin-nombre.mp4 |
| sortilega | La Sortílega Sin Sombra | Irina M. | @irina_mlk_ (IG+Threads) | /sortilega-sin-sombra.mp4 |
| arlequin | El Arlequín Sin Flores | Germán Ferri | @germyto (Threads) | /arlequin-sin-flores.mp4 |

La Emperatriz is "en paradero desconocido" — this is narrative, not a bug.

---

## Catalogue (StateManager.js — CATALOGUE[])

| ID | Title | Archetype | Status | Notes |
|----|-------|-----------|--------|-------|
| emperatriz-obra | En preparación | emperatriz | coming-soon | Tragedia lírica, Alicia Sarel. Title TBD. |
| la-corte | Totalis Libertas | emperatriz | coming-soon | Anthology. "Antología de la Verdad Histórica de España". `relatos[]` array ready to populate. |
| pulso | Pulso del Núcleo | caballero | **available** | Single CATALOGUE entry with nested `editions[]`: tapa blanda (Amazon ES, live) + tapa dura (coming-soon). Amber buy button. |
| filamentos | Filamentos de Oscuridad | sortilega | **available** | Released 2026-05-12. Amazon ES: 8409861771 |
| anatomia | Anatomía del Vacío | arlequin | coming-soon | Interactive web experience |

To add a relato to La Corte: add entry to `relatos[]` array in StateManager.js. No code changes needed.

---

## Architecture decisions — DO NOT REVERSE without reason

- **No React** — canvas 60fps needs clean main thread
- **CSS custom props drive flame mask** — GPU compositing
- **.sr-only for ghost DOM** — not display:none (blocks Googlebot)
- **Root-relative video paths** `/name.mp4` — bare paths break deep links
- **touch-action:none scoped** to intro layers only — not body
- **box-shadow over border-right** for pillar dividers — borders cause artifacts
- **display:none (not opacity:0) on overlays** — opacity:0 doesn't hide position:fixed children
- **#mobile-char-detail display:none in global.css** — must exist outside media query or bleeds onto desktop
- **30fps simulation / 60fps render** — particle physics every 2nd frame, halves TBT
- **Canvas at 1:1 CSS pixels** — no DPR scaling. Fire/smoke doesn't need retina. Scaling increases TBT.

---

## Known technical constraints

**iOS audio:**
- Silent buffer unlock + `_buildGraph()` must be synchronous in gesture handler
- `_restartNoiseSources()` after every `resume()` — iOS drops looping BufferSourceNodes on suspend
- `navigator.audioSession.type = 'playback'` for mute switch bypass (iOS 17+)
- Page Visibility API: suspend on hidden, restart sources on resume

**Video:**
- 4 × ~2.4MB MP4s currently on Netlify — bandwidth risk at scale
- Migrate to Bunny.net or Cloudflare R2 before any marketing push
- Pillar videos: `preload="metadata"` loads first frame as static thumbnail

---

## SEO status

- **Google Search Console:** Registered ✅ Sitemap: submitted ✅
- **Indexed (as of May 14, 2026):** 1 of 9 sitemap URLs. Structure is correct (see below) — the gap is Google's indexing pace on a young site. After cleaning ghost URLs (below) and using GSC "Request indexing" per route, expect the count to climb.
- **Sitemap:** `/sitemap.xml` ✅ 9 URLs (home + 4 characters + 4 obras). Legal pages intentionally excluded — they carry `noindex`.
- **Per-route prerendering:** ✅ `scripts/generate-og-pages.js` runs as postbuild and writes `dist/<route>/index.html` for each of the 8 deep routes with unique `<title>`, `<meta description>`, `<link rel="canonical">`, OG/Twitter tags, and optional Book JSON-LD. Netlify serves these static files before applying the SPA catch-all.
- **Ghost paths:** `/read`, `/saga`, `/contact`, `/map`, `/universo`, `/thanks.html`, `/privacy`, `/terms` (+ `.html` variants) → 301 to `/` via `public/_redirects`. These are remnants of a pre-Vite site that Google still crawls.
- **robots.txt:** ✅
- **JSON-LD:** Organization + 4 Book schemas ✅
- **OG/Twitter meta:** ✅ with 1200×630 image
- **Favicons:** PNG 32px, 16px, Apple touch icon 180px ✅
- **Ghost DOM:** semantic h1/h2/nav/article with .sr-only ✅

---

## Forms

**Netlify Forms** — `data-netlify="true"` on the contact form.
No verification needed. Messages arrive at Netlify dashboard → Forms.
Honeypot field included for spam protection.

---

## Legal pages

All at `/public/`: aviso-legal.html, privacidad.html, cookies.html
Accessible from footer. Serve without .html extension via Netlify pretty URLs.

---

## Assets

`/public/assets/`: book covers as WebP, soulware-logo.webp (5.3KB, display 36px)
`/public/`: MP4 videos, favicons, og-image.jpg, legal pages, sitemap.xml, robots.txt
`/assets/`: source (unoptimised) files — NOT served

---

## Pending — requires Ruben/Javier action

| Item | Owner | Status |
|------|-------|--------|
| Submit sitemap in Search Console | Javier | ✅ Done — May 2026 |
| Video CDN (Bunny.net) | Javier | Before marketing push |
| Goodreads author page (WW. & Eidon) | Javier | Pending |
| Amazon author page + publisher name | Javier | Pending |
| Editorial directories submission | Ruben | Pending |
| @soulware.editorial branded social | Ruben | Pending |
| La Emperatriz obra title | Ruben | TBD |
| La Corte author names + relatos | Ruben/Javier | TBD |
| Book cover for La Emperatriz obra | Alicia Sarel | TBD |

---

## Tizno

Separate design doc: see `TIZNO.md` in this repo.
Tizno lives inside El Umbral as a feature. Development tracked in the same Soulware Claude Project.
