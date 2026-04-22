# HANDOVER.md — El Umbral / Soulware
*Última actualización: 22 Abril 2026*

---

## Estado del sitio

**Live:** https://soulware.live  
**Último commit:** `5d8eac5` — feat(analytics): GA4 tag  
**Build:** ✅ Limpio  
**Deploy:** ✅ Netlify auto-deploy activo

---

## Sesión 22 Abril 2026 — Lo que se hizo

### Copy (brief Susana Azcona)
- Lore actualizado por arquetipo (Emperatriz, Caballero, Sortílega, Arlequín)
- Anatomía del Vacío: desc/vision con copy de Susana ("No entras a leer un relato...")
- Mismo cover para tapa blanda y dura de Pulso del Núcleo
- ISBN 978-8409810345 añadido al JSON-LD de Pulso

### Bugs mobile corregidos
- Overlay de personaje: animación de apertura rota (RAF fix)
- Tabs Autor/Libros invisibles (`.reading-tabs` ocultaba también `.reading-tabs--mobile`)
- `touchend preventDefault` bloqueaba el scroll-snap horizontal del carousel

### Desktop reading view
- `max-width: 650px` → `1100px` (era demasiado estrecho para el grid de 2 columnas)

### Route metadata
- Router.js actualiza title/og:title/og:description/og:url/canonical por personaje
- Compartir `/emperatriz` en WhatsApp muestra datos del personaje, no homepage genérica

### Google Search Console ✅
- Propiedad `https://soulware.live/` verificada vía HTML file
- Archivo `google8ac032f1f6add1da.html` en `/public/` (mantener siempre)
- Sitemap ya estaba submitido y funcionando: 8 URLs, status Success
- DNS TXT de Google añadido en Netlify (no necesario para esta propiedad pero sin daño)

### Google Analytics 4 ✅
- Propiedad: **Soulware** | Measurement ID: **G-VC5QW7C1CQ**
- Timezone: Spain (GMT+02:00) | Moneda: Euro
- Industry: Books & Literature | Objectives: Drive sales + Web traffic
- Tag añadido al `index.html` — tracking activo desde ahora
- Para añadir a Javier: GA Admin → Property access management → Add users

---

### Hito principal: Canvas destination-out
El refactor más importante del día. La arquitectura de spotlight pasó de:
- CSS mask-image sobre vídeo en reproducción (CPU, mata hardware acceleration)
A:
- Canvas `destination-out`: pinta negro, borra agujero transparente → vídeo se ve por debajo (GPU puro)

Esto resolvió el 1fps, el stuttering, y el "medio apagado" de la llama.

### Commits del día (newest first)
```
cb7f7e1  docs: AUDIT_BRIEF_V2.md — updated audit prompt for external LLMs
27b514d  fix: tizno-eyes container CSS was missing
6e32f1b  fix: destination-out canvas spotlight, audio sizzle, remove CSS masks
f42b430  fix: totalis libertas overflow, mobile clicks, 60fps physics, layout
de4eac7  fix: audio silence on archive, faint line, logo color, anthology centered
f780a7e  fix(critical): unclosed CSS comment hiding reading-view, btn-volver, all modals
9a3080d  perf+fix: LERP covers, smoke sprite, footer, mobile, covers
b6c22a5  perf+fix: smoke cap, safari acepto ghost, tizno overhaul, vertical lines
```

---

## Arquitectura actual — referencias rápidas

### Canvas Scene 1 (The Tomb)
```
z-index 0: #gallery-container   — video, sin CSS mask, GPU hardware-accelerated
z-index 1: #char-text           — nombre/desc personaje, revelado por agujero canvas
z-index 3: #vfx-canvas          — negro → destination-out → glow → partículas
z-index 5: #ui                  — instrucción, siempre visible
z-index 6: #umbral-btn
```

VisualEngine ya NO usa CSS vars para el spotlight:
- `this._radioInt`, `this._radioExt`, `this._intensidad` → instance vars, puro canvas
- Solo `--x` y `--y` siguen en CSS (para `#scene-2-light`)

### Archive Scene 4
```
.archive-col = 1 columna por arquetipo (pillar video + libros)
Desktop: 4 columnas, hover expande
Mobile: scroll-snap horizontal, 50dvh video / books naturales abajo
```

---

## AUDIT RESULTS — 3 LLMs (9 Abril 2026)

### Consenso de los 3 (Claude + Gemini + GPT)

1. **Video CDN** — Bunny.net. 4x2.5MB en Netlify con `max-age=0,must-revalidate`.
   No caching. Re-valida en cada visita. Prioridad máxima antes de cualquier marketing push.

2. **Email capture** — Ninguno. La ausencia de captación de emails es el mayor
   error de negocio. En Tizno drawer. Lenguaje en universo. "Firma el pacto."

3. **TBT desktop sigue elevado** — Mejoró mucho (de 18,790ms a ~200-600ms estimado).
   Pero RAF loop en Scenes 1-3 sigue bloqueando main thread. Fix final: OffscreenCanvas worker.

4. **Anatomía del Vacío** — "El placeholder más cool de internet" (GPT). Necesita más.
   Gemini: glitch teaser VHS + acorde disonante en hover. No dejar solo "En preparación".

### Hallazgos únicos de Claude (código)

- `cursor: crosshair !important` en `*` es demasiado agresivo. Necesita `!important`
  en cursor:none para la llama. Considerar scope a `body` o scene containers.
- `user-select: none` en body: hostil en reading view. Aflojar en `.reading-content`
  y `.tizno-panel` donde el usuario puede querer copiar texto.
- **Cache headers de vídeo**: `max-age=0,must-revalidate` — sin CDN, re-valida 2.5MB
  en cada visita. Aunque sea con Netlify: añadir `Cache-Control: max-age=2592000` en headers.
- **`<lastmod>` falta en sitemap**. Google usa lastmod, ignora changefreq/priority.
- **ISBN falta en JSON-LD de Pulso del Núcleo**. Añadir si se tiene ISBN-13.
- **Filamentos: offer sin `url` ni `seller`** en JSON-LD. Añadir antes del lanzamiento.
- `touch-action: none` en múltiples scene elements — verificar no bloquea scroll en Scene 4.

### Hallazgos únicos de Gemini (arquitectura)

- **Smoke glitch diagnosticado**: Dos causas posibles:
  1. Bounding box clipping — el gradiente radial toca el borde del OffscreenCanvas.
     Fix: añadir 15% padding al sprite canvas.
  2. Sub-pixel rendering jitter — coords float a drawImage.
     Fix: integer coords con bitwise OR: `ctx.drawImage(sprite, x|0, y|0)`
- **Cookie banner: NO construir**. Bajo AEPD "Strictly Necessary" clauses,
  sin analytics, sin tracking pixels, sin cookies de terceros → legalmente exento.
  Un banner rompería la atmósfera sin necesidad legal real.
- **Native Web Share API**: `navigator.share()` en reading view. Botón "Propagar Visión".
  Abre share sheet nativo iOS/Android con deep link del personaje. Zero clutter visual.
- **Stateful intro bypass**: `localStorage.setItem('hasCrossed','true')` cuando llega al archivo.
  En visitas posteriores: texto sutil "[ Adentrarse al Archivo ]" para skip.
- **Cinematic e-commerce handoff**: Antes de redirect a Amazon/Stripe, fade a negro
  con "Abriendo pasaje seguro..." (800ms). Evita el corte a white Amazon.
- **prefers-reduced-motion CSS**: Añadir global override además del JS skip:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  ```

### Hallazgos únicos de GPT (negocio/UX)

- **Route-specific metadata sin verificar**: ¿Las URLs `/emperatriz`, `/caballero` etc.
  sirven metadata específica (title, og:image, canonical, twitter:card)?
  Si todas devuelven el mismo shell, SEO de personajes es débil.
- **Camino de compra un beat demasiado sutil**: "La atmósfera es correcta. La oscuridad
  no es un rasgo de personalidad, es un impuesto." Añadir una frase editorial clara
  cerca del header del archivo: qué es Soulware, qué pueden hacer ahora.
- **Kill all non-essential work after Scene 3, hard**: El archivo es la página de dinero.
  Cuando el usuario llega, el sitio debe comportarse como experiencia de contenido.
  No como benchmark intentando impresionar a una GPU.
- **Mecanismo de retorno**: Fragmento semanal, nota de Tizno con timestamp, teaser
  de siguiente descenso. Algo que dé valor a visitas repetidas.
- **Anatomía del Vacío "coolest placeholder on the internet"** — Misma recmendación
  que Gemini pero más contundente. La tarjeta de Arlequín necesita presencia.

---

## BACKLOG PRIORIZADO (para mañana)

### P0 — Bugs abiertos

| Bug | Causa | Fix |
|-----|-------|-----|
| Smoke glitch menor | Sprite bounding box o sub-pixel coords | 15% padding en sprite OffscreenCanvas + `x\|0` en drawImage |
| Route metadata específica | SPA devuelve mismo shell para todos los slugs | Actualizar title/og:image/canonical en cada deep link route |

### P1 — Performance

| Item | Impacto | Responsable |
|------|---------|-------------|
| Video CDN (Bunny.net) | Eliminará 10MB sin CDN | **Javier** — subir 4 MPs y enviar URLs |
| Cache headers vídeo Netlify | Inmediato: añadir `max-age=2592000` aunque sin CDN | Claude — netlify.toml |
| OffscreenCanvas worker | TBT desktop → 0ms | Claude — 2-3h trabajo |
| prefers-reduced-motion CSS | Accesibilidad + WCAG | Claude — 5 min |

### P2 — SEO quick wins

| Item | Fix |
|------|-----|
| `<lastmod>` en sitemap | Añadir fechas reales (o fecha de build) |
| ISBN en JSON-LD de Pulso | Si Javier tiene ISBN-13, añadir |
| Filamentos offer: url + seller | Rellenar antes del 12 Mayo |
| cursor: crosshair scope | Cambiar de `*` a `body` + scopes específicos |

### P3 — Features nuevas (consenso de 3 auditorías)

**Email capture en Tizno** (MÁXIMA PRIORIDAD de features)
- Un input email en el drawer: "Firma el pacto. Recibe los susurros del Umbral."
- Antes del formulario de contacto
- Netlify Forms (sin JS extra, built-in spam protection)
- Lista: lanzamientos, Anatomía del Vacío, fragmentos

**Stateful intro bypass**
- localStorage check en page load
- Si `hasCrossed === 'true'`: mostrar link sutil al fondo de Scene 1 tras 2s
- "[ Adentrarse al Archivo ]" — no eliminar la intro, solo ofrecer skip

**Native Web Share API en reading view**
- Botón amber: "Propagar Visión"
- `navigator.share()` → deep link + quote del personaje
- Fallback: copy to clipboard

**Cinematic e-commerce handoff**
- Al clicar "Comprar en Amazon": fade negro → "Abriendo pasaje seguro..." → redirect
- Mantiene atmósfera antes del corte a Amazon blanco

**Anatomía del Vacío teaser**
- En hover/tap de la tarjeta: glitch VHS + acorde disonante (Web Audio)
- Cambia "En preparación" por algo que provoque

### P4 — Pendiente de Javier

| Item | Status |
|------|--------|
| Google Search Console — submit sitemap | **URGENTE** — sin esto Google no indexa |
| Video CDN (Bunny.net) — upload + URLs | Antes de cualquier marketing |
| ISBN-13 de Pulso del Núcleo | Para JSON-LD |
| Goodreads author page (WW. & Eidon) | Backlink de alta DA |
| Amazon author page + publisher name | Backlink + discoverability |

### P5 — Pendiente de Rubén/equipo

| Item | Status |
|------|--------|
| Anatomía del Vacío: sinopsis + Cap.1 borrador | Esperando a Germán |
| Título de la obra de Emperatriz (Alicia Sarel) | TBD |
| Relatos de Totalis Libertas | TBD |
| Arquetipo para Filamentos en reading view | TBD |

---

## Cómo arrancar mañana

```
"Lee CLAUDE.md y HANDOVER.md y dime en qué estamos."
```

**Primera prioridad recomendada para mañana:**
1. Smoke glitch fix (15min)
2. prefers-reduced-motion CSS (5min)
3. Cache headers netlify.toml para vídeos (10min)
4. Email capture en Tizno (30min)
5. Route-specific metadata (45min)

---

## Decisiones técnicas importantes — NO revertir sin razón

- **No React** — canvas 60fps necesita main thread limpio
- **Canvas destination-out** para spotlight — no volver a CSS mask en video
- **Smoke sprite OffscreenCanvas** — no volver a createRadialGradient por frame
- **position:fixed en firefly container** — no volver a absolute dentro de main-site
- **display:none (no opacity:0) en overlays** — opacity:0 no oculta fixed children en Safari
- **Root-relative video paths** `/name.mp4` — bare paths rompen deep links
- **touch-action scoped** solo a intro layers — preserva scroll móvil en archive

---

*Sesión completa: ~14 horas de trabajo continuo. El sitio está en buen estado.*
*El audio, la llama, el archivo, mobile, y la estructura general funcionan correctamente.*
