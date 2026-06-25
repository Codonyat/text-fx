import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Zigzag text: alternate letters sit high and low (a sawtooth), with a matching tilt
 * each way. The jagged ribbon snaps into place on load (per-letter markup; alternation
 * via :nth-child, so no CSS mod() needed).
 */
const zigzagText: EffectDefinition = {
  id: "zigzag-text",
  name: "Zigzag Text",
  category: "entrance-kinetic",
  tags: ["zigzag", "sawtooth", "jagged", "alternate", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 350, min: 0, max: 360, step: 1, unit: "°" },
    { id: "amp", label: "Amplitude", type: "range", default: 20, min: 6, max: 44, step: 1, unit: "px" },
    { id: "tilt", label: "Tilt", type: "range", default: 8, min: 0, max: 20, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Snap-in",
      type: "range",
      default: 0.6,
      min: 0.2,
      max: 2,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    amp: R.ri(12, 36),
    tilt: R.ri(4, 16),
    speed: Number(R.rnd(0.4, 1).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const amp = ctx.values.amp as number;
    const tilt = ctx.values.tilt as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 80, 72) : hsl(h, 78, 46);
    const a = anim(ctx.scope, "zig");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform: translateY(-${amp}px) rotate(-${tilt}deg);\n` + // odd letters: up
      `  animation: ${a} ${speed.toFixed(2)}s ease-out both;\n` +
      `  animation-delay: calc(var(--i) * 0.035s);\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch:nth-child(2n) {\n` +
      `  transform: translateY(${amp}px) rotate(${tilt}deg);\n` + // even letters: down
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { transform: translateY(0) rotate(0deg); opacity: 0; }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default zigzagText;
