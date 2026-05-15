#!/usr/bin/env node
// generate-og-pages.js
// Runs automatically after `npm run build` (postbuild hook).
//
// Problem: WhatsApp, Twitter, iMessage read the raw HTML file — not JavaScript.
// Router.js updates meta tags at runtime, but scrapers see the homepage meta on
// every URL. This script stamps per-route <title>, description, canonical, and
// OG tags into static HTML files in dist/ so every share looks correct.
//
// Bilingual: each route emits both /<path>/ (Spanish, default) and
// /en/<path>/ (English). hreflang alternates point the two language versions
// at each other.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '../dist');
const BASE = 'https://soulware.live';
const OG_DEFAULT = `${BASE}/og-image.jpg`;

// Each route emits 2 HTML files (es + en). The "path" is the Spanish path,
// the English equivalent is computed by prepending /en/ to the same path —
// EXCEPT for character archetype slugs which get translated (caballero → knight
// etc.). Book slugs (pulso-del-nucleo) stay Spanish in both languages.
const ROUTES = [
  // Generic catalog landing
  {
    path: 'obras',
    enSlug: 'obras', // shared with Spanish — only deep book slugs ever differ
    es: {
      title: 'Las Obras — Soulware Editorial',
      desc:  'Catálogo de Soulware: novelas y experiencias de ficción oscura. Pulso del Núcleo, Filamentos de Oscuridad, Anatomía del Vacío, Totalis Libertas. Editorial independiente española.',
    },
    en: {
      title: 'The Works — Soulware Publishing',
      desc:  'The Soulware catalogue: novels and experiences in dark fiction. Pulso del Núcleo, Filamentos de Oscuridad, Anatomía del Vacío, Totalis Libertas. Independent Spanish publisher.',
    },
    image: OG_DEFAULT,
  },

  // Character archetype routes — slugs translate between es/en
  {
    path: 'emperatriz', enSlug: 'empress',
    es: { title: 'La Emperatriz Sin Reino — Soulware Editorial',
          desc:  'Silencio. El poder no necesita adornos para aplastar. La Emperatriz Sin Reino — una de las cuatro crónicas del universo Soulware. Ficción oscura independiente española.' },
    en: { title: 'The Throneless Empress — Soulware Publishing',
          desc:  'Silence. Power needs no ornament to crush. The Throneless Empress — one of four chronicles in the Soulware universe. Independent Spanish dark fiction.' },
    image: OG_DEFAULT,
  },
  {
    path: 'caballero', enSlug: 'knight',
    es: { title: 'El Caballero Sin Nombre — Soulware Editorial',
          desc:  'Acero oscuro, firmeza absoluta. Lee Pulso del Núcleo — primera novela de la trilogía Pulso del Núcleo. Disponible en Amazon España. Por WW. & Eidon.' },
    en: { title: 'The Nameless Knight — Soulware Publishing',
          desc:  'Dark steel, absolute resolve. Read Pulso del Núcleo — first novel of the Pulso del Núcleo trilogy. Available on Amazon Spain. By WW. & Eidon.' },
    image: `${BASE}/assets/pulso-soft-cover-es.webp`,
  },
  {
    path: 'sortilega', enSlug: 'sibyl',
    es: { title: 'La Sortílega Sin Sombra — Soulware Editorial',
          desc:  'Humo, alteración, luz temblorosa. Filamentos de Oscuridad — primera novela de Irina M. Ya disponible. Soulware Editorial.' },
    en: { title: 'The Shadowless Sibyl — Soulware Publishing',
          desc:  'Smoke, distortion, trembling light. Filamentos de Oscuridad — the first novel by Irina M. Now available. Soulware Publishing.' },
    image: `${BASE}/assets/filamentos-de-oscuridad.webp`,
  },
  {
    path: 'arlequin', enSlug: 'harlequin',
    es: { title: 'El Arlequín Sin Flores — Soulware Editorial',
          desc:  'Una risa seca en una cámara vacía. Anatomía del Vacío — experiencia web inmersiva de terror psicológico. Por Germán Ferri. Soulware Editorial.' },
    en: { title: 'The Flowerless Harlequin — Soulware Publishing',
          desc:  'A dry laugh in an empty chamber. Anatomía del Vacío — an immersive web experience in psychological horror. By Germán Ferri. Soulware Publishing.' },
    image: `${BASE}/assets/anatomia-del-vacio.webp`,
  },

  // Book detail routes — slug stays Spanish in BOTH languages (published titles)
  {
    path: 'obras/pulso-del-nucleo', enSlug: 'obras/pulso-del-nucleo',
    es: { title: 'Pulso del Núcleo — Núcleo Eterno · Soulware',
          desc:  'Primera de tres novelas de la trilogía Pulso del Núcleo. Por WW. & Eidon. Disponible ahora en tapa blanda en Amazon España. Editorial Soulware.' },
    en: { title: 'Pulso del Núcleo — Núcleo Eterno · Soulware',
          desc:  'First of three novels in the Pulso del Núcleo trilogy. By WW. & Eidon. Now available in softcover on Amazon Spain. Soulware Publishing.' },
    image: `${BASE}/assets/pulso-soft-cover-es.webp`,
    bookSchema: { name: 'Pulso del Núcleo', author: 'WW. & Eidon', isbn: '978-8409810345',
                  buyUrl: 'https://www.amazon.es/Pulso-del-N%C3%BAcleo-Parte-Eterno/dp/8409810344/',
                  path: 'obras/pulso-del-nucleo', price: '22.44' },
  },
  {
    path: 'obras/filamentos-de-oscuridad', enSlug: 'obras/filamentos-de-oscuridad',
    es: { title: 'Filamentos de Oscuridad — Irina M. · Soulware',
          desc:  'Primera de dos novelas de terror psicológico. Por Irina M. Disponible ahora en Amazon España. Editorial Soulware.' },
    en: { title: 'Filamentos de Oscuridad — Irina M. · Soulware',
          desc:  'First of two novels in psychological horror. By Irina M. Now available on Amazon Spain. Soulware Publishing.' },
    image: `${BASE}/assets/filamentos-de-oscuridad.webp`,
    bookSchema: { name: 'Filamentos de Oscuridad', author: 'Irina M.',
                  buyUrl: 'https://www.amazon.es/dp/8409861771',
                  path: 'obras/filamentos-de-oscuridad', price: '17.95' },
  },
  {
    path: 'obras/anatomia-del-vacio', enSlug: 'obras/anatomia-del-vacio',
    es: { title: 'Anatomía del Vacío · Soulware',
          desc:  'No entras a leer un relato. Entras para ser diseccionado por él. Experiencia web interactiva de terror psicológico. Por Germán Ferri. Editorial Soulware.' },
    en: { title: 'Anatomía del Vacío · Soulware',
          desc:  'You do not enter to read a story. You enter to be dissected by it. An interactive web experience in psychological horror. By Germán Ferri. Soulware Publishing.' },
    image: `${BASE}/assets/anatomia-del-vacio.webp`,
  },
  {
    path: 'obras/totalis-libertas', enSlug: 'obras/totalis-libertas',
    es: { title: 'Totalis Libertas — Antología · Soulware',
          desc:  'Antología de relatos breves e intensos sobre la Historia de España. Varios autores. En preparación. Editorial Soulware.' },
    en: { title: 'Totalis Libertas — Anthology · Soulware',
          desc:  'An anthology of brief, intense tales drawn from the history of Spain. Various authors. In preparation. Soulware Publishing.' },
    image: OG_DEFAULT,
  },
];

function patch(html, urlPath, { title, desc, image, bookSchema, langCode, altPath, altLang }) {
  const canonical = `${BASE}/${urlPath}`;
  const altUrl    = `${BASE}/${altPath}`;
  // Replace canonical + main meta. hreflang alternates rewrite the whole link
  // block to point at the matching English (or Spanish) twin.
  let out = html
    .replace(/<html([^>]*)\slang="[^"]*"/,                                    `<html$1 lang="${langCode}"`)
    .replace(/<title>[^<]*<\/title>/,                                          `<title>${title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,                         `$1${canonical}$2`)
    .replace(/(<meta name="description" content=")[^"]*(")/,                   `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,                  `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,            `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,                    `$1${canonical}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/,                  `$1${image}$2`)
    .replace(/(<meta property="og:locale" content=")[^"]*(")/,                 `$1${langCode === 'en' ? 'en_US' : 'es_ES'}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/,                 `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/,           `$1${esc(desc)}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/,                   `$1${canonical}$2`);

  // Rewrite hreflang alternates to point at THIS page's languages
  out = out
    .replace(/<link rel="alternate" hreflang="es" href="[^"]*"\s*\/>/,
             `<link rel="alternate" hreflang="es" href="${langCode === 'es' ? canonical : altUrl}" />`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*"\s*\/>/,
             `<link rel="alternate" hreflang="en" href="${langCode === 'en' ? canonical : altUrl}" />`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/>/,
             `<link rel="alternate" hreflang="x-default" href="${langCode === 'es' ? canonical : altUrl}" />`);

  if (bookSchema) {
    const schema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Book",
      "name": bookSchema.name,
      "author": { "@type": "Person", "name": bookSchema.author },
      ...(bookSchema.isbn ? { "isbn": bookSchema.isbn } : {}),
      "inLanguage": "es", // books are published in Spanish even on EN pages
      "publisher": { "@type": "Organization", "name": "Soulware", "url": "https://soulware.live" },
      "url": `${BASE}/${bookSchema.path}`,
      "offers": {
        "@type": "Offer",
        "url": bookSchema.buyUrl,
        "availability": "https://schema.org/InStock",
        ...(bookSchema.price ? { "price": bookSchema.price } : {}),
        "priceCurrency": "EUR",
      }
    }, null, 2);
    out = out.replace('</head>', `  <script type="application/ld+json">${schema}</script>
</head>`);
  }
  return out;
}

const esc = s => s.replace(/"/g, '&quot;');

const base = readFileSync(join(DIST, 'index.html'), 'utf8');

let n = 0;
for (const route of ROUTES) {
  // Spanish version — original path
  const esPath = route.path;
  const enPath = `en/${route.enSlug}`;
  const esDir = join(DIST, esPath);
  const enDir = join(DIST, enPath);
  mkdirSync(esDir, { recursive: true });
  mkdirSync(enDir, { recursive: true });

  writeFileSync(
    join(esDir, 'index.html'),
    patch(base, esPath, {
      ...route.es, image: route.image, bookSchema: route.bookSchema,
      langCode: 'es', altPath: enPath, altLang: 'en',
    }),
    'utf8'
  );
  writeFileSync(
    join(enDir, 'index.html'),
    patch(base, enPath, {
      ...route.en, image: route.image, bookSchema: route.bookSchema,
      langCode: 'en', altPath: esPath, altLang: 'es',
    }),
    'utf8'
  );
  console.log(`  ✓ /${esPath} + /${enPath}`);
  n += 2;
}
console.log(`\n${n} static route pages generated.\n`);
