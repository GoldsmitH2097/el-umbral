# Tomas de voz de Tizno — sesión de grabación EN
*Para Rubén, noche del 7 de agosto de 2026. Banco actual: `public/tizno-sfx/`.*

## Qué NO hay que grabar
Estos pools son vocalizaciones sin idioma y sirven tal cual en `/en/`:
**pop** (×6) · **susto** · **ronroneo** · **risa** (×2) · **quejido** (×2).
⚠️ Excepción: si alguna toma de **toque** (1, 2, 5) o **enfado** (1–4) dice
*palabras* en castellano, necesita gemela inglesa (mismos nombres + `-en`).
Si son gruñidos y ruiditos, valen tal cual.

## A. La súplica del micro — 2 tomas
Suena cuando el navegador tiene el micro vetado. Archivo destino:
`frase-sin-micro-en-1.mp3` y `frase-sin-micro-en-2.mp3`.

1. **"My voice can't reach you… the microphone is sealed. Tap the padlock,
   up in the address bar… and set me free."**
   *Dirección:* susurro ronco pegado al micro, pena vieja; pausas largas en
   los puntos suspensivos — como pedir un favor a través de una puerta.
2. **"Still sealed… the padlock, wanderer. Address bar. Microphone. Allow.
   I'll wait — I always wait."**
   *Dirección:* hastío con sorna cariñosa; las palabras sueltas como
   dictando a alguien torpe; «I'll wait» cae a grave y se apaga.
   («wanderer» = el caminante, del GLOSARIO.md.)

## B. No me encierres — 5 tomas
Suena cuando arrastran a Tizno hacia la caja prohibida. Archivos:
`no-encierres-en-1.mp3` … `no-encierres-en-5.mp3`. Cinco temperamentos:

1. **"No—no, not the box!"** — pánico seco, arranque brusco, sin aire.
2. **"Don't you dare shut me in…"** — grave, amenaza contenida, gruñido final.
3. **"Please… it's dark in there. Darker than me."** — lastimera, casi
   infantil; «darker than me» como confesión.
4. **"NO!"** + gruñido — explosión corta, la más animal.
5. **"Again…? Fine. I remember every hand that's done this."** — resignación
   helada, lentísima; la más inquietante del lote.

## Técnica
- Mismo micro, misma distancia y misma sala que las tomas ES — el timbre
  tiene que casar en un mismo pool.
- Mismo formato de exportación que las ES (MP3, mismo sample rate).
- Nombres EXACTOS de arriba, a `public/tizno-sfx/`. Los archivos se
  versionan por nombre — nunca sobrescribir uno ES.

## Después (me toca a mí)
Cuando los archivos estén en la carpeta: cableo el selector de idioma en
`tizno-ai.html` (pools `-en` cuando `IDIOMA === 'en'`, con fallback al ES si
falta un archivo) y verifico en el simulador. Avísame y son veinte minutos.
