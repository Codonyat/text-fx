import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Floating: the word hovers above the page, casting a large soft shadow far below
 * while it gently bobs up and down — the gap and the drift sell the levitation,
 * unlike the tight static drop shadow.
 */
const floating3d: EffectDefinition = {
  id: "floating-3d",
  name: "Floating",
  category: "threed-depth",
  tags: ["float", "levitate", "elevation", "shadow", "depth", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Large soft drop-shadow + gentle bob animation",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 250, min: 0, max: 360, step: 1, unit: "°" },
    { id: "height", label: "Height", type: "range", default: 16, min: 6, max: 34, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3.5,
      min: 1.5,
      max: 7,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    height: R.ri(10, 26),
    speed: Number(R.rnd(2.5, 5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.height as number;
    const hue = ctx.values.hue as number;
    const speed = ctx.values.speed as number;

    const face = ctx.theme === "dark" ? hsl(hue, 60, 78) : hsl(hue, 60, 42);
    const cast = hsl(hue, 50, ctx.theme === "dark" ? 4 : 35, 0.5);
    const a = anim(ctx.scope, "float");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  filter: drop-shadow(0 ${h}px ${Math.round(h * 0.9)}px ${cast});\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { transform: translateY(0); }\n` +
      `  50% { transform: translateY(-${Math.round(h * 0.35)}px); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default floating3d;
