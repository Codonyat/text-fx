import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Focus-in entrance: the word resolves out of a soft blur while opacity rises and
 * the letters draw together from a wide tracking. Single element, plays once on
 * mount (settles at the user's tracking value).
 */
const blurFocusIn: EffectDefinition = {
  id: "blur-focus-in",
  name: "Focus In",
  category: "entrance-kinetic",
  tags: ["entrance", "blur", "focus", "reveal", "animated"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    { id: "blur", label: "Blur", type: "range", default: 14, min: 4, max: 30, step: 1, unit: "px" },
    { id: "spread", label: "From Tracking", type: "range", default: 18, min: 0, max: 40, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Duration",
      type: "range",
      default: 1.4,
      min: 0.5,
      max: 3.5,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    blur: R.ri(8, 22),
    spread: R.ri(8, 30),
    speed: Number(R.rnd(1, 2.4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const blur = ctx.values.blur as number;
    const spread = ctx.values.spread as number;
    const speed = ctx.values.speed as number;
    // End at the user's chosen tracking so the entrance hands off seamlessly.
    const endTrack = (ctx.values.tracking as number) ?? 0;

    const base = ctx.theme === "dark" ? hsl(h, 30, 92) : hsl(h, 35, 22);
    const a = anim(ctx.scope, "focus");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  animation: ${a} ${speed.toFixed(1)}s cubic-bezier(0.2, 0.7, 0.2, 1) both;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { filter: blur(${blur}px); opacity: 0; letter-spacing: ${spread}px; }\n` +
      `  100% { filter: blur(0); opacity: 1; letter-spacing: ${endTrack}px; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default blurFocusIn;
