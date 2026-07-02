import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Swash Bloom: a refined upright Goudy serif that blossoms into calligraphic
 * flourishes on hover. The resting word is clean roman ink; a stacked data-text
 * copy in ITALIC — with OpenType swashes, discretionary/historical ligatures and
 * stylistic alternates switched on via font-feature-settings — crossfades in over
 * a springy scale settle, so the discrete glyph substitution reads as ornamental
 * tails unfurling. Sorts Mill Goudy's italic carries the flowing swash / ct-st
 * ligature forms, so even where "swsh" is sparse the italic + dlig/hlig/salt
 * alternates still bloom. Deliberately unlike casual-morph's continuous
 * variable-axis warp on a sans: this is discrete OpenType substitution on a serif.
 * Warm ink reads on both themes; an optional flourish accent tints the ornament.
 */
const swashBloom: EffectDefinition = {
  id: "swash-bloom",
  name: "Swash Bloom",
  category: "interactive-advanced",
  tags: [
    "interactive",
    "hover",
    "swash",
    "serif",
    "calligraphy",
    "flourish",
    "opentype",
    "elegant",
  ],
  caps: ["pure", "dataText"],
  font: "'Sorts Mill Goudy', serif",
  pngSupport: "partial",
  supports:
    "Crossfades an italic swash/ligature copy in on :hover via a data-text overlay (OpenType font-feature-settings); resting state is a clean roman serif.",
  controls: [
    { id: "hue", label: "Ink Hue", type: "range", default: 30, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Bloom Speed",
      type: "range",
      default: 0.55,
      min: 0.3,
      max: 1.2,
      step: 0.05,
      unit: "s",
    },
    {
      id: "accent",
      label: "Flourish Accent",
      type: "toggle",
      default: true,
      onLabel: "TINT",
      offLabel: "INK",
    },
  ],
  rand: (R) => ({
    // Warm ink by default (amber/terracotta), with an occasional deep rose.
    hue: R.chance(0.2) ? R.ri(344, 358) : R.ri(16, 46),
    speed: Number(R.rnd(0.45, 0.75).toFixed(2)),
    accent: R.chance(0.65),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const accent = ctx.values.accent as boolean;
    const dark = ctx.theme === "dark";

    // Warm ink for the resting roman word — a light parchment tone on the dark
    // stage, a deep sepia on the light stage (legible on both).
    const ink = dark ? hsl(h, 28, 82) : hsl(h, 48, 26);
    // Same colour with alpha 0 so the base fades STRAIGHT out (no grey midpoint).
    const inkOut = dark ? hsl(h, 28, 82, 0) : hsl(h, 48, 26, 0);
    // The blooming italic copy: same ink, or a richer warm flourish tint.
    const ah = (h + 10) % 360;
    const flourish = accent
      ? dark
        ? hsl(ah, 62, 74)
        : hsl(ah, 66, 34)
      : ink;

    const base = speed.toFixed(2);
    const settle = (speed * 1.2).toFixed(2);

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  color: ${ink};\n` +
      `  cursor: pointer;\n` +
      `  transition: color ${base}s ease;\n` +
      `}\n` +
      `.${ctx.scope}:hover {\n` +
      `  color: ${inkOut};\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${flourish};\n` +
      `  font-style: italic;\n` +
      `  font-feature-settings: "swsh" 1, "dlig" 1, "hlig" 1, "liga" 1, "calt" 1, "salt" 1;\n` +
      `  opacity: 0;\n` +
      `  transform: scale(0.94);\n` +
      `  transform-origin: center;\n` +
      `  transition: opacity ${base}s ease, transform ${settle}s cubic-bezier(0.34, 1.4, 0.4, 1);\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}:hover::before {\n` +
      `  opacity: 1;\n` +
      `  transform: scale(1);\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
    };
  },
};

export default swashBloom;
