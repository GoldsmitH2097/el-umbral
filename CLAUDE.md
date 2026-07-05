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

**EN canon (Session 10)**: The Throneless Empress · The Nameless Knight · The Shadowless Sibyl · The Flowerless Harlequin. EN slugs: `/en/empress`, `/en/knight`, `/en/sibyl`, `/en/harlequin`. Book slugs stay Spanish in both languages (proper nouns).

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
- Two variants per character on Netlify:
  - `/<slug>.mp4` — 1080p, ~979 KB (cinematic)
  - `/720/<slug>.mp4` — 720p, ~397 KB (mobile / slow / skip-intro)
- `src/js/core/videoVariant.js#pickVideoSrc()` selects between them based on:
  - `state.skippedIntro` (force 720p — skip users didn't earn 1080p)
  - `navigator.connection.saveData` / `effectiveType` (2g / slow-2g / 3g → 720p)
  - viewport ≤ 768 (mobile → 720p)
  - otherwise → 1080p
- Pillar videos init with `preload="none"` + poster `.webp` (~20 KB t=0 frame)
- `Events.on('sceneChange', {to:4}, ...)` upgrades to `preload="auto"` and re-picks src in case skip-intro flag flipped post-construction
- `IntersectionObserver` belt-and-suspenders: any pillar approaching viewport with `preload="none"` is bumped to `auto` (one-shot per pillar)
- Migrate to Bunny.net or Cloudflare R2 before any large marketing push

---

## SEO status

- **Google Search Console:** Registered ✅ Sitemap: submitted ✅
- **Bilingual indexing (NEW May 15 — Session 10):** Site is now ES + EN. Each language indexes as a separate URL set, linked by hreflang clusters. Google indexes /en/ independently and may rank both versions in their respective markets.
- **Indexed (as of May 15, 2026):** 1 of 9 ES sitemap URLs prior to EN launch. After Session 10, the sitemap has 20 URLs (10 ES + 10 EN). The 10 new EN URLs need GSC "Request indexing" to bump crawl priority.
- **Sitemap:** `/sitemap.xml` ✅ 20 URLs (10 ES + 10 EN) with bidirectional `xhtml:link hreflang` alternates. Legal pages intentionally excluded — they carry `noindex`.
- **Per-route prerendering:** ✅ `scripts/generate-og-pages.js` runs as postbuild and writes `dist/<route>/index.html` for each route in both languages with unique `<title>`, `<meta description>`, `<link rel="canonical">`, OG/Twitter tags, `<html lang>`, hreflang alternates, and optional Book JSON-LD with price/priceCurrency for merchant-listing eligibility. For EN pages, body text is also pre-translated via `translateBody()` so scrapers + first paint see English (no FOUC). Netlify serves these static files before applying the SPA catch-all.
- **Hreflang:** three layers of defense — `<link rel="alternate" hreflang>` in every prerendered `<head>` (es, en, x-default), `xhtml:link` per sitemap URL, self-pointing `<link rel="canonical">`.
- **Language preference persistence:** sync `<head>` script reads `localStorage('sw_lang')` and `location.replace()`s between `/` and `/en/` on subsequent visits so the user's choice is honoured before paint. No SEO penalty — the redirect only fires for returning visitors with an explicit selection; first crawls and direct deep-links land on the canonical URL.
- **Ghost paths:** `/read`, `/saga`, `/contact`, `/map`, `/universo`, `/thanks.html`, `/privacy`, `/terms` (+ `.html` variants) → 301 to `/` via `public/_redirects`. Remnants of a pre-Vite site that Google still crawls.
- **robots.txt:** ✅
- **JSON-LD:** Organization + 4 Book schemas with `offers.price` + `priceCurrency` + `inLanguage: "es"` (books published in Spanish even on EN routes) ✅
- **OG/Twitter meta:** ✅ with 1200×630 image, per-language `og:locale` (`es_ES` / `en_US`)
- **Favicons:** PNG 32px, 16px, Apple touch icon 180px ✅
- **Ghost DOM:** semantic h1/h2/nav/article with .sr-only ✅
- **No third-party tracking:** GA4 / GTM removed entirely (no `googletagmanager.com` script, no `dataLayer`, no cookie banner). If analytics are ever needed, prefer privacy-preserving alternatives (Plausible, Umami, Netlify Analytics).
- **Performance (last PSI run, May 14):** LCP 0.7s · FCP 0.7s · TBT ~2.1s · CLS 0 · Speed Index 0.9s · WAVE 0 errors, AIM 9.8/10. EN routes ship the same bundle + ~1 KB inline `<head>` redirect script; same perf budget expected. Worth one PSI run on `/en/` post-launch to confirm.

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
| Submit sitemap in Search Console | Javier | ✅ Done — May 2026 (re-fetched automatically; lastmod bumped 2026-05-15 with EN URLs) |
| Request indexing for 10 EN URLs in GSC | Javier/Ruben | Pending — Session 10 |
| Submit Bing Webmaster Tools | Ruben | ✅ Done — May 15. Imported from GSC; sitemap auto-imported; 10 EN URLs submitted via URL Submission (quota 90/100 left). Bing also feeds DuckDuckGo + Yahoo. |
| PSI run on /en/ (post-Session-10 deploy) | — | ✅ Done — Mobile: Perf 86/A11y 100/BP 100/SEO 100, LCP 1.3s, CLS 0. Desktop: Perf 70/A11y 100/BP 100/SEO 100, LCP 0.3s, CLS 0. Same budget as / (TBT is the cinematic intro, known constraint). |
| Goodreads author page (WW. & Eidon) | Javier | Pending — high SEO impact for EN |
| Amazon author page + publisher name | Javier | Pending — high SEO impact for EN |
| Editorial directories submission | Ruben | Pending |
| @soulware.editorial branded social | Ruben | Pending |
| La Emperatriz obra title | Ruben | Placeholder "Título Sellado" — pending final |
| La Corte author names + relatos | Ruben/Javier | TBD |
| Book cover for La Emperatriz obra | Alicia Sarel | TBD |

---

## Tizno

Separate design doc: see `TIZNO.md` in this repo.
Tizno lives inside El Umbral as a feature. Development tracked in the same Soulware Claude Project.

---

## Anatomía del Vacío

Separate design doc: see `ANATOMIA.md` (v2 — supersedes the pre-manuscript draft).
Germán's full manuscript is delivered and scored: `src/anatomia/score.es.json` (Phase 0 ✅).
Interactive line-by-line experience at `/obras/anatomia-del-vacio/` — user-paced, ElevenLabs
voiceover (Ruben casts the voice), free at launch, separate Vite entry point. Never reword
Germán's text — the score's `t` fields are canon.
