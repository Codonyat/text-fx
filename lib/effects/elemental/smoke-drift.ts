import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Smoke drift: each letter softly blurs, lifts and fades a touch then re-forms,
 * offset per letter so a smoky haze rolls across the word. Stays legible — a
 * continuous shimmer, not a full dissolve (per-letter markup).
 */
const smokeDrift: EffectDefinition = {
  id: "smoke-drift",
  name: "Smoke Drift",
  category: "elemental",
  tags: ["smoke", "fog", "haze", "drift", "elemental", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Tint", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "amount", label: "Haze", type: "range", default: 2.5, min: 1, max: 5, step: 0.5, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 4,
      min: 2,
      max: 9,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    amount: R.pick([1.5, 2, 2.5, 3, 3.5]),
    speed: Number(R.rnd(3, 6).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const amount = ctx.values.amount as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 14, 80) : hsl(h, 16, 32);
    const a = anim(ctx.scope, "smoke");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `  animation-delay: calc(var(--i) * -0.32s);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { filter: blur(0); transform: translateY(0) rotate(0deg); opacity: 1; }\n` +
      `  50% { filter: blur(${amount}px); transform: translateY(-${amount * 1.6}px) rotate(1.5deg); opacity: 0.62; }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default smokeDrift;
