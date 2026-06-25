import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId } from "@/lib/engine/helpers";

/**
 * Chalkboard: chalk-dust lettering — a soft off-white (or charcoal on light themes)
 * fill roughened at the edges by an SVG turbulence displacement, with a faint dusty
 * halo. The filter id is salted; the seed is fixed (deterministic). Static.
 */
const chalkboard: EffectDefinition = {
  id: "chalkboard",
  name: "Chalkboard",
  category: "retro-themed",
  tags: ["chalk", "chalkboard", "dusty", "school", "svg", "filter"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence + feDisplacementMap (rough chalk edge) via filter:url(#…)",
  controls: [
    { id: "hue", label: "Chalk Tint", type: "range", default: 45, min: 0, max: 360, step: 1, unit: "°" },
    { id: "rough", label: "Roughness", type: "range", default: 1.5, min: 0.5, max: 3.5, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.pick([45, 0, 200, 130, 320]),
    rough: R.pick([1, 1.5, 2, 2.5]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const rough = ctx.values.rough as number;
    const dark = ctx.theme === "dark";

    const chalk = dark ? hsl(h, 18, 90) : hsl(h, 22, 26);
    const dust = dark ? hsl(h, 20, 95, 0.35) : hsl(h, 20, 40, 0.3);
    const fid = svgId(ctx.scope, "chalk");

    const defs =
      `<filter id="${fid}" x="-15%" y="-15%" width="130%" height="130%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n"/>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="n" scale="${rough}" xChannelSelector="R" yChannelSelector="G"/>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${chalk};\n` +
      `  filter: url(#${fid});\n` +
      `  text-shadow: 0 0 1px ${dust}, 0 0 3px ${dust};\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css, defs };
  },
};

export default chalkboard;
