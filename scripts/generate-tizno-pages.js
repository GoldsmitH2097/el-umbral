/* La Estancia por idioma: los scrapers de WhatsApp/Twitter no ejecutan JS,
   así que /tizno y /en/tizno necesitan HTML ESTÁTICO con su tarjeta OG en su
   idioma. Un solo frente: ambas páginas se SELLAN aquí desde dist/tizno-ai.html
   (la fuente única del rig) — nunca se editan a mano. Netlify sirve estos
   archivos antes que los rewrites de _redirects (que quedan de red de
   seguridad). El rig detecta el idioma por la ruta (/en/). */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const fuente = readFileSync(join(dist, 'tizno-ai.html'), 'utf8');

const EN = {
  '<title>Tizno — El Custodio del Umbral · Soulware</title>':
    '<title>Tizno — Custodian of the Threshold · Soulware</title>',
  'Habla con Tizno, el Custodio del Umbral: una criatura minúscula que vive en la niebla de Soulware. Acércate, acarícialo… y no lo encierres.':
    'Speak to Tizno, Custodian of the Threshold: a tiny creature living in the Soulware fog. Come closer, pet him… and do not lock him away.',
  '<meta property="og:title" content="Tizno — El Custodio del Umbral" />':
    '<meta property="og:title" content="Tizno — Custodian of the Threshold" />',
  'Una criatura minúscula vive en la niebla de Soulware. Habla con ella. No la encierres.':
    'A tiny creature lives in the Soulware fog. Speak to it. Do not lock it away.',
  'https://soulware.live/tizno': 'https://soulware.live/en/tizno',
  '<html lang="es">': '<html lang="en">',
};

// ES: la fuente tal cual (su canonical ya apunta a /tizno).
mkdirSync(join(dist, 'tizno'), { recursive: true });
writeFileSync(join(dist, 'tizno', 'index.html'), fuente);

// EN: la fuente con la tarjeta sellada en inglés.
let en = fuente;
for (const [es, sub] of Object.entries(EN)) en = en.replaceAll(es, sub);
mkdirSync(join(dist, 'en', 'tizno'), { recursive: true });
writeFileSync(join(dist, 'en', 'tizno', 'index.html'), en);

console.log('tizno-pages: /tizno (ES) y /en/tizno (EN) selladas.');
