# Retailer logos

Drop the shop logos here, then add `logo` + `w` to the matching entry in
`src/js/core/retailers.js`. Until a `logo` is set the strip renders a styled
wordmark — an intentional fallback, never a broken image.

## What we need

**Format: SVG.** One file per shop, named by its registry id:

    casadellibro.svg   elcorteingles.svg   fnac.svg   amazon.svg

The SVG is used as a **CSS mask**, not as an `<img>` — the artwork becomes a
stencil and CSS paints it with `currentColor`. Consequences worth knowing:

- **The logo's own colours are irrelevant.** Solid black, full colour, whatever
  the press kit ships — all identical once masked. Don't waste time recolouring.
- **Colour is 100 % ours**, so the hover is a real bone → amber transition
  rather than a filter swap, and it matches every other hover on the site.
- **Multi-colour brand marks flatten to one colour.** That's the intended look
  (the "as seen in" press strip). If a shop's guidelines forbid it, use that
  one as an `<img>` instead and give it its own rule.

### Asset requirements

- Transparent background, **no** baked-in white/coloured plate
- Real vector paths — not an embedded `<image>` bitmap
- **Trim the viewBox** to the artwork, no surrounding padding (padding makes
  that logo optically smaller than its neighbours in the strip)
- Prefer the **horizontal wordmark** lockup over the icon-only mark
- Strip `<style>` blocks and scripts; plain `<path>`/`<g>` only

### PNG fallback

If a brand only publishes PNG: transparent, **≥ 120 px tall**, tightly cropped.
Masking works with PNG alpha too, so it drops into the same slot — it'll just
be heavier and slightly softer on retina than an SVG.

### After adding a file

Set the display width from the asset's aspect ratio so all four sit at equal
optical weight in the 17 px-tall strip:

```js
fnac: { name: 'Fnac', brand: '#e1a900',
        logo: '/assets/retailers/fnac.svg', w: 46 },
```

`w` ≈ `17 × (viewBox width ÷ viewBox height)`.

## Where to source them

Each brand's press / media / brand-assets page is the correct source.
Wikimedia Commons also carries clean, current SVGs for all four.
