# Retailer logos

Referenced by `logo` in `src/js/core/retailers.js`, one file per registry id:

    casadellibro.svg   elcorteingles.svg   fnac.svg   amazon.svg

## How they're rendered

The SVG is used as a **CSS mask**, not as an `<img>` — the artwork becomes a
stencil and CSS paints it with `currentColor`. So:

- **The logo's own colour is irrelevant.** Masking reads the ALPHA channel, so
  white-on-transparent, black-on-transparent, or full colour all behave
  identically. Don't spend time recolouring.
- **Colour is 100 % ours**, which is why the hover is a real bone → amber
  transition rather than a filter swap, matching every other hover on the site.
- Multi-colour marks flatten to one colour. That's the intended press-strip
  look. To bloom to each shop's true brand colour instead, switch the hover
  rule to `color: var(--brand)` — the hex is already on the element.

## ⚠️ Sizing: one square slot, same scale for all four

**Every asset shares an identical 500×500 artboard, and the mark is balanced
INSIDE it so the LETTERING reads at the same size across all four logos.** That
is the thing the eye actually compares, and it's a design decision baked into
the files.

Consequently their bounding boxes differ enormously *on purpose* — measured:

| logo | artwork bbox | ratio |
|---|---|---|
| casadellibro | 375.9 × 435.9 | 0.86 (taller than wide) |
| elcorteingles | 487.9 × 274.9 | 1.78 |
| fnac | 400.1 × 400.1 | 1.00 |
| amazon | 360.3 × 108.6 | 3.32 (wide wordmark) |

**Do not trim the viewBoxes to the artwork, and do not normalise by bounding
box or to a common height.** Any of those throws the balancing away and makes
Amazon's lettering tower over Casa del Libro's. Keep `viewBox="0 0 500 500"`,
keep one square `--slot`, and let each file's internal scale do the work.

Slots in use: **44px** in the reading view, **36px** in the Las Obras grid card,
**38px** on mobile — see `--slot` in `obras.css`.

## Adding another shop

1. Export on the **same 500×500 artboard**, balancing the mark so its lettering
   matches the existing four. Transparent background, real vector paths (no
   embedded bitmap), no `<style>` blocks.
2. Drop the file here, named after its registry id.
3. Add `logo: '/assets/retailers/<id>.svg'` to the entry in `retailers.js`.

No CSS change needed — the slot handles it.

PNG works too (masking uses alpha), but it'll be heavier and softer on retina.
