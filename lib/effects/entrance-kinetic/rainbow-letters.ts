import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { anim } from "@/lib/engine/helpers";

/**
 * Rainbow letters: each glyph takes a hue stepped by its index, and the whole word
 * cycles continuously through the spectrum via filter:hue-rotate — a flowing rainbow
 * with no motion (per-letter markup).
 */
const rainbowLetters: EffectDefinition = {
  id: "rainbow-letters",
  name: "Rainbow Letters",
  category: "entrance-kinetic",
  tags: ["rainbow", "color", "per-letter", "spectrum", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "spread", label: "Hue Spread", type: "range", default: 32, min: 8, max: 80, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 5,
      min: 2,
      max: 14,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    spread: R.ri(18, 60),
    speed: Number(R.rnd(3.5, 9).toFixed(1)),
  }),
  build: (ctx) => {
    const spread = ctx.values.spread as number;
    const speed = ctx.values.speed as number;
    const l = ctx.theme === "dark" ? 66 : 48;
    const a = anim(ctx.scope, "spectrum");

    const css =
      `.${ctx.scope} {\n` +
      `  white-space: pre;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  color: hsl(calc(var(--i) * ${spread}deg) 90% ${l}%);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { filter: hue-rotate(0deg); }\n` +
      `  to { filter: hue-rotate(360deg); }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default rainbowLetters;
