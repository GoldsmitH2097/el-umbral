# BABY-TIZNO-ELEVENLABS-POLITICAS.md — Lo que dicen los términos de ElevenLabs sobre datos, menores y voces

## Verificado en fuentes primarias el 10-sep-2026 (agente de lectura + comprobación en el panel con la sesión de Ruben). Citas literales en inglés; lo no verificable está marcado.

Documentos y fecha de «Last updated»: Privacy Policy (20-may-2026) · Terms of
Use EU, la versión que aplica a España (31-mar-2026) · DPA (8-abr-2026) ·
Prohibited Use Policy (17-ago-2026) · ElevenAgents Terms (29-abr-2026) · Speech
Engine Terms (20-may-2026) · Voice Library Addendum (6-mar-2026) · Trust Center
(compliance.elevenlabs.io) · Docs de Agents (privacidad, retención, ZRM, LLM).

---

## 1 · Entrenamiento con nuestros datos: SÍ por defecto en planes self-serve

- Privacy Policy §8: «We may process your Personal Data to research, develop,
  train and/or otherwise improve our AI models. This may include processing
  audio, text… that you provide or that is collected or generated in
  connection with your use of the Services.»
- Terms EU §4(d): licencia «perpetual and irrevocable», «sub-licensable» sobre
  el Content (Input + Output, incluidas transcripciones y audio de Agents)
  «to improve the Services, and to develop new services and products».
- Trust Center (Google Cloud como subprocesador): «For non-Enterprise plan
  customers… LLM Services may also be used for research, development,
  training, and product improvement purposes, to the extent permitted under
  the applicable agreement with the customer.»
- **Opt-out** (Terms EU §4(i)): «you may opt out of our use of your Content for
  training at any time by navigating to the "Data use" menu in the "Terms and
  Privacy" section of your ElevenLabs account.» No es inmediato ni
  retroactivo. → PENDIENTE: activarlo en la cuenta de Ruben (ajuste de cuenta;
  requiere su OK explícito).
- **Zero Retention Mode**: solo Enterprise («Enterprise customers can use Zero
  Retention Mode»). El interruptor aparece en Settings → Privacy de cada
  agente, pero no está disponible en self-serve.

## 2 · Retención de conversaciones de Agents

- Por defecto: transcripción + audio, **2 años**, alojado en EE. UU. (para
  no-Enterprise: «US, EU or Singapore» según latencia). Residencia EU solo
  Enterprise.
- Configurable por agente: `record_voice` (hoy OFF en Baby Tizno) y
  `retention_days` (hoy 30 con autoborrado; `0` = borrado programado).
- Redacción automática de datos personales en el historial: solo Enterprise
  → el filtro de datos sensibles lo hacemos nosotros en la app.
- Borrado manual: `DELETE /v1/convai/conversations/{conversation_id}` (la doc
  no detalla si separa audio y transcripción: no verificado).

## 3 · El LLM (Gemini vía Vertex AI de Google)

- Doc ZRM: «ElevenLabs has agreements in place with each third-party LLM
  provider which expressly prohibit such providers from training their models
  on customer content, whether or not Zero Retention Mode is enabled.»
- No publican el periodo de retención del proveedor del LLM (no verificado).
- ElevenAgents Terms §3.B: «Customer shall clearly and prominently inform its
  End Users that (a) they are interacting with AI rather than a human, and (b)
  conversations are being recorded and may be shared with ElevenLabs and LLM
  Providers. Customer is also required to update its privacy policies
  accordingly.» → CHOCA con la decisión D6 (no decirle al niño que es una IA).
- ElevenAgents Terms §4.A: acuerdo de usuario final obligatorio («clickwrap…
  affirmative click to accept») → encaja con D2 (login serio + aceptación).

## 4 · Menores: EL BLOQUEO

- Titular de cuenta: 18+ (Terms EU §1(a)).
- **Prohibited Use Policy §9(r)**: «Making our Services available to anyone
  under the age of 13, or anyone between the ages of 13-18 without first
  obtaining parental or guardian consent, or otherwise using our Services to
  make available bundled solutions that target anyone under the age of 13.»
- **Privacy Policy §11**: «all users are strictly prohibited from uploading,
  transmitting, emailing, or otherwise making Voice Data from children under
  the age of 18 available to us or other users or using them for any of our
  Services.» La voz de un niño hablando con el agente es Voice Data
  transmitida a ElevenLabs.
- Voice Library: «children's voices or voices that sound child-like cannot be
  added to the Library.»
- COPPA: ninguna mención en ningún documento; la responsabilidad es del
  cliente.

**Conclusión**: tal como están escritos los términos, un producto dirigido a
niños de 5 a 12 años NO puede correr sobre ElevenLabs sin una autorización
escrita de ElevenLabs (acuerdo específico o Enterprise). Esto incluye la
prueba interna con niños reales: sus voces viajan a ElevenLabs. Probar con
adultos (nosotros haciendo de niño) sí está permitido.

## 5 · La voz «Gork»

- Es un Professional Voice Clone de OTRO usuario, compartido en la Voice
  Library: «Gork - Terrifying & Dark Creature» · Spanish · Peninsular ·
  Characters · **notice period 2 years** · 4,2K usuarios · 2,8M créditos. La
  UI no muestra el propietario.
- Licencia: todos los planes de pago incluyen licencia comercial; «All voices
  in the Voice Library come with a free commercial use license». Las
  etiquetas «Commercial use / Not for commercial use» ya no existen.
- Revocación (VLA §4): el dueño puede retirarla, pero «the User Voice Model
  will remain accessible for the duration of the Notice Period to users that
  added that User Voice Model to their account prior to removal» (mínimo 30
  días, máximo 2 años → Gork: 2 años). ElevenLabs «reserve[s] the right to
  review and remove any User Voice Model… with or without notice».
- El dueño puede activar «Live Moderation» (filtro de categorías prohibidas,
  latencia extra); no puede vetar categorías concretas.
- Voces «Default» de ElevenLabs (Rachel, Adam…): caducan el 31-12-2026. No
  las usamos.

## 6 · El clon de la voz de Ruben (Instant Voice Clone, tomas SFX)

- Permitido con licencia comercial desde el plan Starter; consentimiento
  propio; «We will not commercialize your voice on a standalone basis without
  your permission». Sin restricción específica para productos infantiles.
- Datos biométricos retenidos hasta 3 años tras terminar la relación. IVC
  queda fuera de ZRM.

---

## Qué hacer (propuesta)

1. Hoy: opt-out de entrenamiento en la cuenta (con OK de Ruben). Probar Baby
   Tizno SOLO con adultos hasta tener el permiso escrito.
2. Pedir a ElevenLabs por escrito la autorización para un producto infantil
   (contacto de Grants / ventas): qué plan o acuerdo, ZRM, residencia EU,
   redacción de PII. Alternativa si dicen que no: otra pila de voz para Baby
   Tizno (a evaluar).
3. Revisar D6: el contrato exige avisar al usuario final de que habla con una
   IA y de que la conversación se graba y comparte con ElevenLabs y el LLM.
4. Antes de lo público: mecanismo de transferencia a EE. UU. (revisión
   legal), retención 0 cuando la app guarde el historial en el aparato, voz
   propia (PVC bajo contrato) en vez de una de biblioteca.
