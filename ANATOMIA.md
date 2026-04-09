# ANATOMIA.md — Anatomía del Vacío
## Documento de diseño. Actualizar cuando Germán confirme contenido.

---

## Qué es

Anatomía del Vacío no es un libro. Es una experiencia web inmersiva de terror psicológico.
El usuario desciende. No hay mapa de salida.

Vinculada al arquetipo **El Arlequín Sin Flores** / **Germán Ferri** (@germyto).

**Estado actual:** En preparación. Aparece en el catálogo como "Experiencia Digital".
**URL prevista:** soulware.live/anatomia (o integrada dentro del archivo)

---

## Concepto central

La experiencia se revela frase a frase. No hay narración de voz.
El sonido es procedural — construido con Web Audio API, no archivos de audio pregrabados.
El usuario no lee: desciende.

Cada frase aparece, existe, y puede desaparecer.
El ritmo lo controla la experiencia, no el usuario.
Hay momentos donde el usuario puede actuar. La mayoría del tiempo, solo puede esperar.

---

## Estructura narrativa (pendiente de contenido de Germán)

```
Invocación
  └── Prólogo
        └── Capítulo 1 — [LIBRE / GRATUITO]
              └── Corte → Umbral de pago
                    └── Capítulo 2...N — [DE PAGO]
```

### Lo que se sabe:
- Capítulo 1 es gratuito — puerta de entrada
- A partir del corte, requiere pago (ver TIZNO.md para modelo de monetización)
- La experiencia es psicológica, no gore — incomodidad, no violencia
- Terror de lo que no se ve, no de lo que se muestra

### Lo que falta (preguntas para Germán):
1. ¿Cuántos capítulos tiene la versión completa?
2. ¿El Capítulo 1 existe en borrador?
3. ¿Hay una sinopsis del arco narrativo completo?
4. ¿La voz es segunda persona (tú), primera (yo), o narrador?
5. ¿Hay personajes, o solo el descenso?
6. ¿El usuario toma decisiones que afectan el relato, o es lineal?
7. ¿Hay un final, o el descenso es el final?

---

## Mecánica de lectura

### Lo que está decidido:
- Revelación frase a frase — no página completa
- Sin narración de voz
- Audio procedural (Web Audio API, mismo motor que El Umbral)
- Sin scroll voluntario — la experiencia avanza sola, con tiempos calculados
- El usuario puede pausar, pero no retroceder

### Lo que está pendiente:
- ¿La frase anterior desaparece al aparecer la siguiente, o se acumulan?
- ¿Hay interacciones del usuario más allá de esperar/pausar?
- ¿Hay momentos visuales (imágenes, video) o es puramente texto?
- ¿El diseño tipográfico cambia entre capítulos o momentos?
- ¿Hay un "mapa de descenso" visual, o total oscuridad?

---

## Diseño de audio

Mismo enfoque que El Umbral: Web Audio API, nada pregrabado.

Ideas de capas (pendiente de decisión):
- Silencio largo → tensión
- Ruido de fondo que evoluciona con el descenso
- Tonos graves que aparecen y desaparecen
- Distorsión de audio en momentos de ruptura psicológica
- Silencio absoluto como elemento narrativo

**Nota técnica:** El motor de AudioEngine.js de El Umbral es reutilizable como base.

---

## Arquitectura técnica

### Componentes a construir:
- `AnatomiaEngine.js` — motor de revelación de texto (timing, secuencia)
- Sistema de capítulos cargados dinámicamente (JSON o JS modules)
- Integración con TIZNO para el umbral de pago
- Panel de administración de contenido (o edición directa de archivos)

### Integración con El Umbral:
- Anatomía vive dentro de soulware.live — no es un sitio separado
- Acceso desde el archivo: clic en la carta del Arlequín o en la portada de Anatomía
- Tiene su propia escena (Scene 6 en la arquitectura de main.js)
- Al terminar o al salir: retorno al archivo

### Estructura de datos de un capítulo:
```js
// Ejemplo — pendiente de confirmar con Germán
const CAPITULO_1 = [
  { type: 'text', content: 'Frase inicial.', duration: 4000, fade: true },
  { type: 'pause', duration: 2000 },
  { type: 'text', content: 'Segunda frase.', duration: 3500 },
  { type: 'audio', event: 'distortion_start' },
  { type: 'text', content: '...', duration: 6000 },
  // etc.
];
```

---

## Modelo de monetización

Ver TIZNO.md — Tizno es el guardián del umbral de pago.

Resumen:
- Capítulo 1: libre
- Capítulos siguientes: 0,99€/capítulo o 2,99€/mes
- Stripe como pasarela

---

## Hoja de ruta

### Antes de empezar a construir — necesitamos de Germán:
- [ ] Sinopsis del relato completo
- [ ] Capítulo 1 en borrador (aunque sea aproximado)
- [ ] Decisión sobre voz narrativa
- [ ] Decisión sobre interactividad (lineal vs. ramificado)

### Antes de empezar a construir — decisiones de Ruben:
- [ ] ¿Cómo se accede desde el archivo? (¿desde el pillar del Arlequín, desde la portada de Anatomía, botón especial?)
- [ ] ¿La experiencia ocupa pantalla completa o convive con el archivo?
- [ ] ¿Hay un diseño visual específico (tipografía, color) distinto al resto del sitio?

### Fases de construcción:
1. **Motor de texto** — revelación frase a frase, timing, pausa
2. **Capítulo 1** — primer contenido real, sin pago
3. **Integración de audio** — capa sonora procedural
4. **Umbral de pago** — conexión con Tizno y Stripe
5. **Capítulos siguientes** — según ritmo de escritura de Germán

---

## Cómo arrancar la conversación de construcción

Cuando estés listo, abre una nueva conversación en el Proyecto Soulware y di:

> "Lee CLAUDE.md y ANATOMIA.md. Vamos a construir Anatomía del Vacío."
