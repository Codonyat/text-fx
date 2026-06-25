import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Falling letters: each glyph drops in from above, squashes on landing and settles,
 * staggered by index. A bouncy gravity entrance — distinct from the in-place jelly
 * wobble and the steady letter wave (per-letter markup).
 */
const fallingLetters: EffectDefinition = {
  id: "falling-letters",
  name: "Falling Letters",
  category: "entrance-kinetic",
  tags: ["entrance", "fall", "drop", "bounce", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 40, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Duration",
      type: "range",
      default: 0.9,
      min: 0.4,
      max: 2,
      step: 0.05,
      unit: "s",
    },
    { id: "stagger", label: "Stagger", type: "range", default: 80, min: 20, max: 180, step: 5, unit: "ms" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(0.6, 1.4).toFixed(2)),
    stagger: R.ri(40, 130),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const stagger = ctx.values.stagger as number;

    const base = ctx.theme === "dark" ? hsl(h, 75, 72) : hsl(h, 70, 46);
    const a = anim(ctx.scope, "fall");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform-origin: 50% 100%;\n` +
      `  animation: ${a} ${speed.toFixed(2)}s cubic-bezier(0.3, 0.7, 0.4, 1) both;\n` +
      `  animation-delay: calc(var(--i) * ${stagger}ms);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { transform: translateY(-120%); opacity: 0; }\n` +
      `  55% { opacity: 1; }\n` +
      `  70% { transform: translateY(0); }\n` +
      `  82% { transform: translateY(0) scale(1.12, 0.82); }\n` +
      `  92% { transform: translateY(0) scale(0.96, 1.05); }\n` +
      `  100% { transform: translateY(0) scale(1, 1); }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default fallingLetters;
