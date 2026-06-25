import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, clipText } from "@/lib/engine/helpers";

/**
 * Grain gradient: a restrained, low-saturation gradient fill with a faint film-grain
 * dusted over the glyphs (SVG fractal noise confined to the text) — the matte,
 * tactile gradient finish on a lot of modern brand type. Static and understated.
 */
const grainGradient: EffectDefinition = {
  id: "grain-gradient",
  name: "Grain Gradient",
  category: "fill-texture",
  tags: ["modern", "grain", "noise", "gradient", "matte", "premium", "svg"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "background-clip:text gradient + SVG fractal-noise grain confined to the text",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 230, min: 0, max: 360, step: 1, unit: "°" },
    { id: "shift", label: "Hue Shift", type: "range", default: 40, min: 10, max: 90, step: 1, unit: "°" },
    { id: "grain", label: "Grain", type: "range", default: 12, min: 4, max: 24, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    shift: R.ri(24, 70),
    grain: R.ri(8, 18),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const shift = ctx.values.shift as number;
    const alpha = ((ctx.values.grain as number) / 100).toFixed(2);
    const dark = ctx.theme === "dark";
    const l = dark ? 66 : 48;

    const c1 = hsl(h, 56, l + 4);
    const c2 = hsl((h + shift) % 360, 50, l - 4);
    const fid = svgId(ctx.scope, "grain");

    // Fine fractal noise, knocked to a faint dark speckle, composited only where the
    // text is, then merged over the gradient-filled glyphs for a matte grain.
    const defs =
      `<filter id="${fid}">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" stitchTiles="stitch" result="noise"/>\n` +
      `  <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${alpha} 0" result="grain"/>\n` +
      `  <feComposite in="grain" in2="SourceGraphic" operator="in" result="textGrain"/>\n` +
      `  <feMerge>\n    <feMergeNode in="SourceGraphic"/>\n    <feMergeNode in="textGrain"/>\n  </feMerge>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(`linear-gradient(105deg, ${c1}, ${c2})`)}\n` +
      `  filter: url(#${fid});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css, defs };
  },
};

export default grainGradient;
