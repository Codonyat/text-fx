import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Jelly wobble: per-letter squash-and-stretch (scaleX/scaleY about the baseline)
 * with a staggered delay so the gel-wobble rolls across the word. Distinct from
 * the translate-based letter wave — this stretches, it doesn't bob.
 */
const jellyWobble: EffectDefinition = {
  id: "jelly-wobble",
  name: "Jelly Wobble",
  category: "entrance-kinetic",
  tags: ["jelly", "wobble", "squash", "stretch", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 300, min: 0, max: 360, step: 1, unit: "°" },
    { id: "bounce", label: "Bounce", type: "range", default: 22, min: 8, max: 40, step: 1, unit: "%" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 1.8,
      min: 0.8,
      max: 4,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    bounce: R.ri(14, 34),
    speed: Number(R.rnd(1.2, 3).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const amt = (ctx.values.bounce as number) / 100;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 85, 70) : hsl(h, 80, 48);
    const a = anim(ctx.scope, "jelly");

    // Squash wide -> stretch tall -> settle, anchored to the baseline.
    const sx1 = (1 + amt).toFixed(2);
    const sy1 = (1 - amt).toFixed(2);
    const sx2 = (1 - amt * 0.7).toFixed(2);
    const sy2 = (1 + amt * 0.9).toFixed(2);
    const sx3 = (1 + amt * 0.25).toFixed(2);
    const sy3 = (1 - amt * 0.25).toFixed(2);

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform-origin: bottom center;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `  animation-delay: calc(var(--i) * 0.08s);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 40%, 100% { transform: scale(1, 1); }\n` +
      `  10% { transform: scale(${sx1}, ${sy1}); }\n` +
      `  20% { transform: scale(${sx2}, ${sy2}); }\n` +
      `  30% { transform: scale(${sx3}, ${sy3}); }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default jellyWobble;
