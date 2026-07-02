import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * 3D flip-in: each letter swings down into place around its baseline on a shared
 * perspective, staggered by index, with a slight overshoot. A crisp on-load entrance
 * (per-letter markup).
 */
const flipIn3d: EffectDefinition = {
  id: "flip-in-3d",
  name: "Flip In 3D",
  category: "entrance-kinetic",
  tags: ["entrance", "3d", "flip", "rotate", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Duration",
      type: "range",
      default: 0.8,
      min: 0.4,
      max: 2,
      step: 0.05,
      unit: "s",
    },
    { id: "stagger", label: "Stagger", type: "range", default: 70, min: 20, max: 160, step: 5, unit: "ms" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(0.6, 1.3).toFixed(2)),
    stagger: R.ri(40, 120),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const stagger = ctx.values.stagger as number;

    const base = ctx.theme === "dark" ? hsl(h, 60, 76) : hsl(h, 60, 42);
    const a = anim(ctx.scope, "flip");
    const a2 = anim(ctx.scope, "flip-r"); // hover replays the on-load entrance

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `  perspective: 600px;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform-origin: 50% 100%;\n` +
      `  backface-visibility: hidden;\n` +
      `  animation: ${a} ${speed.toFixed(2)}s cubic-bezier(0.2, 0.7, 0.3, 1.2) both;\n` +
      `  animation-delay: calc(var(--i) * ${stagger}ms);\n` +
      `}\n` +
      hoverReplay(ctx.scope, " .fx-ch", a2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { transform: rotateX(-90deg); opacity: 0; }\n` +
      `  60% { transform: rotateX(18deg); opacity: 1; }\n` +
      `  100% { transform: rotateX(0); opacity: 1; }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: speed * 1000,
    };
  },
};

export default flipIn3d;
