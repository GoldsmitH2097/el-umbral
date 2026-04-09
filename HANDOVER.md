# HANDOVER.md — Estado actual del proyecto
## Actualizar al final de cada sesión. Es la primera lectura de cada nueva conversación.

**Última sesión:** 9 de abril 2026
**Commit más reciente:** `753891c` — fix: mobile-char-detail bleeding onto desktop

---

## Estado del sitio

**soulware.live está live, indexado y funcionando.**

- Google Search Console registrado ✅ (Javier lo hizo el 8 abr)
- Página indexada, crawleada por smartphone bot ✅
- Sitemap pendiente de submit manual (ir a Sitemaps en Search Console)
- Scores Lighthouse: Mobile 98 / Desktop 60 (TBT problema pendiente)

---

## Qué se ha construido (sesión de hoy)

### SEO y visibilidad
- Title tag: "Soulware — Editorial Independiente Española | Ficción Oscura y Universos de Autor"
- Meta description editorial-focused
- JSON-LD: Organization + 4 Book schemas inyectados en `<head>`
- Sitemap corregido (/reina → /emperatriz, legal pages añadidas)

### UX / Contenido
- Línea editorial en Scene 1 (watermark bottom-fixed) y Scene 4 hero
- Hero text: "Cuatro arquetipos. Cuatro universos. Bienvenido al Archivo de Soulware."
- Status pills: [DISPONIBLE] [PRÓXIMAMENTE] en todas las obras
- Amber accent color en el único botón de compra (Pulso tapa blanda)
- Format badges: [EDICIÓN FÍSICA] [EXPERIENCIA DIGITAL] etc.
- Book descriptions con hooks comerciales (aprobadas por Ruben)
- Scene 2 idle hint: "Busca las voces en la oscuridad" tras 5s, desaparece al primer hallazgo

### Mobile
- Horizontal swipe carousel para character pillars (revertible: quitar clase `pillar-grid--swipe`)
- Haptic feedback en Scene 1: pulso mientras crece la llama, snap al ignitar
- 100dvh en todos los overlays (fix iOS bottom bar)
- Archetype label + author encima de obras en mobile

### Performance
- 30fps simulación / 60fps render (partículas: physics cada 2 frames, draw cada frame)
- DPR cap revertido — canvas ya era 1:1, escalar añadía pixels y empeoró TBT
- OffscreenCanvas: decidido NO hacer todavía. Esperar nuevo Lighthouse tras 30fps fix.

### Bugs corregidos
- `#mobile-char-detail` display:none en global.css — era visible en desktop, `#mobile-char-close` (el "← Volver") y video overlay con position:fixed sangraban sobre toda la interfaz
- Watermark editorial movido de `#ui` centrado a bottom-fixed
- Hint de Scene 2 ya NO ilumina whispers automáticamente — solo texto
- "Bienvenido al Archivo" con white-space:nowrap, no se rompe en líneas
- `pillar--highlighted` también muestra descripción (Emperatriz fix)

### Infraestructura
- Netlify Forms reemplaza Formspree (sin verificación manual requerida)
- tabular-nums en countdown timer
- prefers-reduced-motion bypass directo a Scene 4

---

## Pendiente inmediato (código — próxima sesión)

En orden de prioridad:

1. **Nuevo Lighthouse** — ver si TBT mejoró con 30fps sim. Si sigue alto → OffscreenCanvas.
2. **Skip button** — hacer primer elemento focusable del DOM (WCAG 2.4.1)
3. **Focus management** — Scene 4 load → focus h2; modal open → focus close; modal close → return focus
4. **Archetype persistence** — carácter de Scene 1 pre-highlighted en Scene 4
5. **3D tilt en portadas** — cursor tracking + rotateX/Y + gradient glare
6. **Dual-layer book modal** — "La Visión" / "El Manuscrito" tabs (pending: Ruben confirmar copy de "La Visión")
7. **touch-action en Scene 1** — `-webkit-touch-callout: none` en Scene 1 container
8. **Audio muffling** — BiquadFilterNode lowpass cuando modal abre
9. **Scene 3 auto-advance** — ya implementado (4s), confirmar que funciona bien
10. **Video CDN** — cuando Javier tenga URLs de Bunny.net, actualizar paths en StateManager (10 min)

---

## Pendiente — Ruben/Javier (no código)

| Item | Owner | Urgencia |
|------|-------|---------|
| Submit sitemap en Search Console | Javier | HOY |
| Video CDN (Bunny.net) | Javier | Antes de marketing push |
| Goodreads + Amazon author pages | Javier | Esta semana |
| Directorios editoriales | Ruben | Este mes |
| @soulware.editorial social | Ruben | Este mes |
| La Emperatriz obra título definitivo | Ruben | Cuando esté listo |
| La Corte: autores + títulos de relatos | Ruben/Javier | Cuando estén listos |

---

## Decisiones pendientes de Ruben

1. **Tizno visual** — ¿cómo aparece? ¿qué lo activa? (ver TIZNO.md)
2. **Dual-layer modal copy** — "La Visión" tab necesita texto poético para cada obra
3. **Awwwards/FWA submission** — esperar a que TBT esté bajo 300ms
4. **Newsletter** — ¿implementar "El Pacto" newsletter (Mailchimp/Resend)?
5. **Boutique** — ¿cuándo empieza la conversación sobre arquitectura de comercio?

---

## Cómo usar este archivo

### Documentación del proyecto (leer antes de cada sesión):
| Archivo | Contenido | Cuándo leerlo |
|---------|-----------|---------------|
| `CLAUDE.md` | Arquitectura permanente, equipo, decisiones | Siempre |
| `HANDOVER.md` | Estado actual, pendientes, próximos pasos | Siempre |
| `TIZNO.md` | Diseño de Tizno, capas, monetización | Cuando trabajemos en Tizno |
| `ANATOMIA.md` | Diseño de Anatomía del Vacío | Cuando trabajemos en Anatomía |

### Para arrancar una nueva conversación (El Umbral / bugs / site):
> "Lee CLAUDE.md y HANDOVER.md y dime en qué estamos."

### Para arrancar Tizno:
> "Lee CLAUDE.md y TIZNO.md. Vamos a construir Tizno."

### Para arrancar Anatomía del Vacío:
> "Lee CLAUDE.md y ANATOMIA.md. Vamos a construir Anatomía del Vacío."
