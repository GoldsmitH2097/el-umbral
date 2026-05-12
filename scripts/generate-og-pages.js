#!/usr/bin/env node
// generate-og-pages.js
// Runs automatically after `npm run build` (postbuild hook).
//
// Problem: WhatsApp, Twitter, iMessage read the raw HTML file — not JavaScript.
// Router.js updates meta tags at runtime, but scrapers see the homepage meta on
// every URL. This script stamps per-route <title>, description, canonical, and
// OG tags into static HTML files in dist/ so every share looks correct.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '../dist');
const BASE = 'https://soulware.live';
const OG_DEFAULT = `${BASE}/og-image.jpg`;

const ROUTES = [
  {
    path: 'emperatriz',
    title: 'La Emperatriz Sin Reino — Soulware Editorial',
    desc: 'Silencio. El poder no necesita adornos para aplastar. La Emperatriz Sin Reino — una de las cuatro crónicas del universo Soulware. Ficción oscura independiente española.',
    image: OG_DEFAULT,
  },
  {
    path: 'caballero',
    title: 'El Caballero Sin Nombre — Soulware Editorial',
    desc: 'Acero oscuro, firmeza absoluta. Lee Pulso del Núcleo — primera novela de la trilogía Núcleo Eterno. Disponible en Amazon España. Por WW. & Eidon.',
    image: `${BASE}/assets/pulso-soft-cover-es.webp`,
  },
  {
    path: 'sortilega',
    title: 'La Sortílega Sin Sombra — Soulware Editorial',
    desc: 'Humo, alteración, luz temblorosa. Filamentos de Oscuridad — primera novela de Irina M. Ya disponible. Soulware Editorial.',
    image: `${BASE}/assets/filamentos-de-oscuridad.webp`,
  },
  {
    path: 'arlequin',
    title: 'El Arlequín Sin Flores — Soulware Editorial',
    desc: 'Una risa seca en una cámara vacía. Anatomía del Vacío — experiencia web inmersiva de terror psicológico. Por Germán Ferri. Soulware Editorial.',
    image: `${BASE}/assets/anatomia-del-vacio.webp`,
  },
  {
    path: 'obras/pulso-del-nucleo',
    title: 'Pulso del Núcleo — Núcleo Eterno · Soulware',
    desc: 'Primera de tres novelas de fantasía oscura épica. Por WW. & Eidon. Disponible ahora en tapa blanda en Amazon España. Editorial Soulware.',
    image: `${BASE}/assets/pulso-soft-cover-es.webp`,
    bookSchema: { name: 'Pulso del Núcleo', author: 'WW. & Eidon', isbn: '978-8409810345', buyUrl: 'https://www.amazon.es/dp/B0CQPCRCXP', path: 'obras/pulso-del-nucleo' },
  },
  {
    path: 'obras/filamentos-de-oscuridad',
    title: 'Filamentos de Oscuridad — Irina M. · Soulware',
    desc: 'Primera de dos novelas de terror psicológico. Por Irina M. Disponible ahora en Amazon España. Editorial Soulware.',
    image: `${BASE}/assets/filamentos-de-oscuridad.webp`,
    bookSchema: { name: 'Filamentos de Oscuridad', author: 'Irina M.', buyUrl: 'https://amzn.eu/d/0asS9y3l', path: 'obras/filamentos-de-oscuridad' },
  },
  {
    path: 'obras/anatomia-del-vacio',
    title: 'Anatomía del Vacío · Soulware',
    desc: 'No entras a leer un relato. Entras para ser diseccionado por él. Experiencia web interactiva de terror psicológico. Por Germán Ferri. Editorial Soulware.',
    image: `${BASE}/assets/anatomia-del-vacio.webp`,
  },
  {
    path: 'obras/totalis-libertas',
    title: 'Totalis Libertas — Antología · Soulware',
    desc: 'Antología de relatos breves e intensos sobre la Historia de España. Varios autores. En preparación. Editorial Soulware.',
    image: OG_DEFAULT,
  },
];

function patch(html, path, { title, desc, image, bookSchema }) {
  const canonical = `${BASE}/${path}`;
  let out = html
    .replace(/<title>[^<]*<\/title>/,                                        `<title>${title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,                       `$1${canonical}$2`)
    .replace(/(<meta name="description" content=")[^"]*(")/,                 `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,                `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,          `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,                  `$1${canonical}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/,                `$1${image}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/,               `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/,         `$1${esc(desc)}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/,                 `$1${canonical}$2`);
  if (bookSchema) {
    const schema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Book",
      "name": bookSchema.name,
      "author": { "@type": "Person", "name": bookSchema.author },
      ...(bookSchema.isbn ? { "isbn": bookSchema.isbn } : {}),
      "inLanguage": "es",
      "publisher": { "@type": "Organization", "name": "Soulware", "url": "https://soulware.live" },
      "url": `${BASE}/${bookSchema.path}`,
      "offers": { "@type": "Offer", "url": bookSchema.buyUrl, "availability": "https://schema.org/InStock", "priceCurrency": "EUR" }
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
  const dir = join(DIST, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), patch(base, route.path, route), 'utf8');
  console.log(`  ✓ /${route.path}`);
  n++;
}
console.log(`\n${n} static route pages generated.\n`);
