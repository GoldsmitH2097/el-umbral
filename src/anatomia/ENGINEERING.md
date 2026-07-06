# ENGINEERING.md — Anatomía del Vacío: build spec

> **Audience: AI models / future sessions building or extending this experience.**
> Read `/CLAUDE.md` (project) and `/ANATOMIA.md` (creative design) FIRST. This file is the
> technical contract. If this doc and the code disagree, the code is drifting — fix the code
> or update this doc in the same PR.

---

## 0. Invariants (violating any of these is a bug, not a choice)

1. **Never reword Germán's text.** `score.es.json` `t` fields are canon. Annotations
   (`fx`, `sfx`, `scene`, `stack`, `delay`) are ours; text is not. A validation script must
   always be able to match every beat 1:1 against the original manuscript.
2. **Main site's perf budget is untouchable.** This experience is a SEPARATE Vite entry
   (`src/anatomia.html`). The main `dist/assets/main-*.js` bundle content must not change
   when you touch anatomia code. Verify after build: main chunk hash unchanged (unless you
   deliberately edited main-site code in the same PR).
   *Naming note (Phase 1)*: switching to multi-entry renamed the main chunk `index-*` →
   `main-*` and split Vite's modulepreload polyfill into a shared 0.7 KB chunk that both
   entries `modulepreload`. One-time, content-neutral, perf-negligible — accepted 2026-07.
3. **No framework.** Vanilla JS classes, same idiom as `src/js/` (underscore-prefixed
   private methods, sparse comments stating constraints, not narration).
4. **User-paced.** The reader advances; we never advance for them. Exactly one sanctioned
   exception: `fx: "carrera"` (Octavo Piso, "Subo corriendo.") auto-fires a short burst,
   then control returns. Do not add more.
5. **Restraint.** Default is `fade`. If an effect doesn't serve a motif, it doesn't exist.
6. **Audio is synthesized** (Web Audio, following `src/js/engine/AudioEngine.js` patterns).
   The ONLY pre-recorded audio is the Phase-3 ElevenLabs voiceover.
7. **Free access, no tracking.** No analytics, no third-party scripts. localStorage only
   for progress + preferences.

---

## 1. File map

```
src/
├── anatomia.html                 # Vite entry #2 (root is src/ — see vite.config.js)
└── anatomia/
    ├── score.es.json             # THE SCORE — content + annotations (Phase 0 ✅)
    ├── ENGINEERING.md            # this file
    ├── AnatomiaEngine.js         # orchestrator: state machine, input, render, floors
    ├── effects.js                # fx implementations (beat-level)
    ├── SceneFX.js                # environment layer (vignette, red wash, figura, blackout)
    ├── AnatomiaAudio.js          # synth ambience + SFX + (Phase 3) voiceover sprites
    └── anatomia.css              # all styling + fx keyframes; brand: black/serif/amber
public/audio/anatomia/            # Phase 3: <floorId>.mp3 sprites + manifest.json
```

### Build integration

- `vite.config.js`: `root: 'src'`, so the entry is `src/anatomia.html`. Multi-page build:

```js
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'src/index.html'),
      anatomia: resolve(__dirname, 'src/anatomia.html'),
    },
  },
}
```

- Output: `dist/anatomia.html` + its own hashed chunks. The JSON score is statically
  imported → bundled into the anatomia chunk only (~60 KB raw, ~15 KB gzip — fine).
- **URL**: `public/_redirects` rewrites (200, not 301) — MUST be above the SPA catch-all:

```
/obras/anatomia-del-vacio/leer  /anatomia.html  200
/obras/anatomia-del-vacio/leer/ /anatomia.html  200
```

- `scripts/generate-og-pages.js` (postbuild) writes `dist/obras/anatomia-del-vacio/index.html`
  (the antechamber). It does not touch `/leer` — no conflict. Do not add `/leer` to the
  sitemap; `anatomia.html` carries `noindex` + `canonical` → `/obras/anatomia-del-vacio/`
  (the antechamber owns SEO; Phase 5 adds the full transcript there as ghost DOM).

---

## 2. Score format (authoritative spec)

Top level: `{ meta, floors[] }`. Floor: `{ id, title, ambience, mode?, loop?, beats[] }`.

Beat fields (all optional except `t`):

| Field | Type | Semantics |
|---|---|---|
| `t` | string | The text. Canon. Lines starting with `—` are dialogue (auto-styled). |
| `fx` | string | Presentation effect. Default `fade`. See §5. |
| `sfx` | string | Sound cue fired when the beat renders. See §7. |
| `stack` | bool | `true`: append to current stanza. Absent/false: clear stage first. |
| `delay` | ms | Input is locked for this long after render (weight). Default 0. |
| `voice` | `"void"` | Essay-voice intrusion — distinct styling (dim, tracked-out, small caps). |
| `scene` | string | Environment event fired when the beat renders. See §6. |
| `interact` | `"wipe"` | Blocks advance until gesture completes (tap-skip after 6 s). |
| `id` | string | Anchor for floor mechanics (only used by `loop.toBeatId` today). |

Floor fields:

| Field | Semantics |
|---|---|
| `ambience` | Synth preset name, crossfaded on floor entry. See §7. |
| `mode: "carta"` | Epilogue: typewriter reveal, left-aligned letter layout instead of centered. |
| `loop: {toBeatId, times}` | After the floor's LAST beat, jump back to `toBeatId` `times` times before releasing to the next floor. Re-passes render with `.repeat-glitch` corruptions. |

**i18n**: EN version = `score.en.json` with translated `t` (same beat count/annotations) +
`meta.lang = "en"`. Engine takes the score module as its only content input.

---

## 3. Engine state machine (`AnatomiaEngine.js`)

States: `entry → titlecard(floor) → playing(floor, beat) → transition → … → finale`.

```
advance():
  if now < lockUntil or state != playing or pendingInteract: return
  i = beatIndex + 1
  if i >= floor.beats.length:
    if floor.loop and loopsDone < floor.loop.times:
      loopsDone++; corrupted = true
      beatIndex = indexOf(floor.loop.toBeatId); renderBeat()   // the trap
    else:
      nextFloor()   // blackout → titlecard → first beat (or finale after epilogo)
  else:
    beatIndex = i; renderBeat()

renderBeat():
  b = floor.beats[beatIndex]
  if !b.stack: clearStage()               // fade-out old stanza, 300 ms
  el = buildBeatEl(b)                     // <p class="beat [voice-void] [dialogue] fx-…">
  stage.append(el); applyFx(el, b)        // effects.js
  if corrupted: el.classList.add('repeat-glitch')
  if b.scene: sceneFX.trigger(b.scene)
  if b.sfx:   audio.play(b.sfx)
  if b.interact: pendingInteract = startInteraction(b.interact)
  lockUntil = now + (b.delay ?? 0)
  saveProgress()                          // localStorage sw_anatomia { floorId, beatIndex }
```

### Input (one gesture = one advance, ever)

| Input | Handling |
|---|---|
| click / tap (touchend) | `advance()` — ignore if target is UI chrome (✕, mute) |
| Space, Enter, →, ↓ | `advance()` |
| wheel | accumulate `deltaY`; threshold 50, cooldown 400 ms → one `advance()` |
| Escape | exit menu overlay |

First-run hint: after 4 s idle on beats 0-2 only, fade in "toca para continuar" (tiny, dim);
never show again once the reader has advanced 3 beats (persist in localStorage).

### Progress & resume

`localStorage.sw_anatomia = { floorId, beatIndex, done: bool }`. On load with progress >
floor 0/beat 3: entry screen offers CONTINUAR (jump to saved floor's start — not mid-floor;
stanza context matters) and EMPEZAR DE NUEVO.

### Reduced motion / reading mode

`prefers-reduced-motion: reduce` → after ENTRAR render each floor as a static
`<article>` (all beats as `<p>`, void-voice styled, no traps, no carrera, no loop, no wipe).
Same content, dignified reading. This mode is also the a11y screen-reader path.

### Exit

Discreet ✕ (top-right, opacity .25). Click → brand-toned confirm ("¿Abandonar la subida?
Tu paso queda guardado.") → `location.href = '/obras/anatomia-del-vacio/'`.

---

## 4. Rendering & layout

- Stage: full-viewport black, single centered column, `max-width: 34ch`,
  `font: clamp(19px, 2.6vw, 27px)/1.9 'Times New Roman', serif; color: #d8dce0`.
- `voice: "void"`: `font-size: .72em; letter-spacing: 3px; color: #8a8a92;
  text-transform: uppercase` — the essay-voice reads as inscription, not narration.
- Dialogue (`—`): italic, natural case.
- Stacked stanzas: beats append with 0.9em gap; stage scrolls internally NEVER — if a stanza
  would overflow (piso-8 anaphora), earlier stacked beats compress opacity (oldest fades to
  .25) rather than scrolling. Max visual stack ≈ 8 lines; beyond that, oldest lines fade out
  entirely. The reader never scrolls; the page is a chamber, not a document.
- `mode: "carta"` (epilogue): left-aligned, `max-width: 52ch`, smaller (0.85em), typewriter
  reveal per beat, all beats stack (letter accumulates) with slow scroll-follow allowed —
  the single exception to no-scroll, because a letter is a document.
- Floor title cards: floor `title` centered, small caps, `letter-spacing: 8px`, dim; 2.2 s
  or tap to skip.

---

## 5. Effects implementation table (`effects.js` + `anatomia.css`)

Implementation legend: **CSS** = class + keyframes only. **JS** = DOM manipulation required.

| fx | Impl | Spec |
|---|---|---|
| `fade` | CSS | opacity 0→1, 900 ms ease |
| `cut` | CSS | instant, no transition |
| `whisper` | CSS | 0.8em, opacity→.55, 1500 ms fade |
| `slam` | CSS | 1.3em, instant + 1-frame ±2px shake (2 keyframes, 120 ms) |
| `cadence` | JS | split `t` on sentence ends (`. ` `? ` `! `); if 1 sentence, split words. Wrap in spans, stagger fade 350 ms apart |
| `clock` | CSS+JS | digits `font-variant-numeric: tabular-nums`, faint amber glow; colon does NOT blink (pointedly static) |
| `obturar` | JS | render → hold 500 ms → letters translate+scale into center point (each span animated to the line's midpoint), leaving a 3px dot that persists until stage clear |
| `corrige` | JS | render with ~30 % of glyphs swapped for random ones (`▚?#$&`), then correct in 3 steps (400/650/900 ms) to clean text — correction as horror |
| `friccion` | CSS | ±0.5px translate jitter, 6 iterations over 1.8 s, then settle |
| `mirror` | CSS | `transform: scaleX(-1)` on render → normalize at 700 ms |
| `vaho` | CSS | blur(6px) + opacity .4 → blur(1.5px)/op .85 over 1.8 s — condensation look |
| `vaho-write` | JS+CSS | large (1.4em), `letter-spacing: 6px`, chars appear sequentially 90 ms apart with blur(3px), like finger-writing; slight downward smear (text-shadow) |
| `blink` | JS | full-viewport black overlay 150 ms (scene layer), then text `cut` |
| `estira` | CSS | `letter-spacing` animates 0→5px over 4 s while visible |
| `rewrite` | JS | type in, hold 400 ms, delete char-by-char (18 ms/char), retype same text |
| `amputada` | JS | typewriter until the word "Sofía" is half-typed → "Sof—" freeze 600 ms → rest of beat text never completes; next beat proceeds normally |
| `etiquetas` | JS | split on `" "`-separated quoted tokens (or `. `-separated words for "Madre. Padre. Hija."), wrap each in `.chip` (border, radius 3px, mono-ish tracking, padding 2px 10px) — words as UI labels |
| `comprimida` | CSS | `transform: scaleX(.82)`; slightly clipped feel; no correction |
| `eco` | JS | clone the line 2× behind itself (translateY 4/8 px, opacity .3/.12, blur 1/2 px) |
| `inversion` | JS | scene layer flashes white 400 ms; this beat renders black-on-white during the flash, then re-renders normal |
| `replay` | JS | previous beat's element flickers back at opacity .5 for 130 ms, twice |
| `cuenta` | JS | render numbers; after 600 ms each digit swaps to a wrong one (7→4→9…), 3 swaps, never settles until stage clear |
| `oscuridad` | CSS | text opacity .06 — barely legible, force the lean-in. Persists for stacked beats until stage clear |
| `breath-in` / `breath-out` | JS | stage container scales to 1.012 / 0.988 over 1.6 s (ease-in-out), synced with beat render |
| `breath-stop` | JS | halt any running breath transform at current value — freeze 400 ms — snap back over 900 ms |
| `breath-cycle` | JS | one full in-hold-out cycle, 4 s, while beat visible |
| `interfaz` | CSS | `font-family: system-ui, -apple-system, sans-serif` — the ONLY beat ever rendered outside the serif. Do not reuse |
| `reproduce` | JS | render → wipe → re-render, 3 total, 700 ms apart, identical each time |
| `acelera` | JS | stacked beats: each successive render halves its fade duration (900→450→225→110 ms) |
| `carrera` | JS | on render, auto-advance the next 4 beats at 550/450/350/300 ms intervals (input ignored during burst); control returns after |
| `desviado` | CSS | stage container `translate(1.5px, -1px) rotate(0.15deg)` — everything a millimeter wrong; persists until floor end |
| `umbral` | CSS | the word "umbral" wrapped and colored `#c8922a` (brand amber), rest normal. Used ONCE |
| `repeat-glitch` (modifier) | CSS | on loop re-pass: every ~4th beat gets ±1px letter jitter + one duplicated word overlapped at opacity .15 |

`interact: "wipe"`: canvas overlay covering the vaho-write text; pointerdown+move erases
(`globalCompositeOperation: destination-out`, 40 px brush). At ≥60 % erased → complete →
advance unlocks. After 6 s without gesture, show hint + allow tap-through (a11y/mobile).

---

## 6. Scene events (`SceneFX.js`)

Layers (z-order, all `position: fixed`, `pointer-events: none`):
`#redwash` < `#figura` < `#smoke` (canvas) < `#vignette` < `#blackout` < `#whiteflash`.

| scene | Spec |
|---|---|
| `close-in` | vignette radial gradient edges → opacity .55 over 3 s; persists |
| `flicker` | page light flicker: brief opacity dips of a full-screen black overlay at irregular 3-7 s intervals (bombilla enferma); persists until floor end |
| `smoke` | minimal canvas particles (≤ 40, 24 fps): thin blue-grey wisps rising, bending midway; kill on floor end |
| `zippo-on/off` | cursor becomes a warm glow: radial-gradient div (140 px) following pointer (lerp 0.12); on mobile: fixed soft glow bottom-center. `off` → extinguish over 300 ms |
| `figura-on` | silhouette div (tall narrow black shape, white oval face hint, opacity .07) at a random viewport edge; NEVER acknowledged by other systems, never centered |
| `figura-close` | move to 60 % viewport height behind text, opacity .12 |
| `figura-off` | fade out 2 s |
| `red-on/off` | `#redwash` (mix-blend-mode: multiply, #4a0000) → opacity .5 over 2.5 s / off over 2 s |
| `silence` | AnatomiaAudio: duck ALL buses to 0 over 800 ms (incl. ambience) |
| `silence-swing` | duck all except `columpio` loop |
| `blackout` | full black 800 ms in, clear stage, hold 400 ms — used by floor transitions |
| `reflejo` | vignette + a barely-there vertical reflection smear (CSS gradient) 4 s |
| `final` | hold black 2 s with input dead → title card ("ANATOMÍA DEL VACÍO / Germán Ferri / SOULWARE") → after 3 s fade in: VOLVER AL ARCHIVO (→ `/obras/anatomia-del-vacio/`) + El Pacto invitation (mailto-free capture module reused from Tizno markup, or plain link to `/#contact`). Set `done: true` in progress |

---

## 7. Audio (`AnatomiaAudio.js`)

Follow `src/js/engine/AudioEngine.js` patterns: single `AudioContext` created lazily,
**resumed inside the ENTRAR click handler** (iOS unlock — the button IS the gesture),
`navigator.audioSession.type = 'playback'` when available, Page Visibility suspend/resume
with `_restartNoiseSources()` (iOS drops looping BufferSourceNodes — see CLAUDE.md).

Buses: `master → { ambienceGain, sfxGain, voGain }`. Mute toggle drives `master`.

### Ambience presets (crossfade 2 s on floor entry)

| Preset | Recipe |
|---|---|
| `void-static` | brown noise → lowpass 220 Hz, gain .015 + sine 38 Hz drone, gain .012, LFO ±3 Hz/9 s |
| `casa-madrugada` | near-silence: brown noise lowpass 150 Hz gain .008 + very sparse tick bus |
| `vestibulo-lluvia` | rain = white noise → bandpass 900 Hz Q .4, gain .02 + wind gusts (filtered noise, slow LFO) |
| `corredor` | wind only, tighter (bandpass 500 Hz), gain .012 + occasional distant knock (sparse scheduler) |
| `escalera-profunda` | drone 44 Hz + gear sub-rotation: sine 31 Hz AM-modulated at 0.4 Hz, gain .014 |
| `escalera-espiral` | same + periodic creak scheduler every 9-14 s |
| `interior-humedo` | brown noise lowpass 300 Hz + drip scheduler (short sine pings, random pan) |
| `casa-exacta` | `casa-madrugada` recipe + barely audible 50 Hz mains hum (the house "functions") |
| `edificio-vivo` | breathing bed: filtered noise swell/release cycle 7 s, gain .018 |
| `silencio-residual` | almost nothing: 30 Hz sine gain .006 |

### SFX (synthesized, one function per cue)

`timbre` sawtooth burst 320 Hz, hard clip, 900 ms · `tick` 2 kHz filtered click (NO answering
tock — schedule one, never two) · `tick-stop` one tick then dead stop of ambience tick bus ·
`rain` (bus swell) · `gate` metal: square 180 Hz + noise burst · `steps` 4 filtered thumps ·
`hum` bulb: 100 Hz sine + flicker AM · `wind` (bus swell) · `gear` 31 Hz sub swell 3 s ·
`heartbeat-soft`/`heartbeat` double-thump 55 Hz, gain .02/.05 · `breath-*` filtered noise
swells shaped by ADSR that CUTS mid-release (the failure) · `door`/`creak-door` bandpass-swept
noise 400→900 Hz over 700 ms · `knock` 3 damped thumps · `timbre-dead` `timbre` recipe at
half gain, lowpassed to dullness · `mecedora` looped 2-part creak (bandpass sweep up/down,
2.8 s period) — loop while flagged · `zippo` click + brief noise flare · `extinguish` reverse
flare 200 ms · `crujido` low ratchet burst · `tos` two bandpass barks 300 Hz, tiny, distant
(gain .015, heavy lowpass) · `columpio` slower mecedora variant (3.6 s period) · `intento`
**the worst sound**: a breath-in swell that clips to silence at 70 % — 400 ms, gain .03

### Voiceover (Phase 3 — do not build before Ruben casts the voice)

- Generation: ElevenLabs TTS, one request per beat (≈ 615), stitched per floor into
  `public/audio/anatomia/<floorId>.mp3` + `manifest.json`:
  `{ "<floorId>": [[startSec, durSec], …] }` indexed by beat.
- Playback: fetch floor sprite on floor entry (`fetch` → `decodeAudioData`), on each beat
  `start(0, start, dur)` through `voGain`. Toggle VOZ: ON/OFF in entry screen + exit menu.
- Trance mode (post-launch): auto-advance driven by segment end + beat `delay`.

---

## 8. Entry screen & chrome

- Entry: title (letter-spacing 10px) / "Germán Ferri · SOULWARE" / three dim lines:
  "Se recomienda auriculares." · "Avanzas tú. Nadie te empuja." · "No se entra aquí. Se es
  absorbido." / button **ENTRAR** (brand border button). Click = audio unlock + fade to
  Prólogo title card.
- Resume state adds **CONTINUAR — <FLOOR TITLE>** above ENTRAR (which becomes "EMPEZAR DE NUEVO").
- Chrome (opacity .25, hover .7): ✕ exit (top-right) · sound toggle (top-left) ·
  floor indicator (bottom-center: "PRÓLOGO" … tiny, tracked-out).
- `<title>Anatomía del Vacío — Soulware</title>`, `<meta name="robots" content="noindex">`,
  `<link rel="canonical" href="https://soulware.live/obras/anatomia-del-vacio/">`,
  `<html lang="es">`, theme-color #020202, brand favicons.

---

## 9. Phase checklist & acceptance criteria

| Phase | Scope | Acceptance |
|---|---|---|
| 0 ✅ | `score.es.json` | 615/615 lines match manuscript exactly; loop ref valid (validated 2026-07) |
| 1 ✅ | Entry + engine + Prólogo | Shipped + feel pass (cross-fades, pre-laid stanzas, typographic scale, mono void-voice register, per-floor palettes incl. bone-white epilogue, dust field, drone ambience) |
| 2 ✅ | All floors + full fx/sfx/ambience | Full §5 fx + §6 scenes + §7 SFX/ambience recipes. Extras shipped: tab title becomes 11:11 on clock beats; cursor becomes the zippo flame (cursor:none + glow) on floors 4-5; piso-8 titlecard flashes "NOVENO PISO" for 130 ms before correcting; paper-grain overlay on the carta epilogue; mecedora/columpio creak loops drift in stereo. Wipe requires the vaho beat and "Paso el dedo." to share a stanza (stack:true) — the wipe hooks the .fx-vaho-write element in the live stage |
| 3 | Voiceover | Ruben casts voice from 3 candidates; sprites + manifest generated; VOZ toggle; sync verified on iOS Safari |
| 4 | Polish | mobile pass; a11y audit (reduced-motion, keyboard-only, screen reader via antechamber transcript); PSI on the antechamber unchanged; cross-browser (Safari/iOS focus) |
| 5 | Launch | antechamber "ENTRAR" CTA wired in StateManager CATALOGUE (status → `available`, buyUrl → `/obras/anatomia-del-vacio/leer`); full transcript ghost DOM added to antechamber prerender; Pacto announcement email; HANDOVER/CLAUDE docs updated |

### Known traps for future builders (inherited from main-site scar tissue — see CLAUDE.md)

- iOS: `AudioContext.resume()` + graph build must be synchronous inside the user-gesture
  handler; looping sources need restart after visibility resume.
- Don't use `opacity: 0` to hide fixed-position layers that have fixed children — use
  `display: none` (main site learned this the hard way).
- `touch-action: none` only on the stage, never on `body`.
- Canvas (smoke): 1:1 CSS pixels, no DPR scaling; cap at 24 fps; kill rAF when tab hidden.
- Netlify `_redirects`: specific rules BEFORE the `/*` catch-all or they never match.
- The prerender postbuild rewrites `dist/obras/anatomia-del-vacio/index.html` — if you need
  to touch the antechamber's HTML, do it in `scripts/generate-og-pages.js`, not in `dist/`.
