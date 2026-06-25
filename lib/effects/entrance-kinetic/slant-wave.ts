import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim, fvs } from "@/lib/engine/helpers";

/**
 * Slant wave: each letter leans from upright to italic and back via the Recursive
 * variable font's slnt axis, staggered by index so the lean ripples through the
 * word — a true type-axis slant, not a transform skew (per-letter markup).
 */
const slantWave: EffectDefinition = {
  id: "slant-wave",
  name: "Slant Wave",
  category: "entrance-kinetic",
  tags: ["variable-font", "slant", "italic", "wave", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  font: "'Recursive', sans-serif",
  pngSupport: "good",
  supports: "Variable-font slnt axis (Recursive) animated per letter.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 320, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 2.2,
      min: 1,
      max: 5,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(1.4, 3.2).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    // Hold the chosen weight steady on the wght axis while only the slant animates.
    const wght = Math.max(300, Math.min(1000, (ctx.values.weight as number) ?? 700));

    const base = ctx.theme === "dark" ? hsl(h, 60, 78) : hsl(h, 62, 42);
    const a = anim(ctx.scope, "swave");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  ${fvs({ wght, slnt: -8 })}\n` + // resting lean so the static/reduced-motion frame reads
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `  animation-delay: calc(var(--i) * -0.1s);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { ${fvs({ wght, slnt: 0 })} }\n` +
      `  50% { ${fvs({ wght, slnt: -15 })} }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default slantWave;
