import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, glowShadow } from "@/lib/engine/helpers";

/**
 * Color-cycling neon: a solid glowing tube whose whole hue rotates continuously via
 * filter:hue-rotate, so the sign drifts through the spectrum. Solid fill, so the
 * glow is a layered text-shadow (no clip — text-shadow is correct here).
 */
const colorCycleGlow: EffectDefinition = {
  id: "color-cycle-glow",
  name: "Color Cycle Glow",
  category: "neon-glow",
  tags: ["neon", "glow", "rainbow", "hue", "cycle", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Layered text-shadow glow + animated filter:hue-rotate",
  controls: [
    { id: "hue", label: "Start Hue", type: "range", default: 300, min: 0, max: 360, step: 1, unit: "°" },
    { id: "glow", label: "Glow", type: "range", default: 16, min: 6, max: 32, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 6,
      min: 2,
      max: 16,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    glow: R.ri(10, 26),
    speed: Number(R.rnd(4, 10).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const g = ctx.values.glow as number;
    const speed = ctx.values.speed as number;

    const tube = hsl(h, 95, 65);
    const core = ctx.theme === "dark" ? "#fff" : hsl(h, 90, 88);
    const a = anim(ctx.scope, "cycle");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${tube};\n` +
      `  ${glowShadow(tube, [g * 0.4, g, g * 2], core)}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { filter: hue-rotate(0deg); }\n` +
      `  to { filter: hue-rotate(360deg); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default colorCycleGlow;
