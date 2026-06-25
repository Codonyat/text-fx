import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, glowShadow } from "@/lib/engine/helpers";

/**
 * Lightning: a cold electric-white core with a charged blue glow that crackles —
 * erratic flicker with sudden bright spikes, harsher and snappier than a steady neon.
 * Solid fill, so the glow is a layered text-shadow.
 */
const lightning: EffectDefinition = {
  id: "lightning",
  name: "Lightning",
  category: "elemental",
  tags: ["lightning", "electric", "spark", "energy", "elemental", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "text-shadow glow + erratic flicker with bright spikes",
  controls: [
    { id: "hue", label: "Bolt Hue", type: "range", default: 205, min: 160, max: 280, step: 1, unit: "°" },
    { id: "glow", label: "Charge", type: "range", default: 14, min: 6, max: 30, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 2.4,
      min: 1,
      max: 6,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(175, 255),
    glow: R.ri(10, 24),
    speed: Number(R.rnd(1.6, 3.6).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const g = ctx.values.glow as number;
    const speed = ctx.values.speed as number;

    const bolt = hsl(h, 90, 82);
    const charge = hsl(h, 100, 60);
    const a = anim(ctx.scope, "spark");

    // Big spikes where the glow flares, with near-blackouts between strikes.
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${bolt};\n` +
      `  ${glowShadow(charge, [g * 0.4, g, g * 2], "#fff")}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s steps(1, end) infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { opacity: 0.92; filter: brightness(1); }\n` +
      `  8% { opacity: 1; filter: brightness(1.8); }\n` +
      `  10% { opacity: 0.5; filter: brightness(0.8); }\n` +
      `  12% { opacity: 1; filter: brightness(1.6); }\n` +
      `  14% { opacity: 0.85; filter: brightness(1); }\n` +
      `  60% { opacity: 0.9; }\n` +
      `  62% { opacity: 1; filter: brightness(1.9); }\n` +
      `  64% { opacity: 0.6; }\n` +
      `  66% { opacity: 1; filter: brightness(1); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default lightning;
