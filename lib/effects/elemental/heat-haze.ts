import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId } from "@/lib/engine/helpers";

/**
 * Heat haze: the word seen through rising hot air. A fine, high-frequency SVG
 * turbulence drives a feDisplacementMap, with a fast SMIL <animate> shimmering the
 * noise so the glyph edges waver and swim like a desert mirage. Distinct from the
 * slow underwater wobble of Liquid Warp — finer ripple, quicker shimmer, warm fill.
 * The filter id is salted; the noise seed is fixed (deterministic, parity-safe).
 */
const heatHaze: EffectDefinition = {
  id: "heat-haze",
  name: "Heat Haze",
  category: "elemental",
  tags: ["heat", "haze", "shimmer", "mirage", "svg", "displacement", "animated"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence + feDisplacementMap (SMIL-animated) via filter:url(#…)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 32, min: 0, max: 360, step: 1, unit: "°" },
    { id: "shimmer", label: "Shimmer", type: "range", default: 4, min: 2, max: 12, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 2.2,
      min: 1,
      max: 6,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.chance(0.7) ? R.ri(18, 48) : R.ri(0, 360),
    shimmer: R.ri(3, 7),
    speed: Number(R.rnd(1.6, 3.4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const shimmer = ctx.values.shimmer as number;
    const speed = ctx.values.speed as number;

    const fill = ctx.theme === "dark" ? hsl(h, 60, 70) : hsl(h, 58, 46);
    const fid = svgId(ctx.scope, "haze");

    // Fine noise with extra vertical detail so the wobble reads as rising air; the
    // baseFrequency cycles tightly for a continuous heat shimmer.
    const defs =
      `<filter id="${fid}" x="-20%" y="-30%" width="140%" height="160%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" seed="3" result="n">\n` +
      `    <animate attributeName="baseFrequency" dur="${speed.toFixed(1)}s" ` +
      `values="0.02 0.05;0.028 0.062;0.02 0.05" repeatCount="indefinite"/>\n` +
      `  </feTurbulence>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="n" scale="${shimmer}" xChannelSelector="R" yChannelSelector="G"/>\n` +
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

export default heatHaze;
