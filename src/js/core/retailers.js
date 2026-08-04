// retailers.js — the bookshops we send readers to.
//
// One registry, referenced by id from CATALOGUE editions. Adding a shop is a
// line here plus a line in the edition's `retailers[]`.
//
// ORDER IS EDITORIAL, NOT ALPHABETICAL. Within an edition the array order is
// the display order, and it is deliberate: the Spanish bookshops lead, Amazon
// comes last. All four sell the SAME ISBN — Amazon's paperback is print-on-
// demand, a worse print run of the identical book, so it stays in the list (a
// missing link loses the sale rather than redirecting it) but never leads.
//
// ── LOGOS ───────────────────────────────────────────────────────────────────
// `logo` is OPTIONAL. Until it's set we render a styled wordmark — a deliberate
// on-brand fallback, never a broken image.
//
// When set, the SVG is used as a CSS MASK, not as an <img>. The artwork becomes
// a stencil and we paint it with `background: currentColor`, which means:
//   · the logo's own colours are irrelevant — any SVG works
//   · colour is 100 % CSS, so the hover is a real, smooth colour transition
//     (bone → amber) instead of a filter swap
//   · one asset covers both states; no @2x, no second file
// See .retailer-mark in obras.css.
//
// ── SIZING: all four share ONE square slot. Do not "fix" this. ──────────────
// Every asset is drawn on an identical 500×500 artboard and Ruben balanced the
// marks INSIDE it so the LETTERING reads at the same size across all four —
// which is the thing the eye actually compares. Their bounding boxes therefore
// differ wildly on purpose (0.86:1 for Casa del Libro's book icon, 3.32:1 for
// the Amazon wordmark). Scaling each to a common height, or trimming the
// viewBoxes and normalising by bounding box, throws that balancing away and
// makes Amazon's lettering tower over Casa del Libro's. Same square, same
// scale factor, every logo. The artboard IS the design.
//
// `brand` is the shop's own colour, kept for the alternative hover treatment
// (bloom to true brand colour instead of amber — one line to switch in CSS).

export const RETAILERS = {
  // The digital edition's mark. Not a shop — it stands in for the format, and
  // links straight to wherever that format is sold, so the reader meets one
  // consistent row of icons whatever they're buying.
  // shop:false — it's a format, not a retailer, so the aria-label reads
  // "Edición Digital" rather than the nonsense "Comprar en Edición Digital".
  ebook:         { name: 'Edición Digital', name_en: 'Digital Edition',
                   shop: false, logo: '/assets/retailers/ebook-fino.svg' },
  casadellibro:  { name: 'Casa del Libro',  brand: '#e30613',
                   logo: '/assets/retailers/casadellibro.svg' },
  elcorteingles: { name: 'El Corte Inglés', brand: '#00843d',
                   logo: '/assets/retailers/elcorteingles.svg' },
  fnac:          { name: 'Fnac',            brand: '#e1a900',
                   logo: '/assets/retailers/fnac.svg' },
  amazon:        { name: 'Amazon',          brand: '#ff9900',
                   logo: '/assets/retailers/amazon.svg' },
};

export function retailer(id) {
  return RETAILERS[id] || { name: id };
}
