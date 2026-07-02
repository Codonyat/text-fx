import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * Center-grow underline: a solid underline bar grows outward from the centre to full
 * width once on entrance, then holds. Origin-from-centre sets it apart from the
 * left-anchored slide, the dashed march and the wavy underlines.
 */
const centerGrowUnderline: EffectDefinition = {
  id: "center-grow-underline",
  name: "Center Underline",
  category: "decoration-underline",
  tags: ["underline", "grow", "center", "decoration", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Animated background-size width from centre",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 280, min: 0, max: 360, step: 1, unit: "°" },
    { id: "thickness", label: "Thickness", type: "range", default: 5, min: 2, max: 14, step: 1, unit: "px" },
    { id: "gap", label: "Gap", type: "range", default: 6, min: 0, max: 16, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3.2,
      min: 1.5,
      max: 7,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    thickness: R.ri(3, 10),
    gap: R.ri(2, 12),
    speed: Number(R.rnd(2.2, 5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const thickness = ctx.values.thickness as number;
    const gap = ctx.values.gap as number;
    const speed = ctx.values.speed as number;

    const textColor = ctx.theme === "dark" ? hsl(h, 25, 92) : hsl(h, 35, 18);
    const rule = hsl(h, 50, ctx.theme === "dark" ? 62 : 48);
    const a = anim(ctx.scope, "grow");
    const a2 = anim(ctx.scope, "grow-r"); // hover re-draws the underline

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  color: ${textColor};\n` +
      `  padding-bottom: ${gap + thickness}px;\n` +
      `  background-image: linear-gradient(${rule}, ${rule});\n` +
      `  background-repeat: no-repeat;\n` +
      `  background-position: center 100%;\n` +
      `  background-size: 0% ${thickness}px;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-out both;\n` +
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

export default centerGrowUnderline;
