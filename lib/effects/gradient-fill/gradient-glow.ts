import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText, dropGlow } from "@/lib/engine/helpers";

/**
 * Gradient glow: a flowing multi-stop gradient clipped to the text, lit from behind
 * by a matching drop-shadow halo (glow guard — filter, not text-shadow). The lively
 * gradient flow plus a coloured bloom, distinct from the plain gradient flow.
 */
const gradientGlow: EffectDefinition = {
  id: "gradient-glow",
  name: "Gradient Glow",
  category: "gradient-fill",
  tags: ["gradient", "glow", "bloom", "color", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + drop-shadow glow",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 300, min: 0, max: 360, step: 1, unit: "°" },
    { id: "glow", label: "Glow", type: "range", default: 14, min: 4, max: 30, step: 1, unit: "px" },
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
    glow: R.ri(8, 24),
    speed: Number(R.rnd(4, 10).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const g = ctx.values.glow as number;
    const speed = ctx.values.speed as number;

    const c1 = hsl(h, 95, 64);
    const c2 = hsl((h + 50) % 360, 95, 60);
    const c3 = hsl((h + 120) % 360, 95, 64);
    const glow = hsl((h + 50) % 360, 100, 60, 0.55);
    const a = anim(ctx.scope, "glowflow");

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(`linear-gradient(90deg, ${c1}, ${c2}, ${c3}, ${c1})`)}\n` +
      `  background-size: 220% 100%;\n` +
      `  ${dropGlow(glow, [g * 0.6, g * 1.6])}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { background-position: 0% 50%; }\n` +
      `  100% { background-position: 220% 50%; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default gradientGlow;
