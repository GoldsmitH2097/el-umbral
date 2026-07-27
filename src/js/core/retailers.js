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
// `w` is the display width in px at the strip's 17px cap — set it from the
// asset's aspect ratio so all four logos sit at equal optical weight.
// `brand` is the shop's own colour, kept for the alternative hover treatment
// (bloom to true brand colour instead of amber — one line to switch in CSS).

export const RETAILERS = {
  casadellibro:  { name: 'Casa del Libro',  brand: '#e30613' },
  elcorteingles: { name: 'El Corte Inglés', brand: '#00843d' },
  fnac:          { name: 'Fnac',            brand: '#e1a900' },
  amazon:        { name: 'Amazon',          brand: '#ff9900' },
};

export function retailer(id) {
  return RETAILERS[id] || { name: id };
}
