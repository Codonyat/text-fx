import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * Strike-through draw: a coloured line draws itself across the middle of the text
 * from the left, holds, then retracts — looping. Mid-line placement and the draw-on
 * set it apart from the underline family.
 */
const strikeThrough: EffectDefinition = {
  id: "strike-through",
  name: "Strikethrough",
  category: "decoration-underline",
  tags: ["strikethrough", "line", "draw", "decoration", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Animated background-size width on a centred line",
  controls: [
    { id: "hue", label: "Line Hue", type: "range", default: 0, min: 0, max: 360, step: 1, unit: "°" },
    { id: "thickness", label: "Thickness", type: "range", default: 3, min: 2, max: 12, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3,
      min: 1.5,
      max: 7,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    thickness: R.ri(2, 5),
    speed: Number(R.rnd(2, 4.5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const thickness = ctx.values.thickness as number;
    const speed = ctx.values.speed as number;

    const textColor = ctx.theme === "dark" ? hsl(h, 20, 92) : hsl(h, 30, 18);
    const line = hsl(h, 30, ctx.theme === "dark" ? 60 : 38);
    const a = anim(ctx.scope, "strike");
    const a2 = anim(ctx.scope, "strike-r"); // hover re-draws the strike line

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  color: ${textColor};\n` +
      `  background-image: linear-gradient(${line}, ${line});\n` +
      `  background-repeat: no-repeat;\n` +
      `  background-position: left center;\n` +
      `  background-size: 0% ${thickness}px;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out forwards;\n` +
      `}\n` +
      hoverReplay(ctx.scope, "", a2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { background-size: 0% ${thickness}px; }\n` +
      `  100% { background-size: 100% ${thickness}px; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: speed * 1000,
    };
  },
};

export default strikeThrough;
