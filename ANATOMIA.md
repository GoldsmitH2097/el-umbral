# ANATOMIA.md — Anatomía del Vacío, experiencia web interactiva

## Canonical design doc. Companion to CLAUDE.md — read that first.
## v2 (2026-07) — supersedes the pre-content draft. Germán delivered the full manuscript; Ruben locked the open decisions. Deltas from v1 noted inline.

---

## What this is

**Anatomía del Vacío** by Germán Ferri (El Arlequín Sin Flores) is not published as a book.
It is published as a **web-native interactive experience** at `/obras/anatomia-del-vacio/`.
The reader advances through the text one beat at a time — every line lands alone, with its
own timing, effect, and sound. A father climbs a building that will never let him reach the
ninth floor, where his daughter is suffocating. The building repeats him.

**2,901 words · ~590 beats · 10 sections** (Prólogo + eight "pisos" + Epílogo). The
manuscript is COMPLETE — not episodic. (v1 assumed chapters written over time; the
delivered text is one closed piece. v1's "el usuario desciende" became an *ascent* —
Germán wrote a building, floors, subir. The vault metaphor inverted itself.)

Key line (Octavo Piso): *"Solo existe este umbral."* — the story names the brand. This
experience is the site's dark mirror: thresholds, stairs, doors that never open.

---

## Decisions (locked 2026-07, Ruben)

| Decision | Choice | v1 said |
|---|---|---|
| Advance mechanism | **User-paced** — tap / click / space. Optional "modo trance" (auto, voiceover-synced) later. | auto-paced ("el ritmo lo controla la experiencia") — overridden |
| Voiceover | **ElevenLabs**, pre-generated audio (no runtime AI). Ruben casts the voice. | "sin narración de voz" — overridden |
| URL | Inside **`/obras/anatomia-del-vacio/`** — the obra page becomes the antechamber. | `/anatomia` — changed |
| Access | **Free** at launch. Future pieces may be Pacto-gated (members-only, even if free). Stripe/pago: shelved. | 0,99 €/capítulo via Tizno — deferred |
| Author involvement | Germán is hands-off — full creative delegation. | pending questions — all answered by the manuscript |
| Language | ES at launch. Score format is i18n-ready (`score.en.json` later + EN voiceover run). | — |

v1 answers now settled by the manuscript itself: narrative voice = first person (with
second-person "essay-voice" intrusions we style distinctly); linear, no branching; text +
audio only, no imagery; fullscreen takeover with return-to-archive at the end.

---

## Architecture

```
src/anatomia/
├── score.es.json      ← THE SCORE (Phase 0 ✅) — all content + fx/sfx/scene annotations
├── AnatomiaEngine.js  ← Phase 1 — reads score, renders beats, handles advance/effects
├── AnatomiaAudio.js   ← Phase 2 — synth ambience + SFX (Web Audio, AudioEngine patterns)
└── anatomia.css       ← Phase 1-2 — effects vocabulary as CSS
anatomia.html          ← separate Vite entry point (own bundle — main site budget untouched)
public/audio/anatomia/ ← Phase 3 — voiceover sprites (1 per floor) + timing manifest
```

**Content as data, presentation as engine.** Retuning pacing/effects = editing JSON, no code.
(Same philosophy as v1's chapter-array sketch, formalized.)

## Score format

Each beat = one reader advance. Compact, defaults implicit:

```json
{ "t": "No suena. Irrumpe.", "fx": "cut", "sfx": "timbre", "stack": true, "delay": 900 }
```

| Field | Meaning | Default |
|---|---|---|
| `t` | The text. Never reworded — Germán's words are canon. | required |
| `fx` | Presentation effect (see vocabulary) | `fade` |
| `sfx` | Sound cue | none |
| `stack` | Keep previous beats on screen (build a stanza) | `false` (replace) |
| `delay` | Min ms before advance is allowed (weight for key lines) | 0 |
| `voice` | `"void"` = essay-voice intrusions, styled distinctly (dimmer, wider tracking) | narrative |
| `scene` | Environment event (red-on, figura-on, blackout…) | none |
| `interact` | Forced interaction (`wipe` = reader drags to erase the vaho) | none |
| `id` | Anchor for floor-level mechanics (loop) | none |

Floor-level: `ambience` (synth preset), `mode` (`carta` = epilogue typewriter/letter styling),
`loop` (Quinto Piso trap: `{"toBeatId": "p5-loop-start", "times": 1}` — advancing past the
floor's last beat jumps the reader BACK once; second pass renders with subtle corruptions).
Dialogue (lines starting with `—`) auto-styled by the engine.

## Effects vocabulary (fx)

Restraint rule: ~85 % of beats are plain `fade`. Special effects fire ~40 times total.
One effect per motif — never effect soup.

| fx | What it does | Motif |
|---|---|---|
| `fade` / `cut` | Default entrance / hard instant | — |
| `cadence` | Sentences/words within the beat land sequentially | "Limpia. Silenciosa. Correcta." |
| `whisper` | Small, dim, slow | intimate intrusions |
| `slam` | Large, instant, 1-frame shake | "—¡Gabi!" |
| `clock` | 11:11 materializes, digits never advance | the clock |
| `obturar` | Letters collapse into a single black point | "Obtura." |
| `corrige` | Text appears corrupted, then snaps clean — correction as horror | "Te corrige. Te pule." |
| `friccion` | Subtle letter jitter | "Es fricción." |
| `mirror` | Text renders flipped, then normalizes | the mirror |
| `vaho` / `vaho-write` | Condensation blur / finger-written on fogged glass | the glass door |
| `blink` | 150 ms full blackout | "Parpadeo." |
| `estira` | Letter-spacing slowly stretches | impossible corridor |
| `rewrite` | Text erases and retypes itself, same words | "Se reescribe." |
| `amputada` | Word starts typing and halts mid-word: "Sof—" | language failing |
| `etiquetas` | Words render as UI label chips | "Etiquetan." |
| `comprimida` | Text compresses horizontally | compressed voice |
| `eco` | Line re-renders fading behind itself | the echo |
| `inversion` | 1-beat white flash, black text | "Blanco." |
| `replay` | Previous beat flickers back one frame | "Esto ya ha pasado." |
| `cuenta` | Numbers appear then scramble | losing count |
| `oscuridad` | Text at ~5 % opacity, barely readable | total darkness |
| `breath-in/out/stop/cycle` | Viewport scales ±1 % breathing — halts on "stop" | asthma cycle |
| `interfaz` | One beat renders in system UI font (serif brand breaks) | "interfaz" |
| `reproduce` | Line re-renders itself 3× | "Una y otra vez." |
| `acelera` | Stacked anaphora with shrinking holds | "Otra vez…" |
| `carrera` | 4-5 beats auto-fire fast (the ONE moment pace is stolen) | "Subo corriendo." |
| `desviado` | Everything shifts 1-2 px off-grid | "un milímetro desviado" |
| `umbral` | The word in Soulware amber — once | "Solo existe este umbral." |

## Scene events

`close-in` (edges darken) · `flicker` (page light palpitates) · `smoke` (canvas particle) ·
`zippo-on/off` (cursor becomes flame glow — ties to Scene 1 press-hold flame) ·
`figura-on/off/close` (silhouette at viewport edge, never acknowledged) ·
`red-on/off` (saturation flood) · `silence` (all audio cut) · `silence-swing` (only the swing creak) ·
`blackout` (floor transition) · `reflejo` (dark vignette, reader's "reflection") ·
`final` (hold black, input dead 2 s, then title card + Pacto)

## SFX vocabulary (synthesized via Web Audio — v1's procedural-audio principle holds)

`timbre` (distorted doorbell) · `tick` / `tick-stop` (clock with no tock) · `rain` · `gate` ·
`steps` · `hum` · `wind` · `gear` (sub-bass rotation) · `heartbeat-soft` / `heartbeat` (Átomo) ·
`breath-fail-soft` / `breath-fail` / `breath-in-fail` / `breath-out-fail` · `door` / `creak-door` ·
`knock` · `timbre-dead` · `mecedora` (creak loop) · `zippo` / `extinguish` · `crujido` ·
`tos` (distant cough) · `columpio` (swing creak) · `intento` (tiny failed breath — the worst sound)

The only pre-recorded audio is the voiceover. `AudioEngine.js` patterns are the base.

## Voiceover (Phase 3)

- ElevenLabs, ES male, dry + close-mic'd, whisper-adjacent. **No drama — the text dramatizes.**
- ~16.5k chars total → one-time generation, trivial cost.
- Per-beat segments packed into **one audio sprite per floor** (10 files) + JSON timing manifest.
- Reader-paced mode: advancing plays that beat's segment. Trance mode: audio drives the text.
- Toggleable; the experience is complete without it. Ruben casts the voice (3 candidates prepared).

## Accessibility & SEO

- `prefers-reduced-motion` → clean reading mode: plain text, no traps, no carrera/loop.
- Full transcript in ghost DOM (`.sr-only`) → screen readers + the story becomes indexable
  text on `/obras/anatomia-del-vacio/` (Book JSON-LD already exists for this route).
- `interact: wipe` must be tap-skippable; mobile drag works natively.

## Phases

| Phase | Deliverable | Status |
|---|---|---|
| 0 | Score markup (`score.es.json`) — full text, all annotations | ✅ 2026-07 |
| 1 | Engine + Prólogo produced end-to-end (prototype to feel) | next |
| 2 | All 10 floors, effects + synth audio complete | |
| 3 | Voiceover: casting (Ruben) → generation → sprite sync | |
| 4 | Polish: mobile, a11y, perf, the ending | |
| 5 | Launch: catalogue → `available`, sitemap/OG/GSC/Bing, Pacto email | |

## Hard rules

- **Never reword Germán's text.** The score's `t` fields are canon; only annotations are ours.
- **Restraint**: if an effect doesn't serve a motif, it's `fade`.
- **Main site's perf budget is untouchable** — separate entry point, zero shared-bundle growth.
- The reader's pace is sacred (user-paced) — stolen exactly once (`carrera`), returned immediately.
