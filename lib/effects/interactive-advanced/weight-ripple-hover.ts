import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, fvs } from "@/lib/engine/helpers";

/**
 * Weight ripple: hovering the word sends a wave of boldness sweeping through the
 * letters and back out, each letter's wght axis transitioning on an index-based
 * delay. CSS-only (no JavaScript); the resting state is the chosen weight.
 */
const weightRippleHover: EffectDefinition = {
  id: "weight-ripple-hover",
  name: "Weight Ripple",
  category: "interactive-advanced",
  tags: ["variable-font", "weight", "interactive", "hover", "ripple", "per-letter"],
  caps: ["perLetter"],
  split: "grapheme",
  font: "'Recursive', sans-serif",
  pngSupport: "good",
  supports: "Variable-font wght ripples through letters on :hover (per-letter delay) — static preview is the resting weight.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 265, min: 0, max: 360, step: 1, unit: "°" },
    { id: "stagger", label: "Stagger", type: "range", default: 45, min: 15, max: 100, step: 5, unit: "ms" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    stagger: R.ri(25, 80),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const stagger = ctx.values.stagger as number;
    // Rest weight is capped at 800 (not 1000) so the :hover peak of 1000 always has
    // visible headroom to ripple toward, even at the max base weight.
    const rest = Math.max(300, Math.min(800, (ctx.values.weight as number) ?? 400));

    const base = ctx.theme === "dark" ? hsl(h, 55, 80) : hsl(h, 58, 42);

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `  cursor: pointer;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  ${fvs({ wght: rest })}\n` +
      `  transition: font-variation-settings 0.32s ease;\n` +
      `  transition-delay: calc(var(--i) * ${stagger}ms);\n` +
      `}\n` +
      `.${ctx.scope}:hover .fx-ch {\n` +
      `  ${fvs({ wght: 1000 })}\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
    };
  },
};

export default weightRippleHover;
