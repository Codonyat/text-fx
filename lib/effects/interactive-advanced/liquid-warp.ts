import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId } from "@/lib/engine/helpers";

/**
 * Liquid warp: an SVG feTurbulence + feDisplacementMap that wobbles the glyph edges,
 * with a SMIL <animate> cycling the noise frequency so the letters ripple like they
 * are underwater. The filter id is salted; the noise seed is fixed (deterministic).
 */
const liquidWarp: EffectDefinition = {
  id: "liquid-warp",
  name: "Liquid Warp",
  category: "interactive-advanced",
  tags: ["liquid", "warp", "wobble", "svg", "displacement", "animated"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence + feDisplacementMap (SMIL-animated) via filter:url(#…)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 195, min: 0, max: 360, step: 1, unit: "°" },
    { id: "amount", label: "Warp", type: "range", default: 14, min: 4, max: 30, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 6,
      min: 2,
      max: 14,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    amount: R.ri(8, 22),
    speed: Number(R.rnd(4, 10).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const amount = ctx.values.amount as number;
    const speed = ctx.values.speed as number;

    const fill = ctx.theme === "dark" ? hsl(h, 85, 64) : hsl(h, 80, 46);
    const fid = svgId(ctx.scope, "warp");

    const defs =
      `<filter id="${fid}" x="-25%" y="-25%" width="150%" height="150%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="2" seed="5" result="n">\n` +
      `    <animate attributeName="baseFrequency" dur="${speed.toFixed(1)}s" ` +
      `values="0.012 0.022;0.02 0.014;0.012 0.022" repeatCount="indefinite"/>\n` +
      `  </feTurbulence>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="n" scale="${amount}" xChannelSelector="R" yChannelSelector="G"/>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${fill};\n` +
      `  filter: url(#${fid});\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      defs,
      loopMs: speed * 1000,
    };
  },
};

export default liquidWarp;
