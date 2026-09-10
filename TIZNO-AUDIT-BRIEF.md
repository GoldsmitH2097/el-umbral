# Tizno — brief de auditoría externa (para Claude, GPT y Gemini)

Copia todo lo que hay bajo la línea en cada modelo. El código está en el repo
público: https://github.com/GoldsmitH2097/el-umbral (archivo
`public/tizno-ai.html`, ~270 KB; en crudo:
https://raw.githubusercontent.com/GoldsmitH2097/el-umbral/main/public/tizno-ai.html).
Los modelos truncan archivos largos por URL: mejor **adjunta el archivo** además
de dar el enlace.

---

## Qué es

**Tizno** es una criatura de tinta y hollín que vive en https://soulware.live/tizno/
(inglés: https://soulware.live/en/tizno/). Es la mascota interactiva de
Soulware, una editorial española independiente de ficción oscura. Se puede
hablar con él por voz (ElevenLabs Agents, Gemini Flash como LLM). Todo el rig
visual es un único archivo HTML con CSS y JS vanilla (adjunto), sin
frameworks: filtros SVG «goo» sobre capas de tinta, canvases 2D para
partículas y para el mar, y capas CSS compuestas para la luz.

Público: visitantes de la web de la editorial, de escritorio y móvil. Debe
sentirse como un ser vivo (respira, parpadea, reacciona al ratón, a la voz y
a los toques), con estética tipo Tim Burton: negro sobre negro, glow ámbar.

## Qué queremos de ti

1. **Rendimiento (prioridad 1).** El rendimiento ha caído tras añadir
   varias capas esta semana. Identifica, en orden de coste, qué está
   quemando GPU/CPU por fotograma y qué recortarías o reharías, con el
   ahorro estimado. Presta atención a: filtros SVG (`#ink-goo`,
   `#ink-goo-body`: blur + umbral alfa + turbulencia) sobre capas de
   660×700 y 720×900 a DPR 2; el lienzo del mar (`#mar-frente`, ancho
   completo, tres rellenos por fotograma, ya a media resolución y 60 Hz);
   el lienzo de la corona (dentro del filtro goo, repintado a cada
   fotograma); las capas `.luz-giro` (nubes de fondo con giro + translate);
   las señales de texto con `text-shadow` por letra; el vigilante de FPS
   (`medirFps`, baja de nivel alto→medio→bajo y ahora recupera).
   Objetivo: 60 fps estables en un MacBook con GPU integrada y ≥30 fps en
   un móvil medio, sin perder el carácter.
2. **Diseño y sensación.** ¿Qué rompe la ilusión de vida? ¿Qué sobra?
   ¿Qué falta para que parezca una criatura y no un efecto? Sé concreto.
3. **Ideas.** Tres ideas de bajo coste (compositor puro o pocas
   operaciones por fotograma) que aporten más vida que lo que cuestan.
4. **Código.** Riesgos, bugs latentes, cosas frágiles que veas en el
   archivo (es largo: prioriza).

## Restricciones que no se negocian

- Vanilla JS, sin frameworks ni bundles nuevos; un solo archivo.
- Nada de rastreo ni de terceros (ni Google Fonts en caliente: la fuente va
  autoalojada).
- Safari e iOS rasterizan los filtros SVG por CPU: lo que proponga tiene que
  degradar bien ahí (existen tres niveles: alto/medio/bajo).
- Los ojos no llevan pupila ni brillo. La silueta es negra pura.
- No sugieras WebGL/three.js salvo que el ahorro sea enorme y lo justifiques.

## Cómo probar

- `?nivel=alto|medio|bajo` fuerza el nivel y apaga el vigilante.
- `?mar=0` apaga el mar (vuelve la lámina antigua). `?fondo=0` apaga las
  nubes de fondo. `?tune=1` abre un panel de ajustes en vivo.
- `?horizonte=concavo`, `?curvatura=1.4` cambian el horizonte.
- El rig duerme cuando Tizno está hundido y no hay partículas: para medir,
  mueve el ratón hasta que asome y déjalo fuera.
- Chrome DevTools → Performance con «Enable advanced paint instrumentation»
  enseña el coste de cada filtro y capa. Layers panel enseña las texturas.

## Formato de respuesta

Una tabla de hallazgos ordenada por impacto: qué, dónde (id/selector/función),
coste estimado, arreglo propuesto, riesgo. Después, las ideas. Sin relleno.
