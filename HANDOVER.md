# HANDOVER.md — El Umbral / Soulware
*Last updated: August 16, 2026 — Session 14 (SEO: de 10/20 a 20/20 páginas indexadas en una noche)*

---

## Sep 8, 2026 — Pagos (decisión en marcha), El Último Pago, y los botones bajo Tizno

### Pasarela de pagos — recomendación entregada, Javier crea la cuenta
Ruben pidió una pasarela para (1) vender experiencias digitales (Anatomía:
prólogo + primer piso gratis, el resto a 2,99 €) y (2) más adelante libros
físicos con Lantia gestionando pedidos y envíos. **Recomendación: Stripe, una
sola cuenta, dos carriles** — verificado en las fuentes el 8-sep:
- Stripe normal para España/UE: 1,5 % + 0,25 € (tarjeta EEE), **Bizum en
  Checkout y Payment Links desde mayo 2026** (changelog 2026-05-27), Apple/
  Google Pay. Bajo 10.000 €/año de ventas transfronterizas B2C la UE permite
  cobrar el IVA de casa; **libros electrónicos y audiolibros van al 4 %** en
  España (art. 91 LIVA, RDL 15/2020; DGT avala audiolibros) — Anatomía es
  texto + voz, encaja, pero lo confirma el gestor. El umbral cambia en
  enero de 2027 (seguimiento por país de destino).
- Stripe **Managed Payments** (merchant of record, GA, España elegible):
  3,5 % SOBRE las tarifas de Payments; Stripe asume el IVA en 80+ países
  (UK, MX, US…); **solo productos digitales, sin Bizum, sin dominio propio,
  el recibo lo firma Link**; requiere revisión de elegibilidad. Es una
  casilla en la misma Checkout Session: se activa por país del visitante
  (Netlify Functions dan `context.geo`) para compradores fuera de la UE.
- Descartadas: Lemon Squeezy / Paddle (solo digital, 5 % + 0,50 $, LS se
  funde en MP), Gumroad (~10 %, su marca), Shopify (cuota, plataforma
  entera), TPV bancario.
- Economía a 2,99 € con IVA 4 %: quedan ~2,58 € (Stripe normal) / ~2,48 €
  (MP). A 1,99 €: ~1,63 / ~1,56. Recomendado 2,99 €.
- **Lantia**: tienen libros.cc, POD y agregación; la página del servicio a
  editoriales no es pública. La compatibilidad depende de QUIÉN VENDE: si
  Soulware vende y Lantia solo prepara/envía → Stripe cobra (dirección +
  tarifas de envío) y una función les pasa el pedido; si vende Lantia → la
  web solo enlaza. Preguntas pendientes a Lantia: vendedor, cómo llega el
  pedido (API/webhook/panel), quién factura al lector, tarifas por zona.
- **Estado**: Javier crea la cuenta de Stripe (NIF de Soulware; Bizum lo
  exige; solicitar MP; activar Bizum/Apple/Google Pay; clave de test).
  Ruben pregunta al gestor (4 % y umbral 2027) y a Lantia. Después: Javier
  (o yo desde la sesión de Netlify de Ruben) mete 3 variables de entorno
  (clave secreta, secreto del webhook, secreto de firma de la llave).
- **Arquitectura pendiente (no empezar hasta que vuelva Anatomía)**: HOY el
  texto ENTERO viaja en el bundle (`AnatomiaEngine.js: import score from
  './score.es.json'`) — cualquiera lo lee con «inspeccionar». Para cobrar
  de verdad: prólogo + piso 1 en el bundle, los otros 8 pisos servidos por
  una función de Netlify que exige la llave firmada (primer serverless del
  proyecto). Tres funciones: crear sesión (elige carril por país), verificar
  + firmar llave (webhook), servir pisos. Llave en localStorage + enlace
  guardable; recuperación por email de compra. Sin cuentas, sin DRM.
  Condiciones de compra ES/EN nuevas + casilla de renuncia al desistimiento
  (contenido digital, Directiva 2011/83/UE art. 16 m).
- **Anatomía en pausa** (Ruben): se retoma en un par de días con
  regrabación completa por Diego (amigo argentino). El motor ya admite una
  toma por piso.

### Catálogo — El Último Pago, y Totalis fuera por ahora (commit content(obras))
- La obra de la Emperatriz es **El Último Pago**, Alicia Sarel, tragedia
  lírica. Portada real (`/assets/el-ultimo-pago.webp`, 600×900 desde el PNG
  1800×3000 de Descargas: es 3:5, así que 30 px de papel ESPEJADO por lado
  para llegar a 2:3 sin recortar título ni sello) + móvil 280×420.
- Nuevo estado en CATALOGUE: `retailers[{ id, soon: true }]` (sin url) →
  marca apagada, sin ancla ni chispas, bajo «Próximamente en». Un libro con
  solo tiendas anunciadas recibe el COFRE (clase --available + --pronto) —
  «como un igual a Pulso y Filamentos». Cuando haya enlace: url, fuera el
  soon, edición y obra a 'available'. Nunca un enlace de relleno.
- Totalis Libertas (la-corte) fuera del catálogo «por ahora»: 301 al
  catálogo (ES/EN) en _redirects, fuera de sitemap, @graph, fantasma y
  Router. Entrada completa en git `26bbf11`; en StateManager hay una nota
  con la lista de sitios que tocar para reponerla.
- Filamentos: Amazon vivo + Casa del Libro/ECI/Fnac anunciadas tras el
  filete con nota «próximamente». **No hay ebook y no lo habrá: la autora
  no lo quiere** (decisión, no hueco). Pulso no cambia (sus 4 tiendas viven:
  CdL y Amazon 200; ECI y Fnac 403 solo al bot).
- Ruta /obras/el-ultimo-pago/ ES+EN prerenderizada (Book JSON-LD sin
  oferta), sitemap con lastmod de hoy. El fantasma SEO no emite
  href="undefined" para tiendas anunciadas.
- **Anatomía también en cofre grande** (Ruben, misma tarde): invitación
  propia `cofreInvite` («Experiencia inmersiva» / «Immersive experience»),
  cuatro LLAVES apagadas — los palos de la baraja, `palo-*.svg` de trazo fino
  como ebook-fino — y la nota «próximamente» debajo. Son marcadores para el
  acceso de pago futuro («we play later with the access»). `llave:true` en
  retailers.js: el fantasma SEO no las lista como tiendas.
- Lectura de Ruben que tomé: «en pulso y filamentos podemos poner
  próximamente en CdL, ECI, Fnac y Amazon» → Pulso ya tiene las cuatro
  vivas, así que solo Filamentos recibió las anunciadas. Ajustable.

### Tizno en la web madre — tres peticiones de Ruben (commit fix(tizno))
- **Botones bajo Tizno, centrados**: con él suelto, `.footer-bar.tizno-libre
  .fb-right` pasa a `position: fixed` centrado bajo el centro del marco
  (right 8px + 910×0,55/2 ≈ 258px desde el borde de la VENTANA — la barra
  tiene max-width 1500 y su borde no es el de la ventana). Franja 769–820:
  el grupo baja a la segunda fila de la barra (en flujo, margen calculado
  para el centro a 191px). ≤768: nada que hacer, la barra ya lo centra (y un
  fixed ignoraría el safe-area de iOS). Verificado a 1200, 1440 (EN) y 800.
- **Susurro apagado** («summoning Tizno…»): `_susurroEl()` devuelve null y
  `#liberar-susurro { display:none !important }`. Los diagnósticos del
  micrófono van a `console.warn('[Tizno] micrófono:')`. Tizno sigue
  pidiendo el candado en voz (sinMicro) — el texto no hace falta.
- **Súplica en español con la web en inglés**: `_latidoSuplica` cargaba
  `frase-sin-micro-{1,2}.mp3` a pelo. Ahora rota por el banco del idioma
  de la web: 2 tomas ES, 4 EN (`frase-sin-micro-en-1..4`).

### PageSpeed de /obras/ (móvil) — 98 · 96 · 100 · 100, y lo que se tocó
Ruben pasó PSI (https://pagespeed.web.dev/analysis/https-soulware-live-obras/e4z661b1mk?form_factor=mobile):
FCP 1,1 s · LCP 1,4 s · TBT 0 · CLS 0 · SI 4,3 s (naranja). La API anónima
de PSI ya no da cuota (429): se audita con `npx lighthouse` en local.
- **Contraste (único fallo de accesibilidad, 96 → 100)**: el auditor hace su
  foto en un instante fijo tras la carga que cae EN MITAD del fundido de las
  frases del hero: leía #464646 (el gris al 75 % de opacidad), no el color
  del CSS. Arreglo de raíz: el velo de `.hero-frase` es ahora una MÁSCARA
  (`--velo` registrado con @property, de −35 % a 100 %, borde difuminado)
  en vez de opacidad — la opacidad se multiplica en el color calculado, una
  máscara no. Misma coreografía y tiempos. Además la línea editorial pasa de
  #5d5d5d (3,2:1) a #7a7a7a (4,9:1), aún por debajo del #9a9a9a del susurro.
- **Imagen**: la portada móvil de Anatomía baja de 29,6 KB a 21,9 KB (q45
  desde el PNG de Descargas; a 3× no se distingue).
- **Forced reflow**: `_buildArchiveGrid` leía `innerWidth` dos veces tras
  insertar DOM; ahora una vez al principio. El resto de lecturas (clic,
  scroll, luciérnagas) son inocuas.
- **NO tocado, a propósito**: Speed Index 4,3 s es la coreografía del
  archivo (frases a 1,15/1,6/2,0/2,45 s + 1,4 s) — decisión artística, no
  lentitud; caché de 7 días en vídeos/portadas (netlify.toml explica por
  qué); CSS render-blocking (es la hoja principal, inevitable); «unused JS
  21 KiB» (partir el bundle no compensa); animaciones no compuestas (cofre).
- OJO en Lighthouse local: mi Chrome inyecta un script de 98 KB con una URL
  base64 en soulware.live que NO existe en el sitio (Netlify le da 404):
  ignorarlo — el informe de Google no lo tiene.

### Auditoría GPT del 8-sep — contrastada y aplicada (commit fix(auditoria))
Ruben pasó la «segunda auditoría de lanzamiento» de GPT. Veredicto: seria,
se autocorrige, nada absurdo. Contrastado punto por punto y aplicado:
- **Cookies decía Formspree** (ES/EN) → Netlify Forms (Netlify, Inc.).
- **Canonical de la Estancia** apuntaba a `/tizno` (301) → `/tizno/`; ES y EN
  en el sitemap (prioridad 0,6). Los enlaces ES/EN del conmutador también
  con barra. generate-tizno-pages: el replaceAll de URLs respeta la barra.
- **SDK de ElevenLabs fijado** a `@elevenlabs/client@1.25.0` (esm.sh servía
  «la última»). Para subir: cambiar, probar la Estancia, desplegar.
- **Tecla «0»** (reinicia el tope diario) solo con `?tune=1`.
- **Estancia**: enlace «← Soulware» arriba a la izquierda (/ o /en/).
- **Privacidad de Tizno**: el pacto (web madre), el aviso de la Estancia
  (ES/EN) y el aviso legal (ES/EN) dicen ahora que la voz la pone
  ElevenLabs y que la voz + lo que recuerda viajan a sus servidores, con
  enlace a su política. NO se tocó privacidad/cookies (Ruben, ago: Tizno
  solo en aviso legal y en el pacto). Texto exacto en el commit.
- **Grises de las páginas legales**: #666→#8c8c8c (6,1:1), #555→#8a8a8a.
- **Nada invisible en el tabulador**: `#umbral-btn`, `#scene-2` y `#scene-3`
  nacen `inert` en el HTML; las escenas se des-inertan al mostrarse. OJO:
  `#umbral-btn` («EL UMBRAL») es un RESTO — ningún código lo hace visible
  (el intro avanza solo); un MutationObserver lo des-inertaría si algún día
  alguien le pusiera opacidad 1.
- **La ficha vive en la URL** (lo más valioso del informe): abrir un libro
  desde la portada hace pushState a `/obras/<slug>/` con título/canonical;
  abrir un personaje desde el pilar, a `/<personaje>/`; cambiar de pestaña
  Autor/Libros hace replaceState; Atrás cierra la lectura (Router avisa a
  `closeReading({silencioso:true})`, que no apila); cerrar con el botón
  vuelve a `/obras/` si se entró por ahí, a `/` si no. `slug` nuevo en
  CATALOGUE (fuente única: el prerender deriva OBRA_RUTA de él). Probado:
  portada → URL, Autor → /caballero/, Libros → /obras/pulso-del-nucleo/,
  Atrás → /obras/ cerrada, Adelante → reabierta en Libros.
- **«Avísame» recuperado**: al pasar Anatomía y El Último Pago al cofre
  desapareció el botón que abría la captación de correo. Ahora las marcas
  apagadas son <button> con la clase obra-btn--soon y abren el Aviso con el
  título de la obra (busca .obra-title, .reading-obra-title o el h3).
- **No aplicado, por decisión**: DOM fantasma → HTML visible; renombrar
  «Autor»; CSP (más adelante, en report-only); perfilado del intro (constraint
  conocido).

### Tizno: el nombre (8-sep, panel de ElevenLabs)
Ruben: «corrige su nombre mucho… Tizno no, ¡Tizno!». Dos frentes, los dos
publicados en Main y tirados a la rama gemini-3-flash-preview:
- Bloque «TU NOMBRE — SIN QUISQUILLAS» al principio del system prompt:
  cualquier «Tisno/Tizmo/Tino/Ticno/Tirso…» es él; nunca corrige, nunca
  deletrea, lo dice una vez solo si se lo preguntan; igual con las Voces y
  las obras; vale en inglés.
- Settings → ASR → Keywords (máx. 20 caracteres/palabra): Tizno, Soulware,
  Umbral, Emperatriz, Sortílega, Arlequín, Pulso del Núcleo, Filamentos,
  Anatomía, Último Pago, Caballero — el reconocedor deja de inventarse
  nombres a la entrada, que es donde nacía el error.
Lo que Tizno YA sabe del visitante (buildDossier en tizno-ai.html, viaja
como contexto oculto + variables): hora y si es rara, día, zona horaria,
idioma del navegador, origen (Instagram/buscador/directo), batería, móvil,
modo oscuro, reduced-motion, segundos mirándole antes de hablar, nº de
visita y días desde la última, nombre recordado. El prompt ya tiene «LA LEY
DEL ILUSIONISTA» para jugarlas con cuentagotas.

### La carta del fuego (8-sep, commit feat(tizno))
La única idea nueva que Ruben aceptó: si el visitante se saltó el intro,
Tizno le dice que se ha perdido algo bueno. Lo demás (ratón, contadores,
tiendas pulsadas, pestañas) lo rechazó: «no me gusta que cuente x veces o
que sea un poco big brother… que Tizno es muy listo, no que te observa».
- main.js graba `sw_intro_vista=1` al cruzar la escena 3 (enterMainSite) y
  `window.__introSaltada` al pulsar «Romper el trance».
- TiznoTease añade `&intro=vista|saltada|nunca` al src del marco.
- tizno-ai.html: `INTRO` (URL en el embed; localStorage en la Estancia),
  `dossier.intro`, y dos líneas en dossierToText: «SE SALTÓ EL FUEGO…»
  (lástima o reproche, que vuelva por «Volver al Umbral») y «ENTRÓ POR UNA
  PUERTA LATERAL…» (invitarle a la puerta principal, sin vender).
- Prompt (Main + rama): carta «El fuego» en TUS CARTAS.
- ASR Keywords ampliadas a 26: + Alicia Sarel, Eidon, Irina, Germán Ferri,
  Casa del Libro, Corte Inglés, Fnac, Pulse of the Core, Eternal Core, Sibyl,
  Harlequin, The Hollow, Totalis Libertas, Núcleo Eterno, Voces del Umbral.
  Una sola lista para ES y EN (máx. 20 caracteres por palabra, 50 en total).

### Auditoría GPT, 3ª ronda (8-sep, 18:27) — contrastada y aplicada
Nota de GPT: 8/10, «sí para difusión gradual». Confirma corregido lo de la
2ª ronda. Tres abiertos, aplicados (commit fix(auditoria-3)):
- **Foco sobre el catálogo oculto**: cierto — `#main-site` estaba a opacidad
  0 tras el intro pero no inerte, y «LAS OBRAS» recibía Tab. Ahora nace
  `inert aria-hidden` en el HTML y showArchive() (único camino por el que
  se muestra) lo libera. «Volver al Umbral» recarga la página, así que
  vuelve a nacer inerte. Verificado: al arrancar solo `skip-btn` es
  tabulable; en /obras/ el nav vuelve a serlo.
- **«Avísame» con la obra**: el modal envía `form-name=el-pacto` con el campo
  `obra`, pero el form oculto de Netlify NO declaraba ese campo → Netlify lo
  habría descartado (solo guarda campos declarados). Añadido
  `<input type="hidden" name="obra">`. PENDIENTE un envío de prueba real
  (es un formulario: lo hace Ruben o me da permiso) y mirar Netlify → Forms.
- **Privacidad**: describe ahora el aviso de disponibilidad (correo + obra,
  finalidad, borrado tras el aviso o a los 12 meses, Netlify Forms, derecho
  de supresión) en ES y EN. Tizno sigue fuera de privacidad por decisión de
  Ruben (agosto): va en el pacto y en el aviso legal.
- No aplicado: perfilado del intro (constraint conocido), CSP (más adelante),
  Buscalibre (plan de Ruben), matriz física de dispositivos.

### Tizno vive en Gemini 3 (8-sep, tarde)
Ruben: «movemos a 3.0 en la versión live y vemos qué pasa». Main → Gemini 3
Flash Preview (reasoning effort «minimal»), publicado. La rama
gemini-3-flash-preview queda redundante. Ojo: el aviso de ElevenLabs dice que
migrarán 2.5 → 3.5 Flash automáticamente; en la lista hay 3.5/3.6/3.7 Flash.
Si el 3 Preview desaparece o suena raro, el siguiente candidato es 3.5 Flash
(latencia algo mayor: 0,9–3,8 s frente a 1,1–1,9 s).

### Las Llaves de la Caja — instrucciones para Javier (8-sep)
Artefacto: https://claude.ai/code/artifact/76996a43-2de4-47e5-aae1-a266a363c278
Seis pasos: cuenta Stripe (NIF obligatorio para Bizum), Bizum/Apple/Google
Pay + solicitar Managed Payments, STRIPE_SECRET_KEY (test) en Netlify,
LLAVE_SECRET (openssl rand -hex 32), webhook cuando avise Claude
(https://soulware.live/.netlify/functions/stripe-webhook →
STRIPE_WEBHOOK_SECRET), y notificación por correo del form el-pacto a
editorial@. Regla: las claves nunca pasan por el chat ni por Claude.
Prueba del «Avísame» hecha desde producción (editorial@, El Último Pago):
POST 200 y «Hecho»; falta verla en Netlify → Forms (sesión cerrada en el
Chrome de Ruben; no entro en cuentas).

### Stripe, primer ladrillo: el webhook (9-sep, encargo de Javier)
`netlify/functions/stripe-webhook.mjs` (Functions 2.0, esbuild; `[functions]`
en netlify.toml; `stripe` ^22 en dependencies). POST
https://soulware.live/.netlify/functions/stripe-webhook. Verifica SIEMPRE la
firma (constructEvent sobre el cuerpo crudo) con STRIPE_WEBHOOK_SECRET; sin
STRIPE_SECRET_KEY o sin el secreto → 500 not_configured; firma mala → 400;
GET → 405; evento ajeno → 200 ignored. Maneja checkout.session.completed
(solo cumple si payment_status = paid) y los dos async_* (Bizum confirma
después). Hoy `cumplir()` solo registra (email enmascarado); ahí irá la
llave del lector. Probado en local con firmas válidas/manipuladas/ausentes
(9 casos). Variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (las pone
Javier en Netlify; Claude nunca las ve).

### Compra de Anatomía en rama (PR #64, deploy preview 64) — 9-sep
Javier (vía su GPT) pidió un único botón «Comprar — 2,49 €» hacia su Payment
Link Sandbox, sin variantes por palos, probado en deploy preview y SIN
publicar en producción. Rama `stripe-sandbox`, PR #64:
https://deploy-preview-64--el-umbral.netlify.app/obras/
- El enlace lo inyecta el build (vite `define`) desde
  `STRIPE_PAYMENT_LINK_ANATOMIA` (valor por contexto en Netlify). Sin
  variable: Sandbox por defecto en previews/ramas/local; en `production`
  cadena vacía → sin botón. Comprobado: el bundle de producción no contiene
  buy.stripe.com.
- En el cofre, el botón ocupa el sitio de la invitación y las cuatro llaves
  quedan de adorno (`retailerLink(r, {adorno:true})`, sin Aviso).
- El Checkout Sandbox muestra «Anatomía del Vacío €2.49», con Bizum,
  tarjeta y Link; el negocio aparece como «Core Soulware».
- NO fusionar hasta que Ruben lo diga: Anatomía no entrega nada aún tras el
  pago (falta partir la partitura y la llave). Al pasar a Live: poner el
  enlace Live en la variable del contexto Production y fusionar.
- Precio: Javier fijó 2,49 € (la cuenta del 8-sep recomendaba 2,99 €; con
  0,25 € fijos de Stripe, a 2,49 la comisión pesa ~12 %).

### 9-sep, noche — Tizno se pasó al castellano con la web en inglés
Conversación «Language Switch» (Main v31, Gemini 3 Flash Preview): saludo
en inglés, silencio del visitante, y el 2º turno ya en castellano; al
quejarse, inglés «con voz española» (la sesión seguía en inglés: es el
texto castellano pasado por TTS inglés, y viceversa). Client data: override
Language = English, idioma = en → la sesión arrancó bien; falló el MODELO.
«Detect language» del agente estaba apagado (no fue eso).
- Arreglo 1 (código, desplegado): `dossierToTextEn` — el contexto oculto
  viaja en inglés en sesiones EN, con aviso explícito de que también los
  turnos de silencio van en inglés. Antes TODO el contexto era español.
- Arreglo 2 (panel): Main → Gemini 3.5 Flash y, minutos después, → **Gemini
  3.6 Flash** (Ruben: mismo precio y más rápido: 0,8–1,6 s frente a
  0,9–3,9 s). OJO: Gemini 2.5 ya no aparece
  en la lista (una vez abandonado no hay vuelta). Si 3.5 también deriva,
  siguiente candidato Claude Haiku 4.5 (estricto con instrucciones, ~0,7 s).
- Arreglo 3 (panel): bloque «SI TE PIDEN CAMBIAR DE IDIOMA» en el prompt:
  Tizno no cambia en conversación; señala el selector ES/EN arriba a la
  derecha, en su voz, en ambos idiomas.
- Coste/latencia (lista ElevenLabs 9-sep): 3.5 Flash ~0,017 $/min y
  0,9–3,8 s; 3 Preview ~0,039 $/min y 1,1–1,9 s; 3.6 Flash ~0,016 $/min y
  0,85–2,7 s (candidato si el 3.5 hace pausas). Claude Haiku 4.5 ~0,72 s si
  el 3.5 también rompe el idioma.
- Pendiente: que Ruben/Javier repitan la prueba en /en/ con un silencio
  largo tras el saludo.

### Baby Tizno — el agente ya existe por separado (9-sep, noche)
Ruben: «duplica la personalidad que tenemos ahora en ElevenLabs (en los dos
idiomas) para tocar por separado». Hecho desde el panel (Options → Duplicate
agent):
- **Baby Tizno** = `agent_3601m23sdxb4fx0adrkse21ynvb9` (rama Main
  `agtbrch_3701m23sdxb6ezfvvpfgg468qvz3`). Copia exacta de Tizno a día de
  hoy: mismo system prompt (14,6k caracteres, con los bloques del nombre y
  del idioma), español + inglés, Gemini 3.6 Flash, `{{saludo}}` como primer
  mensaje, mismas herramientas y KB. También se copió la rama redundante
  `gemini-3-flash-preview` (se puede borrar en los dos agentes).
- El Tizno de producción (`agent_2101kyzjd6e6ehhaaq9m4mhn8dhq`) NO se ha
  tocado. Nada en el código apunta todavía al agente nuevo.
- Decisiones de Ruben para Baby Tizno: 5–12 años; el adulto configura y
  entra como adulto; MISMO Tizno (sin chupete), más grande y protagonista;
  más cute y nunca enfadado; libro impreso al final («devuélvele la
  creatividad a tu hijo»); imágenes con ElevenLabs Image & Video más
  adelante. Marco legal: artefacto «El Mapa Legal de Baby Tizno».
- Siguiente: biblia narrativa (espina + baldosas + ficha del héroe +
  movimientos del narrador + oráculos, por franjas 5–7 / 8–10 / 11–12) y
  reescritura del prompt de Baby Tizno en los dos idiomas (quitar
  [Angrily], añadir aviso de IA, nunca «te necesito»).

### Baby Tizno — la biblia narrativa v0.2 (9-sep, noche)
Ruben: «empezamos a definir todo lo demás de Tizno» (ficha, voz por franjas,
«nunca», capítulos modelo, oráculos, baldosas, textos del adulto) «y luego lo
vamos conectando a nuestro nuevo personaje en ElevenLabs».
- `BABY-TIZNO-BIBLIA.md` (8,4k palabras) + página compartible
  https://claude.ai/code/artifact/1518f8b6-4abe-4c9e-8d4c-367065a8633c
- `BABY-TIZNO-FUENTES.md`: las nueve referencias del canon leídas en el
  original (agente de búsqueda), con lo que NO se pudo verificar. La biblia
  §9 dice qué regla sale de qué fuente. Cambios que salieron del contraste:
  «¡No!» es palabra de seguridad (NTYE: lo que asusta huye al instante);
  Adams tiene tres «por eso» (el tercero solo a los 11–12); selección de
  baldosas por saliencia (Short); palabras del niño literales + relectura al
  cerrar (Paley); movimientos de Tizno y «solo habla en tres momentos»
  (Dungeon World); oráculo como especia (Ironsworn); aceptar/rechazar/desviar
  (Ingold); ritual de apertura de dos elecciones por voz (Lunii).
- Mundo PROVISIONAL (Casa del Árbol, Niebla Olvidona) hasta la biblia de
  mundo de Javier; Ruben cierra la personalidad sobre la ficha propuesta.
- Decisiones abiertas para Ruben: lista de acotaciones aprobadas (ocho
  propuestas, ninguna de miedo/enfado) y si Baby Tizno usa la voz de
  producción o una toma más lenta para 5–7.
- Siguiente: con el visto bueno, conectar pieza a pieza al agente
  `agent_3601…` (§8 de la biblia): prompt ES/EN, `{{saludo}}` por franja,
  `{{franja}}` como variable, KB con espina/baldosas/oráculos, client tools
  `anotar`/`rebobinar`, humor «ternura» en MOOD_LEX.

### Baby Tizno — 10-sep: el mundo de Javier, decisiones de Ruben y limpieza del agente
- Javier entregó «El Reino de la Primera Llama» (docx) → `BABY-TIZNO-LORE.md`
  (canon, copia fiel). Aldea sin nombre, volcán con la Primera Llama, Bruja
  que gobierna por miedo, Dragón cuya voluntad no es de nadie, ocho umbrales
  con sonido y olor, siete momentos por capítulo (Entrada · Señal · Elección ·
  Viaje · Giro amable · Decisión · Cierre), ficha de continuidad de cinco
  campos. «La Pluma es más poderosa que la Espada».
- Ruben: **Baby Tizno es un producto aparte**, no promo de Soulware. No sabe
  nada de libros ni del Umbral; solo que viene de Soulware, que el Tizno
  original vive allí y que él es la versión infantil que cuenta cuentos.
  Castellano primero, inglés después. Misma voz para todos (Gork) más suave y
  cute. Tablet y móvil con la misma página. T&C transparentes. Cajón de
  «Recuerdos» con borrado por elemento. Libro/imágenes/app: después.
- **Panel ElevenLabs, agente Baby Tizno (`agent_3601…`), publicado en Main
  (dos publicaciones: «Update ASR keywords and privacy settings» y «Clear all
  knowledge base documents»)**: Store Call Audio OFF · retención 30 días con
  borrado automático de transcripción y audio · Zero Retention no (hace falta
  la transcripción para depurar la prueba; para lo público, activar) ·
  Eagerness «patient» · turn timeout 7 → 10 s · keywords: Tizno, Soulware,
  Primera Llama, Bruja, Dragón, Volcán, Bosque Encantado, Panthera, otra cosa,
  Reino · **KB vaciada** (los 8 docs de Soulware se DESVINCULARON del agente,
  no se borraron: el Tizno de producción sigue con sus 8, comprobado). Truco:
  las filas de la KB tienen menú «···» → «Detach from agent»; con clics por
  coordenadas, uno a uno, porque el banner de «KB pequeña» desplaza filas.
- El prompt del agente sigue siendo el de producción (heredado): se
  sustituye entero cuando Ruben aclare la «entrada del adulto» (§4 de la
  biblia). Pendiente de Ruben: confirmar el flujo (puerta del adulto: aviso +
  franja + «dáselo al peque»; el niño construye el héroe por capas con Tizno,
  como escribió Javier).

### Baby Tizno — 10-sep, noche: términos de ElevenLabs y opt-out de entrenamiento
- Leídos los términos oficiales (`BABY-TIZNO-ELEVENLABS-POLITICAS.md`, con
  citas y fechas). **Bloqueo**: la Prohibited Use Policy (17-ago-2026) prohíbe
  «bundled solutions that target anyone under the age of 13» y la Privacy
  Policy prohíbe transmitirles voz de menores de 18 → Baby Tizno necesita
  autorización escrita de ElevenLabs; mientras tanto se prueba SOLO con
  adultos. Ruben escribe a ElevenLabs cuando le conteste el director de
  Grants. Los ElevenAgents Terms §3.B obligan a avisar al usuario final de que
  habla con una IA y de que se graba/comparte → la frase de IA vuelve al
  primer saludo (Ruben ok).
- **Opt-out de entrenamiento ACTIVADO** en la cuenta de Ruben (avatar → Terms
  and privacy → Data use → «Improve the models for everyone» OFF; toast de
  confirmación). Por defecto ElevenLabs entrena con el contenido de los planes
  self-serve, incluidas conversaciones de agentes; el opt-out no es
  retroactivo. Zero Retention y residencia EU: solo Enterprise.
- Voz «Gork»: clon profesional de otro usuario en la Voice Library, licencia
  comercial de plan de pago, preaviso de retirada de 2 años. Vale para prueba
  y piloto; para lo público, voz propia.
- Documento Maestro de Javier: guardado (`BABY-TIZNO-MAESTRO-JAVIER.md`);
  decisiones D1–D18 en BABY-TIZNO.md, ya respondidas por Ruben: claim «Dale
  voz a su imaginación», login serio + PIN más adelante, memoria preguntada al
  configurar, SÍ historial borrable, web → web instalable → wrapper, aviso de
  IA al adulto Y en el saludo, Core Soulware, Ruben es el jefe de proyecto de
  todo lo de Tizno.
- Siguiente: prompt en castellano (tres registros, palabras de parada, frase
  de IA) y página standalone (puerta del adulto con multiplicación, ajustes,
  Recuerdos e historial en el aparato, filtro de datos sensibles). Pruebas con
  adultos.

### Baby Tizno — 10-sep, noche: prompt v0.1 en el agente
- `BABY-TIZNO-PROMPT.md` (17.601 caracteres) pegado ENTERO en el system
  prompt de `agent_3601…` (Main) y publicado («Rewrite Tizno character prompt
  and logic», toast «Main updated»). Verificación: hash djb2 del texto
  normalizado igual en el editor y en el archivo (len 17584, hash 531855973).
- Cómo se pegó (la extensión no puede pegar el portapapeles del sistema con
  cmd+v, y `navigator.clipboard.readText()` cuelga la pestaña esperando un
  permiso): JS en la página → `DataTransfer` + `ClipboardEvent('paste')`
  sobre `.ProseMirror`. OJO: `document.execCommand('selectAll')` NO selecciona
  para ProseMirror (el primer pegado se AÑADIÓ encima del prompt viejo);
  seleccionar con `Range.selectNodeContents(pm)` + `getSelection().addRange`
  y volver a pegar sí reemplaza todo.
- CORRECCIÓN: la voz del agente (y de producción) es «Parasyte - Dweller in
  the Deep-Dark» (English · British · +13 · Characters · preaviso 2 años ·
  recargo 0,20 $/1.000 créditos), no «Gork». La conclusión de licencia no
  cambia (voz de biblioteca de otro usuario, comercial en plan de pago,
  preaviso máximo), pero la memoria estaba desactualizada.
- Faltan en el agente: tools de cliente `anotar(hecho)`, `rebobinar()`,
  `cerrar_capitulo(resumen)`; KB con el lore de Javier, oráculos y baldosas
  del Reino; saludos por franja los compone la página (`{{saludo}}`).
- Siguiente: la página standalone.

### Baby Tizno — 10-sep, mediodía: LA PRUEBA LIVE (Ruben: «sigue hasta que tengamos una prueba live»)
- **URL de prueba: https://soulware.live/baby-tizno/** (sin enlazar, con
  `noindex`, fuera del sitemap). Tablet, móvil y escritorio con la misma
  página. Solo con ADULTOS hasta el permiso escrito de ElevenLabs.
- **Cómo está hecha**: `scripts/generate-baby-tizno.js` (postbuild) genera
  `dist/baby-tizno/index.html` A PARTIR de `public/tizno-ai.html` (misma
  criatura, una sola fuente): cambia la puerta del head (solo /baby-tizno y
  ?demo=1), inyecta `src/baby-tizno/baby.css` (piel de día: negro acogedor,
  luz de vela cálida, botón grande) y `src/baby-tizno/baby-ui.html` (capas de
  la zona de mayores), parchea el rig (sin sustos: `scareSfx` y `sfxPlay`
  solo pop/ronroneo) y sustituye el módulo del SDK por
  `src/baby-tizno/baby.js`. Cada ancla del rig se comprueba: si el rig
  cambia, el build falla en voz alta. El resultado se minifica como el rig.
- **Flujo**: puerta del adulto (la primera vez, texto de transparencia +
  casilla; siempre, una multiplicación 3–9 × 3–9) → Inicio (resumen del
  último capítulo, estado, «Dáselo al peque» / «Ajustes») → Ajustes (franja
  5-7/8-10/11-12, nombre del héroe opcional, memoria on/off, «cosas que no
  entran en el cuento», Recuerdos con borrado por elemento, Historial por
  capítulo con resumen y transcripción y borrado, «Empezar historia nueva»
  = el Reino pasa al archivo, «Borrar todo») → pantalla del niño (Tizno +
  botón grande «Hablar con Tizno»/«Parar», rincón «Mayores» arriba a la
  derecha) → fin de capítulo («Fin del capítulo» si el agente llamó a
  cerrar_capitulo; «Paramos aquí» si se interrumpió) → «Soy mayor» → puerta.
- **Estado en el aparato** (`localStorage.bt_v1`): puerta, ajustes, reino
  {recuerdos[], capitulos[{n, inicio, fin, lineas[], resumen, cerrado,
  conversationId}]}, archivo[]. Tope diario `bt_daily` 40 min. Sesión 11 min
  (el agente corta a 10). A los 75 s del final se le susurra al agente que
  cierre con calma (sendContextualUpdate).
- **Filtro de datos sensibles** (`limpiar`): correos, teléfonos, «Colegio X»,
  direcciones con número (y piso), «mi apellido/dirección/teléfono…». Se
  aplica a lo que dice el niño y a lo que anota el agente; nunca a los
  textos del cuento de Tizno. Probado: «la calle de la aldea» y «la escuela
  de la aldea» NO se tocan.
- **Agente `agent_3601…` (Main, publicado 3 veces hoy)**: prompt v0.1 ·
  tools de cliente `anotar(hecho)`, `rebobinar()`, `cerrar_capitulo(resumen)`
  (todas sin esperar respuesta) · KB con dos textos («El Reino de la Primera
  Llama», canon de Javier tal cual; «Oráculos») con **RAG desactivado** (la
  KB es pequeña y va entera al prompt) · first message `{{saludo}}` que
  compone la página por franja y modo (con la frase de IA) · variables
  dinámicas heroe, franja, modo, capitulo, recuerdos, vetados, saludo.
- **Función `netlify/functions/baby-borrar.mjs`**: borra la conversación en
  ElevenLabs cuando el adulto borra un capítulo. Necesita
  `ELEVENLABS_API_KEY` en Netlify (Javier); sin ella responde
  `not_configured` y el borrado local ya está hecho.
- **Trucos del panel aprendidos hoy**: los menús de «Add tool» y «Add
  document» son Radix (abrir con clic por coordenadas, no con JS); las
  herramientas se pegan en «Edit as JSON» (CodeMirror: seleccionar con
  Range + ClipboardEvent('paste')); los parámetros necesitan
  `dynamic_variable: ''` y `constant_value: ''`; el texto de la KB se mete
  con `execCommand('insertText')` en el textarea del diálogo «Create Text».
- **Probado**: puerta, inicio, ajustes, Recuerdos e historial (con datos
  sembrados), pantalla del niño, error de micrófono, rincón de mayores. NO
  probado: la conversación de voz de principio a fin (la vista previa no
  tiene micrófono). Es la prueba que hace Ruben.

### Stripe — 10-sep, tarde: Ruben ya es Super Administrador de la cuenta real; ajustes hechos
- Cuentas: **real = «Core Soulware» `acct_1UDP50JO8ECUbST9`** (Javier propietario,
  Ruben Super Administrator desde hoy) · sandbox aparte «Core Soulware sandbox»
  `acct_1UDP5AJAS9Ql4N7H` (vacío, sin usar) · **la cuenta «Buymeacoffee» de
  Ruben (`acct_1TQmZTBymhtr5pVt`) es personal/EE. UU. y NO se usa.** El enlace
  de prueba «Anatomía del Vacío» (2,49 €, Managed Payments desactivado) vive
  en el MODO DE PRUEBAS de la cuenta real, no en el sandbox aparte.
- Estado encontrado en la cuenta real: tarjeta, Apple Pay, Google Pay, Link,
  PayPal y **Bizum** ya activos (Javier); Klarna/SEPA apagados; Stripe Tax con
  sede en España y categoría «servicios prestados por vía electrónica»
  (apta para Managed Payments); descriptor «READER, CURIOUS»; marca vacía;
  sin dominios.
- **Cambios hechos hoy con el OK de Ruben (cuenta real)**: descriptor →
  «SOULWARE» (y abreviado «SOULWARE») · Amazon Pay apagado (quedan 6:
  tarjeta, Apple, Google, Link, PayPal, Bizum) · dominio `soulware.live`
  registrado en Payment method domains (Enabled) · marca: icono
  (apple-touch-icon 180px) + logo (soulware-logo 120px), color de marca
  `#050505` (fondo) y acento `#C8922A` (botones), guardado.
- Archivo de verificación de Apple Pay servido en
  `/.well-known/apple-developer-merchantid-domain-association` (main y rama
  `stripe-sandbox`, que se ha puesto al día con main para que el deploy
  preview 64 también lo sirva).
- Trucos del panel de Stripe: las páginas tardan 10–20 s en pintar (leer
  `document.body.innerText` tras esperar); los diálogos no son role=dialog
  (usar coordenadas o buscar botones por texto); las URLs de la cuenta real
  llevan `acct_1UDP50JO8ECUbST9` y el modo de pruebas `/test/`.
- Pendiente: dominio del deploy preview cuando sirva el archivo; alinear la
  configuración de métodos del modo de pruebas; decidir Managed Payments;
  clave de prueba en Netlify (Javier); construir el modal con
  `ui_mode=elements` (ver STRIPE-CHECKOUT-OPCIONES.md).

### Stripe — 10-sep, 16:30: la vista previa ya habla con Stripe (sandbox)
- Netlify (`el-umbral`, equipo de Javier; Ruben tiene acceso): variables
  `STRIPE_SECRET_KEY` (Production = **REAL sk_live_**, puesta por Javier el
  9-sep; Deploy Previews = sk_test_ pegada por Ruben hoy), `STRIPE_WEBHOOK_SECRET`
  (Production = whsec de Javier; Deploy Previews = whsec del webhook nuevo),
  `LLAVE_SECRET` (**se vació sin querer** al cambiarla a «same value for all
  contexts»: hay que generar una nueva con `openssl rand -hex 32` y pegarla;
  no había llaves emitidas, así que no se rompe nada).
- Función `netlify/functions/stripe-diag.mjs`: devuelve presencia y tipo de
  las variables por contexto, nunca valores (`/.netlify/functions/stripe-diag`).
  Comprobado: producción = sk_live_ + whsec + (LLAVE ausente ahora);
  deploy-preview-64 = sk_test_ + whsec.
- Stripe modo de pruebas: webhook **«anatomia-deploy-preview-64»**
  (`we_1UE8cgJO8ECUbST9EnEn0XiO`) → deploy-preview-64/.netlify/functions/stripe-webhook,
  3 eventos. Probado con `stripe trigger checkout.session.completed` desde el
  Shell del Workbench: **200 OK** con `{received:true}` — la firma se verifica.
  Existe también el de Javier «vibrant-spark» → soulware.live (modo de pruebas).
- Claves: Claude no pega claves nunca. Al hacer una captura de la página de
  API keys, Stripe MOSTRÓ la clave secreta de pruebas en claro (no la de
  producción). Es de sandbox; renovarla («Roll key») es opcional.
- Siguiente: construir el modal negro con Checkout Sessions `ui_mode=elements`
  en la rama `stripe-sandbox` (función que crea la sesión con la clave del
  contexto + Payment Element/Express Checkout Element con Appearance night+oro).

### Stripe — 10-sep, 17:00: el cofre de pago propio existe (rama stripe-sandbox, PR #64)
- Integración elegida: **Elements con Checkout Sessions** (`ui_mode: 'elements'`,
  Stripe.js `https://js.stripe.com/dahlia/stripe.js`, `initCheckoutElementsSdk`).
  Fuente: docs.stripe.com/payments/accept-a-payment (elements + checkout) y
  /elements/express-checkout-element/accept-a-payment (embedded-components).
- Archivos (en la rama `stripe-sandbox`, NO en main):
  `netlify/functions/crear-sesion-pago.mjs` (POST {obra, idioma} → clientSecret
  + publishableKey; precio fijado en servidor, 2,49 € IVA incluido
  `tax_behavior: inclusive`; `automatic_tax` solo si `STRIPE_TAX=1`; return_url
  a `/obras/anatomia-del-vacio/?pago=vuelta&session_id=…` sobre un origen
  nuestro) · `netlify/functions/estado-pago.mjs` (GET ?session_id → status /
  payment_status, correo enmascarado) · `src/js/ui/PagoModal.js` (Stripe.js
  bajo demanda; Appearance night + oro; Express Checkout Element con Apple/
  Google/PayPal y Link fuera de los botones grandes; Contact Details Element;
  Payment Element en acordeón; `actions.confirm({redirect:'if_required'})`;
  vuelta por `?pago=vuelta`) · modal `#pago-modal` en index.html + CSS en
  archive.css · `.obra-compra` lleva `data-obra` y el enlace de Stripe queda
  de red de seguridad · textos `pago.*` ES/EN en translations.js.
- Probado en https://deploy-preview-64--el-umbral.netlify.app/obras/anatomia-del-vacio/ :
  el botón «Comprar — 2,49 €» abre el modal (título, precio, estado). La
  función responde `not_configured: STRIPE_PUBLISHABLE_KEY` hasta que Ruben
  pegue la clave publicable de pruebas (pk_test_) en Netlify (Deploy Previews
  + Branch deploys). En producción irá pk_live_ (Javier/Ruben).
- Pendiente tras la clave: compra completa con 4242, Bizum (redirección de
  prueba), PayPal sandbox, Apple/Google Pay en móvil; luego la entrega real de
  la llave en el webhook (`cumplir`), hoy solo registra.

### Stripe — 10-sep, 18:00: el cofre abre con Stripe dentro (vista previa 64)
- Ruben pegó `STRIPE_PUBLISHABLE_KEY` (pk_test) en Deploy Previews/Branch
  deploys → el modal carga Stripe.js y pinta: franja de marcas en oro (Visa,
  Mastercard, Apple Pay, Google Pay, Bizum como texto, PayPal; SVG de
  simpleicons.org en `public/assets/pago/`, máscara CSS), correo (Contact
  Details Element) con nota «ahí te enviaremos la llave», acordeón con la
  tarjeta abierta por defecto (`layout: {type:'accordion', defaultCollapsed:false,
  radios:'always', spacedAccordionItems:true}`), Bizum, Google Pay, PayPal,
  botón «Pagar 2,49 €». Texto de carga: «Cargando pasarela de pago segura…».
- Ajustes tras el feedback de Ruben («genial, funciona»; «más legítimo»,
  «falta Apple Pay», «¿qué hace el email?», «¿o paga con qué?»): sesión con
  `payment_method_types: ['card','bizum','paypal']` y
  `wallet_options.link.display='never'` (fuera Link y su bloque «guardar mi
  información» con teléfono); botones exprés (Apple/Google/PayPal) solo
  cuando el navegador tiene cartera, y el «o paga con» solo con ellos
  encima. Apple Pay solo aparece en Safari/iPhone con tarjeta en Wallet.
- Errores cazados: `buttonTheme.amazonPay` no existe; `layout.radios`
  quiere 'always'/'never'/'auto'/'if_multiple'.
- **Primera compra completa por el modal (10-sep, 17:04 CEST, modo test)**:
  prueba@soulware.live, tarjeta 4242 → «Pago recibido» en el propio cofre
  sin redirección (`redirect: 'if_required'`); Stripe test → Payments: 2,49 €
  Succeeded; webhook `anatomia-deploy-preview-64` → `checkout.session.completed`
  entregado 200 OK (`{received:true, session:cs_test_…}`); `estado-pago`
  devuelve `{estado:'complete', pago:'paid', obra:'anatomia', importe:249,
  email:'p***@soulware.live'}`. El bucle sesión → pago → webhook → estado
  funciona de punta a punta. Lo que no hace todavía: entregar la llave real
  (el `cumplir` del webhook sigue en pausa hasta que Anatomía esté lista).
- Truco para teclear en los iframes de Stripe con la extensión de Chrome:
  escribir en trozos de 4 caracteres con 1 s de espera, y pasar de campo
  en campo con Tab (los clics dentro del iframe no mueven el foco).

### Stripe — 10-sep, 19:30: tres pasos, botones rápidos y Apple Pay en Chrome (vista previa 64)
- **Tres pasos numerados** en una sola vista (Ruben: «no está claro que son 3
  pasos»): ① Tu correo, ② Cómo pagar (acordeón), ③ Confirmar (botón). Los
  botones rápidos quedan arriba como atajo, seguidos de «o paso a paso».
  Descartado el asistente de 3 paneles: más clics y los botones rápidos se
  saltan los pasos 1 y 3 por naturaleza.
- **Los botones rápidos no salían por dos fallos**, bisecados con sondas en
  la propia vista previa: (1) el hueco se montaba con `hidden` → Stripe medía
  0 px y nunca disparaba `ready`; ahora el hueco está siempre en el flujo y
  solo se activa el margen (clase `hay`); (2) `layout.overflow: 'never'`
  junto a maxColumns/maxRows deja al Express Checkout Element sin `ready`
  (cualquier otra combinación funciona). Quitado.
- **Apple Pay en Chrome/Edge/Firefox de escritorio** solo sale con
  `paymentMethods.applePay: 'always'` (docs: ECE → navegadores compatibles,
  nota 3); el clic abre el código de Apple para escanear con el iPhone.
  Google Pay en Safari/Firefox, igual con `googlePay: 'always'`. Verificado
  en el Chrome de Ruben: Apple Pay, Google Pay (con sus tarjetas) y PayPal.
- **El botón flotante «stripe ›»** abajo a la derecha es el asistente de
  pruebas de Stripe: solo en sandbox, nunca en modo real ni al cliente. Se
  deja mientras probamos (autorrelleno de tarjetas de prueba, inspector de
  métodos); se quita con `Stripe(pk, {developerTools:{assistant:{enabled:false}}})`.
- Dominios de método de pago en test: `deploy-preview-64--el-umbral.netlify.app`
  y `soulware.live`, ambos Enabled (hay que registrarlos también en live).

### Obras — 10-sep: cofres gemelos de altura (main + PR 64)
- Ruben: «quiero que todos los recuadros estén perfectamente alineados abajo
  y arriba; el próximamente y los iconos de las cartas rompen la simetría».
  Medido a 1800 px: marcos de 706/706/713/738 px. La mini-tienda del cofre
  es ahora una rejilla de dos filas fijas (35 px invitación/botón + slot+22 px
  de tiendas con nota) y las marcas se alinean arriba (`align-items`), así el
  icono del ebook y el grupo de anunciadas, más altos por sus notas, no
  bajan a sus vecinas. Resultado: 732/732/732/732 y las marcas a 780 px.
  En main como `fix(obras)` 2a5e3b0; main fusionado en stripe-sandbox.

### Stripe — 10-sep, 21:30: el cofre en tres pasos que se destapan (vista previa 64)
- Ruben: «ahora es muy confuso»; «solo mostrar paso 1, cuando completamos
  paso 1, paso 2 se muestra»; «mantén Apple Pay, Google Pay, PayPal, Tarjeta
  y Bizum como opciones visibles; el email solo dentro de tarjeta y el
  teléfono en Bizum»; «botones de Apple/Google negros»; «con los logos
  oficiales».
- **① Cómo pagar**: cinco puertas. Apple Pay, Google Pay y PayPal son los
  botones oficiales que pinta Stripe (tema `black` los tres) sobre un lecho
  apenas más claro con un rótulo detrás del iframe («Apple Pay · Google Pay ·
  PayPal») porque los botones tardan segundos en pintarse tras `ready`.
  Tarjeta (marcas Visa/Mastercard en oro) y Bizum (wordmark) son botones
  nuestros. La franja de marcas se retira en el formulario.
- **② Tus datos**: aparece al elegir Tarjeta o Bizum. **Una Checkout Session
  por puerta** (`crear-sesion-pago` acepta `metodo`: carteras → card+paypal,
  tarjeta → card, bizum → bizum): con un solo `payment_method_type` Stripe
  pinta solo los campos de ese método. Bizum pide el teléfono (formulario de
  Stripe, con la nota de Openbank). El correo va en los dos: es donde se
  entrega la llave y Stripe lo exige para confirmar. `wallets: never` en el
  Payment Element de tarjeta (si no, Google Pay reaparecía como fila).
- **③ Confirmar**: el botón aparece cuando `canConfirm` es true y ya no se
  esconde (se apaga si se rompe un campo).
- Carteras: no pasan por ② ni ③; su hoja recoge el correo (la sesión lo
  exige). `emailRequired` no existe en el ECE de Checkout Sessions.
  **Pendiente de comprobar por Ruben**: pulsar Google Pay en Chrome y ver
  que la hoja pide/lleva el correo; el pago en test no cobra.
- Trampas encontradas (en memoria de Claude también): un iframe de Stripe
  remontado tras `unmount()` se queda en blanco (el correo, al pasar de
  Bizum a Tarjeta) → se destruyen y se crean piezas nuevas en cada cambio;
  `ready` llega segundos antes del pintado; `layout.overflow:'never'` bloquea
  `ready`.
- Google Pay muestra las tarjetas guardadas del usuario en el propio botón:
  es el «botón dinámico» de Google, solo lo ve quien tiene sesión de Google
  con tarjetas, y Stripe no ofrece forma de quitarlo.
- Logos: Visa, Mastercard, Apple Pay, Google Pay y PayPal son las marcas
  oficiales monocromas (simpleicons); Bizum no está en simpleicons y va como
  wordmark tipográfico — si Ruben quiere el logo oficial hay que bajarlo del
  kit de marca de bizum.es.
- Segunda compra de prueba por el flujo nuevo: prueba2@soulware.live, 4242 →
  «Pago recibido».
- Obras (main): la invitación del cofre había quedado a la izquierda al
  convertir la mini-tienda en rejilla → `justify-items:center` + `text-align`
  (03e9cc2). Verificado en producción: centrada.

### Concursos — 10-sep: ¿Devpost, ElevenLabs? (investigado a petición de Ruben)
- Devpost (abiertos/próximos, 10-sep): casi todos exigen proyecto NUEVO creado
  durante el plazo (GatewayHacks 1 M «en premios» = 8.185 $ en metálico y el
  resto créditos, solo obra original para el evento; AI Builders 33.900 $ =
  OSC, solo estudiantes, «creado durante el hackathon», sin ElevenLabs;
  Agents for Humans 40 k = Amazon, obliga a Strands SDK). Nada de voz,
  narrativa ni niños con premio real. El «ElevenLabs 33 k» de Ruben no
  aparece: ElevenHacks (temporada 1, 11 semanas, 240 k) terminó el 25-jun-2026
  sin temporada 2 anunciada; el Worldwide Hackathon del 11-dic ya tuvo
  ganadores; el blog de ElevenLabs no anuncia nada abierto en septiembre.
  Pedido el enlace a Ruben.
- **El que encaja: Chroma Awards (organiza ElevenLabs, en Devpost)**,
  temporada 2 «a mediados de octubre» de 2026, online, entrada gratis,
  división Games: jugable en navegador de escritorio sin descarga,
  completable en <30 min, hecho después del 1-feb-2025, IA usada de forma
  significativa, se juzga como juego (narrativa, originalidad, producción,
  sonido). Premios por subcategoría 2.000/1.000/500 $ + premios de
  patrocinadores (temporada 1: 191.500 $ en metálico). Mayoría de edad,
  algunos países excluidos. Candidatos: Anatomía del Vacío (la mejor
  carta), El Umbral+Tizno como experiencia interactiva; Baby Tizno NO
  (política de ElevenLabs sobre <13 hasta tener permiso escrito).
- Valoración honesta dada a Ruben: contra 5.500 participantes con
  cortometrajes y juegos, El Umbral como web no gana por «tecnología»; gana
  o no por narrativa, sonido y originalidad, que es justo lo que juzgan.

### 10-sep, noche — Tizno vende la casa; Pulso en inglés; tiendas por ubicación; Astra fuera
- **Prompt de Tizno v2 publicado (Main)**: bloque «LA CASA Y SUS OBRAS —
  CUANDO TE PREGUNTAN QUÉ ES ESTO» en PIEZAS (¿quién eres? / ¿qué es
  Soulware? / ¿qué haces aquí? / ¿qué obras hay y dónde? / ¿qué viene? /
  despídete), dos a cuatro frases cada una, para que en el vídeo del Demo
  Day se le pueda preguntar por partes (Ruben: «no un bloque de 60 s»).
  Tono: artesanos de experiencias, dos amigos (novelista y diseñador), «se
  cuentan historias y se venden experiencias»; sin precios ni proveedores.
  La regla «No vendes libros» pasa a «No eres un vendedor… respondes con las
  piezas». Regla de idioma sin Astra (El Último Pago en su lugar).
  Copia local: scratchpad tizno-prompt-v2.txt (18,5k). Segunda publicación
  (+1 −1): fuera «Totalis Libertas: antología en preparación» de la PIEZA 4
  (Ruben la retiró del catálogo el 8-sep).
- **Trucos del editor ProseMirror del panel**: la pega con ClipboardEvent
  AÑADE (no sustituye) aunque haya selección; para vaciar hay que
  `Range.selectNodeContents` + `document.execCommand('delete')` (cmd+a de
  la extensión no selecciona) y luego pegar. Publish → «Review Changes»
  (diff) → Publish; toast «Main updated».
- **KB de Tizno**: «Astra — Deuda del Pacto» ya no existe (Ruben:
  «eliminate it completely»). Editados en el panel (Options → View details
  → Edit → textarea → Save): «Prompt 4» (ahora El Último Pago, tragedia
  lírica, en preparación; «si preguntan por Astra, no existe») y «Las Obras
  del Umbral» (sección El Último Pago; Anatomía ya no es «gratuita»; la
  sección «dónde conseguirlas» con idiomas y tiendas). El nombre del doc
  Prompt 4 sigue diciendo «Astra» (el panel no renombra; habría que crear
  uno nuevo y desvincular el viejo). Glosario de la KB sustituido por el
  GLOSARIO.md nuevo (sin Astra, con El Último Pago); antes tenía 4 «Astra».
- **GLOSARIO.md**: sin Astra; El Último Pago añadido a la tabla de obras.
- **Pulso en inglés («Pulse of the Core — Eternal Core», Kindle B0G6Y3PH6R)**:
  opción PROPIA del cofre, visible igual en la web ES y EN (Ruben: cambiar
  el enlace por idioma es «bad practice»). Tercera fila del cofre («Edición
  en inglés · [ebook] Amazon US/UK»), reservada en todos los cofres para
  que los marcos sigan iguales.
- **Tiendas por UBICACIÓN, no por idioma** (`regionDelVisitante()` por zona
  horaria; `?region=mx|uk|us|es…` fuerza una región): España → Casa del
  Libro, El Corte Inglés, Fnac, Amazon.es; fuera → el Amazon del país (uk,
  us, de, fr, it, ca, mx; resto → amazon.com) para papel y Kindle; LatAm →
  además Buscalibre (mx, co, cl, ar, pe, ec; resto → buscalibre.com, que
  redirige por geolocalización) con el ISBN 979-13-99282-70-2 (otra tirada);
  edición inglesa solo Amazon US/UK. Las librerías españolas anunciadas de
  Filamentos y El Último Pago solo en España. Verificado en producción con
  ?region=mx y ?region=es. Buscalibre va como wordmark (falta SVG) y sus
  fichas de LatAm tienen la portada rota (placeholder «no_image»; en .es
  sale bien) — avisar a Buscalibre/Javier. Amazon MX/CA/DE/FR/IT: las
  fichas existen (200) pero no se ha comprobado stock.
- Prerender: cada tienda regional listada una vez con su dominio.
- Bug corregido de paso: `.map(retailerLink)` pasaba el índice como nombre.

### 10-sep, noche (2) — Tizno v3: las piezas con las palabras de Ruben
- Ruben corrigió las piezas y se publicó v3 (+6 −8, «Main updated»):
  ① «¿Quién eres?» → el Tizno de siempre, lo más novelesco posible (hollín,
  tinta húmeda, sombras, Custodio del Umbral); fuera «voz prestada y sin
  vergüenza». ② «¿Qué es Soulware?» → «una nueva editorial española de
  historias de autor en formatos tradicionales y experimentales: artesanos
  de experiencias…». ③ «¿Qué haces aquí?» → guía, educa, lleva de la mano
  por la experiencia de Soulware (lo de «no rastrea» ya no es lo
  importante). ④ Obras → Pulso disponible en España en librerías,
  principales tiendas online y ebook, y en inglés en ebook; Filamentos en
  ebook y muy pronto en librerías; Anatomía pronto aquí mismo como
  experiencia audiovisual interactiva; El Último Pago pronto en papel y
  ebook; fuera de España, tiendas online de cada país y ebook. ⑤ «¿Qué
  viene?» → Anatomía, nuevos proyectos con Tizno como protagonista, El
  Último Pago. Copia local: scratchpad tizno-prompt-v3.txt.
- KB «Las Obras del Umbral» alineado con ④ (sección «dónde conseguirlas»,
  estado de Anatomía y de Filamentos, idiomas de Pulso).
- Confirmado en producción: con la web en INGLÉS y el visitante en España
  (`/en/obras/?region=es`) salen las librerías españolas y el Kindle ES,
  más la edición inglesa. La tienda depende del país, no del idioma.

### 10-sep, noche (3) — ramas archivadas, KB revisada doc a doc
- Ruben vio «gemini-3-flash-preview» en los agentes dependientes de la KB y
  preguntó por «Gemini 3.0». Era la rama de prueba del 8-sep (0 % de
  tráfico, 0 conversaciones, 7 commits por detrás de Main). Producción usa
  Main = Gemini 3.6 Flash. Archivadas las ramas `gemini-3-flash-preview` de
  Tizno y de Baby Tizno (el panel no borra ramas: las archiva; «archived
  branches cannot be deployed or modified»). Solo queda Main en los dos.
- KB revisada doc a doc buscando Astra / «gratuita» / precios / tiendas:
  Prompt 5 (Universo), Prompt 1 (Pulso) y Prompt 4 limpios; Prompt 2
  (Filamentos y «los oficios de Tizno») tenía el oficio de Astra («el
  Escriba del Pacto») → sustituido por **El Último Pago — el Testigo de la
  Caída** («guarda lo que queda cuando cae lo que creías que eras; no
  consuela: da fe»), también añadido al GLOSARIO como propuesta. Prompt 3
  (Anatomía) y Las Cuatro Llamas: ver siguiente sesión si no consta aquí.
- El doc «Prompt 4» se pudo RENOMBRAR (clic en el título del panel de
  detalles → input → Enter): ahora «…Alicia Sarel y El Último Pago (Prompt 4)».
  Ya no queda «Astra» en ningún nombre ni texto de la KB.

### 10-sep, noche (4) — OJOS VIVOS: hoja de expresiones y mandíbula
- Idea de Ruben: los ojos deberían cambiar de forma y tamaño según la
  entonación (los audio tags) cuando Tizno habla; «caras muy claras, tipo
  anime o Pixar, solo con los ojos»; **sin pupila** («dejamos los ojos como
  están, me encantan»). Diagnóstico: la línea de tiempo emocional ya existe
  (tags → humor por tramo, sincronizado por caracteres/seg) y las señales
  de audio también; lo pobre era el vocabulario de los ojos (círculo blanco
  + seis recortes poligonales).
- **Hoja de expresiones**: `public/tizno-ojos.html` → soulware.live/tizno-ojos.html
  (noindex, sin enlazar). Rig paramétrico: mismo disco blanco con brillo y
  resplandor; dos párpados como cúbicas (top/bot = altura de cada párpado,
  tIn/tOut = esquinas interior/exterior, sx/sy, hl = brillo como falsa
  pupila, hlx/hly = mirada, glow = color del resplandor, trem). Muelle por
  parámetro con rigidez por pose. Ocho poses ↔ tags: neutro, miedo
  [scared], susurro [Whispers], tristeza [Sighs], risa [Chuckles] (media
  luna ^ ^), emoción [Excitedly], curiosidad [Curious] (asimétrica), furia
  [Angrily]. Teclas 1–8, «hablar» simula sílabas, «auto», «susto».
  PENDIENTE: que Ruben apruebe/corrija la hoja; después se conecta al rig
  (sustituir las clases angry/sad/happy por el motor de poses, mapear los
  humores miedo/enfado/tristeza/energia/duda de MOOD_LEX + Whispers →
  susurro, y el pulso de voz encima). Referencia visual propuesta: los
  Susuwatari de Ghibli (hollín con ojos) y WALL-E/EVE (solo párpados).
- **Mandíbula** (desplegado en tizno-ai.html, también en /baby-tizno vía
  postbuild): al hablar la cabeza BAJA con cada golpe de voz (aiVolFast×26
  px + transient×10) y vuelve al callar; fuera el cabeceo muppet hacia
  arriba (W_TELENECO → W_MANDIBULA). Sigue el audio real (ataque 0.8 por
  fotograma). Sin verificar en conversación real: pedir a Ruben que hable
  con él y ajustar la amplitud (26) si se pasa o se queda corto.

### 10-sep, noche (5) — Filamentos sin ebook; página de Tizno limpia; cejas
- **Filamentos de Oscuridad NO tendrá ebook** (Ruben: «the author prefers
  to publish as a printed book only»). Corregido en el prompt (PIEZA 4 ES y
  EN: «en papel, ya en Amazon España y muy pronto en librerías; no hay ni
  habrá ebook») y en el doc de la KB «Las Obras del Umbral». En la web el
  cofre de Filamentos ya solo enlaza Amazon.es (papel) — sin cambios.
- **Página de Tizno** (Estancia, /tizno y /en/tizno): el párrafo de
  cookies/privacidad/olvido ya no está bajo el botón: cuelga de un botón
  redondo «i» abajo a la derecha (Ruben: «en una esquina, no es
  importante»). El botón «Hablar con Tizno» es más pequeño (12px, tracking
  4), está 18px más abajo y respira como una ascua (animación de sombra y
  borde; apagada con reduced-motion) con tinta ámbar al pasar por encima.
- **Hoja de ojos**: los ojos se dibujan en una caja de 60px para que los
  párpados no se corten en recto (los platos y las cejas furiosas se
  truncaban); modo «quieto» sin parpadeo (`__ojos.quieto(true)`) para
  revisar; y CEJAS de hollín que solo existen cuando actúan (se leen en
  negativo contra el halo, como el pendiente): gestos «doble ceja» (orgullo
  absurdo, Ace Ventura) y «escucha» (una arriba, otra abajo), a petición de
  Ruben. Las ocho caras revisadas en producción con capturas.
- Referencias visuales dadas a Ruben: Susuwatari / Makkuro-kurosuke (Ghibli),
  Kodama (Mononoke), WALL-E y EVE (Pixar), el niño de LIMBO (Playdead),
  hojas de expresión de Preston Blair y Richard Williams.

### 10-sep, noche (6) — Tizno se despide con excusa y llena los silencios
- **Despedida con excusa** (Ruben): 35 s antes del tope de sesión el rig
  manda al agente un aviso entre corchetes como si lo dijera el visitante
  (`conversation.sendUserMessage`, con caída a sendContextualUpdate si el
  SDK 1.25 no lo tuviera) y el bloque del prompt «CUANDO TE TIENES QUE IR»
  lo convierte en una despedida de una o dos frases con una excusa distinta
  cada vez (le llaman del otro lado de la niebla, se le seca la tinta…).
  Cuando termina de decirla, el rig cuelga (`onModeChange` speaking →
  listening tras el aviso); el tope duro sigue de red de seguridad.
  Estado en pantalla: «a Tizno le llaman…» / «se ha ido». SIN PROBAR en
  conversación real (hay que aguantar 9,5 min): pedir a Ruben que lo pruebe
  o bajar SESSION_MAX_S en local para verlo.
- **Silencios** (Ruben): bloque «SILENCIOS — CUANDO EL VISITANTE CALLA» en el
  prompt: nada de «¿sigues ahí?»; en cada silencio una pieza distinta
  («¿Sabías que…?», rumores de la casa, detalles de las obras sacados de la
  KB, sin spoilers), tres o cuatro frases; al tercer silencio seguido, se
  calla él también. Depende del turn timeout del agente (panel), que ya
  provocaba turnos de silencio.
- Filamentos sin ebook: corregido y publicado (prompt) y en la KB.

### 10-sep, noche (7) — LOS OJOS NUEVOS YA VIVEN EN EL RIG
- Ruben aprobó la forma de la hoja («buena pinta»), NO el brillo («el punto
  extraño») → fuera brillo y pupila en hoja y rig. Las cejas «quedan fatal
  por sí solas» pero quería verlas fundidas con la silueta → montadas en el
  rig como hollín plano (fuera del wrapper del ojo, que lleva el filtro del
  resplandor); solo existen cuando la pose las usa. Veredicto pendiente.
- **Motor OJOS en tizno-ai.html** (también en /baby-tizno vía postbuild):
  párpados como cúbicas + muelle por parámetro; las clases angry/sad/happy/
  squint/wince/shock del rig son la intención y se traducen a poses; al
  hablar manda el humor del tramo (MOOD_LEX) — miedo, furia, tristeza,
  energía, duda y el NUEVO «susurro» ([Whispers] ya no es miedo). Escuchando
  → «escucha» (una ceja arriba, otra abajo); pensando → «duda». Gesto «doble
  ceja» (orgullo absurdo) al entrar en un tramo de energía.
  `window.__tiznoOjos.pose('furia')` fuerza una pose; `.pose(null)` libera;
  `.gesto('orgullo')` dispara el gesto. El tamaño del ojo sigue en t_EyeL/R.
- Ajustes de Ruben ya aplicados: susurro con párpado superior PLANO (top 0,
  esquinas −5) y abajo redondo; furia recto en ángulo (top 0, tIn +10,
  tOut −7) y abajo redondo; risa como media luna de dos circunferencias
  (top 1, bot −0,55). Ojos 3 px más juntos por lado (143 px; «nunca más
  separados»). TODO el movimiento es morph continuo: parpadeo por nivel
  suavizado (ya no la clase .blinking), pulso de sílaba filtrado, sin ruido
  aleatorio por fotograma, muelles ×0,55 con más amortiguación. Mandíbula
  suave: envolvente filtrada, 16 px.
- La hoja /tizno-ojos.html queda como banco de pruebas (Ruben: «sáltate el
  dashboard»); allí los ojos se ven lejos y pequeños por el zoom — no
  importa.
- SIN VERIFICAR en conversación real: mandíbula, pulso, humor por tramo,
  despedida y silencios. Las poses forzadas sí se revisaron en producción.

### 10-sep, noche (8) — cejas en la tinta de la cabeza; tween, rebote y parpadeo coreografiado
- **Cejas → capa de la cabeza** (Ruben: «misma capa que las formas negras,
  efecto líquido»): ahora son divs de tinta dentro de #head-breathing-layer,
  bajo #ink-goo-body. Duermen en top 60 (dentro del círculo de 150 px de la
  cabeza, invisibles); al subir (bY × 2,4 × bO) asoman por el contorno como
  bultos líquidos; en furia, giradas, sacan un cuerno por lado. Sin
  opacidad (el umbral alfa del goo las haría aparecer de golpe). Las poses
  «ceja abajo» no se ven, por geometría. PENDIENTE VER: cuánto asoman
  (subida ×2,4, reposo 60 px) puede necesitar ajuste a ojo.
- **Tween con ease in/out y rebote** (Ruben): cada cambio de pose lanza un
  tween por ojo (dur por pose 200–640 ms) con easeInOutBack suave (c1 0,9),
  interrumpible desde donde esté. Tamaño del ojo con muelle infraamortiguado
  (0,16 / 0,74) → un poco de bounce.
- **Parpadeo coreografiado** (Ruben: «juntos pero desincronizados, a menudo
  en parejas, a veces uno solo»): 18 % un ojo solo; el resto parejas con
  40–110 ms de desfase; 28 % de las parejas, doble. Cierra ease-in 70 ms,
  abre 130 ms con rebote (el nivel se vuelve negativo un instante: ojo un
  pelín más abierto).
- La hoja /tizno-ojos.html sigue con muelles (no se toca: Ruben la descartó).
- No verificado visualmente: la pestaña de Chrome estaba oculta (rAF
  congelado, capturas negras). Ruben lo mira él o deja Chrome delante.

### 10-sep, noche (9) — la voz no se aplana; silencios distintos; memoria anti-repetición; orejas con tween
- Ruben: «a veces pierde la personalidad: menos Gollum y más aristócrata
  británico»; «cuando me quedo callado cuenta siempre la misma historia»;
  «repite su propia descripción con el mismo guion exacto».
- **Panel de voz del agente**: v3 Conversational, modo expresivo ON;
  estabilidad/velocidad/similitud NO son ajustables en v3. Añadidas 7
  etiquetas sugeridas (scared, Whispers, Curious, Angrily, nervously,
  stammering, gasps → 10/20): guían al LLM, no al TTS.
- **Prompt Main publicado** («Enforce character consistency and prevent
  repetitive responses», +11 −3):
  · «EL PERSONAJE NUNCA SE APLANA» dentro de EXPRESIÓN DE LA VOZ: cada
    respuesta ≥1 acotación + 1 tic, ráfagas de 2–3 frases, romper la
    serenidad; en LA CASA, «claro no significa normal».
  · Bloque nuevo «MEMORIA — NUNCA TE REPITAS»: se presenta UNA vez y solo si
    se lo piden; las PIEZAS son contenido, no guion (hechos fijos, palabras
    nuevas cada vez); segunda pregunta igual → respuesta distinta, más corta
    y con queja.
  · SILENCIOS reescrito: FUERA los dos ejemplos literales (Gemini los
    recitaba tal cual en cada silencio: «¿sabías que en Tierra Médula las
    fechas no son casualidad?»); menú de 5 familias (rumor de la casa /
    «¿Sabías que…?» de UNA obra / detalle de una Voz / confesión suya /
    pregunta rara al visitante), familia distinta a la del silencio anterior,
    repasar lo ya dicho antes de hablar.
  Lección: un ejemplo literal en el prompt para algo que debe VARIAR se
  convierte en el guion único. Describir familias, no dar la frase.
- Diagnóstico del silencio: el rig NO manda nada cuando el visitante calla
  (solo el briefing al conectar y el aviso de despedida). El turno lo abre
  ElevenLabs por timeout y el LLM copiaba el ejemplo. El panel no expone la
  temperatura del LLM.
- **Orejas con tween** (Ruben: «muy jerky»): c_EarL/R pasan de ease
  exponencial a muelle infraamortiguado (0,14 / 0,76) y el canal aditivo
  (tics de agudos ×34 + transient ×10) se filtra (addEarLs, 0,3) antes de
  pintar. Desplegado en b6ce092 (Netlify «Published 22:28»). OJO al
  verificar con curl: /tizno redirige a /tizno/ → usar `curl -sL`, sin -L el
  grep de marcadores da 0 y parece que no se ha desplegado.
- **Voz que se apaga en parrafadas largas: SIN DIAGNOSTICAR.** El rig no
  toca el volumen del agente (solo lee outVol para el cuerpo). Sospechas:
  interrupción por eco del micro (VAD) o el propio TTS v3 bajando en frases
  largas. Hace falta la hora/ID de una conversación con el fallo para mirar
  Conversations → historial y audio.
- Sin verificar a ojo (pestaña de Chrome oculta): orejas, cejas en el goo,
  tween de párpados.

### 10-sep, noche (10) — Tizno más inky: pelaje, humo y vaho en el filtro del cuerpo
- Ruben (con tres referencias de icono: silueta de hollín con borde peludo y
  la cabeza deshaciéndose en humo y letras): «¿podemos hacer la superficie
  más inky, irregular, peluda, smokey?».
- `#ink-goo-body` (nivel alto) pasa de «fusión + humo suave (9)» a tres
  capas sobre la fusión goo: PELAJE (feTurbulence 0.09/0.12, 2 octavas,
  desplazamiento 12: eriza el contorno en pelusa), HUMO (las volutas de
  siempre 0.014/0.042 con recorrido 18: la silueta se retuerce) y VAHO
  (copia del cuerpo desenfocada 12, subida 28 px, retorcida por un ruido
  grave 0.006/0.02 ×46, alfa 0,55, fusionada DEBAJO del cuerpo: halo de
  humo que sube de la cabeza). Nuevo `#ink-goo-body-medio` = pelaje + humo
  sin vaho; nivel bajo sigue con `#ink-goo-movil` (sin turbulencia).
- Panel ?tune=1: cuatro deslizadores nuevos (Cuerpo: pelaje / humo / vaho
  opacidad / vaho cuánto sube) que tocan los primitivos por `data-p`.
- `?nivel=alto|medio|bajo` fuerza el nivel y desactiva el vigilante de FPS
  (para comparar a ojo o en capturas).
- Verificado en el Chrome de Ruben contra un servidor local (`srv-tizno.py`
  en el scratchpad: sirve public/ y mapea /tizno/ → tizno-ai.html): borde
  peludo claro en orejas y cabeza, humo subiendo de la coronilla, ojos y
  pendiente intactos (los ojos van en otra capa, fuera del filtro).
  Probados 8/14 (sutil), 18/26 (orejas rasgadas, demasiado) y vaho 0,9
  (la cabeza se disuelve del todo); elegido 12/18 + vaho 0,55/28.
- Coste: nivel alto suma 2 turbulencias + 2 desplazamientos + 1 desenfoque
  por fotograma sobre 660×700; medio suma 1 turbulencia + 1 desplazamiento.
  Safari nunca arranca en alto; el vigilante baja el nivel si no da la
  talla. Sin medir FPS en móvil todavía.
- Capturas headless (`Chrome --headless=new --screenshot
  --virtual-time-budget=12000`) sirven para el estado de entrada pero no
  mostraron el filtro con claridad: el zoom del Chrome real fue lo que valió.
- Tope diario: Ruben lo agotó (2298 s de 1800). Se borra `tizno_daily` del
  localStorage de soulware.live (o tecla 0 con ?tune=1). Hecho desde su
  Chrome; el botón volvió a «Hablar con Tizno».

### 10-sep, noche (11) — menos distorsión y filtro más barato
- Ruben: «me gusta mucho; un poco demasiada distorsión; no veo diferencia
  entre los sliders, prefiero ir describiendo; no matar la GPU».
- El cuerpo pasa a UN solo ruido (fractalNoise 0.02/0.05, 3 octavas: la
  grave retuerce, la aguda eriza) y UN desplazamiento (12) en vez de dos
  turbulencias y dos desplazamientos (12 + 18). El vaho reutiliza ese mismo
  ruido (desenfoque 8, subida 24, alfa 0,5). Coste sobre el filtro original
  del cuerpo: un desenfoque y un desplazamiento más, cero turbulencias
  extra. Medio = el original con una octava más. Bajo intacto.
- Panel ?tune=1: fuera el slider de pelaje; queda «Cuerpo: distorsión
  (pelusa+humo)» + vaho opacidad/subida. Ruben prefiere describir: no
  apoyarse en los sliders.
- Verificado en su Chrome contra el servidor local: contorno con pelusa
  fina, orejas ya no rasgadas, halo de humo discreto.

### 10-sep, noche (12) — fuera el vaho
- Ruben: «no me gusta la sombra que Tizno parece proyectar hacia atrás» =
  el vaho (copia difusa detrás del cuerpo). Eliminado del todo: el cuerpo
  queda con la fusión goo + un ruido de 3 octavas + un desplazamiento (12),
  igual para alto y medio (`#ink-goo-body-medio` ya no existe); bajo sigue
  con `#ink-goo-movil`. Panel ?tune=1: solo «Cuerpo: distorsión».
- Lo que sí le gusta y se queda: la pelusa del contorno y el retorcimiento
  suave. El humo de la coronilla lo siguen dando la corona y las letras.

### 10-sep, noche (13) — el ajuste de Ruben, medido: cuesta lo mismo que antes
- Ruben (con captura del panel): «me gusta así, pero creo que consume
  MUCHÍSIMOS más recursos; no subir más de un 20 %». Sus valores, ahora por
  defecto: corona 8 grumos/pulso (antes 11), goo contraste 8,5 (antes 14:
  vapor), goo distorsión 36 (antes 30), cuerpo distorsión 17 (antes 12),
  vaho 0.
- **Banco de medida nuevo**: `scripts/tizno-bench/` (srv.py + bench.mjs).
  Chrome headless con render por software y CDP; lee el `data-fps` que
  escribe el propio `medirFps`. Variantes = copias del rig con otro filtro
  y un ratón sintético (hundido no cuesta nada). Resultado (dpr 1, 16 s):

  | cuerpo | fps |
  |---|---|
  | sin filtro | 20 |
  | filtro original (2 octavas, desplaz. 9) | 12 |
  | pelusa+humo (3 octavas, desplaz. 17) — LO ACTUAL | 12 |
  | 2 octavas 0.04/0.10 | 12 |
  | con vaho a opacidad 0 (lo que Ruben tenía en pantalla) | 6 |

  Lectura: el look actual cuesta lo mismo que el filtro de siempre (la
  resolución del medidor es ±1 fps ≈ 8 %); lo que Ruben notó era el VAHO,
  que doblaba el coste del fotograma aunque estuviera a 0 (el desenfoque y
  el desplazamiento se calculan igual). Ya no existe. En GPU (Chrome real)
  la parte del filtro es aún menor que en software.
- Marcadores para verificar producción: `scripts/minify-tizno.cjs` quita
  los comentarios del HTML → grep por atributos (`numOctaves="3"`), nunca
  por texto de comentario (por eso «fuera el vaho» nunca «llegaba»).

### 10-sep, madrugada (14) — MAR DE TINTA, volutas procedurales, corona por las orejas, «ouch» en llamada
- Ruben: «reemplazar las volutas por una animación de líquido negro, un mar
  que reacciona como un líquido a Tizno sin gastar demasiados recursos… y
  partículas hacia arriba lo más parecido a las volutas, procedurales».
- **Mar** (`#mar`, solo en estancia; la lámina `#niebla-grabada` y las dos
  nieblas `#abyss-foreground*` quedan ocultas, no borradas): tres bandas.
  Fondo y medio = divs con una tira de olas SVG (data-URI, 480×40, tile sin
  costura) + degradado sólido, derivando con transform (puro compositor) y
  un vaivén vertical. Frente = `<canvas id="mar-frente">` con simulación de
  muelles 1-D (h[i], v[i]; k 0,028, amortiguación 0,05, contagio 0,22;
  columna cada 12 px) + oleaje ambiente de dos senos; pintado a 30 fps con
  el resto de la tinta, y a 15 fps con Tizno dormido. Empujones: el pop
  (sube o se hunde → salpica alrededor y se hunde bajo él), la voz
  (aiVolFast) y el ratón al rozar la superficie. Brillo de cresta de 1,5 px.
  Nivel medio 27,5vh (MAR.nivel, CSS de bandas y `#mar-menisco`: un bloque
  de tinta DENTRO de la capa goo del cuerpo, 24 px bajo el nivel, para que el
  filtro funda el cuello con el líquido).
- **Volutas procedurales**: 4 sprites (96 px) dibujados una vez: espiral que
  se cierra (gruesa en la cola, fina en el ojo) deformada por dos senos
  inconmensurables + rizo hijo en sentido contrario. Viven en POOL_P con
  `vol` (1–4), suben 150–240 px girando (twist), crecen y se disuelven; el
  goo de la capa de partículas las funde (blob). Nacen en la superficie a
  ±150 px de Tizno cada 1,3–2,2 s con él fuera (medio: la mitad; bajo: no) y
  al salpicar. OJO: el reloj de las partículas es Date.now (una voluta con
  performance.now moría al nacer).
- **Corona por las orejas** (Ruben: «mucha tinta del medio de las orejas y
  poca de las puntas»): la coronilla emite solo entre -150° y -30°; la
  mitad de los grumos nace en la arista superior de una oreja (Bézier del
  propio SVG llevada a pantalla con getScreenCTM, peso hacia la punta).
- **«Ouch» en llamada** (Ruben): `sfxPlay` deja pasar toque/quejido/
  enfado/susto/risa en llamada si el agente NO está hablando; además el
  toque se le cuenta al agente (`window.__tiznoSusurra`: sendUserMessage si
  le toca hablar → reacciona al momento; sendContextualUpdate si ya habla),
  máx. uno cada 6 s. Sin probar en llamada real todavía.
- **Coste medido** (scripts/tizno-bench, dpr 1, máquina tranquila): 13 fps
  con mar vs 12 sin él → paridad. Después el banco dio 1 fps para TODO,
  incluida la versión anterior: la máquina estaba a carga 12–16 (Chrome de
  Ruben al 57 %, coreaudiod). Regla: el banco solo vale con la máquina
  quieta; comparar siempre contra una referencia medida en la misma tanda.
- Verificado en Chrome (servidor local): mar negro en tres tonos con olas,
  Tizno metido en el líquido, rizos subiendo, corona en las puntas.
  Pendiente de Ruben: nivel del mar, tono de las bandas, forma de los rizos.

### 11-sep, madrugada (15) — mar negro puro, orilla en el goo, sin volutas; prompt pícaro
- Ruben: «olas 100 % negras, opacas, sin contorno, que se solapen; formas
  grandes»; «las volutas son horribles, solo olas por ahora»; «dos o tres
  capas negras que se fundan con el blob de Tizno y alguna partícula en la
  unión para que no quede una esquina».
- Mar: las tres bandas a #000 sin brillo de cresta. Tiles de olas grandes
  (720×120 y 640×110), bandas a 30vh/29vh, frente con oleaje de tres senos
  (12+7+4 px) y lienzo de 46vh (aire arriba: el pico salía plano por el
  recorte). Ratón: empuja solo al MOVERSE (proporcional a la velocidad,
  tope 1,4), no por fotograma (quieto junto a la superficie levantaba
  montañas). Tope de altura ±70 px. Pop: empujón ×0,25 (entra 60 veces/s).
- **La orilla dentro del goo**: el mismo mar (misma simulación) se dibuja
  en el lienzo de la corona, que vive DENTRO de la capa goo del cuerpo: 7 px
  por encima del de fuera y hundido 90 px hacia los bordes de la capa (no se
  ve dónde acaba). El filtro funde el cuello con la ola: menisco vivo. La
  corona y las salpicaduras se pintan ahora a cada fotograma desde marPaso
  (dibujarTinta solo las pinta cuando no hay mar, p. ej. en embed).
- **Salpicaduras** (`spawnOrilla`): gotas de tinta en POOL_C nacidas en la
  línea de agua a ±60 px del cuello, suben 12–38 px y caen; cadencia 420 ms
  en alto (800 medio, nada en bajo), más con la voz y el pop.
- Fuera: sprites de volutas, `emitirVoluta`, rama `p.vol`, `#mar-menisco`.
- Sin ver a ojo esta última vuelta: la pestaña de la extensión quedó oculta
  (rAF congelado) y el headless no hace emerger a Tizno. Ruben lo mira.
- **Prompt (Main)**: bloque «PÍCARO Y JUGUETÓN» dentro de IDENTIDAD
  (Ruben: «no parece un tío muy feliz; más pícaro, que se ría más del
  usuario, más juguetón»): se ríe mucho y del visitante (burla cariñosa,
  gato que tira cosas de la mesa), retos, adivinanzas, apuestas absurdas,
  al menos una risita por respuesta, susto y risa se turnan.

### 11-sep, madrugada (16) — núcleo con ruido, átomos, horizonte curvo, lámpara de lava
- Ruben: «me gusta la versión actual»; «ruido de partículas en el núcleo que
  con el blob cree la ilusión de una forma simple»; «partículas orbitando
  como átomos, cerca del cuerpo»; «el punto de contacto emite como la cabeza
  y las orejas, sin letras»; «blobs grandes que salen del mar de vez en
  cuando, como una lámpara de lava, como medio Tizno»; «horizonte curvo».
- Todo lo del cuerpo va en el lienzo de la corona (dentro del goo):
  · `spawnHervor` (cada 130 ms, 3 grumos en alto / 1 medio): nacen dentro
    del contorno del tronco (10 % hacia dentro del rect de bodyTracker),
    asoman 6–24 px y vuelven → contorno que hierve. CORONA_MAX 46 → 90.
  · `ATOMOS` (9 alto / 5 medio, se recrean al cambiar de nivel): grumos
    persistentes en órbitas elípticas inclinadas alrededor del tronco, con
    velocidad y radio que respiran; dibujados directos a cada fotograma
    (`dibujarAtomos`) tras la orilla, o desde dibujarTinta si no hay mar.
  · `spawnOrilla`: la mitad de los grumos sube por el tronco y se disuelve
    (estilo corona, sin letras), la otra mitad salpica y cae.
- Mar en UN solo lienzo (fuera los divs `.mar-banda`): tres rellenos por
  fotograma (`marFondo`, `marMedio`, `marSuperficie`) sobre un **horizonte
  convexo** (`marCurva`: 5vh más alto en el centro). Lienzo de 62vh.
- **Lava** (`marLava`): cada 9–21 s en alto (16–28 medio; nunca en bajo),
  con Tizno fuera, una burbuja (rx 55–85, ry ×1,3–1,6) emerge a ≥280 px del
  centro, se mece fuera (7–12 s en total) y se hunde; falda que la une a la
  superficie; empuja los muelles al salir. Va entre las capas de atrás y el
  frente. La primera, a los 7 s.
- Sin ver a ojo (pestaña oculta / headless sin emerger): lo valida Ruben.

### 11-sep, madrugada (17) — lava v2 (tinta que sube y se evapora); menos humo de orejas
- Ruben: «los blobs de lava tienen que ir hacia arriba, convertirse en tinta
  y desaparecer, como el cuerpo de Tizno; ahora son un huevo que flota, muy
  cutres»; «demasiado humo de las orejas, rebajarlo un 20 % o más».
- Lava v2: fuera la elipse del lienzo del mar. `spawnLava` mete en POOL_P
  (capa de partículas, bajo `#ink-goo`) una gota grande (130–190 px) que
  nace bajo la superficie a 140–290 px del centro, sale, sube 260–420 px
  encogiéndose y se apaga (6–9 s), más 10–15 gotas de rastro (24–64 px) con
  t0 en el futuro que se desprenden por el camino y se evaporan más arriba.
  Empuja los muelles al salir. Cadencia 9–21 s (alto), 16–28 (medio), nunca
  en bajo; solo con Tizno fuera. Lienzo del mar vuelve a 46vh.
- Orejas: la probabilidad de que un grumo de la corona nazca en una oreja
  baja de 0,5 a 0,35 (-30 %); total por pulso sin tocar (8).

### 11-sep, madrugada (18) — luz de los ojos sobre el mar, hombro redondo, señales Tim Burton
- Ruben: «el glow de los ojos debería estar sobre todas las capas, incluido
  el mar»; «la unión entre el blob de Tizno y el mar más redondeada»; «las
  señales (ir al Umbral, ES/EN, Hablar con Tizno) más tipo Tim Burton,
  natural; mejor texto que imagen para animarlo y traducirlo».
- `#luz-ojos`: div fijo de 640×640 con degradado radial ámbar, z 6 (encima
  del mar z 5, debajo de los ojos z 10), clavado al centro de la cabeza a
  cada tick de 30 fps (reusa el rect que ya leía el foco perezoso),
  opacidad = luz del pop × 0,95. Oculto en embed. Solo transform+opacity.
- Unión: la orilla interior sube de 7 a 12 px sobre la exterior y se añade
  un COLLAR: elipse de tinta (118×34) en la línea de agua bajo el cuello,
  dentro del goo → el encuentro cuello-agua pasa de esquina a hombro.
- Señales: fuente **Jolly Lodger** (SIL OFL) autoalojada en
  `public/fonts/jolly-lodger.woff2` (17 KB, subset latin, bajada del CSS de
  Google Fonts con UA de Chrome; ni una petición a Google en producción).
  `#tizno-call` sin caja: 44 px, color #fff2cc y text-shadow ámbar en cuatro
  capas que respira (`resplandor`, 4,2 s); hover más blanco y +3 %; `.live`
  en rojo sin animación. `#tizno-volver` y `#idiomas a` a 27 px sin píldora
  ni backdrop: el activo brilla, el inactivo en #4d4436. Textos intactos
  (siguen traduciéndose por JS). Verificado en headless.
- Tope diario reseteado otra vez desde su Chrome (1894 s).

### 11-sep, madrugada (19) — halo sutil, sin doble borde, lente; lava blobby; prompt burlón
- Ruben: «has hecho lo contrario: tan brillante que se nota la línea; lo que
  quería es que el brillo vaya encima para que no se note el corte entre
  capas»; «¿un lens flare desenfocado en los ojos? podría molar»; «los blobs
  muy grandes: más pequeños, menos duraderos, más blobby»; «Tizno más burlón
  y juguetón: chistes, dichos y refranes con lo que dice el usuario; un
  pequeño sabio resabiado».
- `#luz-ojos` a un tercio (0,13 pico): no ilumina, solo funde el horizonte
  bajo los ojos. La orilla interior pasa a 4 px POR DEBAJO de la superficie
  exterior (antes 12 por encima: su borde blando sobre el borde nítido del
  lienzo era la línea que se veía al iluminarse); queda solo el collar.
- `#lente` (z 11, oculto en embed): raya anamórfica (560×3), anillo (210)
  y tres fantasmas (44/26/76 px) en el eje ojos→centro de pantalla
  (k 0,5/0,95/1,55), `mix-blend-mode: screen`, opacidad = luz × ojos
  abiertos (min(parpL, parpR)) × 0,85: se apaga al parpadear. Solo
  transform+opacity en el tick de 30 fps.
- Lava v3: masa de 3–5 gotas medianas (tam 70–110 × 0,55–1,05) con t0
  desfasados, 3,5–5,5 s, subida 180–280; rastro 6–9 gotas de 16–40 px.
- Prompt Main: bloque «BURLÓN, SABIO RESABIADO» tras el pícaro (publicado,
  «Add mocking and wise-cracking personality traits»): coge palabras del
  visitante y las devuelve en chiste, juego de palabras, dicho o refrán
  retorcido («a quien madruga, Tizno le asusta»); pulla cada 2–3 respuestas;
  burla de amigo; en inglés con sus propios proverbios.

### 11-sep, madrugada (20) — fuera la lente; halo al 10 %; señales letra a letra
- Ruben: «el lens flare terrible, quítalo; del glow deja un pelín, un 10 %,
  justo sobre los ojos»; «pon Volver al Umbral / Back to The Threshold, no
  Soulware; texto más irregular, con glow animado, color igual al glow de
  los ojos, todos con un glow titilante lento».
- `#lente` eliminado (HTML, CSS, JS). `#luz-ojos` a 260×260 y 0,10 de pico,
  centrado en los ojos.
- Señales: `letrear(el, texto)` (expuesta como `window.__letrear`) trocea el
  texto en spans `.letra` con --rot (±4,5°), --dy (±1,5 px), --esc
  (0,94–1,06) deterministas (hash de senos por posición) y titileo propio
  (`titila`, 3,2–6,6 s con desfase negativo): el conjunto respira como
  brasas. Color #ffd58e con sombras en --eye-glow (#f39c12) vía --g0..3;
  `.live` cambia las variables a rojo. Inactivo de idioma sin glow ni
  animación. Los cambios de texto del botón (Hablar/Dejarle en paz, EN) y
  los textos EN del head pasan por `__letrear`. «← Volver al Umbral» /
  «← Back to The Threshold» (aria-label sin la flecha).

### 11-sep, madrugada (21) — lente v2 sobre el ojo grande; horizonte +20 % y conmutable
- Ruben: «el lens flare podría estar sobre el ojo grande cuando un ojo se
  hace grande y otro pequeño, solo en ese momento, alineado con el ojo,
  como continuación, y más pequeño»; «horizonte un 20 % más curvo; si no,
  al revés; ¿probamos los dos?».
- `#lente` v2: raya anamórfica de 230×2 + halo de 64 px, `screen`, clavada
  al centro del ojo GRANDE (rect del wrapper, solo mientras se ve) con el
  giro del rig; opacidad = f(|c_EyeL − c_EyeR|) (arranca a 0,22 de
  diferencia, plena a 0,62) × luz × ojos abiertos, con lerp 0,25.
- Horizonte: 6vh (antes 5). `?horizonte=concavo` invierte el sentido;
  `?curvatura=8` cambia los vh. Ruben compara ambos en producción.

### 11-sep, madrugada (22) — fuera el collar
- Ruben: «los hombros raros entre Tizno y el horizonte, terrible, remove».
  Era el COLLAR (elipse de tinta 118×34 bajo el cuello, dentro del goo).
  Eliminado. La orilla interior (misma ola, 4 px bajo la superficie, dentro
  del goo) se queda: es la que funde el cuello con el agua sin dibujar nada.

### 11-sep, madrugada (23) — horizonte planeta; botón en llamada
- Ruben: «¿puedes curvar más el horizonte? como un planeta». Curvatura 6 →
  14vh y nivel base 30 → 22vh: el centro sigue a 36vh (Tizno igual de
  hundido), los bordes caen 14vh. `?curvatura=` y `?horizonte=concavo`
  siguen valiendo.
- «Dejarle en paz» (`.live`): 30 px y mismo amarillo, sin rojo.

### 11-sep, madrugada (24) — Tizno sabe las tiendas; ebook en dos idiomas; «no lo sé»
- Ruben: «Tizno debería saber los nombres de las tiendas (El Corte Inglés,
  Fnac…); el ebook también está en español (el original) y en inglés
  (traducido por el autor); si no tiene información, que diga que no sabe».
- Prompt Main, PIEZA 4 (sacado de StateManager): Pulso en papel en España
  en Casa del Libro, El Corte Inglés, Fnac y Amazon; ebook Kindle en
  español (original) e inglés («Pulse of the Core — Eternal Core»,
  traducido por el propio autor); fuera de España el Amazon de cada país y
  Buscalibre en Latinoamérica. Filamentos: Amazon España ya, «muy pronto»
  Casa del Libro, El Corte Inglés y Fnac; nunca ebook. Ejemplo EN
  reescrito igual. Bloque nuevo «SI NO LO SABES, LO DICES» tras la PIEZA 6:
  sin precios, fechas ni stock inventados; remite al cofre de la obra.
- Lente sobre el ojo grande más evidente (raya 320, cruz, halo 96, escala
  con el ojo, fade ~100 ms). Horizonte planeta (14vh, base 22vh).

### 11-sep, madrugada (25) — horizonte circular de radio fijo; lente discreta
- Ruben: «la curvatura depende del ancho de la ventana; hazlo siempre
  circular, con más o menos recorte». `marCurva` pasa de parábola
  normalizada al ancho a un CÍRCULO de radio 1,8 × altura de ventana con la
  cima en el centro (MAR.nivel 36vh). `?curvatura=1.4` = radio en alturas
  (menos = más curvo); `?horizonte=concavo` invierte. En ventanas muy anchas
  la superficie cae por debajo del lienzo en los bordes: se ve el fondo
  (espacio), no mar. Si molesta, limitar la caída.
- Lente del ojo grande: sin rotación, raya 240, opacidad ×0,7.

### 11-sep, madrugada (26) — si se despide, se va
- Ruben: «Tizno se despide pero no se va; es la primera vez, otras veces se
  iba sin despedirse». El cierre solo estaba armado tras NUESTRO aviso de
  tiempo (despedidaAt); si Tizno se despedía por su cuenta (p. ej. tras un
  aviso de toque entre corchetes, o porque el visitante dijo adiós), nada
  colgaba.
- Rig: `esDespedida(texto)` mira la cola del parlamento del agente (sin
  acotaciones, ≤320 caracteres, sin pregunta final) con un patrón ES/EN
  (me voy, me tengo que ir, hasta luego, adiós, nos vemos, I have to go,
  goodbye, bye…). Si casa y la llamada lleva >25 s, arma el mismo cierre
  (habloTrasAviso = true → cuelga al pasar a listening) y un seguro a los
  15 s por si el turno no se cierra.
- Prompt: «CUANDO TE TIENES QUE IR» solo con el aviso que dice que se
  acaba el tiempo; los otros avisos entre corchetes (toques) no son para
  irse; y «si te despides, te vas: después no dices nada más».

### 11-sep, madrugada (27) — fondo vivo: dos capas de manchas girando
- Ruben: «¿rotar dos imágenes borrosas en direcciones opuestas con
  multiply/transparencia para un fondo procedural barato? el glow más
  estilizado». Hecho con degradados radiales, no imágenes: `.luz-giro` ×2
  dentro de `#luz-sala` (heredan el foco perezoso y la opacidad del pop),
  110vh cuadradas centradas en el glow, 5 y 4 manchas ámbar, `mix-blend-
  mode: screen` (sobre negro, multiply no haría nada), giro 150 s y 210 s
  en sentidos opuestos. La primera capa del fondo es una caída a negro que
  bajo screen hace de máscara gratis (sin mask-image, que costaba en capas
  animadas). Texturas de capa: 110vh y no 150vmax por memoria GPU a retina.
  Apagado en nivel bajo, embed y reduced-motion.

### 11-sep, madrugada (28) — el vigilante de FPS ya no deja a Tizno en «bajo» para siempre
- Ruben: «a veces, al abrir otras apps, los efectos desaparecen y no vuelven
  hasta recargar» (capturas: silueta nítida sin pelusa ni humo = nivel bajo).
  Causa: con otra app delante el navegador estrangula los fotogramas sin
  que `document.hidden` se active; el vigilante juzgaba esa ventana (sin
  hueco >400 ms pero a 5–20 fps), bajaba dos niveles y, por diseño, nunca
  subía.
- Arreglo: (1) una ventana solo se juzga con `document.hasFocus()`;
  (2) `subirNivel()` recupera un nivel tras 3 ventanas seguidas ≥56 fps
  (+4 por cada bajada previa, freno anti-oscilación), nunca por encima de
  `NIVEL_INICIAL` (la estimación por hardware/Safari) ni con `?nivel=`.

### 11-sep, madrugada (29) — fondo sin aura y con nubes grandes; Tizno con colmillo
- Ruben: «un aura negra, un semicírculo que se mueve con Tizno» = la
  máscara negra de `.luz-giro` (confiaba en `screen`; se pintaba como negro
  real). Fuera la máscara y fuera el blend: las elipses se desvanecen solas.
  «Las nubes mucho más grandes, más de fondo»: capa 140vh, elipses de 26–45 %
  de la capa, alfas 0,09–0,22, giros 190/270 s. Solo en nivel alto (memoria
  de textura a retina).
- Prompt Main: bloque «COLMILLO — SI TE FALTAN AL RESPETO» tras el burlón
  (Ruben: «más ácido, más verso con las palabras para dejar a quien sea en
  su lugar si se porta mal»): réplicas ácidas y secas ante insultos,
  humillación o ensañamiento con las Voces; ingenio sin insultos, palabrotas,
  crueldad con lo que una persona es ni amenazas; un aviso, dos como mucho,
  y si insiste se despide con excusa fría (y el rig cuelga, ver (26)); sin
  rencor al volver a las buenas.

### 11-sep, madrugada (30) — fondo abstracto: cada nube con su seguidor
- Ruben: «que parte del fondo siga animado como un foco con delay, lento;
  que todas las capas reaccionen al ratón y al movimiento con distintos
  modificadores y multiplicadores». Nubes más sutiles (120vh, alfas 4–10 %).
- En el tick de 30 fps: nube A sigue al ratón (×0,05) y a la cabeza (×0,35)
  con lerp 0,018; nube B al revés (×−0,035 / ×−0,20) con lerp 0,011 →
  paralaje; ambas con deriva autónoma de senos lentos (30–40 px). Se escribe
  la propiedad `translate` (convive con el `transform: rotate` de la
  animación CSS). El foco perezoso de `#luz-sala` (22 %) sigue como estaba.

### Pendientes vivos
- Ruben (5 min): probar la rama `gemini-3-flash-preview` del agente de
  ElevenLabs y promoverla (Branches → traffic split), antes del 20-oct.
- Idea aparcada: Tizno se duerme tras X s sin interacción (Ruben decide).
- Lección de hoy: **nunca backticks dentro de `git commit -m "…"` en zsh**
  (se ejecutan y se borran): usar `git commit -F - <<'EOF'`.

---

## Sep 1, 2026 — Safari móvil petaba con Tizno liberado (RESUELTO)

**Síntoma** (Javier): la web le mataba la pestaña en Safari de iPhone haciendo
scroll lateral por el archivo, con Tizno LIBERADO y sin llegar a hablar con él
— «y se ha calentado bien el teléfono». **El calor era el diagnóstico**:
sobrecarga térmica, no un error de código.

**Causa**: el motor de la web principal SÍ se apaga en el archivo (VisualEngine
deja de pedir frames en escena 4 y esconde su lienzo), pero el marco de Tizno
no se enteraba. Dentro seguía su bucle a 60 fps y TRES generadores de
partículas (140/90/110 ms) que solo miraban `document.hidden` — y **hacer
scroll no oculta la pestaña**. Todo ello en una capa `position:fixed` +
`transform:scale(0.42)` con filtros SVG que **WebKit rasteriza por software**,
así que el compositor no puede cachear la capa mientras el scroll la mueve.

**Arreglo en dos vueltas**:
- `d3322b6` — la madre avisa por postMessage al empezar el scroll y 200 ms tras
  parar (listener pasivo en TiznoTease). El marco deja de fabricar partículas y
  dibuja 1 de cada 4 fotogramas. → deja de petar y de calentar.
- `0fd787b` — no bastaba: **lo caro no es el bucle, son los filtros**. Ahora
  durante el gesto se congela el dibujado entero (la cadena de rAF sigue viva,
  solo no se trabaja) y se sueltan los filtros de la capa de partículas y del
  cuerpo; `aplicarNivel()` los restaura al soltar. Las capas se localizan por
  POSICIÓN en el DOM, no por el filtro que llevan puesto: buscarlas por filtro
  fallaba a partir del segundo scroll (tras el primero su style ya decía none).

**Estado**: resuelto y verificado por Javier en su iPhone. Queda un residuo
inherente («sigue siendo más suave sin Tizno») — una capa compuesta de más en
un móvil siempre cuesta; Ruben y Javier lo dan por normal y por bueno. **No
seguir optimizando esto** salvo que vuelva a petar.

**IDEA APARCADA (Ruben, decisión suya)**: que Tizno se duerma solo tras X
segundos sin interacción y vuelva al detectar movimiento. Buena por
rendimiento (libera el marco cuando nadie le hace caso) y por carácter (es
tímido y ya sabe esconderse: lo hace al cuarto piquito). Falta que Ruben fije
el número de segundos y si vuelve solo o hay que darle al candado.

---

## GRANT CONCEDIDO — Aug 18, 2026 🎉

**ACTIVE since Aug 25, 2026**: Ruben enabled 2FA, accepted, 33,015,069
credits confirmed in the dashboard (workspace on "Grant plan"; his paid
subscription replaced). GRANT_ACTIVO=true deployed (aa42253) — Tizno now
runs 10 min/session, 30 min/day per browser.

**ElevenLabs Grants accepted Core Soulware**: unlimited Tizno credits for a
year. Applied Aug 15 (Javier), granted Aug 18. Decision email went to Javier.

**RUBEN must do (the ElevenLabs account is HIS, corrected 18-ago — the
decision email just went to Javier as applicant)**: enable 2FA on his
ElevenLabs account, THEN accept via the email link Javier received, while
logged into the account where Tizno's agent lives — that's where the credits
must land. Verify in the dashboard afterwards that they actually did. Best
not to let the acceptance link sit.

**When Ruben is back from holidays (deliberately deferred)**:
- Grants logo on the site: 12+ months with link, placement already decided
  (legal footer / privacidad, next to credits). They sent HTML snippets — use
  the WHITE logo (dark backgrounds): eleven-public-cdn.elevenlabs.io/payloadcms/cy7rxce8uki-IIElevenLabsGrants%201.webp
  → https://elevenlabs.io/startup-grants. Five-minute job in ArchiveDOM/footer.
- Caps (RECALIBRATED 25-ago with the real number): the grant is 33,000,000
  credits or 12 months, whichever first — at ~670 credits/min that is ~821
  hours total ≈ 135 min/DAY averaged over the year. NOT infinite. The
  GRANT_ACTIVO branch in tizno-ai.html is therefore 10 min/session and
  30 min/day per browser (one browser = 22% of the daily average budget;
  60 would have been 44%). Flag still OFF — flip when Ruben confirms the
  credits are in his dashboard. Allowlist stays ARMED regardless (it gates
  who may embed the agent, not spend). NOTE: accepting REPLACES his current
  paid subscription; after the year it auto-downgrades to Free.
- Month-10 alarm (already in GRANT-SOLICITUD.md): after 12 months or on
  credit exhaustion the account falls to Free unless negotiated. Plan the
  transition ~May 2027 so Tizno doesn't lose his voice overnight.

---

## Session 14 (night of Aug 15→16, 2026) — the whole site is finally in Google

**THE ROOT CAUSE, and the lesson worth keeping**: `generate-og-pages.js` sealed a
perfect `<head>` on all 20 routes — title, description, canonical, hreflang,
JSON-LD — but every route served **the same body**: the home's ghost DOM.
Measured in production: **219 of 237 text lines identical** across
`/obras/pulso-del-nucleo/`, `/obras/totalis-libertas/` and `/caballero/`. The
only unique content was the title and the offers JSON-LD. Google crawled 10 of
20, found the same page with different titles, and stopped spending crawl.
**Pulso del Núcleo — the only book on sale — had never been crawled** (`Last
crawl: N/A`, `Referring page: None detected`). So had none of the four EN
character pages, unindexed since the May bilingual launch.

Fix (commits **5fe0331** + **d009f98**):
- `ghostFor(path, lang)` seals a per-route `.sr-only` block built ENTIRELY from
  `StateManager` (vision / desc / lore / ficha / editions) + `retailers.js`.
  **Zero invented prose** — edit a synopsis and the page regenerates itself.
  Home keeps its own ghost DOM (it's the site index). `navGhost()` preserves the
  internal link graph on every page, now with trailing slashes (no 301 hops).
- `schemasFor(path, lang)`: BreadcrumbList on all 18 inner routes, VideoObject
  for the 4 character videos (uploadDate = real git add date 2026-03-24),
  Person + sameAs for authors, ItemList on /obras/, Book for Anatomía and
  Totalis. **No prices, deliberately** — none exist in the project and the same
  ISBN sells at different prices per shop; a wrong price costs merchant
  eligibility rather than earning it.
- Then 10 × Request Indexing in GSC. **All 10 verified "URL is on Google"** the
  same night; `/en/obras/` already shows "Breadcrumbs: 1 valid item detected".

**GSC operating notes (hard-won)**: the URL-inspection bar needs a JS event
dispatch (`Enter` never fires — already in memory). Each *Request indexing*
click runs a ~90 s live test before queueing; navigating away sooner looks like
it aborted (it usually didn't, but you can't confirm). The green toast fades, so
verify by re-inspecting later, not by waiting for the toast. **The Pages report
lags days behind live inspection** — it will keep saying 10/30 for a while.

**DNS TXT — DONE Aug 16 (Ruben asked me to do it)**: added the full 43-char
record, deleted the truncated 37-char one AND the junk 36-x one. Search Console
answered **"Ownership auto verified — Domain name provider"**; the
`sc-domain:soulware.live` property is live (and now shows Enhancements →
Breadcrumbs + Videos, so Google has ingested the new schema). MX ×3, SPF, DKIM
and zoho-verification verified intact via `dig` against dns1.p06.nsone.net
before and after every deletion.
**How to drive that Netlify form** (it fought me for an hour the night before):
the record-type control is a NATIVE `<select>` — clicking its option refs does
nothing, `form_input` is blocked by the permission classifier, and keyboard
focus does not survive between tool calls. What works is **click + type in the
SAME batch**: `left_click` on the select then `type "TXT"` atomically. The Value
field for TXT is a `<textarea>`, not an input. Always verify the row's value in
its own expanded panel (Name/TTL/Type/Value + its own Delete button) before
deleting — the confirm dialog also names the record, and it needs ~5 s to become
opaque or the click passes through.

**LLM — RAMA DE PRUEBA YA LISTA (1-sep-2026), falta el oído de Ruben**

Gemini 2.5 Flash se depreca el **20-oct-2026**. Si no hacemos nada, ElevenLabs
migra solo a **Gemini 3.5 Flash**: 0,1164 $/min — el más caro de la lista tras
los Claude grandes, **3x el candidato**, y techo de latencia 3,35 s. Con el
presupuesto del grant (49.250 min) esa diferencia son ~5.700 $ frente a
~1.900 $ de créditos. Para Tizno la latencia ES carácter: un silencio de 3 s
antes de cada frase rompe la ilusión más que un fallo de escritura.

Comparativa medida en el panel (latencia · $/min):
- **Gemini 3 Flash Preview — 1,1-1,85 s · 0,0388** ← elegido: único con techo
  por debajo de 2 s
- Gemini 3.5 Flash-Lite — 0,68-3,1 s · 0,0234
- Gemini 3.5 Flash (el automático) — 0,92-3,35 s · 0,1164
- Claude Haiku 4.5 — ~714 ms · 0,0774 (plan B: mejor media, doble precio)
- Gemini 3.7 Flash — 2,25-4,87 s · 0,0581 (descartado: inasumible hablando)

**HECHO**: rama `gemini-3-flash-preview` creada y publicada con ese modelo
(+ Reasoning Effort «minimal», bueno para la latencia). **Traffic split 0%**,
Main sigue 100% Live: producción intacta, verificado. El diff tocaba SOLO el
LLM — prompt, voz y KB sin cambiar.

**LO QUE FALTA (5 minutos de Ruben)**: en el panel, selector de rama arriba a
la izquierda → `gemini-3-flash-preview` → hablar con él dos minutos. ¿Sigue
tartamudeando, sigue siendo corto y nervioso, respeta el idioma, no nombra
proveedores? Si sí: Branches → Edit traffic split → subirlo (o promover a
Main). Si no: probar Claude Haiku 4.5 en la misma rama.
Yo no puedo cerrar esto: el chat del panel responde en VOZ, no en texto, y las
transcripciones no se dejan abrir por automatización. Es exactamente la parte
que necesita oídos.

**Nota para el futuro**: existe un MCP oficial de ElevenLabs para Claude
(«Manage your voice and chat agents directly from Claude», anunciado en el
panel). Conectarlo ahorraría toda esta pelea con el navegador.

**PENDING, human hands only**:
- **Backlinks are now THE bottleneck**: 14 external links, all to the home, from
  auto-generated directories; zero to book pages. Researched Aug 16, findings:
  - **Casa del Libro lists the publisher as «Autor-editor», not Soulware.** That
    field comes from the ISBN registration and propagates to every shop and
    trade database. Fixing it at source (Agencia del ISBN / distributor record)
    is worth more than several links — we're building the "Soulware, Spanish
    publisher" entity on our site while the official book record denies it.
  - **BlogLiterario.com already reviewed Pulso del Núcleo**, names Soulware as
    publisher in its metadata, links to Amazon, and does NOT link soulware.live.
    Easiest quality backlink available: ask them to add it. (They say 428 pages;
    it's 444 — Casa del Libro confirms our ficha is right, the blog is wrong.)
  - **Neither book exists on Goodreads or todostuslibros** — nothing to claim,
    they must be created. todostuslibros goes via the ISBN/distributor route,
    same errand as the «Autor-editor» fix.
  - Cheap and available today: social bios linking to each character's page
    instead of the home (deep links — we have zero).
  I cannot do any of these: they need account logins or credentials I must not
  handle.
- **Anatomía del Vacío** ficha is the thinnest — the data has little written
  about it. Needs a few lines from Ruben.
- Shareable report for Javier: https://claude.ai/code/artifact/8f7dd838-b51e-4304-b6df-145fab80af43

---

## What was completed — Session 13 (August 6, 2026)

**Aug 14 (night) — the Estancia finds its voice (commits 8bea709→5eca01a, all verified live):**
- **THE MUTE ESTANCIA — two stacked causes, both real**: (1) `SFX_BASE` was
  RELATIVE (`tizno-sfx/`) so from `/tizno/` every take resolved to
  `/tizno/tizno-sfx/…` → 404 → total silence ONLY there (the embed lives at
  root and never suffered it). Now `/tizno-sfx/` — same root-relative doctrine
  as the videos in CLAUDE.md. (2) Autoplay policy: the emergence greeting fired
  ~1.5s after load with NO user gesture and the rejected `play()` was swallowed
  by the catch; in the embed the padlock click in the parent grants activation
  (same origin). Now, if `navigator.userActivation.hasBeenActive` is false the
  greeting (vuelve/pop) goes PENDING and plays on the first pointerdown.
- **Hover reaction expires** (Ruben: «no more panting dog»): `gustoDesde` +
  `gustoFade()` — full illusion 3s, ~0.9s fade back to idle even if the cursor
  stays, re-arms on leaving the radius. Applied to the idle branch AND the
  during-call overlay. The padlock FEAR does NOT expire (a threat that bores
  stops being a threat).
- **THE FOG-LOWERING LESSON (three attempts — do not repeat)**: with
  `cover` anchored bottom, SHRINKING THE BOX does not lower the crests — it
  DECAPITATES them (the image never moves; the window crops, and the mask then
  eats the cut tops — Ruben's «sigue con un fade» complaint). Lowering is done
  by PUSHING THE IMAGE: `background-position: center bottom -60px`. Final
  blessed geometry (Ruben: «como la primera vez, solo bajado un poquito»):
  box 44vh + mask 52% (the original soft look), image pushed -60px, box
  widened to 112vw centered at 54.7vw so the artwork's ink column (at 45.8%
  of the image width, canvas-measured; crest tops at y≈503-557 of 893) sits
  under Tizno's axis. The `-60px` is THE knob for future taste passes.
  Mobile caveat noted: in portrait, cover maps by HEIGHT and squeezes the
  whole artwork into the band — pre-existing, revisit with its own framing.
- **MONDAY (Ruben, tired but willing)**: record ES `vuelve` takes (3–6 return
  greetings, list given in chat: «¿Otra vez tú?», «Has vuelto… lo sabía.»,
  «Te estaba esperando.», «¡Ah! Conozco esos pasos.», «¿Me echabas de menos?»,
  «Bienvenido otra vez al Umbral») + EN `quejido` ×2 and `risa` ×2 — OR, if the
  ES quejido/risa takes turn out wordless, certify them `sinIdioma` and they
  sound in EN for free. Ruben listens and decides.
- **Javier is submitting the ElevenLabs grant** (GRANT-SOLICITUD.md): remind
  him his LinkedIn Experience must list Soulware BEFORE submitting, and the
  editorial@soulware.live mailbox must actually exist in Zoho (decision email
  goes there).

**Aug 14 (late) — La Estancia settles (commit 21fd8cb, deployed + verified):**
- **THE EYES LESSON (do not repeat)**: both `.master-rig`s (body AND eyes layer)
  share the class, so `html.estancia .master-rig { bottom: 21vh }` raises them IN
  PARALLEL — the eyes need NO extra help. Any additional push on
  `#eyes-layer-container` (padding-bottom first, transform later) double-shifts
  them (~21vh too high — the two broken-eyes screenshots). Fix was REMOVING all
  eye overrides; verified by rect deltas (eyes at dx±40/dy+5 from head center,
  identical in demo and Estancia).
- **Toque universal**: `toqueEn` (click on his body → respingo + toque take, 4th
  poke in 25s → hide + quejido) lived INSIDE `if (EMBED)` — the Estancia and demo
  had NO click reaction at all. Hoisted to frame scope, registered for all modes
  with a control guard (`button, a, nav, input…` clicks are not for him). The
  embed message path ({tipo:'clic'}) still feeds the same function.
- **El escudo (main site)**: Tizno was "transparent to clicks" — the iframe is
  pointer-events:none and the obra chests sit behind his silhouette, so tapping
  him bought books AND TiznoTease's forwarder skipped those clicks (its guard
  ignores clicks that land on links/buttons). New `#tizno-escudo`: invisible
  fixed circle (d = 0.38 × frame width, center at 50%/68% of frame), z-index 29
  (above frame 28, below bar 30), created as the frame's next sibling; CSS shows
  it only while `#tizno-frame.visible:not(.backstage)` — swallows the click so
  the book doesn't fire, and the window forwarder turns it into his «¡ay!».
- **EN call states completed**: «Leave him be» during calls (was «Dejarle en
  paz» hardcoded), the olvido confirmation and the daily-reset dev status now
  bilingual. Rule stands: every new `setStatus` literal needs its ESTADOS_EN
  entry in the same commit.
- **Aviso**: the erase sentence sits on its own line (`<br>` in ES markup; the
  EN node-surgery now strips the ES `<br>` and inserts its own).
- **Marea calmada**: Ruben wanted "almost static" — ±5px drift + 1.05→1.057
  scale breathing over 24s.
- **Niebla centrada**: the artwork's ink column lives at 45.8% of the image
  width (canvas-measured), not 50% — the fog box is now 112vw wide with its
  center at 54.7vw so the column lands exactly under Tizno's axis (50vw) without
  exposing the left edge. Cover maps image→box width in landscape.
- **Preview-pane caveat (tooling)**: the in-app browser keeps the tab
  `document.hidden` → rAF frozen → the pop spring never fires and Tizno stays
  sunken in screenshots. Not a site bug. Verify geometry via forced transforms +
  rect math, or on a real browser.

**Aug 14 — La Mente, La Estancia y la aduana de Casanova:**
Casanova delivered 3 docs (QA bank, 2-min First Message, Muster Knowledge). Customs
findings applied with Ruben's decisions: temperament FUSED (fear outside, sage inside
— new prompt section LA MENTE BAJO EL MIEDO), origin = LA ESCALERA DE LA INSISTENCIA
(hints on insistence, NEVER vendor names), 2-min monologue discarded (best lines
harvested into 8 new short saludos ES/EN in the rig pools), «Custodian of the
Threshold» now OFFICIAL in GLOSARIO.md, the eight-dynamics framework was a
recognizable Scientology parallel → replaced by LAS CUATRO LLAMAS anchored to the
canon domains (Honor·Conocimiento·Identidad·Juicio), brands/citation artifacts
removed. Both prompt sections PUBLISHED to the agent. KB now 8 docs: added «Las
Cuatro Llamas» (master copy TIZNO-CUATRO-LLAMAS.md) and the long-pending bilingual
GLOSARIO. QA bank lives in repo as TIZNO-BANCO-PRUEBAS.md (NEVER upload to KB —
it's the exam). PENDING: run the quick-pass (20 tests, list in the bank doc) in ES
and EN — needs voice, Ruben's hands. Also: LA ESTANCIA — soulware.live/tizno and
/en/tizno (SECRET URL, nothing links to it; rewrite 200 to tizno-ai.html, same
single-front rig): play boxes hidden in public Estancia (?demo=1 keeps them),
button verb is now «Hablar con Tizno»/«Speak to Tizno» everywhere, OG/meta for
shareability. Box B relabeled «ENCERRAR A TIZNO».

**Post-launch same-day (Aug 8) — Tizno's English voice + polish, all live on main:**
EN voice bank complete (34 takes, generated with the cloned voice + ElevenLabs v3 audio
tags): frase-sin-micro-en ×4, no-encierres-en ×11 (NotTheBox/DontYouDare/ItsDarkInThere/
NoNo), toque-en ×6, enfado-en ×7, vuelve-en ×6 (return greeting — plays on first
emergence when memory says the visitor has been here; ES falls back to pop). LANGUAGE
WHITELIST in sfxObtener: on /en/ only pools with an EN bank or certified sinIdioma
(pop, ronroneo) may sound — susto/risa/quejido stay SILENT in EN until Ruben certifies
them wordless or records twins. Agent system prompt got REGLA DE IDIOMA (published):
{{idioma}} variable enforced, no mixing, untranslated titles cited in Spanish per
GLOSARIO.md. Bare /tizno-ai.html redirects home (?demo=1 = team door; ?embed=1
untouched). Petting now beats 'listening' for the face (cute melt during calls;
speaking theater still wins). Footer turn-states («Tizno habla/te escucha») removed —
susurro reserved for mic failures/remedies. EL AVISO NOTIFICATIONS WORK: Netlify
delivers form emails in delayed batches (~30-40 min) — configured to editorial@
soulware.live + goldsmith2097@gmail.com; Javier should confirm the editorial@ mailbox
exists in Zoho. PR #62 closed as superseded.

**🚀 PUBLISHED Aug 7, 2026 — Ruben tested everything on-device ("probado y va todo perfecto") and said "vamos a publicar". PR #63 merged to main (merge commit c8f5564), production verified (aviso-modal live, tizno-ai.html 200). ElevenLabs allowlist ARMED the same hour: soulware.live + el-umbral.netlify.app, origin-header required — WS-probe verified (prod accepted, alien origins refused). NOTE: deploy previews can no longer connect to the agent; to test Tizno on a preview, open the allowlist temporarily and re-arm it after. PR #62 is superseded (614 lines behind what shipped) — close it on GitHub. Remaining: EN voice takes (script in TOMAS-EN.md) + per-language pool wiring; El Aviso E2E now testable directly on production (submit → Netlify Forms → el-pacto).**

- **Cofre "versión galería" (final)**: the buyable card is cover-only — no DISPONIBLE
  pill, no repeated title/subtitle (the cover art carries them; the h3 stays as
  `.sr-only` for SEO/a11y). Full-width cover + one shop row spread edge-to-edge
  (space-evenly), ebook last behind a vertical filete with its EBOOK note
  (letter-spacing optically compensated). Icon size is fluid via **container query on
  the card** — floor 40px on ~280px cards (1280 laptops), 46px where they fit; NOTE:
  container queries measure the **content-box**. Both chests identical height (strip
  `min-height` reserves the EBOOK-note space). Mobile: cover capped at 250px and
  centered so the whole 513px chest fits one viewport; frame + strip stay edge-to-edge.
- **La Emperatriz "transparent text" — third skin of the same ghost, finally dead**:
  the 4s welcome `--highlighted` expired and dropped the pillar description back to
  opacity 0.75, only on the column you arrive with (nearly always hers). Rest state is
  now opacity 1; hover keeps the gold title + video reveal. (Commit de19a3a.)
- **Mobile pillars**: archetype title + description centered; "LAS CRÓNICAS" reveal no
  longer reflows (scaleX instead of animating letter-spacing).
- **New covers installed** (renamed, never overwritten — cache doctrine):
  `filamentos-de-oscuridad-v2.webp`, `anatomia-del-vacio-v2.webp` + `/mobile/` 280w
  variants; og-pages references updated. Astra cover still pending delivery.
- **Tizno English live end-to-end**: ElevenLabs agent has English published + language
  override; `tizno-ai.html` reads `?lang=`, EN status map incl. turn states
  (`window.__traducirEstado`), EN greeting pools; TiznoTease passes the lang.
  Knowledge base: Javier's 5 docs uploaded as separate text docs, RAG multilingual
  embeddings. **Bilingual glossary COMPLETED Aug 7** (Tierra Médula terms verified
  against the official EN manuscript of Pulse of the Core) — committed as
  `GLOSARIO.md` (plain-text dump of Ruben's docx). ⏳ NEXT SESSION: upload it as a
  text doc to Tizno's ElevenLabs KB (Create Text dialog, same flow as the other 6).
- **Audits closed**: Claude verification 8/8 after the i18n fix; GPT's "Chrome doesn't
  sleep" P0 refuted with Ruben's real Task Manager (47.9% visible → 0.4% hidden).
  Earlier in the session: mobile canvas 7→60fps (half-resolution buffer), iOS mic fixed
  (audioSession 'play-and-record'), 8 leaks sealed, a11y batch, obra deep links restore
  the ficha (ES + EN).

**Pre-merge / pre-launch checklist (the Javier conversation):**
1. ElevenLabs agent **domain allowlist → soulware.live** — REHEARSED Aug 7, then reverted.
   Findings (verified live with a raw WS-handshake probe, `scratchpad/ws-origin-probe.mjs`
   pattern): enforcement WORKS — rejected origins get an in-band close ("Host X is not
   allowed"), accepted ones get conversation metadata; the HTTP 101 handshake succeeds
   either way, so a probe must read the FIRST FRAME, not the status code. Matching is
   EXACT hostname: no wildcards (`*` rejected by the form validator) and the validator
   also rejects Netlify's `--` deploy-preview hosts, so the preview can never be
   allowlisted → the list stays open while preview testing is ongoing. AT LAUNCH: add
   `soulware.live` (+ optionally `el-umbral.netlify.app`, both validated) in Settings →
   Security → Allowlist and Publish — 3 clicks; "Fail when Origin header is missing"
   arms itself with the list.
2. ✅ DONE Aug 7 — `microphone=(self)` deployed to **main** (commit cab3158, inert until
   Tizno merges: nothing in production requests the mic yet).
3. Email capture for PRÓXIMAMENTE — **REBUILT Aug 7 as "El Aviso"** (Ruben caught
   that the old pact form no longer existed, then chose a plain popup, explicitly
   NOT tied to Tizno). Implemented: `#aviso-modal` (index.html, next to the pacto
   consent modal) — obra title in gold, "¿Quieres que te avisemos cuando esté
   disponible? Déjanos tu email.", email field + AVISADME; all PRÓXIMAMENTE /
   notify / locked CTAs (grid AND reading view) open it; submits by fetch to the
   long-registered Netlify mailbox `el-pacto` with an `obra` field saying which
   book. Bilingual (aviso.* keys). Gotchas encoded in comments: card click-guard
   now ignores `.obra-btn` (the soon CTA is a span — same click used to open the
   ficha underneath), reopen-race timer cleared, reflow instead of rAF (background
   tabs never run rAF). → REMAINING E2E (2 min, needs Javier's Netlify panel):
   click a PRÓXIMAMENTE on the deploy preview, submit a real email, confirm it
   lands in Netlify → Forms → el-pacto (preview submissions are collected too).
4. Ruben tests Tizno EN voice on `/en/` preview (allowlist reverted, preview connects —
   re-verified Aug 7).
5. Post-launch backlog: CSP report-only · Firefox idle-GPU trim · SEO content pass on
   obra pages · CLS Pulso mobile + render-blocking CSS.

---

## What was completed — Session 12 (July 5, 2026)

**Anatomía del Vacío — Phase 0 complete.** Germán delivered the full manuscript
(2,901 words, 10 sections: Prólogo + 8 pisos + Epílogo — one closed piece, not episodic).
Converted in full to the beat score: `src/anatomia/score.es.json` — **615 beats**, validated
1:1 against the original (zero lines lost, zero invented, breath-cycle duplicates intact).

- `ANATOMIA.md` rewritten (v2) — supersedes the pre-manuscript draft. Key deltas: user-paced
  (was auto-paced), ElevenLabs voiceover (was no-voice), free at launch (was per-chapter
  payment), lives inside `/obras/anatomia-del-vacio/` (was `/anatomia`), ascent not descent.
- Decisions locked by Ruben: user-paced advance · ElevenLabs with Ruben casting the voice ·
  URL inside the obra route · free for now (future pieces may be Pacto-gated) · Germán hands-off.
- Score format: `{t, fx, sfx, stack, delay, voice, scene, interact, id}` per beat; floor-level
  `ambience`/`mode`/`loop`. ~28 bespoke effects mapped 1:1 to the story's motifs (11:11 clock,
  vaho, obturar, breath cycle, Quinto Piso repetition trap, etc.). Full vocab in ANATOMIA.md.
- **Next: Phase 1** — AnatomiaEngine.js prototype + Prólogo produced end-to-end, separate Vite
  entry (`anatomia.html`) so the main site's perf budget is untouched.
- Ruben can start ElevenLabs voice browsing any time (Phase 3 needs the pick, not blocking 1-2).

---

## Site status

**Live:** https://soulware.live · https://soulware.live/en/
**Repo:** github.com/GoldsmitH2097/el-umbral
**Local:** `/Users/Ruben/Developer/el-umbral`
**Last commit:** `227ba13` — fix(i18n): wire remaining Spanish-leaking UI + prerender /en/ home (#30)
**Build:** ✅ Clean
**Deploy:** ✅ Netlify auto-deploy from `main`
**GA4:** ❌ Removed (PR #16) — no third-party tracking, no cookie banner
**Languages:** 🇪🇸 ES (default, `/`) · 🇬🇧 EN (`/en/`) — selector visible in footer, choice persisted in `localStorage('sw_lang')`, sync `<head>` redirect honours the saved preference on next visit

---

## What was completed — Session 10 (May 15, 2026)

Bilingual (ES/EN) shipped publicly. The site is now indexable in two languages with hreflang clusters, per-route prerender, a visible language selector, and persistent preference.

### PRs landed in this session — #27 through #30
| PR | Title | Summary |
|----|-------|---------|
| #27 | `feat(i18n): bilingual scaffold (ES/EN) — dark-launched` | `src/js/core/i18n.js` (`t`, `getField`, `setLang`, `urlForLang`, `applyTranslations`), `STRINGS` dict in `translations.js`, Router `/en/` prefix + character-slug translation map. Dark-launched (selector hidden). |
| #28 | `feat(i18n): full English translations + render layer wired` | Character lore + catalogue translated via `_en` overlay fields on `CHARACTERS` / `CATALOGUE`. ArchiveDOM / mobile.js use `getField()`. Bilingual prerender via `scripts/generate-og-pages.js` (10 ES + 10 EN). Sitemap with `xhtml:link` hreflang. |
| #29 | `fix(i18n): Scene 1 character text translates + #umbral-btn re-centred` | VisualEngine `_loadCharacterVideo` / `_swapToNextCharacter` use `getField()` (Scene 1 char-text was still ES on /en/). `#umbral-btn` got `text-indent: 5px` to compensate for letter-spacing trailing gap. |
| #30 | `fix(i18n+footer): EN body prerender, legal pages, skip resilience, footer polish` | Body content for /en/ routes pre-translated by the prerender script (kills FOUC). Sync `<head>` redirect honours stored `sw_lang` before first paint. `aviso-legal-en.html` / `privacidad-en.html` / `cookies-en.html` siblings; modal fetches the matching file by lang. Skip-intro now tears down in-flight scene state (was leaving Cm7 chord looping). Footer logo 120→72, replay+selector inline, watermark + hero copy translated. `text-wrap: pretty` extended to vision blocks / subtitles / pillar quotes; pillar max-width 250→290. `.obra-btn` `text-indent: 1.5px` (CLAIM YOUR COPY off-centre fix). Reading + modal book covers lock `aspect-ratio: 2/3` + `object-fit: cover`. Footer legal links blur active element on modal close (default blue focus ring fix). |

### Translation conventions established
- **Translated**: chrome (nav, hero, footer, modals, Tizno panel), CTAs, status pills, format labels, character archetype names ("El Caballero Sin Nombre" → "The Nameless Knight"), character lore + descriptions, catalogue vision / subtitle / format, legal pages.
- **NOT translated** (proper nouns of the universe): "Soulware", book titles (`Pulso del Núcleo`, `Filamentos de Oscuridad`, `Anatomía del Vacío`, `Totalis Libertas`), volume names (`Núcleo Eterno`, `Resonancia de la Penumbra`), author names, `editorial@soulware.live`. Same in both languages.
- **Character archetype canon (EN)**: The Throneless Empress · The Nameless Knight · The Shadowless Sibyl · The Flowerless Harlequin. EN slug routes: `/en/empress` · `/en/knight` · `/en/sibyl` · `/en/harlequin`. Book slugs stay Spanish in both languages.

### How the i18n system works
- **Source of truth = URL.** `/` is ES, `/en/*` is EN. `lang` is resolved in `i18n.js` from `location.pathname`.
- **Pre-render** (`scripts/generate-og-pages.js`) emits 20 static HTML files: `dist/index.html` (ES root), `dist/en/index.html` (EN root), and one subdir per route per language with patched `<title>`, `<meta description>`, canonical, OG/Twitter, `<html lang>`, and (NEW in #30) body text rewritten via `translateBody()` for EN routes so scrapers + first paint show English.
- **Runtime translation** (`applyTranslations()`) walks `[data-i18n]` / `[data-i18n-html]` / `[data-i18n-attr-*]` elements and rewrites textContent / innerHTML / attribute values from `STRINGS[lang]`. Runs once on boot; the pre-rendered EN HTML matches what it would output, so no FOUC.
- **`getField(obj, 'title')`** returns `obj.title_en` when `lang === 'en'` and the field exists, else falls back to `obj.title`. Lets CHARACTERS / CATALOGUE keep a single source with `_en` overlay fields.
- **Persistence**: clicking ES/EN in the footer calls `setLang()` (writes `localStorage.sw_lang`) and navigates to `urlForLang(path, target)`. On next visit, the sync `<head>` script reads `sw_lang` and `location.replace`s to the matching URL before any paint.
- **SEO**: hreflang in three layers — `<link rel="alternate" hreflang>` per page, `xhtml:link` per sitemap URL, self-pointing `<link rel="canonical">`. Both languages indexable; Google clusters them.

### Other UX/polish in #30
- **Skip-intro resilience**: previously a mid-transition skip (Scene 1→2 or 2→3) left the awakening chord (Cm7) looping forever, the gallery video painting under the archive, and pending timers firing. Fixed by tearing down audio (`stopAwakening`, `setAwakening(false)`, `state.isAwakening=false`), hiding `#gallery-container` + `#scene-2` + `#scene-3`, pausing `#char-video`, cancelling `_autoTimer` / `_s3IdleInterval` / `_s2HintInterval` before `transitionTo(4)`.
- **Widow lines**: pillar quotes were rendering "truth." on its own line. Widened `max-width 250→290px` and switched `text-wrap: balance` → `text-wrap: pretty` (better for short paragraphs — `pretty` pulls trailing words back; `balance` only equalises line widths). Extended to `.reading-obra-vision`, `.reading-obra-subtitle`, `.obra-subtitle`, `.tizno-pacto-label`, `#editorial-watermark`, `.site-hero-editorial`, modal descriptions.
- **Book cover stretching**: `.reading-obra-cover` and `#obra-modal-cover` had no explicit aspect-ratio; the IMG could grow unbounded under certain flex parent heights. Now both have `aspect-ratio: 2/3` + img `width: 100% height: 100% object-fit: cover`.
- **Footer**: logo `120→72px`, padding `6vh 5vw 5vh → 2vh 5vw 5vh`, replay button + lang selector share one row separated by `·`. Legal links: programmatic focus on modal close was leaving a default blue rectangle; closeLegal now `blur()`s the active element and `.footer-legal a:focus-visible` is on-brand amber.
- **Editorial watermark + hero copy translates.** EN copy drops the "Spanish" qualifier (Ruben call: "instead of Spanish Publisher of dark fiction, just say Dark Fiction Publisher"): watermark = "Independent publisher / of dark fiction and author-driven universes"; hero = "Soulware — an independent publisher of dark fiction and author-driven universes."

### Files touched
- `src/index.html` — data-i18n attrs across chrome + Tizno + modals, lang selector in footer, sync `<head>` redirect script, footer-replay-row, smaller logo.
- `src/js/core/translations.js` — full ES + EN dictionaries, including `editorial.watermark-html`, `tizno.*`, `nav.las-obras/contacto`, `site-hero.*`, `site-footer.tagline`, `reading-view.back/back-aria`, `mobile-detail.back`, `nav.author/books/vision/sheet`, `ui.close`.
- `src/js/core/StateManager.js` — `_en` overlay fields on every CHARACTERS + CATALOGUE entry (per-character: `slug_en`, `label_en`, `title_en`, `desc_en`, `lore_en`; per-catalogue: `title_en`, `subtitle_en`, `seriesInfo_en`, `vision_en`, `desc_en`, `buyLabel_en`, plus `editions[*].label_en/buyLabel_en/format_en/vision_en`).
- `src/js/core/Router.js` — `/en/` prefix handling, dual `OBRA_META`, SLUG_MAP accepts both languages.
- `src/js/engine/VisualEngine.js` — `getField(c, 'title')` / `getField(c, 'desc')` in char-text rendering.
- `src/js/ui/ArchiveDOM.js` — all renders + reading view + obra modal use `getField` + `t`. Legal modal fetches per-language file. btn-volver uses `t('reading-view.back')` + data-i18n hooks. Modal close blurs active element.
- `src/js/mobile.js` — `getField` in mobile detail view, `t()` for status labels.
- `src/css/global.css` — `text-wrap: pretty` extended.
- `src/css/archive.css` — pillar quote `max-width 290px` + `text-wrap: pretty`, footer redesign, `.lang-selector` styling with `aria-current` amber active state, `.footer-legal a:focus-visible`, `.reading-obra-cover` aspect-ratio.
- `src/css/obras.css` — `.obra-btn` `text-indent: 1.5px`, `#obra-modal-cover` aspect-ratio + object-fit.
- `src/css/canvas.css` — `#umbral-btn` `text-indent: 5px`.
- `scripts/generate-og-pages.js` — bilingual prerender (10 ES + 10 EN routes, including home), `translateBody()` for EN, hreflang alternates rewritten per page.
- `public/sitemap.xml` — 20 URLs with hreflang alternates.
- `public/aviso-legal-en.html` · `public/privacidad-en.html` · `public/cookies-en.html` — EN legal page siblings.

### Live-deploy verification (May 15 ~14:30 Madrid)
- `/` → 200 · `<html lang="es">` · ES title
- `/en/` → 200 · `<html lang="en">` · EN title + EN description
- `/caballero` → 301 → `/caballero/` → 200 (Netlify pretty-URL behavior, fine for SEO)
- `/en/knight` → 301 → `/en/knight/` → 200 · hreflang ES points back to `/caballero` ✓
- `/aviso-legal-en.html` · `/privacidad-en.html` · `/cookies-en.html` → 200
- Spanish-leak grep on `/en/`: 0 matches across the patterns we care about ✓

### Pending for Ruben / Javier (search visibility)
- [x] **GSC → URL Inspection → Request Indexing** on each of the 10 `/en/*` URLs. ✅ Done May 15 — all 10 EN URLs (/en/, /en/obras, /en/empress/knight/sibyl/harlequin, /en/obras/pulso-del-nucleo + 3 more obras) confirmed in priority crawl queue.
- [x] **PSI on /en/** ✅ Done May 15. Mobile: Perf 86, A11y/BP/SEO 100, LCP 1.3s, CLS 0. Desktop: Perf 70, A11y/BP/SEO 100, LCP 0.3s, CLS 0. Same budget as / (TBT is the cinematic intro — known constraint, not a regression).
- [x] **Bing Webmaster Tools** ✅ Done May 15. Imported from GSC (sitemap came over automatically). All 10 EN URLs submitted via URL Submission feature; quota 90/100 left for the day. Bing feeds DuckDuckGo + Yahoo + ChatGPT search citations as well.
- [ ] **External EN-language inbound links** (Goodreads author page, Amazon author page, etc.) will move the needle far more than any on-page tweak. The Amazon + Goodreads work was already pending in CLAUDE.md; same items.

### Tiny follow-up — PR #32 (May 15)
After Session 10 shipped, the post-deploy hardening pass caught one residual Spanish hardcode: the Pacto submit-success aria-label (`'Pacto firmado'`) was set inline in `ArchiveDOM.js`. Fixed via `t('pacto.signed-aria')`, both ES + EN dictionaries updated. PR #32 merged.

### SEO follow-up — PR #35 (May 15) — trailing-slash canonical fix
While reviewing GSC's "Why pages aren't indexed", Ruben spotted **8 pages flagged as "Redirect error"**. Root cause: the prerender writes `dist/<path>/index.html`, Netlify serves at `/<path>/` with a trailing slash, but our sitemap entries / `<link rel="canonical">` / hreflang alternates all referenced the **no-slash** version. The crawler's chain was: sitemap URL `/sortilega` → 301 → `/sortilega/` → canonical points back at `/sortilega` (the redirecting URL) → Google classified as canonical loop / redirect error.

Fix in `scripts/generate-og-pages.js` and `public/sitemap.xml`: every URL emitted carries the trailing slash on deep routes (`/sortilega/`, `/en/knight/`, `/obras/pulso-del-nucleo/`, etc.). The home routes `/` and `/en/` already had the slash and were unaffected.

After the fix shipped, re-submitted the 10 ES URLs to GSC via URL Inspection (priority crawl) and 10 to Bing via URL Submission. Counter for GSC indexing requests today: 20 (10 EN earlier + 10 ES now), no quota issues. Bing UI shows the most-recent submission set (10 ES); the earlier EN batch was accepted, also in queue.

The 5 "Server error (5xx)" entries in GSC are ghost paths (`/read`, `/saga`, `/contact.html`) that 301-redirect to `/`, plus two parameterized homepage variants (`/?brand=...`, `/?titulo=...`). All currently return correct codes — the 5xx flag was historical and Google's validation status is "Started" (already re-checking, will clear on its own).

---

## What was completed — Session 9 (May 14, 2026 — night → May 15)

A mega session — 17 PRs merged (#5 through #21) covering performance, SEO, accessibility, content, UX polish, and privacy.

### Headline numbers (before → after)
| Metric | Before | After |
|---|---|---|
| WAVE errors | 6 (4 empty headings + 2 form labels) | **0** |
| WAVE AIM | — | **9.8 / 10** |
| DebugBear suggestions met | ~15/30 | **26/30** |
| LCP (PSI mobile) | 3.6 s | **0.7 s** |
| TBT (Lighthouse) | 11–19 s | **~2.1 s** |
| CPU busy | 19 s | **5.96 s** |
| Total initial payload | 5.5 MB | ~1.5 MB |
| "Improve image delivery" flag | 1.57 MB savings | **114 KB savings** |
| Forced reflow from gtag | 2 × 47 ms | **0** (GTM removed) |
| Speed Index | 4.6 s | **0.9 s** |

### Performance — JS / canvas (PRs #9, #12)
- **Canvas RAF idle-pause** in Scenes 1–3: suspends after 3 s of no interaction. Wake-up listeners on `mousemove`/`mousedown`/`touchstart`/`touchmove`/`keydown`/`scroll`.
- **Particle physics @ 30 fps simulation, 60 fps render** — halved TBT.
- `_getTargets()` in ArchiveFireflies no longer fires `getBoundingClientRect()` every frame — gated to only fire near the idle threshold (120 reads/sec → ~10).
- Removed `filter:blur`, `mix-blend-mode`, heavy `text-shadow`, `cronicasGlow` keyframe (caused Chrome crashes on weaker devices).

### Performance — assets (PRs #13, #15, #17, #18, #20, #21)
- **Cover webps resized to 900 px max** at q82 (1.4 MB saved across 7 covers).
- **Mobile cover variants** at 318×450 in `/public/assets/mobile/` (-545 KB on mobile). All cover imgs ship `srcset="…/mobile/x.webp 320w, …/x.webp 600w" sizes="(max-width: 768px) 150px, 220px"`.
- **720p video variants** at `/public/720/<slug>.mp4` (-60%, ~397 KB each).
- **`pickVideoSrc()` helper** at `src/js/core/videoVariant.js` picks 1080p / 720p based on:
  - `state.skippedIntro` (force 720p — these users didn't watch the cinematic)
  - `navigator.connection.saveData` / `effectiveType` (2g / slow-2g / 3g → 720p)
  - viewport ≤ 768 → 720p
  - otherwise → 1080p
- **Video posters** (`.webp` from t=0 frame, 9–20 KB each) in `/public/posters/`. Set as `<video poster=...>` on all pillars and on `#char-video` for the gallery. t=0 matches the video's loop entry point so the static→playing handoff is seamless.
- **`width="600" height="900"`** explicitly set on every cover img + `width="120" height="120"` on the logos. CLS = 0.

### Loading strategy (PRs #15, #17, #18, #20, #21)
- All `<video>` start at `preload="none"` — Lighthouse never reaches Scene 4 so initial-load metrics are unaffected.
- `sceneChange→4` listener upgrades pillars to `preload="auto"` AND re-picks src via `pickVideoSrc(dataset.charSrc)` (handles skip-intro flag flipping post-construction).
- **IntersectionObserver belt-and-suspenders** in `_initPillarPreloadOnScroll()`: any pillar approaching viewport (`rootMargin: 200px`) with `preload="none"` is bumped to `auto`. Defense in depth for any future skip path that misses `sceneChange`.
- **LCP poster discoverable from initial HTML** (PR #21): hardcoded `poster="/posters/reina-sin-corona.webp"` on `#char-video` + `<link rel="preload" as="image" href="..." fetchpriority="high">` in `<head>`. Lighthouse LCP audit now passes "Request is discoverable in initial document" and "fetchpriority=high should be applied".
- Legal HTML cache warming (`requestIdleCallback`) moved to first user interaction (`pointerdown` / `touchstart` / `keydown` / `scroll`) or `sceneChange→4`. Was upstream of LCP in the critical chain on slow-4G.
- Removed `<link rel="prefetch">` for legal HTMLs from `<head>` (was serializing into critical path).

### SEO (PRs #12, #15)
- Per-route prerender (`scripts/generate-og-pages.js` postbuild): 8 deep routes get unique `<title>`, description, canonical, OG/Twitter, JSON-LD `Book` schema with `offers.price` + `priceCurrency`.
- Pulso JSON-LD: 22.44 EUR.
- Filamentos JSON-LD: 17.95 EUR.

### Accessibility (PRs #10, #11)
- 4 empty headings → sr-only placeholder spans.
- `<input id="contact-email">` → `aria-label="Email"`.
- Honeypot `bot-field2` → `aria-label` + `tabindex="-1"` + `autocomplete="off"`.
- All `<video>` decorative → `aria-hidden="true"`.

### Privacy (PR #16)
- **GA4 / GTM completely removed.** No `<script async src="googletagmanager.com/gtag/js">`, no `dataLayer`, no `gtag('config'...)`. No cookie banner required.
- Killed the only cross-origin script the site loaded.

### Catalogue + UI polish (PRs #6, #7, #8, #14, #19)
- Pacto button (Tizno panel): icon-only with check-on-send swap.
- "Cargando…" replaced with breathing **"Despertando…"** + cascading dots.
- Legal modal: synchronous open when cache-hit (no loading flash).
- Pulso del Núcleo card + modal + reading view: two editions render in a single stacked layout — buy CTA for Tapa Blanda (live), "Tapa Dura / Próximamente" combined button below.
- All coming-soon CTAs unified to **"Próximamente"**.
- Status pill removed on coming-soon cards (the button already says it).
- Emperatriz obra: title "En preparación" → **"Título Sellado"**. CTA → "Próximamente". (Placeholder title — real title sealed.)
- La Corte (Totalis Libertas) CTA: "Cruza el Umbral" → "Próximamente".
- Anatomía CTA: "Iniciar mi Disección" → "Próximamente".

### Audio (PR #3, continued)
- Cover-hover sound + button-hover sound (independent throttles).
- Reading view: master output goes through `BiquadFilter` lowpass at 22050 Hz baseline; muffles to ~800 Hz when reading view opens, restores on close.

### Security headers (PR #3, continued, in `netlify.toml`)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Permissions-Policy: geolocation=() microphone=() camera=()`

### Files added this session
- `public/720/{reina-sin-corona,caballero-sin-nombre,sortilega-sin-sombra,arlequin-sin-flores}.mp4` — 720p variants
- `public/posters/{…}.webp` — t=0 frame posters
- `public/assets/mobile/{…}.webp` — mobile cover variants
- `src/js/core/videoVariant.js` — variant picker

---

## What was completed — Session 8 (May 14, 2026 — evening)

A long polishing session covering visual, audio, performance, and content fixes. Three PRs merged: #3 (polish) and #4 (lighter videos); #2 was closed as superseded by #3.

### Audit cleanup (rolled into PR #3)
- **Filamentos JSON-LD**: was declared `PreOrder` with `availabilityStarts: 2026-05-12` for a book that's been shipping since May 12. Fixed to `InStock` with Amazon ES `url`.
- **Filamentos copy**: "Disponible el 12 de mayo de 2026" appeared in `src/index.html` (ghost DOM) and `Router.js`. Both surface in shares/crawlers. Now reads "Ya disponible" + Amazon link.
- **Pulso ASIN mismatch**: `scripts/generate-og-pages.js` was using `B0CQPCRCXP` for the Offer URL; everywhere else uses `8409810344`. Unified.
- **Dead code removed**: `_buildContact()` method + `<section id="contact-section">` (no UI path; scroll-contact opens Tizno). `#contact-form` from submit handler. `localStorage.removeItem('sw_crossed')` (flag never set). Production `console.warn('[AudioEngine] blocked')`.
- **Listener / interval leaks**: countdown `setInterval` now tracked + cleared (was dormant but would leak when next countdown launches). Reading-view obras-list click handler moved from per-call to one-time delegated binding. Global Escape `keydown` for obra modal now guarded with `modal.classList.contains('open')`.
- **A11y**: `h4` → `h3` for pillar headings (fixes Lighthouse `heading-order`). `<div id="main-site">` → `<main id="main-site">` (adds the missing `<main>` landmark). On-brand amber `:focus-visible` outline on `.archive-pillar` replaces default browser blue.
- **Security headers** in `netlify.toml`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy: geolocation=() microphone=() camera=()`.
- **Doc drift**: `CLAUDE.md` catalogue replaced `pulso-blanda`/`pulso-dura` with single `pulso` + `editions[]` to match `StateManager.js`.

### Tizno panel
- Restructured from awkward 2-column-half-empty grid to **single centered ~480px column**, then in a follow-up rebuilt as a **3-column wide-and-shallow grid** at desktop (1024px+) — col 1 contact CTA, col 2 brand block (social/email/identity), col 3 El Pacto form. Collapses to 2 cols at tablet, 1 col on mobile. Panel height went 396px → 196px on desktop.
- Reordered DOM: Contacto + Envíanos button on top, then social row, email, identity, El Pacto.
- Padding/max-height tightened (44px→28px, 85vh→70vh).
- Cursor: `pointer !important` + `user-select: none` on the mailto button (was text cursor).
- `:focus-visible` outline on the X close button (was default browser blue square on click).
- **Threads icon** replaced with the official Meta SVG (192×192 viewBox + `fill-rule="evenodd"` on its own subpath). Previous path was a single subpath that rendered as a solid blob.

### Archive fireflies
- **Spawn range** spread across full viewport (was clustered top-third with H*1.2 going off-screen).
- **More dynamic motion**: independent X and Y phase oscillators (the previous sine was Y-only — why they barely moved horizontally), bigger Brownian amplitude, per-firefly `speedMult` for variance.
- **Cursor repulsion**: fireflies now flee from the mouse within a 220px radius with strength scaling 1/distance — like dust avoiding a hand.
- **Scroll-direction wake nudge** with inertia decay — they catch scroll motion like dust in air.
- **Real viewport bounds** — soft boundary was `y > 3000` (way past screen). Now clamps to actual viewport edges.
- Count 4 → 6 for more presence.
- **30fps throttle** on the RAF (was 60fps) — halves CPU; motion is slow enough the difference isn't perceptible.
- **Page Visibility hook** — pause RAF when tab hidden, resume when visible.
- **Big perf win from trace analysis**: `_getTargets()` was calling `getBoundingClientRect()` twice every frame (forces synchronous layout). At 30fps that was 600 layout reads per 5s in the user's trace — the #1 `UpdateLayoutTree` contributor. Gated to fire only when `idle > INACTIVITY_OBRAS - 1500ms`. Next trace showed 12× reduction in layout reads.

### Las Crónicas heading
- Split into per-letter `<span>` tags via JS in `main.js`, with `--i` index custom prop. `aria-label="Las Crónicas"` preserved on h2; spans are `aria-hidden`.
- Per-letter subtle Y/X sine-wave drift (±1.5px Y, ±0.5px X) with phase offset per letter. Animation starts after the existing reveal completes (2.8s delay).
- Space character span gets explicit `width: 0.45em` so the gap between "LAS" and "CRÓNICAS" actually renders.
- Per Ruben's call: the original glow breath + Ó blink were removed — "shitty" and CPU-heavy (text-shadow with 50px blur radius is the most expensive single thing you can put on a heading). Only the drift remains.

### Scene 3 — entrance + Adentrarse departure
- **Entrance**: h1 and button now start invisible and fade in via opacity once `triggerAwakening` adds `.scene-3--awakened` (h1 at 0.3s, button at 2.2s). Pure opacity transitions — no scale, no letter-spacing, no blur (per Ruben's "lets simplify to fades" feedback).
- **Departure** (clicking ADENTRARSE or 7s idle auto-advance): scene fades over 1.4s, button + h1 fade in 0.7s. Simple, smooth, no glitch flicker.
- **VFX canvas fade**: the awakening spotlight (drawn on `#vfx-canvas` at z-index 3) was visible through the fading white scene-3 (z-index 10), making the circle appear to "linger" past the click. Now the canvas itself fades on the same trigger (`transition: opacity 0.4s` on the base canvas rule + sibling-selector rule sets opacity 0 when scene-3 has `.scene-3--departing`; JS belt-and-suspenders inside rAF).
- **Auto-advance idle bumped 5s → 7s** so the button is visible for >1s before auto-advance fires.

### Audio
- **Master output bus** added to `AudioEngine._buildGraph()`: all sources now route through `masterOut → masterFilter (lowpass) → ctx.destination`. New method `setReadingViewMuffle(open)` animates the master lowpass cutoff between 22050Hz (clear) and 700Hz (muffled) over ~150ms.
- **Reading-view muffle wired**: `ArchiveDOM.openReading()` muffles, `closeReading()` restores. Like a heavy door closing as the reader steps into a character bio.
- **Hover sounds**:
  - `playCoverHover(charIndex)` — two-harmonic chime (sine + triangle) tuned to `CHAR_FREQUENCIES[charIndex]`, ~50ms attack, 550ms exponential decay, ~0.04 gain. Each character's books carry that character's tonal fingerprint.
  - `playButtonHover()` — soft metallic shimmer on active buy buttons (bandpass-filtered noise sweeping 5200Hz → 1800Hz over 220ms).
  - Independent throttle timers (`_lastCoverHoverT` / `_lastBtnHoverT`) so a cover hover doesn't suppress a button hover when the cursor moves between them.
- **Wiring**: delegated `mouseover` handler on `document` with `relatedTarget` guard so each cover/button only chimes on actual entry. Reading-view `.reading-obra-cover` also fires the character-tuned chime (uses `_currentReadingIndex`).

### Performance
- Stripped every `filter: blur()` from transition/entrance keyframes (was up to `blur(30px)` — most expensive CSS filter). Removed `mix-blend-mode: multiply` (forces extra compositing layer). Removed `cronicasGlow` keyframe (50px text-shadow infinite was the biggest single ongoing cost). Replaced with vector-only transforms + opacity.
- Pillar videos no longer call `video.load()` eagerly — defers to `preload="metadata"` (~8MB saved on iOS Safari Archive entry).
- Audio context already suspends on Page Visibility hidden. Verified working.
- VisualEngine `_tick` already clamps delta-time during tab-switch pauses.

### Cursor consistency
- Previously `main.js` was forcing `cursor: auto !important` on every element when entering the archive, which suppressed anchor pointer defaults — that's why legal-link hovers showed text cursors.
- Now removes inline cursor styles only; explicit CSS rules: default arrow on body, pointer on a/button/`[role=button]`/`.archive-pillar`/`.obra-cover--clickable`/`.obra-btn`/`.footer-legal a`/etc., text only on `input[type=email]`/`input[type=text]:not([readonly])`/textarea.

### Active column / modal pure black
- `.archive-col` was `background: #050505` with `#080808` on hover — that bleed showed as gray. Now solid `#000`, no hover lift.
- `.archive-pillar` also explicitly `background: #000` (video opacity now renders onto pure black).
- `#obra-modal` was `rgba(2,2,2,0.97)` (3% transparency let underlying pillars show through). Now solid `#000`.

### Pillar typography
- All 4 character titles align at the same vertical height regardless of 1/2/3-line descriptions — reserved 5.1em `min-height` on `.pillar-content p`.
- `text-wrap: balance` on the same selector — prevents widow words ("verdad." dangling alone).

### Legal pages fast-load
- `<link rel="prefetch">` for `/aviso-legal.html`, `/privacidad.html`, `/cookies.html` in `<head>` — browser warms cache during idle.
- In-memory `legalCache` Map so second open is also instant (no re-fetch).

### Character videos — 50% smaller (PR #4)
- All 4 character pillar videos re-encoded from After Effects → Adobe Media Encoder at half the bitrate (1 Mbps target instead of ~2 Mbps).
- Same H.264 codec (universal browser support — no compat risk; HEVC was ruled out because Chrome on Linux/Windows decoding is unreliable).
- Same resolution (1080×1080), same 24fps, same 7.96s duration, same visual quality acceptable for ambient looping.
- Sizes: 1.9 MB each → ~980 KB each. **Total: 7.6 MB → 3.9 MB (-49%).**

### Performance numbers (start → end of session)

| Metric | Before | After |
|---|---|---|
| Total video weight | 7.6 MB | 3.9 MB (-49%) |
| TBT (mobile, throttled) | 100ms | 20ms (-80%) |
| TTI (mobile, throttled) | 18.3s | 3.8s (-79%) |
| Accessibility score | 97 | 100 |
| UpdateLayoutTree (per-sec, in 4× throttled trace) | 120/s | 9.5/s (12× better) |

---

## What was completed — Session 7 (May 14, 2026)

### SEO diagnosis
- GSC dashboard showed 1 indexed / 15 not indexed → investigated each of 4 error buckets
- **All 15 non-indexed URLs are ghosts from a pre-Vite site**, not current routes (`/read`, `/saga`, `/contact`, `/map`, `/universo`, `/thanks.html`, `/privacy`, `/terms`, `/?brand=`, `/?titulo=`)
- Confirmed per-route prerendering (`scripts/generate-og-pages.js`) is already working — live `/caballero/` serves unique title and `canonical → /caballero`

### Code changes (PR #1, merged)
- `public/sitemap.xml`: dropped `/aviso-legal`, `/privacidad`, `/cookies` (they carry `noindex` — contradictory to sitemap inclusion). Now 9 URLs.
- `public/_redirects`: 10 explicit `301` redirects for legacy ghost paths, ahead of SPA catch-all
- `CLAUDE.md`: refreshed SEO status section with accurate state; fixed stale Filamentos status (`countdown` → `available`)

### Google Search Console actions (May 14)
- "Validate Fix" submitted for 3 of 4 error buckets:
  - Server error (5xx)
  - Alternate page with proper canonical tag
  - Crawled - currently not indexed
- **Skipped** "Excluded by noindex" — the 3 legal pages are intentionally noindexed; validation would fail
- "Request Indexing" submitted for all 8 real routes via URL Inspection:
  - `/caballero` (was already indexed)
  - `/emperatriz`, `/sortilega`, `/arlequin` (not yet indexed)
  - `/obras/pulso-del-nucleo`, `/obras/filamentos-de-oscuridad`, `/obras/anatomia-del-vacio`, `/obras/totalis-libertas` (not yet indexed)

### Expected outcome
- Ghost URLs should drop from GSC reports over the next 1–2 weeks as Google re-crawls and sees the 301s
- Real routes should appear in indexed count over the next 1–4 weeks as Google processes the priority crawl queue
- Indexed count should climb from 1/9 toward 9/9. Re-check GSC weekly.

---

## Captured ideas (not yet scoped)

### Archetype-keyed ambient drone (Scene 4)
**Idea:** When focusing on one of the four character columns in the Archive, the ambient sound should subtly retune to that character's tonal signature (using the existing `CHAR_FREQUENCIES` chord set).

**Why it's interesting:** `playCharacterSignature` already exists for transitions. Extending the *continuous* ambient to also respond to focus would deepen the immersive feedback — each column gains a sonic identity, not just a visual one. Since `CHAR_FREQUENCIES` alternates per session (high vs grave), the same hover gesture sounds different across visits.

**Implementation sketch:**
- New ambient drone (fundamental + perfect 5th, gain ~0.005, slow LFO pulsation 6–12s)
- `audio.setArchetypeFocus(i | null)` — smooth pitch glide over 1–2s
- Desktop: pillar mouseenter/mouseleave; Mobile: carousel `.archive-col--active` detection
- Effort: ~1.5–2h, low risk (additive to AudioEngine)

**Open design questions:**
- Drone timbre (sine / filtered saw / resonant noise)
- Volume floor (atmospheric vs noticeable)
- Pulsation pattern (synced vs pseudo-random)

---

## How to start a session

```
"Lee CLAUDE.md y HANDOVER.md y dime en qué estamos."
```

Paste this file fresh at the start of every new chat.

---

## What was completed — Session 6 (May 12, 2026)

### Audio redesign
- Removed audio toggle button entirely — auto-unmute on first user gesture
- **Chord**: CHAR_FREQUENCIES now randomly alternates per session between:
  - Set 2: Am/maj7 high `[220.00, 261.63, 329.63, 415.30]`
  - Set 4: Am/maj7 grave `[110.00, 130.815, 164.815, 207.65]`
- Chord test HTML built and shared with Javier + musician Diego (5 options, intro + awakening modes)
- `resume()` moved before `_buildGraph()` in AudioEngine.init() — iOS gesture window fix
- Silent looping `<audio>` element: holds AVAudioSession in Playback category → bypasses iOS mute switch
- `touchend` also calls `resume()` + iosUnlock.play() — long presses don't fire synthetic mousedown, so single unlock wasn't enough
- `playCharacterSignature()` moved to start of `forceIgnite()` (gesture handler context)
- Signature volumes raised 0.08 → 0.14 for audibility
- Skip button no longer bleeds intro audio into archive
- Archive ambient: droplets continue past scene 4, crackle every 3–7s via `startArchiveAmbient()`, faint wind at 0.008

### Mobile fixes
- `forceIgnite()`: 600ms smoothstep spotlight animation (was instant jump)
- `_silentFlame` flag: tap = spotlight+glow only, hold >300ms = fire appears
- Fire particles cleared 200ms after finger release (was instant, then was 0ms)
- `_endMobileHold()`: `state.isPressed = false` added alongside `isIgnited = false`
- `_doMobileTap()` and `_autoAdvanceNext()` now hide `instMobile` — instruction text was overlapping during auto-advance
- `handleUp()`: `setSilentFlame(true)` + 200ms timer to `clearFireParticles()` on release
- `initMobileScene2`: off-by-one bug fixed — `index: currentIndex - 1` → `index: currentIndex` (first whisper had no sound, each sound was one tap behind)
- Awakening circle: `visual.snapCenter()` called in `triggerAwakening()` — no more off-center expansion on mobile

### Visual / CSS
- Watermark: `bottom: 80px` → `bottom: max(16px, env(safe-area-inset-bottom, 16px))`
- `#read-title:focus { outline: none }` — blue rectangle on reading view heading
- `.obra-btn--buy`: `cursor: pointer !important; user-select: none` — text cursor on hover fixed
- Filamentos buyLabel: `'Edición física: Reclamar mi Ejemplar'` — consistent with Pulso 2-line format
- ArchiveDOM: all 3 CTA render paths split buyLabel on `: ` for edition label + CTA
- Mobile carousel: `.archive-col--active .pillar-content h4 { color: #e8c87a !important }` — amber on active column
- Sortílega desc: `<br>` after first sentence so "Lo que crees..." starts on line 2
- `#char-desc`: `min-height: 4em` for consistent 2-line height across all characters
- `_descEl.innerText` → `innerHTML` to support `<br>` tags
- `.archive-pillar::before` gradient: dark vignette behind pillar text — critical for Emperatriz whose video has warm amber tones exactly where text sits
- `text-wrap: balance` on `#char-title, #char-desc` — prevents orphaned words
- `text-wrap: pretty` extended to `.read-body p, .mobile-detail-lore p`
- Mobile `reading-obra-cover`: 80px (was 120px)
- Mobile `obra-btn`: `letter-spacing: 2px` to prevent button text overflow
- Mobile `#btn-volver`: safe-area top for deep links
- `transition: all` replaced with specific properties in archive.css + obras.css

### Content
- Filamentos: status `countdown` → `available`, buyUrl set to amazon.es/dp/8409861771, releaseDate removed
- Filamentos + Pulso buy buttons: correct Amazon URLs verified
- SEO: all 9 routes audited, descriptions updated, sitemap lastmod 2026-05-12
- Book JSON-LD schema added to Pulso + Filamentos OG pages

### Tizno panel
- Contact form removed → replaced with `mailto:editorial@soulware.live` "Envíanos un mensaje" button
- Coming-soon / locked CTAs now open Tizno panel (event delegation on grid + reading view)
- Coming-soon fallback label: `'Próximamente'` → `'Recibir señal'`
- El Pacto email form: input + button same height (`align-self: stretch !important`)
- El Pacto button: text → checkmark SVG icon (52px wide)
- Checkbox: `appearance: none`, dark #111 background, amber when checked
- Email address: brighter on hover

### Catalogue
- Countdown module preserved in ArchiveDOM.js for future launches (triggered by `status: 'countdown'` + `releaseDate`)

---

## Current architecture decisions — DO NOT REVERSE

| Decision | Reason |
|----------|--------|
| No React | Canvas 60fps needs clean main thread |
| Canvas `destination-out` for spotlight | CSS mask-image on video kills hardware acceleration (~1fps) |
| Smoke: `createRadialGradient` per frame | OffscreenCanvas sprite caused Z-axis zoom artefact |
| `display:none` (not `opacity:0`) on overlays | opacity:0 doesn't hide `position:fixed` children in Safari |
| Root-relative video paths `/name.mp4` | Bare paths break deep links |
| `touch-action: none` scoped to intro layers | Preserves scroll in archive |
| `.sr-only` for ghost DOM | `display:none` blocks Googlebot |
| `public/_redirects` with `/* /index.html 200` | SPA routing for /obras/* deep links |
| `#mobile-char-detail { display: none }` in global.css | Must be outside media query or bleeds onto desktop |
| `.mobile-panel { display: none }` in mobile.css | Without this, both Autor/Libros tabs show simultaneously |
| `resume()` before `_buildGraph()` in AudioEngine.init() | iOS gesture window expires before heavy buffer allocation |
| Silent looping `<audio>` element | Forces AVAudioSession Playback category → bypasses mute switch all iOS versions |
| `touchend` also calls `resume()` | Long presses don't fire synthetic mousedown — needs second gesture event |

---

## Key files

| File | Purpose |
|------|---------|
| `src/js/engine/AudioEngine.js` | Flame/smoke/dust/firefly + spotlight + scroll impulse |
| `src/js/engine/VisualEngine.js` | forceIgnite (600ms anim), silentFlame flag, spotlight, snapCenter |
| `src/js/main.js` | Scene transitions, audio first-interaction, skip, touchend audio unlock |
| `src/js/core/StateManager.js` | CHARACTERS[], CATALOGUE[], lore, vision, desc, CTAs |
| `src/js/core/Router.js` | Character + obra route metadata, History API |
| `src/js/ui/ArchiveDOM.js` | Archive grid, reading view, obra modal, Tizno wiring, CTA event delegation |
| `src/js/ui/TiznoTease.js` | Asymmetric blink, panel toggle |
| `src/js/mobile.js` | Scene 2 tap (whisper index fix), archive overlay |
| `src/css/archive.css` | Archive grid, reading view, pillar gradient, mobile responsive |
| `src/css/mobile.css` | Mobile overrides, active column amber, safe-area padding |
| `src/css/obras.css` | Obra cards, modal, badges, CTA buttons |
| `src/css/tizno.css` | Tizno peek, eyes, panel, El Pacto form, mailto button |
| `src/css/typography.css` | Reading view body text, social links |
| `public/_redirects` | SPA catch-all |
| `public/google8ac032f1f6add1da.html` | Search Console verification — KEEP FOREVER |

---

## Pending work

### Javier-gated
| Item | Notes |
|------|-------|
| **Goodreads** | Author page for WW. & Eidon |
| **Amazon** | Publisher name + author bio + soulware.live link |
| **Privacy policy** | Update `public/privacidad.html` with Core Soulware S.L., NIF B26896795, Valladolid |
| ~~Bunny.net CDN~~ | Deferred — videos are 980KB each after re-encode, Netlify edge serves them globally, free up to 100GB/mo. Revisit if traffic exceeds 80GB/mo or buffering reports come in. See "Decisions made (deferred work)" below. |
| ~~Google Search Console — resubmit sitemap~~ | Already done in Session 7. Now waiting on Google's crawl pace (re-check May 20). |

### Ruben-gated
| Item | Notes |
|------|-------|
| **Emperatriz obra title** | TBD — Alicia Sarel |
| **Totalis Libertas relatos** | Content for anthology relatos array |
| **Editorial directories** | editorialesindependientes.es, letrasdeencuentro.es, coolt.com |
| **@soulware.editorial branded social** | Pending |

### Code (next session)
| Item | Priority | Notes |
|------|----------|-------|
| **Anatomía del Vacío build-out** | P1 | Prologue + ep.1 content from Germán ready. See ANATOMIA.md |
| **Tizno full implementation** | P1 | System prompt + Claude API + Stripe. See TIZNO.md |
| **Shop v1** | P2 | Stripe Checkout + custom buy buttons. Blocking: Javier brainstorm on fulfillment + digital format. See Captured ideas. |
| **Archetype-keyed ambient drone** | P3 | Scene 4 columns tinting ambient to each character's `CHAR_FREQUENCIES` tone. ~2h. See Captured ideas. |
| **OffscreenCanvas worker** | P3 | TBT fix. Safari fallback needed |
| **Cinematic Amazon handoff** | P3 | Fade to black → "Abriendo pasaje seguro..." → redirect |

### Decisions made (deferred work)
- **Video CDN migration** — deferred. Reasoning: site is already on Netlify (a CDN), free tier covers ≥12k visits/mo, current videos are now 980KB each (down from 1.9MB). Cost difference at current scale: a few dollars per month at most. The migration is meaningful engineering work for no immediate benefit. Trigger to revisit: traffic exceeds 80GB/mo on Netlify, OR users report video stutter on mobile.
- **HEVC / WebM for videos** — rejected. HEVC has spotty browser support (Chrome on Linux/Windows). WebM VP9 would only save ~10–15% more at this point and requires `<source>` fallback markup. Current H.264 at 1 Mbps is the right call.

---

## Catalogue summary

| ID | Title | Archetype | Status | CTA |
|----|-------|-----------|--------|-----|
| `emperatriz-obra` | Título Sellado (placeholder) | emperatriz | coming-soon | Próximamente → opens Tizno |
| `la-corte` | Totalis Libertas | emperatriz | coming-soon | Próximamente → opens Tizno |
| `pulso` (with `editions[]`) | Pulso del Núcleo | caballero | available | Tapa Blanda: Reclamar mi Ejemplar (live, Amazon ES 8409810344) · Tapa Dura: combined "Próximamente" button |
| `filamentos` | Filamentos de Oscuridad | sortilega | **available** (shipped 2026-05-12, Amazon ES 8409861771) | Reclamar mi Ejemplar |
| `anatomia` | Anatomía del Vacío | arlequin | coming-soon | Próximamente → opens Tizno |

---

## Audio — chord sets
Randomly alternates per session:
- **Set 2 (Am/maj7 high):** `[220.00, 261.63, 329.63, 415.30]`
- **Set 4 (Am/maj7 grave):** `[110.00, 130.815, 164.815, 207.65]`

Chord test HTML file: shared with Javier + Diego. 5 options tested (Actual, Set1-4).

## Known iOS audio behavior
- Mute switch: `<audio>` looping + `navigator.audioSession.type = 'playback'` (iOS17+) bypass it
- Long press doesn't fire synthetic mousedown → `touchend` handler also calls `resume()`
- First tap may still require the `touchend` to fully commit audio session on some devices
- Status: functional for most cases. Not 100% on all iOS versions with mute on.

---

## Session history

| Session | Date | Focus |
|---------|------|-------|
| 1 | Apr 23 | Analytics, SEO, copy brief, flame/smoke fixes, mobile overhaul |
| 2 | Apr 23 | Autoplay rework, catalogue editions, SEO obra routes, email capture |
| 3 | Apr 24 | Archive grid, reading view, mobile polish, bug hunt |
| 4 | Apr 24 | Carousel, audio toggle, reading layout, mobile fixes, docs |
| 5 | Apr 27 | a11y inert modals, Javier copy (7/10), GA mess + revert |
| 6 | May 12 | Audio redesign, mobile polish, chord test, Tizno panel, CSS audit, CTA wiring |
| 7 | May 14 (afternoon) | SEO investigation, ghost URL cleanup, GSC validate fixes + request indexing, audit cleanup landed (#3) |
| 8 | May 14 (evening) | Long polish: Tizno 3-col redesign, fireflies behavior + perf, transition simplified to fades, audio muffle + hover chimes, Threads icon fixed, video re-encode (-49%). PRs #3 (polish) and #4 (lighter videos) merged. |
| 9 | May 14 (night) → May 15 | Mega perf/SEO/a11y/privacy overhaul. 17 PRs (#5–#21). GA4/GTM removed. WAVE 6→0 errors. LCP 3.6s→0.7s. TBT ~15s→~2s. 720p mobile video variants + `pickVideoSrc()` + skip-intro flag. Poster `.webp` t=0 frames. IntersectionObserver pillar preload fallback. Mobile cover variants + `srcset`. LCP poster hardcoded in HTML with `fetchpriority="high"`. Catalogue: "Título Sellado" placeholder, all coming-soon CTAs unified to "Próximamente", status pills hidden when redundant. |
| 10 | May 15 | Bilingual ES/EN public launch. 4 PRs (#27–#30). Two-language sitemap (20 URLs) with hreflang clusters. Pre-render translates body for /en/ routes (no FOUC). Visible footer language selector + `localStorage('sw_lang')` persistence + sync `<head>` redirect on next visit. EN legal pages (`*-en.html`). Skip-intro made resilient: tears down Cm7 chord, gallery video, scene overlays, pending timers. Footer redesign: smaller logo, replay+selector inline. Widow-line + button-centring + cover-aspect-ratio polish. |
