import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Hover ripple: each letter carries an index-based transition delay, so hovering
 * the word sends a wave of lift + colour sweeping through the letters and back out
 * on leave. A faint staggered opacity twinkle keeps the resting state alive
 * (animates opacity only, so it never fights the hover transform).
 */
const hoverRipple: EffectDefinition = {
  id: "hover-ripple",
  name: "Hover Ripple",
  category: "interactive-advanced",
  tags: ["interactive", "hover", "ripple", "wave", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  supports: "Ripples on :hover via per-letter transition-delay — resting twinkle in preview.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 160, min: 0, max: 360, step: 1, unit: "°" },
    { id: "lift", label: "Lift", type: "range", default: 16, min: 4, max: 36, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Twinkle",
      type: "range",
      default: 3,
      min: 1.5,
      max: 6,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    lift: R.ri(10, 28),
    speed: Number(R.rnd(2, 4.5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const lift = ctx.values.lift as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 45, 78) : hsl(h, 50, 38);
    const accent = ctx.theme === "dark" ? hsl(h, 95, 64) : hsl(h, 90, 46);
    const idle = anim(ctx.scope, "twinkle");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `  cursor: pointer;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1.4), color 0.35s ease;\n` +
      `  transition-delay: calc(var(--i) * 0.045s);\n` +
      `  animation: ${idle} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `  animation-delay: calc(var(--i) * -0.15s);\n` +
      `}\n` +
      `.${ctx.scope}:hover .fx-ch {\n` +
      `  transform: translateY(-${lift}px) scale(1.08);\n` +
      `  color: ${accent};\n` +
      `}`;

    const keyframes =
      `@keyframes ${idle} {\n` +
      `  0%, 100% { opacity: 0.72; }\n` +
      `  50% { opacity: 1; }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default hoverRipple;
