import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim, fvs } from "@/lib/engine/helpers";

/**
 * Weight wave: each letter's variable-font weight swells from light to heavy and
 * back, offset by index so a wave of boldness rolls across the word. Uses the
 * Recursive variable font's wght axis (per-letter markup).
 */
const weightWave: EffectDefinition = {
  id: "weight-wave",
  name: "Weight Wave",
  category: "entrance-kinetic",
  tags: ["variable-font", "weight", "wave", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  font: "'Recursive', sans-serif",
  pngSupport: "good",
  supports: "Variable-font wght axis (Recursive) animated per letter.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    { id: "light", label: "Light", type: "range", default: 400, min: 300, max: 520, step: 10 },
    { id: "heavy", label: "Heavy", type: "range", default: 880, min: 640, max: 1000, step: 10 },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 2.4,
      min: 1,
      max: 5,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    light: R.ri(360, 460),
    heavy: R.ri(760, 1000),
    speed: Number(R.rnd(1.6, 3.4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const light = ctx.values.light as number;
    const heavy = ctx.values.heavy as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 55, 80) : hsl(h, 60, 38);
    const a = anim(ctx.scope, "wwave");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      // Resting frame is a frozen ascending-weight wave across letters (distinct
      // from the uniform weight-pulse); the animation overrides it while running.
      `  font-variation-settings: 'wght' calc(${light} + var(--i) * 46);\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `  animation-delay: calc(var(--i) * -0.12s);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { ${fvs({ wght: light })} }\n` +
      `  50% { ${fvs({ wght: heavy })} }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default weightWave;
