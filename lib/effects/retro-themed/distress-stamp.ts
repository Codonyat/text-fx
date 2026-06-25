import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId } from "@/lib/engine/helpers";

/**
 * Distressed rubber-stamp: a solid ink applied through an SVG filter that warps the
 * glyph edges (feDisplacementMap) and punches fractal-noise holes out of the fill
 * (feComposite "out"), giving the worn, ink-starved stamp look. Static. The filter
 * id is salted; seeds are fixed so renders are deterministic (parity-safe).
 */
const distressStamp: EffectDefinition = {
  id: "distress-stamp",
  name: "Distress Stamp",
  category: "retro-themed",
  tags: ["distress", "grunge", "stamp", "worn", "texture", "svg", "filter"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence/feDisplacementMap + feComposite via filter:url(#…)",
  controls: [
    { id: "hue", label: "Ink Hue", type: "range", default: 0, min: 0, max: 360, step: 1, unit: "°" },
    { id: "rough", label: "Rough Edges", type: "range", default: 2, min: 0, max: 5, step: 0.5, unit: "px" },
    { id: "grit", label: "Grit", type: "range", default: 55, min: 10, max: 90, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    rough: R.pick([1, 1.5, 2, 2.5, 3]),
    grit: R.ri(30, 75),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const rough = ctx.values.rough as number;
    const grit = ctx.values.grit as number;

    // Ink reads on either theme; the hue tints it.
    const ink = ctx.theme === "dark" ? hsl(h, 55, 72) : hsl(h, 60, 32);
    const fid = svgId(ctx.scope, "distress");

    // grit -> alpha bias of the speckle: higher = more holes punched out.
    const bias = (0.5 + (grit / 100) * 0.45).toFixed(3);
    const grain = (0.4 + (grit / 100) * 0.4).toFixed(3);

    const defs =
      `<filter id="${fid}" x="-20%" y="-20%" width="140%" height="140%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" result="warp"/>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="warp" scale="${rough}" xChannelSelector="R" yChannelSelector="G" result="disp"/>\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="${grain}" numOctaves="2" seed="21" result="speck"/>\n` +
      `  <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 ${bias}" result="holes"/>\n` +
      `  <feComposite in="disp" in2="holes" operator="out"/>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${ink};\n` +
      `  filter: url(#${fid});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css, defs };
  },
};

export default distressStamp;
