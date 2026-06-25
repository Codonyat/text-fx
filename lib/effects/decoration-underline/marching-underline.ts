import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Marching underline: a dashed underline rule that marches steadily along beneath
 * the text (animated background-position on a repeating dash). The text stays fully
 * legible at every frame — distinct from the gradient and grow-in underlines.
 */
const marchingUnderline: EffectDefinition = {
  id: "marching-underline",
  name: "Marching Underline",
  category: "decoration-underline",
  tags: ["underline", "dashed", "marching-ants", "decoration", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Animated background-position on a repeating dash underline",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 145, min: 0, max: 360, step: 1, unit: "°" },
    { id: "dash", label: "Dash", type: "range", default: 8, min: 3, max: 18, step: 1, unit: "px" },
    { id: "thickness", label: "Thickness", type: "range", default: 4, min: 2, max: 10, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 4,
      min: 1.5,
      max: 10,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    dash: R.ri(5, 14),
    thickness: R.ri(2, 7),
    speed: Number(R.rnd(2.5, 7).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const dash = ctx.values.dash as number;
    const thickness = ctx.values.thickness as number;
    const speed = ctx.values.speed as number;

    const textColor = ctx.theme === "dark" ? hsl(h, 25, 92) : hsl(h, 35, 18);
    const rule = hsl(h, 90, ctx.theme === "dark" ? 62 : 46);
    const period = dash * 2;
    const a = anim(ctx.scope, "march");

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  color: ${textColor};\n` +
      `  padding-bottom: ${thickness + 4}px;\n` +
      `  background-image: repeating-linear-gradient(90deg, ${rule} 0 ${dash}px, transparent ${dash}px ${period}px);\n` +
      `  background-size: ${period}px ${thickness}px;\n` +
      `  background-position: 0 100%;\n` +
      `  background-repeat: repeat-x;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes = `@keyframes ${a} {\n  to { background-position: ${period}px 100%; }\n}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default marchingUnderline;
