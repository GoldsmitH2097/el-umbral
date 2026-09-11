# Auditoría técnica y de diseño de Tizno (soulware.live/tizno)

Actúa como un equipo senior de tres perfiles: (1) ingeniero de rendimiento web especializado en el pipeline de render de Chromium y WebKit (compositor, raster, filtros SVG, canvas 2D), (2) director de animación de personajes (Pixar/Laika, animación 2D procedural) y (3) diseñador de experiencias conversacionales por voz. Quiero un informe profesional, concreto y verificable, no una lista de generalidades.

## 1. Qué vas a auditar

- Producción: https://soulware.live/tizno/ (inglés: https://soulware.live/en/tizno/).
- Código fuente, un único archivo de ~4.200 líneas (HTML + CSS + JS vanilla, sin frameworks): https://raw.githubusercontent.com/GoldsmitH2097/el-umbral/9149ed3/public/tizno-ai.html (fijado al commit 9149ed3, que es lo que hay en producción). Repo público: https://github.com/GoldsmitH2097/el-umbral. Te adjunto además el archivo por si truncas la URL. Lee el archivo entero antes de opinar: la mitad de las respuestas están en sus comentarios.
- Para la parte de seguridad, mira también en el repo: `netlify.toml` (cabeceras y redirecciones), `netlify/functions/*.mjs` y `public/_redirects`.

Tizno es la mascota interactiva de Soulware, una editorial española independiente de ficción oscura. Es una criatura de tinta y hollín que vive en la niebla de la web, emerge de un mar de tinta, respira, parpadea, reacciona al ratón, a los toques y a la voz, y con la que se puede hablar por voz (ElevenLabs Agents, LLM Gemini 3.6 Flash, SDK @elevenlabs/client 1.25 por WebSocket). Estética: Tim Burton, negro sobre negro, glow ámbar (#f39c12), sin pupilas ni brillos en los ojos, silueta negra pura. Público: visitantes de la web en escritorio y móvil; muchos entrarán desde Instagram en un móvil medio.

## 2. Arquitectura del render (para que no tengas que deducirla)

Capas fijas, de atrás hacia delante (z-index):
- z0 `#luz-sala`: contenedor de la luz. Dentro: `#ambient-light` (degradado radial, keyframes de parpadeo), tres `.luz-giro` (nubes de fondo: capas cuadradas de 80vh con 4–5 degradados radiales cada una; giran por `transform` con keyframes de 190–300 s y además reciben `translate` desde JS a 30 fps siguiendo al ratón y a la cabeza con ganancias distintas; la C lleva manchas oscuras que restan luz), `#candle-flicker`. El contenedor recibe `transform: translate()` (foco perezoso) y `opacity` (ligada al pop de Tizno) cada tick de 30 fps.
- z1 fondo, z2 dos `.goo-layer`: (a) el CUERPO (660×700 px, `filter: url(#ink-goo-body)`: feGaussianBlur 10 → feColorMatrix umbral alfa 18/−7,5 → feBlend → feTurbulence fractalNoise 0.02/0.05 de 3 octavas → feDisplacementMap 17). Dentro: el rig DOM (cabeza circular de 150 px, orejas SVG, cuello, cejas, cuerpo) movido por transforms cada fotograma, y un `<canvas id="corona">` de 660×700 que se repinta a CADA fotograma con la corona de tinta, el hervor del tronco, las salpicaduras de la orilla, la orilla misma (la ola del mar dibujada dentro del goo para que el cuello se funda con el agua) y 9 «átomos» orbitando. (b) las PARTÍCULAS (720×min(vh,900), `filter: url(#ink-goo)`: blur 10, umbral 8,5, turbulencia 0.008/0.028 y desplazamiento 36) con `<canvas id="lienzo-particulas">`: gotas, micro-letras y las burbujas de «lava» (masa que emerge del mar y se evapora). Los sprites vienen de un atlas; el búfer va a 0,5 en móvil.
- z3 `.head-tracker`, z5 `#mar` (canvas de ancho completo × 46vh, búfer a 0,5, tres rellenos de trazado por fotograma a 60 Hz máx.: dos capas de oleaje por senos y un frente con simulación de muelles 1-D de ~150 columnas que reacciona al pop, la voz y el ratón; horizonte circular de radio 1,8 alturas), z6 `#luz-ojos` (halo de 260 px al 10 %), z9/z10 capa de ojos (dos `.eye` de 40 px con `clip-path: path()` paramétrico morfando a 60 fps + `drop-shadow` ×3 como glow), z11 `#lente` (destello sobre el ojo grande cuando los ojos se desigualan) y `#lienzo-chispas`, z25 luciérnaga, z40 señales (texto Jolly Lodger autoalojada troceado en spans con `text-shadow` fijo de 4 capas y animación de opacidad por letra), z60 botón de llamada, z61 info.

Bucle: un `requestAnimationFrame` (`updateRig`) integra física (muelle del pop, orejas, cejas, párpados, mandíbula por volumen de voz) cada fotograma; las escrituras al DOM y los canvases de partículas van tras una puerta de 30 fps por tiempo (`ultimoDibujo`); el mar y el lienzo de la corona van a cada fotograma (el mar capado a 60 Hz). Emisores por `setInterval`: partículas 140 ms, micro-letras 90 ms (tope 190 vivas), corona 110 ms (8 grumos/pulso, tope 90 en el pool), hervor 130 ms. Cuando Tizno está hundido y no hay partículas, el bucle no escribe nada («sueño profundo»).

Niveles de detalle: `alto / medio / bajo`, estimados por hardware al cargar (Safari nunca arranca en alto: rasteriza los filtros SVG por CPU) y ajustados por un vigilante de FPS (`medirFps`: ventanas de 2,5 s; baja si <50/34 fps con la pestaña enfocada; recupera tras 6 ventanas ≥56 fps). Bajo = filtros sin turbulencia y menos partículas.

Voz: el rig deriva `speaking/listening/thinking` de los eventos del SDK, lee el volumen de salida (envolventes rápidas y lentas, transitorios, graves/agudos) para mover mandíbula, orejas y ojos, y parsea las acotaciones entre corchetes del texto del agente ([Whispers], [scared]…) para una línea de tiempo emocional que cambia las poses de los ojos. Envía al agente contexto (hora, visita, batería, toques) por `sendContextualUpdate`, y avisos como mensaje de usuario (fin de tiempo, toques). Topes: 10 min por conversación, 30 min al día por navegador.

## 3. Lo que quiero que entregues

### A. Rendimiento (prioridad absoluta)
El rendimiento ha caído esta semana al añadir el mar, las nubes, los átomos, la lava y las señales animadas. Objetivo: 60 fps estables en un MacBook Air con GPU integrada a DPR 2 con Tizno fuera y hablando; ≥30 fps en un móvil Android medio y en iPhone (WebKit, filtros por CPU); GPU «casi a cero» con Tizno dormido.

1. Presupuesto por fotograma: estima, con números, cuánto cuesta cada elemento en las tres máquinas objetivo: los dos filtros goo (área × DPR² × primitivas; distingue el coste de blur, umbral, turbulencia y desplazamiento), el canvas de la corona (¿debe ir a cada fotograma o a 30?), el canvas del mar (¿tres rellenos por fotograma? ¿podrían ser una sola ruta?), las nubes (memoria de textura por capa a DPR 2, coste de composición, si `will-change` está de más), el glow de los ojos (`drop-shadow` ×3 en la capa de ojos, ¿cada fotograma?), las señales (40 spans con sombra fija: ¿se rasterizan una vez o cada letra repinta al animar la opacidad?), los `setInterval`, las lecturas de layout (`getBoundingClientRect` por tick, `getScreenCTM` cacheado a 100 ms).
2. Ordena los hallazgos por ahorro real, no por opinión. Para cada uno: dónde exactamente (id, selector, función, línea aproximada), coste estimado, arreglo concreto (código o pseudocódigo), cuánto ahorra, qué se pierde visualmente, riesgo de regresión.
3. Propón una estrategia de niveles mejor que la actual si la ves: qué debería apagarse en medio y bajo, en qué orden, y cómo evitar oscilaciones del vigilante.
4. Memoria: texturas de capas compuestas, canvases, atlas. ¿Hay riesgo de que iOS mate la pestaña? (ya pasó una vez por calor con la versión de agosto).
5. Di qué medirías y cómo (DevTools Performance con «advanced paint instrumentation», panel Layers, `chrome://tracing` con categorías `cc,gpu`, Safari Web Inspector Timelines) para confirmar tus estimaciones. Si puedes abrir la web y medir, hazlo y reporta cifras.

### B. Animación y sensación de vida
Juzga como director de animación: ¿qué rompe la ilusión? ¿Qué movimientos son «de código» y no «de criatura»? Revisa timing y easing de: pop de entrada, parpadeo coreografiado (parejas desincronizadas, dobles, de un ojo), poses paramétricas de párpados por emoción (miedo, susurro, furia, tristeza, risa, duda, escucha), cejas que emergen de la tinta, mandíbula por volumen, orejas con muelle, la reacción del mar, la lava, las nubes. Qué sobra (ruido que resta) y qué falta (anticipación, follow-through, peso, mirada, silencios). Propón cambios con valores concretos (duraciones, curvas, amplitudes).

### C. Experiencia de voz
Latencia percibida, señales de estado (rumiar, escuchar, hablar), qué pasa en silencio, la despedida con excusa y el cuelgue, los toques durante la llamada, los topes de tiempo. ¿Qué haría que la conversación se sintiera más viva y menos «asistente»? ¿Qué señales del rig deberían llegar al agente y cuáles no? (Regla del dueño: intuiciones sobre la situación, nunca vigilancia ni contadores.)

### D. Robustez y código
Bugs latentes, condiciones de carrera (SDK, rAF, intervalos, visibilidad), fugas (listeners, intervalos, streams de micrófono), comportamiento con la pestaña oculta/desenfocada, resize, DPR 1 vs 3, pantallas 120 Hz, `prefers-reduced-motion`, accesibilidad (teclado, lectores de pantalla en las señales troceadas), i18n ES/EN. Prioriza; no listes nimiedades.

### E. Ideas
Cinco ideas de bajo coste (compositor puro o pocas operaciones por fotograma) que aporten más vida de la que cuestan, con una estimación honesta de coste de implementación y de fotograma.

### F. Seguridad y privacidad
Audita como si fueras a atacarlo. Contexto: el agente de ElevenLabs es PÚBLICO (se conecta con `AGENT_ID` desde el navegador, sin backend ni clave; la protección es la allowlist de orígenes de ElevenLabs, soulware.live y el-umbral.netlify.app, con `require_origin_header`). Los créditos son un grant de un año; los topes por conversación (10 min) y por día (30 min) viven en `localStorage` y son evitables desde la consola; `?tune=1` + tecla 0 reinicia el contador y `?equipo=1` lo desactiva en ese navegador (puertas de equipo, visibles en el código). Cabeceras en `netlify.toml` (Referrer-Policy, X-Frame-Options SAMEORIGIN, Permissions-Policy con `microphone=(self)`); funciones en `netlify/functions/` (`baby-borrar.mjs` usa `ELEVENLABS_API_KEY` en servidor; `stripe-webhook.mjs`, `stripe-diag.mjs`), también en el repo público.
Quiero: (1) vectores de abuso del agente (conexiones desde otros orígenes, scripts que agoten créditos, bypass de la allowlist, coste real de un ataque de agotamiento) y qué mitigación proporcionada propones sin meter un backend de sesiones si no hace falta; (2) inyección de prompt por voz y por los avisos entre corchetes que el rig manda como «mensaje de usuario» (¿puede un visitante hacerse pasar por el sistema?); (3) qué texto del agente o del visitante llega al DOM y cómo (busca `innerHTML`, `textContent`, transcripciones, nombre recordado en `localStorage`); (4) CSP: no hay; di qué política mínima permitiría el SDK por `esm.sh`, los WebSockets de ElevenLabs y la fuente autoalojada, y qué rompería; (5) privacidad: micrófono (¿se apaga siempre al colgar?), qué se guarda en el navegador, qué se manda al agente en el contexto (hora, batería, nº de visita, nombre) y si el aviso de privacidad de la página lo cubre; (6) las funciones de Netlify y las claves; (7) cualquier cosa que un repo público no debería enseñar. Severidad, explotabilidad real y arreglo concreto para cada punto.

## 4. Restricciones que no se negocian
- Vanilla JS en un solo archivo, sin frameworks, sin bundles nuevos, sin dependencias salvo el SDK de ElevenLabs.
- Nada de rastreo ni de terceros en caliente (ni Google Fonts: la fuente va autoalojada).
- Silueta negra pura; ojos sin pupila ni brillo; el goo (blur + umbral) es la identidad visual: se puede abaratar, no quitar.
- Degradación elegante en WebKit (filtros SVG por CPU) y en móvil.
- Nada de WebGL/three.js/WebGPU salvo que demuestres un ahorro enorme y una ruta de migración razonable para un solo archivo.

## 5. Cómo probar
- `?nivel=alto|medio|bajo` fuerza el nivel y apaga el vigilante.
- `?mar=0` apaga el mar y devuelve la lámina antigua; `?fondo=0` apaga las nubes; `?tune=1` abre un panel de ajustes en vivo; `?horizonte=concavo` y `?curvatura=1.4` cambian el horizonte.
- Con Tizno hundido el rig duerme: para medir, mueve el ratón hasta que asome y déjalo fuera. Para verlo hablar hace falta micrófono y créditos; si no puedes, audita el código de voz en seco.
- El HTML de producción está minificado (comentarios fuera); el archivo del repo no.

## 6. Formato de entrega
1. Resumen ejecutivo: cinco frases, lo más importante primero.
2. Tabla de hallazgos de rendimiento ordenada por ahorro: qué · dónde · coste estimado (ms/fotograma o % del presupuesto, por máquina) · arreglo · ahorro · pérdida visual · riesgo.
3. Animación: hallazgos con valores propuestos.
4. Voz: hallazgos.
5. Código: hallazgos con severidad (crítico / alto / medio) y línea aproximada.
6. Ideas.
7. Seguridad y privacidad: hallazgos con severidad, explotabilidad y arreglo.
8. Lo que no has podido verificar y por qué.

Sin relleno, sin «considera optimizar», sin consejos genéricos de web performance que no apliquen a este archivo. Si algo del código ya está bien resuelto, dilo en una línea y pasa al siguiente.
