# El Umbral — Crónicas de la Oscuridad

**Live site:** https://el-umbral.netlify.app  
**Repository:** https://github.com/GoldsmitH2097/el-umbral  
**Stack:** Vite + Vanilla JS (ES Modules) + CSS  
**Deploy:** Netlify, auto-deploy on push to `main`

---

## What This Is

A cinematic dark fantasy interactive web experience. Users "earn" the content by completing three ritual scenes before reaching the archive. No framework, no VDOM, no overhead — pure canvas, Web Audio API, and DOM.

---

## Architecture

```
el-umbral/
├── public/                         # Static assets — copied verbatim to dist root
│   ├── reina-sin-corona.mp4
│   ├── caballero-sin-nombre.mp4
│   ├── sortilega-sin-sombra.mp4
│   ├── arlequin-sin-flores.mp4
│   ├── og-image.jpg                # 1200×630 — Open Graph / Twitter card preview
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── index.html                  # Ghost DOM (SEO) + scene scaffolding + entry point
│   ├── css/
│   │   ├── global.css              # Reset, .sr-only, touch-action, scene 2/3 base
│   │   ├── canvas.css              # Scene 1: gallery, ambient light, UI overlay
│   │   ├── archive.css             # Scene 4/5: pillar grid, reading view, pacto modal
│   │   └── typography.css          # Drop cap, read-body hierarchy
│   └── js/
│       ├── main.js                 # Entry point: wires all modules, handles input
│       ├── core/
│       │   ├── StateManager.js     # Single source of truth: state object, CHARACTERS data, event bus
│       │   └── Router.js           # History API router, deep link bypass
│       ├── engine/
│       │   ├── AudioEngine.js      # Web Audio API: cave ambience + Cm7 leitmotif
│       │   └── VisualEngine.js     # Canvas loop: flame, smoke, dust, firefly particles
│       └── ui/
│           └── ArchiveDOM.js       # Archive grid builder, reading view, lazy video loading
└── dist/                           # Production build output (git-ignored, Netlify serves this)
```

---

## Scene Map

| Scene | Description | Entry Condition |
|-------|-------------|-----------------|
| 1 | **The Tomb** — Hold mouse/touch to ignite flame. Cycle through 4 characters. | Boot |
| 2 | **Voces del Umbral** — Hunt 4 hidden whispers in the dark with a firefly. | After all 4 characters lit |
| 3 | **The Awakening** — Binaural chord spins, white flash. | After all 4 whispers found |
| 4 | **The Archive** — Main editorial grid, 4 character pillars. | Click ADENTRARSE |
| 5 | **Reading** — Full lore article for selected character, blurred bg video. | Click any pillar |

---

## Key Design Decisions

### Why Vanilla JS, not React/Vue
The canvas particle loop runs at 60fps with hundreds of calculated particles. React's VDOM reconciliation causes garbage collection pauses that visibly stutter the flame. Vanilla JS with a direct `requestAnimationFrame` loop gives deterministic performance.

### Why Vite, not Webpack/Parcel
91ms production builds. Zero config for ES modules. Native `import` support means the modular file structure works in dev without a bundler step. Rollup under the hood handles tree-shaking properly.

### Why CSS custom properties for the flame mask
The gallery reveal uses `mask-image` with `radial-gradient` driven by `--x`, `--y`, `--radio-interior`, `--radio-exterior` CSS vars. These are updated every frame by VisualEngine. This offloads the compositing to the GPU rather than redrawing a canvas overlay — smoother on low-end hardware.

### Why the Ghost DOM uses `.sr-only` not `display:none` or `aria-hidden`
- `display:none` — Googlebot ignores it entirely, defeating the SEO purpose
- `aria-hidden="true"` — hides from screen readers, defeating accessibility
- `.sr-only` (clip-path trick) — visually invisible, but fully in the DOM, readable by both Googlebot and screen readers. Includes `<a href="/reina">` etc. so Google crawls the deep-link URLs.

### Why `touch-action: none` is scoped to intro layers only
Originally on `body, html` — this blocked native scroll on the archive (Scene 4) on all mobile devices. Moving it to `#gallery-container, #scene-2, #scene-3, #vfx-canvas` preserves the swipe-lock during the canvas intro while restoring normal scroll in the archive.

### Why video paths are root-relative (`/reina-sin-corona.mp4`)
Bare relative paths like `reina-sin-corona.mp4` resolve correctly from `/` but break on deep-linked URLs like `/reina` where the browser looks for `/reina/reina-sin-corona.mp4`. Root-relative paths work from any URL depth.

### The Cm7 Leitmotif
The four characters map to the four notes of a C Minor 7th chord:

| Character | Note | Frequency |
|-----------|------|-----------|
| La Reina | C3 | 130.81 Hz |
| El Caballero | Eb3 | 155.56 Hz |
| La Sortílega | G3 | 196.00 Hz |
| El Arlequín | Bb3 | 233.08 Hz |

Scene 1: one isolated note plays on ignition. Scene 2: same note plays on whisper discovery. Scene 3: all four simultaneously with a stereo LFO accelerating from 0.5Hz to 12Hz — the room "spins" before the whiteout.

### Video Lazy Loading Strategy
- **Scene 1**: Only `characters[0].src` loaded on boot. Characters 1–3 injected by `VisualEngine._loadCharacterVideo()` at swap time.
- **Archive pillars**: `preload="none"`, `data-src` stores the real path. Actual `src` injected by `ArchiveDOM` on first `mouseenter`.
- **Reading bg video**: `preload="none"`. `src` injected only when `openReading()` is called.

### Performance Kill-Switches
1. **Scene culling** — `VisualEngine._tick()` hard-returns when `activeScene >= 4`. Canvas clears once, RAF loop keeps running but does zero work.
2. **Page Visibility API** — `AudioEngine` suspends/resumes `AudioContext` on `visibilitychange`. Browser also throttles RAF on hidden tabs automatically.
3. **Wind interval cleanup** — `setInterval` for wind frequency modulation is captured in `this._windInterval` and cleared via `clearInterval` when entering the archive.

---

---

## Commit Message Convention

Every commit follows this format:

```
<type>(<scope>): <what changed, in plain English>
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or behaviour visible to users |
| `fix` | Bug fix |
| `seo` | Meta tags, ghost DOM, sitemap, robots.txt, canonical URLs |
| `perf` | Performance improvement (kill-switches, lazy loading, etc.) |
| `style` | CSS-only changes, no logic touched |
| `refactor` | Code restructure, no behaviour change |
| `content` | Lore text, character descriptions, copy changes |
| `chore` | Build config, dependencies, tooling |

### Scopes (optional but useful)

`audio` `canvas` `scene1` `scene2` `scene3` `archive` `reading` `router` `seo` `mobile` `css` `deps`

### Examples — Good vs Bad

```
# Good — specific and scannable
fix(mobile): remove touch-action:none from body, scope to intro layers only
feat(audio): add iOS Safari audioCtx.resume() on every touch event
seo(ghost-dom): replace aria-hidden with .sr-only, add anchor links for crawling
fix(video): use root-relative paths to prevent 404 on deep-linked URLs
perf(canvas): hard-return in animation loop when activeScene >= 4
style(archive): add 102% video overbleed to hide sub-pixel white-line artifact
chore(deps): update vite to 5.2.0
content(reina): expand lore paragraph 2 with new backstory detail
fix(router): handle direct /arlequin URL without crashing on audio init

# Bad — useless in a git log
update
fix bug
changes
wip
test
```

### Branch strategy (when working on larger changes)

```
main          ← always deployable, Netlify auto-deploys from here
feature/xxx   ← new scenes, major features
fix/xxx       ← isolated bug fixes
seo/xxx       ← SEO-specific work
```

For this project, committing directly to `main` is fine for small changes. Use a branch only if a change might take multiple sessions to complete.

---

## Rollback

### Option 1 — Netlify (fastest, no terminal needed)
Go to https://app.netlify.com/projects/el-umbral/deploys → click any previous deploy → **Publish deploy**. Live in ~10 seconds.

### Option 2 — Git revert (clean history)
```bash
cd /Users/ruben/Developer/el-umbral
git log --oneline          # find the commit to go back to
git revert HEAD            # undo the last commit, creates a new commit
git push                   # triggers Netlify redeploy
```

### Option 3 — Restore a specific file from history
```bash
git log --oneline src/js/engine/AudioEngine.js   # find commit where file was good
git checkout <commit-hash> -- src/js/engine/AudioEngine.js
git commit -m "fix(audio): restore AudioEngine from <commit-hash>"
git push
```

---

## Adding a Character

1. Add entry to `CHARACTERS` array in `src/js/core/StateManager.js`
2. Add `<article>` with `<a href="/slug">` to Ghost DOM in `src/index.html`
3. Add corresponding frequency to `CHAR_FREQUENCIES` in `AudioEngine.js`
4. Add whisper `<div>` to Scene 2 in `src/index.html`
5. Drop `.mp4` video file into `/public/`
6. Add URL to `public/sitemap.xml`
7. Run `npm run build` — verify it compiles
8. Commit: `feat(characters): add [name] as character 5`

---

## Local Development

```bash
cd /Users/ruben/Developer/el-umbral
npm install          # first time only
npm run dev          # dev server at http://localhost:5173 with HMR
npm run build        # production build → /dist
npm run preview      # preview the production build locally
```

---

## Deploy Checklist

Before pushing a significant change:

- [ ] `npm run build` completes without errors
- [ ] Tested in Chrome desktop
- [ ] Tested on mobile (or Chrome DevTools device mode)
- [ ] Commit message follows the convention above
- [ ] `git push` → check Netlify deploy log completes green

---

*Last updated: March 2026*
