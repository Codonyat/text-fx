import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, dropGlow } from "@/lib/engine/helpers";

/**
 * Glowing tube outline: hollow letters (transparent fill + a bright coloured
 * -webkit-text-stroke) lit by a drop-shadow halo (glow guard — filter, not
 * text-shadow, since the fill is transparent), with an optional broken-sign flicker.
 */
const glowOutline: EffectDefinition = {
  id: "glow-outline",
  name: "Glow Outline",
  category: "outline-stroke",
  tags: ["outline", "stroke", "neon", "glow", "tube", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke + drop-shadow halo (transparent fill)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "stroke", label: "Stroke", type: "range", default: 2, min: 1, max: 5, step: 0.5, unit: "px" },
    { id: "glow", label: "Glow", type: "range", default: 16, min: 4, max: 34, step: 1, unit: "px" },
    { id: "flicker", label: "Flicker", type: "toggle", default: true, onLabel: "On", offLabel: "Off" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    stroke: R.pick([1.5, 2, 2.5, 3]),
    glow: R.ri(10, 26),
    flicker: R.chance(0.6),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const strokeW = ctx.values.stroke as number;
    const g = ctx.values.glow as number;
    const flicker = Boolean(ctx.values.flicker);

    const tube = hsl(h, 95, 62);
    const glow = hsl(h, 100, 60, 0.95);
    const a = anim(ctx.scope, "flicker");
    const animDecl = flicker ? `\n  animation: ${a} 3.5s steps(1, end) infinite;` : "";

    const css =
      `.${ctx.scope} {\n` +
      `  color: transparent;\n` +
      `  -webkit-text-stroke: ${strokeW}px ${tube};\n` +
      `  ${dropGlow(glow, [g * 0.5, g, g * 1.9])}` +
      `${animDecl}\n` +
      `}`;

    // Irregular stops drop the glow for a few frames like a faulty tube.
    const keyframes = flicker
      ? `@keyframes ${a} {\n` +
        `  0%, 100% { opacity: 1; }\n` +
        `  41% { opacity: 1; }\n` +
        `  43% { opacity: 0.35; }\n` +
        `  45% { opacity: 1; }\n` +
        `  72% { opacity: 1; }\n` +
        `  74% { opacity: 0.5; }\n` +
        `  76% { opacity: 1; }\n` +
        `}`
      : undefined;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: flicker ? 3500 : undefined,
    };
  },
};

export default glowOutline;
