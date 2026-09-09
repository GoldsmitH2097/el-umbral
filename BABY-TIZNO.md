# BABY-TIZNO.md — Diseño y Especificación (semilla)

## Documento canónico de Baby Tizno. Compañero de CLAUDE.md y TIZNO.md — léelos antes.
## v0 (2026-09-09) — decisiones cerradas por Ruben + canon de referencias + esqueleto de la mecánica. El mundo lo escribe Javier; la personalidad la trabaja Ruben. Todo lo demás se define después.

---

## Qué es

Baby Tizno es Tizno contando cuentos a niños de 5 a 12 años. No es un juguete
nuevo: es el **mismo Tizno** (sin chupete, sin rediseño), más grande y claro
protagonista de la escena, con un comportamiento **más cute y nunca enfadado**.
El niño no lee: escucha, elige y habla. Tizno narra, ofrece bifurcaciones,
improvisa con lo que el niño dice y lo anota. Al final de cinco capítulos hay
un **libro impreso** que el niño inventó con Tizno.

Claim de trabajo: «devuélvele la creatividad a tu hijo».

**No es:** un chatbot infantil de charla libre · un asistente educativo ·
un árbol de decisiones escrito de antemano · un juego con puntos y vidas.

**Es:** un narrador de mesa (game master) para un solo jugador pequeño ·
un cuento que crece sobre la marcha con reglas fijas por debajo ·
una herramienta para que el adulto se lleve un objeto (el libro).

---

## Decisiones cerradas (Ruben, 8–9 sep 2026)

| Tema | Decisión |
|------|----------|
| Edad | 5 a 12 años, en tres franjas: 5–7 · 8–10 · 11–12 |
| Entrada | Un solo «Umbral de Día» con dos puertas: «Soy mayor» / «Soy peque». El adulto configura una vez y entra **como adulto**; el niño nunca configura, solo elige |
| El adulto | Es la herramienta del libro: ve el diario de la aventura tras cada capítulo, corrige si quiere, pide el libro. Consentimiento sin hablar de consentimiento |
| Tizno | Exactamente el de la versión aislada (`/tizno/`), más grande, protagonista. Cute, **nunca enfadado**. Fuera `[Angrily]` y cualquier susto |
| Memoria | Solo narrativa: el «libro de hechos» de la historia. Ningún perfil del niño más allá del nombre de pila y la franja. Botón de borrado para el adulto |
| «Te necesito» | Prohibido. Tizno nunca afirma que necesita al niño (documento de protección de Javier) |
| Rebobinar | «¡No!» / «¡Otra cosa!» deshacen el último latido. Gratis a los 5–7; con precio narrativo a los 11–12 |
| Imágenes | Más adelante, con ElevenLabs Image & Video (API en plan Pro, créditos). Marcado legible por máquina obligatorio (AI Act art. 50) |
| Plataforma | Web primero, app después |
| Aviso de IA | Tizno dice con su voz, sin romper la magia, que es una máquina (obligatorio desde 2 ago 2026) |
| Legal | Artefacto «El Mapa Legal de Baby Tizno»: LOPDGDD (14 → 16 años en trámite), GDPR art. 8 y 35 (DPIA antes de abrir al público), AI Act art. 5 y 50, Apple Kids / Google Families, COPPA si hay EE. UU. Piloto con tres familias antes de nada público |

**Agente ElevenLabs:** `agent_3601m23sdxb4fx0adrkse21ynvb9` (rama Main
`agtbrch_3701m23sdxb6ezfvvpfgg468qvz3`). Duplicado exacto del Tizno de
producción el 9-sep-2026: mismo prompt, ES + EN, Gemini 3.6 Flash, misma KB y
herramientas. Producción (`agent_2101kyzjd6e6ehhaaq9m4mhn8dhq`) intacta.
Ningún código apunta todavía al agente nuevo.

---

## Canon de referencias — TENER MUCHO EN CUENTA al diseñar la mecánica

Ruben, 9-sep-2026: «quiero que tengamos esto MUCHO en cuenta cuando diseñemos
la mecánica de la historia y cómo se desarrolla». Antes de escribir una sola
regla, leer la fuente original, no resumirla de memoria.

| Referencia | Qué tomamos | Qué NO tomamos |
|------------|-------------|----------------|
| **Emily Short** (emshort.blog) y **Failbetter Games** (Fallen London): storylets y narrativa basada en cualidades | La arquitectura entera: **no hay árbol escrito**. Hay baldosas sueltas (storylets) con requisitos de entrada y efectos de salida sobre variables («cualidades»). El árbol solo existe a posteriori, en el libro | El grind, las cualidades numéricas visibles, la economía de acciones |
| **Kenn Adams**, Story Spine | La **espina de cada capítulo**: érase una vez · cada día · hasta que un día · por eso · por eso · hasta que al final · y desde entonces. Cada latido es un hueco que se rellena con una baldosa. Un niño de cinco años la sigue sin saberlo | Nada: se usa entera |
| **Vladimir Propp**, Morfología del cuento | Las **variables predefinidas** y el orden de los latidos: carencia, prohibición, transgresión, donante, objeto mágico, prueba, regreso. Cada función es una baldosa posible | Las 31 funciones al completo (bastan 8–10 para 5–12 años); la boda final |
| **Martin Lloyd**, Amazing Tales · **Monte Cook**, No Thank You, Evil! | El adulto narra, el niño tiene **pocas habilidades con nombre propio** (cuatro en Amazing Tales) y **el dado falla con gracia**: la Caída es el fallo del dado convertido en cuento. Amazing Tales es el pariente más cercano de lo nuestro | Dados físicos, hojas de personaje, combate, puntos de vida |
| **Dungeon World** (LaTorra y Koebel), movimientos del narrador | La **lista de movimientos de Tizno** para no bloquearse nunca: muestra una señal de peligro que se acerca · ofrece una oportunidad con un precio · presenta a alguien nuevo · devuélvele la pregunta al niño · usa una regla del mundo · separa (con cariño) al héroe de su compañero. «Juega para descubrir qué pasa» | Las mecánicas 2d6, las clases, el daño |
| **Shawn Tomkin**, Ironsworn | Las **tablas de oráculo**: listas cortas de las que Tizno tira cuando el niño se queda callado o cuando hay que inventar un nombre, un lugar, un giro. Sembradas con las variables del mundo de Javier | El juego en solitario completo, los votos, el progreso por marcas |
| **Inkle** (Jon Ingold), 80 Days, lenguaje Ink | **Ramificar y reconverger**: las elecciones se abren y vuelven a la espina sin que el guion explote. Cada bifurcación deja un hecho anotado, no una rama nueva que mantener | Escribir en Ink; el motor es prompt + variables + herramientas del agente |
| **Lunii**, Ma Fabrique à Histoires | Estudiar como **competencia**: cómo eligen los niños de 3–8 sin pantalla (héroe, lugar, compañero, objeto), cómo se vende a los padres, precio, qué se les critica | Su modelo: historias cerradas grabadas. No es la referencia |
| **Vivian Gussin Paley**, storytelling and story acting | La **base pedagógica del libro**: el niño dicta el cuento, lo ve tomar forma y se le devuelve. Dictar → representar → conservar. Justifica el claim | Nada: es el porqué |

Regla derivada de todo lo anterior: **el niño no navega un árbol; el niño
escribe hechos, y las reglas eligen la siguiente baldosa.**

---

## Esqueleto de la mecánica (provisional, a la espera del mundo de Javier)

**Variables predefinidas** (las rellena el adulto o las tira Tizno del oráculo):
`{{heroe}}` (nombre de pila), `{{gusto1..3}}`, `{{companero}}`, `{{lugar}}`,
`{{objeto}}`, `{{carencia}}`, `{{sombra}}` (miedo suave), `{{tono}}`
(risas · misterio · aventura), `{{franja}}` (5-7 · 8-10 · 11-12).

**Un capítulo = una espina de siete latidos**, de uno a tres minutos cada uno:
el mundo · la rutina · la ruptura · consecuencia con elección · consecuencia
con elección · la prueba · la vuelta a casa. Cada latido se rellena con una
baldosa del banco (requisitos + texto con huecos + efectos). **Cinco
capítulos = un libro.**

**El libro de hechos**: cada decisión del niño se anota como hecho corto
(«el dragón se llama Pepa y le da miedo el agua»). Las baldosas siguientes
deben respetarlos. Es la única memoria. Se exporta al libro impreso.

**La Caída**: cuando la elección sale mal, Tizno narra una caída divertida,
nunca un castigo. Necesita una explicación dentro de la ficción (se la pedimos
a Javier: «qué pasa en este mundo cuando la magia sale mal»). «¡Otra cosa!»
deshace el último latido.

**Por franjas:** 5–7 → dos opciones cerradas, mucho sonido y repetición, sin
muerte ni pérdida, rebobinar gratis · 8–10 → tres opciones y una abierta, el
compañero tiene carácter, misterio suave · 11–12 → opciones abiertas, dilemas
con precio, el niño puede proponer reglas que Tizno negocia.

**Tablas de oráculo** (a rellenar con el mundo de Javier): lugares · criaturas
· objetos mágicos · carencias · giros de «hasta que un día» · finales de «y
desde entonces» · preguntas para el silencio.

**Movimientos de Tizno** (Dungeon World, adaptados): ver tabla del canon.

**Motor técnico previsto:** prompt del agente + variables dinámicas +
herramientas de cliente (`anotar` escribe hechos, `ilustrar` más adelante) +
libro de hechos en el navegador primero. Sin backend hasta el libro.

---

## Encargo a Javier: la biblia de mundo (5–8 páginas, no 30)

Javier crea el mundo; Ruben la personalidad; el resto se define después.
Once decisiones que el mundo tiene que responder:

1. **La regla única** que lo hace distinto, en una frase (tres soles, la magia se canta…).
2. **Época y tecnología**, y una **grieta por donde entre cualquier cosa**: un niño pedirá un robot en un mundo de castillos y Tizno no puede decir que no.
3. **La magia**: quién la tiene, qué cuesta, y qué pasa cuando sale mal (la piel de la Caída).
4. **Casa**: donde empieza y termina cada capítulo.
5. **Cinco a siete lugares** con ánimos distintos: seguro · misterioso · maravillas · miedo suave · prohibido.
6. **Seis a diez criaturas**, cada una con lo que quiere y lo que teme. Dragones sí o no.
7. **La sombra**: por qué salen mal las cosas. Nunca un villano que mata.
8. **Lo imposible**: nadie muere, lo roto se arregla, lo perdido vuelve.
9. **Cómo se llaman las cosas**: lógica de nombres para inventar más del mismo mundo.
10. **Qué pinta el niño ahí**: visitante o habitante, y por qué puede ser el héroe, sin que el mundo «le necesite».
11. **Su unión con la cueva** de Soulware: lado de día o mundo aparte; cómo cruza Tizno.

Condiciones de formato (vienen del motor): nombres pronunciables en castellano
e inglés y de menos de veinte letras (lista de palabras clave del ASR); cada
lugar y criatura con cómo suena y cómo huele (solo audio); territorios sin
nombrar a propósito (los huecos los rellena el niño). Su texto es canon, como
el de Germán en Anatomía. **No escribir el árbol: no existe árbol.**

---

## Pendientes

- Javier: biblia de mundo (encargo arriba).
- Ruben: personalidad de Baby Tizno (sobre la ficha actual, cute y nunca enfadado).
- Claude: leer las fuentes del canon antes de escribir reglas; con el mundo en
  mano, biblia narrativa (espina · baldosas · oráculos · movimientos · franjas)
  y reescritura del prompt del agente en ES y EN.
- Antes de nada público: DPIA, piloto con tres familias, revisión legal.
