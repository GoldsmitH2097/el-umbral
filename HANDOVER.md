# HANDOVER.md — El Umbral / Soulware
*Última actualización: 9 Abril 2026 — Fin de sesión. Auditorías externas completadas.*

---

## Estado del sitio

**Live:** https://soulware.live
**Último commit:** `cb7f7e1` — AUDIT_BRIEF_V2.md added
**Repo:** github.com/GoldsmitH2097/el-umbral
**Deploy:** git push origin main → Netlify auto-build (~10s)

---

## Qué se hizo hoy (resumen ejecutivo)

### Arquitectura — cambio más importante del día
**Canvas destination-out** reemplaza el CSS mask-image sobre el video.
- Antes: `mask-image` en `#gallery-container` con video dentro → browser recalculaba máscara sobre frames de video 60fps → CPU/compositing bottleneck → 1fps bajo carga
- Ahora: Canvas pinta negro, `destination-out` borra agujero → video (z-0) y char-text (z-1) se ven a través → operación GPU pura, cero recálculo de layout
- Resultado: TBT desktop estimado ~200-600ms (era 18,790ms)

### Otros fixes del día
- 60fps física para llama/humo (era 30fps — se veía "a mitad de frames")
- 144Hz timestamp guard (era double-speed en ProMotion screens)
- Cursor desaparece al ignitar (la llama ES el cursor)
- Audio sizzle: windGain=0.015 se silencia al entrar al archivo
- Spam protection en EL UMBRAL button (pointerEvents:none al primer click)
- Tizno: silhouette estática, ojos wiggle con CSS (eyeFloat animation)
- Tizno eyes: container CSS `.tizno-eyes` faltaba — restaurado con justify-content:center
- Mobile: overflow-x fix, touch-action:manipulation, event delegation
- Totalis Libertas: overflow de texto con letter-spacing arreglado
- Reading view: autor + libros side-by-side (desktop), apilado (mobile)
- Footer: logo dorado, links legales con :visited fix
- Dead CSS vars purged: --radio-interior, --radio-exterior, --intensidad ya no existen
- AUDIT_BRIEF_V2.md creado y pusheado

---

## Auditorías externas completadas (April 9, 2026)

Tres LLMs auditaron soulware.live. Síntesis de hallazgos:

### ✅ Confirmado como arreglado por los auditores
- destination-out approach: correcto y limpio ✅
- Dead CSS vars: purged completamente ✅
- Bundle size: JS 73KB / CSS 36KB — tiny, sin render-blocking ✅
- SEO 100/100: meta tags, structured data, sitemap, robots.txt ✅
- Rutas deep links: /emperatriz /caballero /sortilega /arlequin → 200 OK ✅
- SPA fallback Netlify: correcto ✅
- Schema.org: Organization + WebSite + 3 Book entities (correcto) ✅
- Filamentos: availabilityStarts 2026-05-12 ✅

---

## Bugs / issues pendientes — PRIORIDAD ALTA

### 1. Smoke glitch (Gemini diagnosó la causa exacta)
**Root cause:**
- **Bounding box clipping**: si el gradiente del sprite toca el borde del OffscreenCanvas,
  el pixel exterior tiene alpha 0.01 en vez de 0. Con 85 humos apilados, el borde se multiplica y
  se vuelve visible como un cuadrado.
- **Sub-pixel jitter**: coordenadas float → GPU aplica anti-aliasing al vuelo.

**Fix exacto (2 líneas):**
```js
// En OffscreenCanvas sprite creation: añadir 15% padding
const _smokeSprite = new OffscreenCanvas(76, 76); // era 64x64
// ... gradient centrado en 38,38 con radio 30 (no 32) para dejar margen

// En SmokeParticle.draw(): forzar coordenadas enteras
ctx.drawImage(_smokeSprite, (this.x-this.size)|0, (this.y-this.size)|0, ...);
// Ya teníamos el |0 — verificar que el sprite también tiene margen
```

### 2. Video CDN — Crítico para escalabilidad
- 4x ~2.5MB MP4s en Netlify sin CDN edge caching
- Cache headers: `max-age=0,must-revalidate` → re-valida 10MB en cada visita
- **Fix inmediato antes de Bunny.net**: añadir headers en netlify.toml:
  ```toml
  [[headers]]
    for = "/*.mp4"
    [headers.values]
      Cache-Control = "public, max-age=2592000"
  ```
- **Fix real**: migrar a Bunny.net. Javier tiene los videos. Cuando tenga URLs → 10 min de código.
- **Bonus**: Gemini sugiere `preload="none"` en pillar videos + `.load()` solo cuando aparece el botón EL UMBRAL en Scene 3

### 3. prefers-reduced-motion CSS (accesibilidad legal)
Claude auditó: el JS salta el intro si reduced-motion, pero las animaciones CSS siguen corriendo.
**Fix (una sola regla global):**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. cursor: crosshair !important en *
Primer línea de global.css. Agresivo: obliga a todos los elementos a crosshair.
- Fuerza que cursor:pointer y cursor:none necesiten !important para override
- En móvil es irrelevante y crea cálculo innecesario
- **Fix**: cambiar a `body { cursor: crosshair; }` y quitarlo del *

### 5. user-select: none en body
- Bloquea selección de texto en toda la página, incluyendo reading view
- En cinematic intro: correcto
- En reading view donde alguien quiere copiar título/autor: hostil
- **Fix**: añadir `user-select: text` en `.reading-content` y `.tizno-panel`

---

## Issues pendientes — PRIORIDAD MEDIA

### 6. OffscreenCanvas Worker (TBT a 0ms)
- 200-600ms TBT es mucho mejor que 18,790ms, pero no es 0ms
- La física de partículas sigue en el main thread
- `canvas.transferControlToOffscreen()` + Web Worker eliminaría todo el TBT del intro
- Complejidad: alta (2-3 horas). Safari fallback necesario.
- **No urgente hasta que hagamos push de marketing**

### 7. Email capture / newsletter (todos los auditores lo señalaron)
- Cero captación de email en el sitio actual
- Gemini: campo email en Tizno drawer "Firma el pacto. Recibe los susurros del Umbral."
- Claude: captura de pre-order bajo el countdown de Filamentos
- Netlify Forms soporta esto nativamente (sin código extra de backend)
- **Alto ROI, bajo coste de desarrollo**

### 8. Route-specific og/meta tags (GPT)
- Las rutas /emperatriz etc. devuelven el mismo shell estático a los crawlers
- Los meta tags (og:title, og:description, og:image) no se actualizan por ruta
- **Fix**: en Router._resolve(), actualizar document.title + meta og:* con datos del personaje
- Mejora SEO para compartir en redes (WhatsApp preview mostraría el personaje, no la home)

### 9. Share button en reading view
- Deep links /emperatriz etc. ya funcionan — capitalizarlos
- Gemini: botón "Propagar Visión" con `navigator.share()` API
- En móvil: abre native iOS/Android share sheet con el deep link + quote del personaje
- **Alto impacto, zero visual clutter**

### 10. Filamentos countdown → captura de email pre-order
- El countdown existe y funciona
- Añadir input email debajo: "Avísame cuando salga" → Netlify Form
- **Convierte la espera en lista antes del lanzamiento (May 12)**

---

## Issues pendientes — PRIORIDAD BAJA

### 11. sitemap.xml — añadir `<lastmod>`
- Actualmente tiene changefreq y priority (Google ignora ambos)
- `<lastmod>` sí lo usa Google
- Fix: añadir fecha de última modificación a cada URL

### 12. ISBN en Pulso del Núcleo JSON-LD
- Schema.org Book soporta `isbn`
- Si tenemos el ISBN-13, añadirlo fortalece los Rich Results
- Javier lo tiene (está en Amazon)

### 13. Filamentos JSON-LD — añadir url + seller al offer
- Pulso tiene url (Amazon) + seller
- Filamentos solo tiene availability + availabilityStarts
- Completar antes del lanzamiento May 12

### 14. Anatomía del Vacío — glitch teaser (Gemini)
- Actualmente muestra card estática "coming-soon"
- Sugerencia: hover/tap dispara CSS VHS-glitch animation + acorde disonante Web Audio
- Convierte "en preparación" en un easter egg narrativo

### 15. Cinematic e-commerce handoff (Gemini)
- Al hacer clic "Comprar en Amazon", el usuario salta de #020202 a fondo blanco de Amazon
- Interstitial: fade a gris oscuro + "Abriendo pasaje seguro..." (800ms) → redirect
- Preserva la atmósfera hasta el último momento

### 16. Stateful skip para return visitors (GPT)
- `localStorage.setItem('hasCrossed', 'true')` cuando el usuario llega al archivo
- En visitas siguientes: mostrar sutil "[ Adentrarse al Archivo ]" para saltar la vela
- Respeta el tiempo de fans del sitio que vuelven a comprar

---

## Confirmado por Claude: NO implementar

**Cookie consent banner**: Claude auditó específicamente esto y confirma que NO es necesario bajo AEPD (Agencia Española de Protección de Datos) — la ley española exime explícitamente el almacenamiento "estrictamente necesario". El sitio no usa tracking cookies, Google Analytics ni pixels. Añadir un banner rompería la experiencia sin beneficio legal real. Solo asegurarse de que Aviso Legal sea accesible.

---

## Decisiones pendientes de Ruben

| Decisión | Contexto |
|----------|----------|
| ¿Bunny.net o Cloudflare R2? | Para video CDN. Bunny = más barato. CF = ecosistema |
| ¿Email capture en Tizno o como componente separado? | Estilo del form |
| ¿Share button texto? | "Propagar Visión" era la sugerencia de Gemini |
| ¿ISBN de Pulso del Núcleo? | Para JSON-LD — pedirle a Javier |
| ¿Anatomía glitch teaser? | ¿Aprueba la dirección creativa? |
| Netlify headers para video cache | Decisión trivial — sí hacerlo YA |

## Decisiones pendientes de Javier

| Item | Status |
|------|--------|
| Google Search Console — submit sitemap | **URGENTE** |
| Video CDN (Bunny.net) — subir 4 MP4s | Antes de marketing push |
| ISBN de Pulso del Núcleo | Para JSON-LD |
| Amazon: publisher name "Soulware" + author bio | SEO backlink |

---

## Cómo arrancar la siguiente sesión

```
"Lee CLAUDE.md y HANDOVER.md y dime en qué estamos."
```

**Primera tarea recomendada para mañana:**
1. Netlify headers para video cache (10 min, netlify.toml)
2. Smoke glitch fix (15 min, OffscreenCanvas padding)
3. prefers-reduced-motion CSS (5 min, una regla)
4. cursor:crosshair scope reduction (5 min)
5. user-select fix en reading-content (2 min)

Luego: email capture en Tizno + share button en reading view.
