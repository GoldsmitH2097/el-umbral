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
import { STRINGS } from '../src/js/core/translations.js';
import { CHARACTERS, CATALOGUE } from '../src/js/core/StateManager.js';
import { RETAILERS } from '../src/js/core/retailers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '../dist');
const BASE = 'https://soulware.live';
const OG_DEFAULT = `${BASE}/og-image.jpg`;

// Each route emits 2 HTML files (es + en). The "path" is the Spanish path,
// the English equivalent is computed by prepending /en/ to the same path —
// EXCEPT for character archetype slugs which get translated (caballero → knight
// etc.). Book slugs (pulso-del-nucleo) stay Spanish in both languages.
const ROUTES = [
  // Home (root). Spanish version overwrites dist/index.html in place; the EN
  // twin is emitted to dist/en/index.html so scrapers and direct visits to /en/
  // see English meta + lang attribute.
  {
    path: '',
    enSlug: '',
    es: {
      title: 'Soulware — Editorial Española de Ficción Oscura',
      desc:  'Soulware es una editorial independiente española de ficción oscura. Cuatro arquetipos, cuatro universos literarios. Descubre el catálogo, los autores y sus mundos.',
    },
    en: {
      title: 'Soulware — Spanish Dark Fiction Publisher',
      desc:  'Soulware is an independent Spanish dark-fiction publisher. Four archetypes, four literary universes. Explore the catalogue, the authors, and their worlds.',
    },
    image: OG_DEFAULT,
    isHome: true,
  },

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
    image: `${BASE}/assets/filamentos-de-oscuridad-v2.webp`,
  },
  {
    path: 'arlequin', enSlug: 'harlequin',
    es: { title: 'El Arlequín Sin Flores — Soulware Editorial',
          desc:  'Una risa seca en una cámara vacía. Anatomía del Vacío — experiencia web inmersiva de terror psicológico. Por Germán Ferri. Soulware Editorial.' },
    en: { title: 'The Flowerless Harlequin — Soulware Publishing',
          desc:  'A dry laugh in an empty chamber. Anatomía del Vacío — an immersive web experience in psychological horror. By Germán Ferri. Soulware Publishing.' },
    image: `${BASE}/assets/anatomia-del-vacio-v2.webp`,
  },

  // Book detail routes — slug stays Spanish in BOTH languages (published titles)
  {
    path: 'obras/pulso-del-nucleo', enSlug: 'obras/pulso-del-nucleo',
    es: { title: 'Pulso del Núcleo — Núcleo Eterno · Soulware',
          desc:  'Primera de tres novelas de la trilogía Pulso del Núcleo. Por WW. & Eidon. Ya en Casa del Libro, El Corte Inglés, Fnac y Amazon. Editorial Soulware.' },
    en: { title: 'Pulso del Núcleo — Núcleo Eterno · Soulware',
          desc:  'First of three novels in the Pulso del Núcleo trilogy. By WW. & Eidon. Available at Casa del Libro, El Corte Inglés, Fnac and Amazon. Soulware Publishing.' },
    image: `${BASE}/assets/pulso-soft-cover-es.webp`,
    // Sellers mirror StateManager CATALOGUE → pulso → editions → retailers.
    // Same ISBN at all four; order is editorial (Spanish bookshops first).
    bookSchema: { name: 'Pulso del Núcleo', author: 'WW. & Eidon', isbn: '978-8409810345',
                  path: 'obras/pulso-del-nucleo',
                  sellers: [
                    { seller: 'Casa del Libro',  url: 'https://www.casadellibro.com/libro-pulso-del-nucleo/9788409810345/18324058' },
                    { seller: 'El Corte Inglés', url: 'https://www.elcorteingles.es/libros/A201079459-pulso-del-nucleo-tapa-blanda-con-solapas/' },
                    { seller: 'Fnac',            url: 'https://www.fnac.es/a13262523/Ww-etAmp-Pulso-Del-Nucleo' },
                    { seller: 'Amazon',          url: 'https://www.amazon.es/Pulso-del-N%C3%BAcleo-Parte-Eterno/dp/8409810344/' },
                  ] },
  },
  {
    path: 'obras/filamentos-de-oscuridad', enSlug: 'obras/filamentos-de-oscuridad',
    es: { title: 'Filamentos de Oscuridad — Irina M. · Soulware',
          desc:  'Primera de dos novelas de terror psicológico. Por Irina M. Disponible ahora en Amazon España. Editorial Soulware.' },
    en: { title: 'Filamentos de Oscuridad — Irina M. · Soulware',
          desc:  'First of two novels in psychological horror. By Irina M. Now available on Amazon Spain. Soulware Publishing.' },
    image: `${BASE}/assets/filamentos-de-oscuridad-v2.webp`,
    bookSchema: { name: 'Filamentos de Oscuridad', author: 'Irina M.',
                  buyUrl: 'https://www.amazon.es/dp/8409861771',
                  path: 'obras/filamentos-de-oscuridad' },
  },
  {
    path: 'obras/anatomia-del-vacio', enSlug: 'obras/anatomia-del-vacio',
    es: { title: 'Anatomía del Vacío · Soulware',
          desc:  'No entras a leer un relato. Entras para ser diseccionado por él. Experiencia web interactiva de terror psicológico. Por Germán Ferri. Editorial Soulware.' },
    en: { title: 'Anatomía del Vacío · Soulware',
          desc:  'You do not enter to read a story. You enter to be dissected by it. An interactive web experience in psychological horror. By Germán Ferri. Soulware Publishing.' },
    image: `${BASE}/assets/anatomia-del-vacio-v2.webp`,
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

/* ══════════════ EL CUERPO PROPIO DE CADA RUTA (15-ago-2026) ══════════════
   EL FALLO QUE ESTO ARREGLA: hasta hoy este script sellaba <head> perfecto
   —title, description, canonical, hreflang, JSON-LD— pero las 20 rutas
   servían EL MISMO cuerpo: el DOM fantasma de la home. Medido en producción:
   de 237 líneas de texto, 219 eran idénticas entre /obras/pulso-del-nucleo/,
   /obras/totalis-libertas/ y /caballero/. Lo único propio era el título.

   Google rastreó 10 de las 20, encontró la misma página con distintos
   títulos y dejó de gastar rastreo: las otras 10 llevaban meses en
   «Discovered – currently not indexed», Pulso del Núcleo incluido — el único
   libro a la venta, invisible en el buscador.

   Ni una palabra de aquí es inventada: todo sale de StateManager
   (vision, desc, lore, ficha, editions) y de retailers.js. Si mañana se
   edita la sinopsis de un libro, esta página se regenera sola.

   Va en .sr-only por la misma doctrina de siempre (ver CLAUDE.md): el
   visitante viene a una experiencia cinematográfica, no a un catálogo;
   Googlebot lee el texto igual, y `inert` + `aria-hidden` evitan que un
   lector de pantalla oiga el sitio dos veces. */

// id de CATALOGUE → ruta pública (las que tienen página propia).
const OBRA_RUTA = {
  pulso:      'obras/pulso-del-nucleo',
  filamentos: 'obras/filamentos-de-oscuridad',
  anatomia:   'obras/anatomia-del-vacio',
  'la-corte': 'obras/totalis-libertas',
};

const T = {
  es: { works: 'Las Obras', chars: 'Las Crónicas', by: 'Por', sheet: 'Ficha técnica',
        isbn: 'ISBN', pages: 'Páginas', binding: 'Encuadernación', lang: 'Idioma',
        buy: 'Dónde comprarlo', soon: 'En preparación', avail: 'Disponible',
        also: 'Explora el universo Soulware', pub: 'Editorial Soulware' },
  en: { works: 'The Works', chars: 'The Chronicles', by: 'By', sheet: 'Technical details',
        isbn: 'ISBN', pages: 'Pages', binding: 'Binding', lang: 'Language',
        buy: 'Where to buy it', soon: 'In preparation', avail: 'Available',
        also: 'Explore the Soulware universe', pub: 'Soulware Publishing' },
};

// Campo con variante idiomática: `vision`/`vision_en`. Cae al castellano
// cuando no hay traducción (los títulos de libro no se traducen nunca).
const f = (obj, key, lang) => (lang === 'en' && obj[`${key}_en`]) || obj[key] || '';

const url = (p, lang) => lang === 'en'
  ? (p ? `/en/${p}/` : '/en/')
  : (p ? `/${p}/` : '/');

// Ruta de un personaje en el idioma pedido (los slugs SÍ se traducen).
const charUrl = (c, lang) => url(lang === 'en' ? c.slug_en : c.slug, lang);

/* La red de enlaces internos, en TODAS las páginas. Sin esto, reemplazar el
   DOM fantasma destruiría el grafo interno del sitio — que es justo lo que
   Google usa para descubrir las fichas. */
function navGhost(lang) {
  const t = T[lang];
  const chars = CHARACTERS.map(c =>
    `<li><a href="${charUrl(c, lang)}">${f(c, 'title', lang)}</a></li>`).join('');
  const obras = Object.entries(OBRA_RUTA).map(([id, ruta]) => {
    const o = CATALOGUE.find(x => x.id === id);
    return o ? `<li><a href="${url(ruta, lang)}">${o.title}</a></li>` : '';
  }).join('');
  return `<nav aria-label="${t.also}"><h2>${t.also}</h2>`
       + `<h3>${t.chars}</h3><ul>${chars}</ul>`
       + `<h3><a href="${url('obras', lang)}">${t.works}</a></h3><ul>${obras}</ul></nav>`;
}

// Ficha de personaje: su lore completo (prosa ya aprobada) + autor + redes.
function ghostCharacter(slug, lang) {
  const c = CHARACTERS.find(x => x.slug === slug);
  if (!c) return '';
  const t = T[lang];
  const obra = CATALOGUE.find(o => o.archetype === slug && OBRA_RUTA[o.id]);
  const social = c.social.map(s =>
    `<li><a href="${s.url}" rel="noopener">${s.handle} · ${s.platform}</a></li>`).join('');
  return `<h1>${f(c, 'title', lang)}</h1>`
    + `<p>${f(c, 'desc', lang)}</p>`
    + `<p>${t.by} <strong>${c.author}</strong> — ${t.pub}.</p>`
    + f(c, 'lore', lang)
    + (obra ? `<p><a href="${url(OBRA_RUTA[obra.id], lang)}">${obra.title}</a> — `
            + `${f(obra, 'desc', lang)}</p>` : '')
    + (social ? `<h3>${c.author}</h3><ul>${social}</ul>` : '');
}

// Ficha de obra: visión, sinopsis, ficha técnica y tiendas reales.
function ghostObra(id, lang) {
  const o = CATALOGUE.find(x => x.id === id);
  if (!o) return '';
  const t = T[lang];
  const ch = CHARACTERS.find(c => c.slug === o.archetype);
  let out = `<h1>${o.title}${o.subtitle ? ` — ${o.subtitle}` : ''}</h1>`
    + `<p>${t.by} <strong>${o.author}</strong> — ${t.pub}.</p>`
    + `<p>${f(o, 'seriesInfo', lang) || o.format || ''} · `
    + `${o.status === 'available' ? t.avail : t.soon}</p>`
    + `<p>${f(o, 'vision', lang)}</p>`
    + `<p>${f(o, 'desc', lang)}</p>`;

  if (o.ficha) {
    const fi = o.ficha;
    out += `<h2>${t.sheet}</h2><ul>`
      + (fi.isbn ? `<li>${t.isbn}: ${fi.isbn}</li>` : '')
      + (fi.pages ? `<li>${t.pages}: ${fi.pages}</li>` : '')
      + (fi.binding ? `<li>${t.binding}: ${f(fi, 'binding', lang)}</li>` : '')
      + (fi.language ? `<li>${t.lang}: ${f(fi, 'language', lang)}</li>` : '')
      + `</ul>`;
  }

  if (o.editions?.length) {
    out += `<h2>${t.buy}</h2>`;
    for (const ed of o.editions) {
      const shops = (ed.retailers || []).map(r => {
        const name = RETAILERS[r.id]?.name || r.id;
        return `<li><a href="${r.url}" rel="noopener">${o.title} — ${name}</a></li>`;
      }).join('');
      out += `<h3>${f(ed, 'label', lang)}</h3><ul>${shops}</ul>`;
    }
  }

  if (ch) {
    out += `<p><a href="${charUrl(ch, lang)}">${f(ch, 'title', lang)}</a> — `
         + `${f(ch, 'desc', lang)}</p>`;
  }
  return out;
}

// El catálogo entero, con una entrada por obra.
function ghostObras(lang) {
  const t = T[lang];
  const items = CATALOGUE.map(o => {
    const ruta = OBRA_RUTA[o.id];
    const head = ruta ? `<a href="${url(ruta, lang)}">${o.title}</a>` : o.title;
    return `<article><h2>${head}</h2>`
      + `<p>${t.by} ${o.author} · ${f(o, 'seriesInfo', lang) || o.format || ''} · `
      + `${o.status === 'available' ? t.avail : t.soon}</p>`
      + `<p>${f(o, 'desc', lang)}</p></article>`;
  }).join('');
  return `<h1>${t.works} — ${t.pub}</h1>${items}`;
}

/* ══════════════ DATOS ESTRUCTURADOS POR RUTA ══════════════
   Todo se deriva de StateManager: nada aquí es un dato inventado.

   SIN PRECIOS, a propósito (decisión del audit del 6-ago, confirmada hoy):
   no existe ningún precio en el proyecto, y el mismo ISBN se vende a
   distinto precio en cada tienda y se reajusta. Un precio erróneo en
   datos estructurados CUESTA la elegibilidad de ficha de comercio en vez
   de ganarla. Cuando alguien se comprometa a mantenerlos al día, se añaden.

   La fecha de los vídeos es la real de su entrada al repositorio
   (git log --diff-filter=A: 24-mar-2026 a las 09:57), no una inventada.

   ISO 8601 COMPLETA, CON ZONA HORARIA — no vale la fecha a secas.
   Con '2026-03-24' Search Console avisó por correo el 17-ago: «Datetime
   property "uploadDate" is missing a timezone» + «Invalid datetime value».
   VideoObject.uploadDate exige fecha-hora con desplazamiento; +01:00 porque
   el 24 de marzo España todavía estaba en horario de invierno (el cambio a
   CEST fue el 29). */
const VIDEO_FECHA = '2026-03-24T09:57:27+01:00';

function schemasFor(path, lang) {
  const out = [];
  const inicio = lang === 'en' ? 'Home' : 'Inicio';
  const obras  = T[lang].works;

  // Migas de pan: Inicio → Las Obras → ficha, o Inicio → personaje.
  const crumbs = [{ name: inicio, item: url('', lang) }];
  if (path.startsWith('obras')) crumbs.push({ name: obras, item: url('obras', lang) });
  const esObra = path.startsWith('obras/');
  const esChar = CHARACTERS.some(c => c.slug === path);
  if (esObra) {
    const id = Object.keys(OBRA_RUTA).find(k => OBRA_RUTA[k] === path);
    const o = CATALOGUE.find(x => x.id === id);
    if (o) crumbs.push({ name: o.title, item: url(path, lang) });
  } else if (esChar) {
    const c = CHARACTERS.find(x => x.slug === path);
    crumbs.push({ name: f(c, 'title', lang), item: url(path, lang) });
  }
  if (crumbs.length > 1) {
    out.push({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      "itemListElement": crumbs.map((c, i) => ({
        "@type": "ListItem", "position": i + 1, "name": c.name,
        "item": `${BASE}${c.item}`,
      })),
    });
  }

  // Página de personaje: el vídeo (Search Console dice 10 sin indexar, 0
  // indexados — hoy no existen para Google) y el autor con sus redes, que
  // es lo que ata la persona real a la entidad del buscador.
  if (esChar) {
    const c = CHARACTERS.find(x => x.slug === path);
    const poster = c.src.replace(/^\//, '').replace(/\.mp4$/, '.webp');
    out.push({
      "@context": "https://schema.org", "@type": "VideoObject",
      "name": f(c, 'title', lang),
      "description": f(c, 'desc', lang),
      "thumbnailUrl": `${BASE}/posters/${poster}`,
      "contentUrl": `${BASE}${c.src}`,
      "uploadDate": VIDEO_FECHA,
      /* Duración medida con ffprobe sobre los cuatro mp4: 7,958 s los cuatro.
         Google la recomienda para los resultados enriquecidos de vídeo. */
      "duration": "PT7.958S",
      "publisher": { "@type": "Organization", "name": "Soulware", "url": BASE },
    });
    out.push({
      "@context": "https://schema.org", "@type": "Person",
      "name": c.author,
      "url": `${BASE}${charUrl(c, lang)}`,
      ...(c.social?.length ? { "sameAs": c.social.map(s => s.url) } : {}),
      "worksFor": { "@type": "Organization", "name": "Soulware", "url": BASE },
    });
  }

  // Catálogo: lista ordenada de las obras con página propia.
  if (path === 'obras') {
    out.push({
      "@context": "https://schema.org", "@type": "ItemList",
      "name": `${obras} — Soulware`,
      "itemListElement": Object.entries(OBRA_RUTA).map(([id, ruta], i) => {
        const o = CATALOGUE.find(x => x.id === id);
        return { "@type": "ListItem", "position": i + 1, "name": o?.title || id,
                 "url": `${BASE}${url(ruta, lang)}` };
      }),
    });
  }

  // Las obras que no llevaban ficha propia (Anatomía y Totalis Libertas):
  // Book sin oferta, porque todavía no se venden. Decirlo así es la verdad.
  if (esObra) {
    const id = Object.keys(OBRA_RUTA).find(k => OBRA_RUTA[k] === path);
    const o = CATALOGUE.find(x => x.id === id);
    if (o && o.status !== 'available') {
      out.push({
        "@context": "https://schema.org", "@type": "Book",
        "@id": `${BASE}/${path}/#book`,   // misma entidad que la del @graph
        "name": o.title,
        "author": { "@type": "Person", "name": o.author },
        "abstract": f(o, 'desc', lang),
        "inLanguage": "es",
        "publisher": { "@type": "Organization", "name": "Soulware", "url": BASE },
        "url": `${BASE}${url(path, lang)}`,
      });
    }
  }
  return out;
}

/* Devuelve el bloque .sr-only completo de una ruta, o null para la home
   (que conserva el suyo: es el índice del sitio y ya está bien escrito). */
function ghostFor(path, lang) {
  let inner = null;
  if (path === 'obras') inner = ghostObras(lang);
  else if (path.startsWith('obras/')) {
    const id = Object.keys(OBRA_RUTA).find(k => OBRA_RUTA[k] === path);
    if (id) inner = ghostObra(id, lang);
  } else if (CHARACTERS.some(c => c.slug === path)) {
    inner = ghostCharacter(path, lang);
  }
  if (!inner) return null;
  return `<div class="sr-only" inert aria-hidden="true">${inner}${navGhost(lang)}</div>`;
}

function patch(html, urlPath, { title, desc, image, bookSchema, langCode, altPath, altLang, ghost, schemas }) {
  // All routes use a trailing slash on the canonical. The prerender writes
  // `dist/<path>/index.html` which Netlify serves at `/<path>/` — without a
  // trailing slash, Netlify 301-redirects to add one, creating a chain
  // (sitemap URL → 301 → real URL) where the canonical pointed back at the
  // redirecting URL. Google flagged that as "Redirect error". With the
  // trailing slash everywhere — sitemap, canonical, hreflang — the chain
  // collapses to a single 200 and the canonical loop closes cleanly.
  const withSlash = p => p === '' ? `${BASE}/` : p === 'en' ? `${BASE}/en/` : `${BASE}/${p}/`;
  const canonical = withSlash(urlPath);
  const altUrl    = withSlash(altPath);
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
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/,                   `$1${canonical}$2`)
    // Espejo de og:image: sin esto, X/Twitter enseñaba la imagen editorial
    // genérica en fichas cuyo Open Graph ya llevaba la portada (audit 6-ago).
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/,                 `$1${image}$2`);

  // Rewrite hreflang alternates to point at THIS page's languages
  out = out
    .replace(/<link rel="alternate" hreflang="es" href="[^"]*"\s*\/>/,
             `<link rel="alternate" hreflang="es" href="${langCode === 'es' ? canonical : altUrl}" />`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*"\s*\/>/,
             `<link rel="alternate" hreflang="en" href="${langCode === 'en' ? canonical : altUrl}" />`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/>/,
             `<link rel="alternate" hreflang="x-default" href="${langCode === 'es' ? canonical : altUrl}" />`);

  // For EN pages, translate body text up-front so scrapers + first-paint show
  // English. Otherwise the prerendered HTML carries Spanish hardcoded strings
  // and the user briefly sees them before applyTranslations() runs at boot.
  if (langCode === 'en') {
    out = translateBody(out, STRINGS.en);
  }

  /* El cuerpo propio sustituye al DOM fantasma compartido — DESPUÉS de
     traducir, porque este bloque ya viene en su idioma y no lleva claves
     data-i18n que la traducción pudiera pisar. La home no pasa por aquí:
     conserva el suyo, que es el índice del sitio. */
  if (ghost) {
    out = out.replace(/<div class="sr-only" inert aria-hidden="true">[\s\S]*?<\/div>/, ghost);
  }

  if (schemas?.length) {
    const bloques = schemas
      .map(s => `  <script type="application/ld+json">${JSON.stringify(s, null, 2)}</script>`)
      .join('\n');
    out = out.replace('</head>', `${bloques}\n</head>`);
  }

  if (bookSchema) {
    const schema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Book",
      /* MISMO @id que el Book del @graph de index.html (que viaja en el <head>
         de las 20 páginas). Sin esto, la ficha llevaba DOS entidades Book del
         mismo libro con nombre y url distintos y Google tenía que adivinar
         cuál era el libro — justo lo que impide que cuaje una entidad sólida.
         Con el @id compartido, las dos declaraciones se fusionan en una. */
      "@id": `${BASE}/${bookSchema.path}/#book`,
      "name": bookSchema.name,
      "author": { "@type": "Person", "name": bookSchema.author },
      ...(bookSchema.isbn ? { "isbn": bookSchema.isbn } : {}),
      "inLanguage": "es", // books are published in Spanish even on EN pages
      "publisher": { "@type": "Organization", "name": "Soulware", "url": "https://soulware.live" },
      "url": `${BASE}/${bookSchema.path}/`,
      // One Offer per shop, each named via `seller`. NO `price`: the same ISBN
      // sells at different prices per retailer and they get adjusted, so any
      // number we bake into the prerender goes stale silently. A wrong price in
      // structured data costs merchant-listing eligibility rather than earning
      // it — truthful-without-price beats rich-but-wrong. Add prices back only
      // if someone commits to keeping them in sync.
      "offers": (bookSchema.sellers || [{ url: bookSchema.buyUrl }]).map(s => ({
        "@type": "Offer",
        "url": s.url,
        ...(s.seller ? { "seller": { "@type": "Organization", "name": s.seller } } : {}),
        "availability": "https://schema.org/InStock",
        "priceCurrency": "EUR",
      })),
    }, null, 2);
    out = out.replace('</head>', `  <script type="application/ld+json">${schema}</script>
</head>`);
  }
  return out;
}

const esc = s => s.replace(/"/g, '&quot;');

// Translate the body of an HTML string up-front by rewriting any element with
// a data-i18n / data-i18n-html / data-i18n-attr-* attribute. Mirrors
// applyTranslations() from src/js/core/i18n.js so the prerendered EN HTML
// matches what JS would have produced at boot. Lets scrapers see English
// content and prevents a Spanish flash on first paint of /en/ routes.
//
// Regex parsing is fine here because we only target tag *opening* attributes
// and adjacent inner text — never nested HTML — and the source HTML is a
// known fixed shape (our own Vite-built index.html), not arbitrary input.
function translateBody(html, dict) {
  // data-i18n: replace inner textContent (between > and the matching </tag>)
  html = html.replace(/<(\w+)([^>]*?)\sdata-i18n="([^"]+)"([^>]*)>([^<]*)<\/\1>/g,
    (_, tag, pre, key, post, _inner) => {
      const v = dict[key];
      return v == null ? _ : `<${tag}${pre} data-i18n="${key}"${post}>${v}</${tag}>`;
    });
  // data-i18n-html: same but allows inner markup, only replaces full body
  html = html.replace(/<(\w+)([^>]*?)\sdata-i18n-html="([^"]+)"([^>]*)>[\s\S]*?<\/\1>/g,
    (_, tag, pre, key, post) => {
      const v = dict[key];
      return v == null ? _ : `<${tag}${pre} data-i18n-html="${key}"${post}>${v}</${tag}>`;
    });
  // data-i18n-attr-*: replace the corresponding attribute value on same element
  html = html.replace(/<(\w+)([^>]*)>/g, (match, tag, attrs) => {
    if (!attrs.includes('data-i18n-attr-')) return match;
    let newAttrs = attrs;
    const re = /\sdata-i18n-attr-([\w-]+)="([^"]+)"/g;
    let m;
    while ((m = re.exec(attrs)) !== null) {
      const attrName = m[1], key = m[2], v = dict[key];
      if (v == null) continue;
      const attrRe = new RegExp(`\\s${attrName}="[^"]*"`);
      if (attrRe.test(newAttrs)) {
        newAttrs = newAttrs.replace(attrRe, ` ${attrName}="${esc(v)}"`);
      } else {
        newAttrs += ` ${attrName}="${esc(v)}"`;
      }
    }
    return `<${tag}${newAttrs}>`;
  });
  return html;
}

const base = readFileSync(join(DIST, 'index.html'), 'utf8');

let n = 0;
for (const route of ROUTES) {
  // Spanish version — original path. Home (path === '') overwrites the root
  // dist/index.html in place; everything else gets its own subdir.
  const esPath = route.path;
  const enPath = route.enSlug ? `en/${route.enSlug}` : 'en';
  const esDir = route.path ? join(DIST, esPath) : DIST;
  const enDir = join(DIST, enPath);
  mkdirSync(esDir, { recursive: true });
  mkdirSync(enDir, { recursive: true });

  writeFileSync(
    join(esDir, 'index.html'),
    patch(base, esPath, {
      ...route.es, image: route.image, bookSchema: route.bookSchema,
      langCode: 'es', altPath: enPath, altLang: 'en',
      ghost: route.isHome ? null : ghostFor(route.path, 'es'),
      schemas: route.isHome ? null : schemasFor(route.path, 'es'),
    }),
    'utf8'
  );
  writeFileSync(
    join(enDir, 'index.html'),
    patch(base, enPath, {
      ...route.en, image: route.image, bookSchema: route.bookSchema,
      langCode: 'en', altPath: esPath, altLang: 'es',
      ghost: route.isHome ? null : ghostFor(route.path, 'en'),
      schemas: route.isHome ? null : schemasFor(route.path, 'en'),
    }),
    'utf8'
  );
  console.log(`  ✓ /${esPath || ''} + /${enPath}`);
  n += 2;
}
// ── Sitemap freshness ────────────────────────────────────────────────────
// The static sitemap's <lastmod> was frozen at its authoring date, so Google
// had no reason to re-read it (last fetch: May 18). Every deploy IS a change
// to the site, so stamp the build date. Runs on the dist copy only — the
// source file in public/ stays clean.
{
  const smPath = join(DIST, 'sitemap.xml');
  const today = new Date().toISOString().slice(0, 10);
  const sm = readFileSync(smPath, 'utf8')
    .replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
  writeFileSync(smPath, sm);
  console.log(`sitemap.xml lastmod stamped ${today}`);
}

console.log(`\n${n} static route pages generated.\n`);
