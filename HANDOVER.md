# HANDOVER.md — El Umbral / Soulware
*Última actualización: 9 Abril 2026 — Sesión larga de fixes y performance*

---

## Estado actual del sitio

**Live:** https://soulware.live | https://el-umbral.netlify.app
**Último commit:** `201ffd6` — fix: fireflies follow scroll, caballero highlight, legal modal clean

El sitio está en producción y funcional. Hoy se hicieron +12 commits con fixes críticos y mejoras de performance.

---

## Qué se ha hecho hoy (en orden)

### Commits del día (newest first)

| Commit | Descripción |
|--------|-------------|
| `201ffd6` | fix: fireflies follow scroll, caballero highlight, legal modal clean |
| `de4eac7` | fix: audio silence on archive, faint line, logo color, anthology centered |
| `f780a7e` | fix(critical): unclosed CSS comment hiding reading-view, btn-volver, all modals |
| `9a3080d` | perf+fix: LERP covers, smoke sprite, footer, mobile, covers |
| `b6c22a5` | perf+fix: smoke cap, safari acepto ghost, tizno overhaul, vertical lines |

### Bugs críticos resueltos

1. **CSS comentario sin cerrar** — `/* ── Site footer padding:...` sin `*/` comentó TODA la segunda mitad de archive.css: `#reading-view`, `#btn-volver`, todos los modals, footer CSS. Causa raíz de la "página negra al hacer clic en personajes".

2. **Safari "Acepto" ghost** — `#pacto-modal` sin `display:none` después del fade causaba que Safari mostrara el botón sobre el archivo. Fix: `display:none` a 1100ms.

3. **Mobile navigation roto** — `mobile.js` usaba `.pillar` (clase obsoleta tras el grid refactor). Actualizado a `.archive-pillar`.

4. **Audio atascado** — `fireGain` y `windGain` no se silenciaban al entrar al archivo. Añadido `setFireVolume(0)` + `setWindVolume(0)` en `enterMainSite()`.

5. **El Caballero permanentemente activo** — `archive-col--highlighted` nunca se eliminaba. Ahora se quita con `setTimeout(..., 4000)`.

6. **Fireflies no siguen al scroll** — Container era `position: absolute` dentro de `#main-site`. Movido a `document.body` con `position: fixed`. Coordenadas ahora viewport-relativas.

### Performance

- **Smoke sprite pre-renderizado**: `createRadialGradient` por frame → `drawImage` con `OffscreenCanvas`. ~10x más rápido por partícula de humo.
- **LERP para cover tilt**: `mousemove` solo guarda coords target. RAF aplica interpolación (friction 0.12). Elimina layout thrashing.
- **Smoke particle caps**: hard cap 35 llama / 45 humo. Decay 3.5x más rápido. Size capped a 28px.
- **decoding="async"** en todas las imágenes de portada.
- `pillarDividerPulse` (línea vertical) ahora 6s cycle, `opacity: 0.05-0.28` (era 0.1-0.7, demasiado brillante).

### Mejoras visuales y UX

- Footer restaurado: logo Soulware (dorado, sin `filter:invert`), copyright, links legales con `:visited` fix.
- Contact form eliminada del bottom de página (ahora solo en Tizno drawer).
- Tizno drawer: backdrop `#tizno-backdrop` para cerrar al clicar fuera. Ojos en la base de la silueta (`bottom: 7px`). Double-blink (25% probabilidad). Contenido: social → email → identidad Tizno.
- CONTACTO botón ahora hace toggle (no solo abre).
- Social links eliminados de los pillars del grid (solo en reading view).
- Legal modal: filtra logo, `.legal-back`, y links de navegación antes de inyectar el HTML.
- Nuevas portadas: `alicia-cover.webp` (400×600) y `anatomia-del-vacio.webp` (actualizado).
- SEO: `availabilityStarts` añadido a Filamentos JSON-LD.
- Android scrollbar oculto en `.archive-grid`.

---

## Arquitectura actual (referencias rápidas)

```
src/
├── index.html              # HTML principal — #tizno-tease, #tizno-panel, modals
├── css/
│   ├── archive.css         # Archivo, reading view, btn-volver, modals, footer
│   ├── obras.css           # Book cards, anthology, firefly container (position:fixed)
│   ├── tizno.css           # Tizno peek + panel + backdrop
│   └── mobile.css          # Mobile archive (archive-pillar, archive-col)
└── js/
    ├── main.js             # enterMainSite: setFireVolume(0)+setWindVolume(0) on enter
    ├── mobile.js           # initMobileArchive: .archive-pillar (updated)
    └── ui/
        ├── ArchiveDOM.js   # showArchive: highlight removed after 4s; legal fetch filtered
        └── ArchiveFireflies.js # Container en body (position:fixed), viewport coords
```

---

## Bugs conocidos / pendientes

### Alta prioridad
1. **Reading view / perfil de personaje** — Funciona (botón ← Volver visible ahora). PERO: no tiene tabs "Perfil | Libros" — actualmente muestra lore + social juntos. Pendiente refactor con tabs.
2. **Mobile character detail** — `.archive-pillar` click debería activar `#mobile-char-detail`. Debe verificarse en dispositivo real tras el fix de hoy.
3. **Líneas de texto dentro del Tizno drawer** — El usuario mencionó que el texto "se va dentro del drawer". Puede ser padding insuficiente o z-index del `#tizno-panel` compitiendo con el backdrop.

### Media prioridad
4. **prefers-reduced-motion** — Debe saltar directamente a Scene 4 (skip intro completa). Actualmente solo para partículas. Fix en `main.js`: check al inicio, `showArchive({skipIntro:true})` inmediato.
5. **BiquadFilterNode pop** — No está implementada la muffling de audio al abrir modals. Pendiente si Rubén lo quiere.
6. **Mobile: partículas Tizno en horizontal scroll** — Las partículas de ArchiveFireflies no reaccionan al scroll horizontal del archive-grid. Complejidad media.
7. **Totalis Libertas** — Estilizado pero posiblemente aún desalineado en algunos breakpoints. Requiere verificación visual.

### Baja prioridad
8. Tizno: "llegará pronto" — sistema de prompt admin panel (no construido aún).
9. Stripe/Shopify integración — pendiente decisión de arquitectura.
10. Video CDN (Bunny.net) — pendiente Javier.
11. Awwwards — tras fix de TBT.

---

## Cómo arrancar siguiente sesión

```
"Lee CLAUDE.md y HANDOVER.md y dime en qué estamos."
```

O para continuar con lo más urgente:
```
"Lee CLAUDE.md y HANDOVER.md. Quiero implementar los tabs de perfil en reading view (Perfil + Libros). Y verificar mobile."
```

---

## Decisiones pendientes de Rubén

| Decisión | Contexto |
|----------|----------|
| ¿Stripe directo o Shopify? | Para Tizno / monetización Anatomía |
| Tabs en reading view: ¿Perfil + Libros? | UX del perfil de personaje |
| Tizno: ¿trigger de activación final? | ¿clic en silhouette, o también auto-aparece? |
| Mobile archive: ¿ok el carousel actual? | Un slide por personaje (pillar + libros) |
| Anatomía del Vacío: sinopsis de Germán | Necesaria para construir AnatomiaEngine |

---

## Decisiones pendientes de Javier

| Item | Status |
|------|--------|
| Google Search Console — submit sitemap | **URGENTE** — sin esto Google no indexa |
| Video CDN (Bunny.net) | Antes de cualquier push de marketing |
| DNS soulware.live (si hay issues) | Confirmar que apunta a Netlify |
