import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, fvs } from "@/lib/engine/helpers";

/**
 * Weight pulse: the whole word breathes from thin to heavy and back on the Recursive
 * variable font's wght axis — a smooth, single-element weight throb (no per-letter
 * markup needed).
 */
const weightPulse: EffectDefinition = {
  id: "weight-pulse",
  name: "Weight Pulse",
  category: "entrance-kinetic",
  tags: ["variable-font", "weight", "pulse", "breathe", "animated"],
  caps: ["pure"],
  font: "'Recursive', sans-serif",
  pngSupport: "good",
  supports: "Variable-font wght axis (Recursive) animated on the whole word.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 150, min: 0, max: 360, step: 1, unit: "°" },
    { id: "light", label: "Light", type: "range", default: 360, min: 300, max: 520, step: 10 },
    { id: "heavy", label: "Heavy", type: "range", default: 900, min: 640, max: 1000, step: 10 },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 2.6,
      min: 1,
      max: 6,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    light: R.ri(360, 460),
    heavy: R.ri(780, 1000),
    speed: Number(R.rnd(1.8, 4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const light = ctx.values.light as number;
    const heavy = ctx.values.heavy as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 60, 76) : hsl(h, 62, 42);
    const mid = Math.round((light + heavy) / 2);
    const a = anim(ctx.scope, "wpulse");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  ${fvs({ wght: mid })}\n` + // rest at a substantial mid weight (poster/reduced-motion)
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite alternate;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { ${fvs({ wght: light })} }\n` +
      `  to { ${fvs({ wght: heavy })} }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      // Alternate runs light->heavy->light over 2x the declared duration.
      loopMs: speed * 2000,
    };
  },
};

export default weightPulse;
