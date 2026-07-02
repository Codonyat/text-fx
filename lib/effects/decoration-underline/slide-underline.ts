import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

const slideUnderline: EffectDefinition = {
  id: "slide-underline",
  name: "Slide Underline",
  category: "decoration-underline",
  tags: ["underline", "decoration", "gradient", "slide", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "::after pseudo-element + transform animation",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    { id: "thickness", label: "Thickness", type: "range", default: 6, min: 2, max: 16, step: 1, unit: "px" },
    { id: "speed", label: "Speed", type: "range", default: 1.4, min: 0.4, max: 4, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    thickness: R.ri(3, 10),
    speed: Number(R.rnd(0.8, 2.4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const thickness = ctx.values.thickness as number;
    const speed = ctx.values.speed as number;
    const txt = ctx.theme === "dark" ? hsl(h, 25, 96) : hsl(h, 45, 18);
    const c1 = hsl(h, 50, 58);
    const grow = anim(ctx.scope, "grow");
    const grow2 = anim(ctx.scope, "grow-r"); // hover re-draws the underline
    const gap = Math.max(2, Math.round(thickness * 0.6));
    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  color: ${txt};\n` +
      `  padding-bottom: ${thickness + gap}px;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  bottom: 0;\n` +
      `  width: 100%;\n` +
      `  height: ${thickness}px;\n` +
      `  border-radius: ${thickness}px;\n` +
      `  background: ${c1};\n` +
      `  transform-origin: left center;\n` +
      `  transform: scaleX(0);\n` +
      `  animation: ${grow} ${speed.toFixed(1)}s ease-in-out forwards;\n` +
      `}\n` +
      hoverReplay(ctx.scope, "::after", grow2);
    const keyframes =
      `@keyframes ${grow} {\n` +
      `  0% { transform: scaleX(0); }\n` +
      `  100% { transform: scaleX(1); }\n` +
      `}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, grow, grow2)}`,
      // runs once forward (grow), so a single pass is the full visual
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default slideUnderline;
