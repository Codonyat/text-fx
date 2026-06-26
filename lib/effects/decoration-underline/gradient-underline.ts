import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, prop, hsl } from "@/lib/engine/helpers";

/**
 * Flowing gradient underline: a solid-coloured word over a gradient bar whose hue
 * cycles continuously via an animated @property number. Distinct from the
 * slide/grow and wavy underlines — the bar stays full width and shifts colour.
 */
const gradientUnderline: EffectDefinition = {
  id: "gradient-underline",
  name: "Gradient Underline",
  category: "decoration-underline",
  tags: ["underline", "gradient", "decoration", "flowing", "animated"],
  caps: ["property"],
  pngSupport: "partial",
  supports: "Animated @property <number> driving a gradient underline bar",
  controls: [
    { id: "thickness", label: "Thickness", type: "range", default: 6, min: 2, max: 16, step: 1, unit: "px" },
    { id: "gap", label: "Gap", type: "range", default: 6, min: 0, max: 18, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 6,
      min: 2,
      max: 16,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    thickness: R.ri(4, 12),
    gap: R.ri(2, 12),
    speed: Number(R.rnd(4, 11).toFixed(1)),
  }),
  build: (ctx) => {
    const thickness = ctx.values.thickness as number;
    const gap = ctx.values.gap as number;
    const speed = ctx.values.speed as number;

    const textColor = ctx.theme === "dark" ? hsl(0, 0, 94) : hsl(0, 0, 14);
    const hueVar = prop(ctx.scope, "hue");
    const a = anim(ctx.scope, "huecycle");

    const gradient =
      `linear-gradient(90deg,` +
      ` hsl(var(${hueVar}) 50% 56%),` +
      ` hsl(calc(var(${hueVar}) + 12) 50% 54%),` +
      ` hsl(calc(var(${hueVar}) + 24) 50% 56%),` +
      ` hsl(calc(var(${hueVar}) + 36) 50% 54%))`;

    const propertyRules =
      `@property ${hueVar} {\n` +
      `  syntax: "<number>";\n` +
      `  inherits: false;\n` +
      `  initial-value: 210;\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${hueVar}: 210;\n` +
      `  color: ${textColor};\n` +
      `  display: inline-block;\n` +
      `  padding-bottom: ${gap}px;\n` +
      `  background-image: ${gradient};\n` +
      `  background-repeat: no-repeat;\n` +
      `  background-size: 100% ${thickness}px;\n` +
      `  background-position: 0 100%;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes = `@keyframes ${a} {\n  to { ${hueVar}: 210; }\n}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      loopMs: speed * 1000,
    };
  },
};

export default gradientUnderline;
