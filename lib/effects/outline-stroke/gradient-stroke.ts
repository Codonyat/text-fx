import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

const gradientStroke: EffectDefinition = {
  id: "gradient-stroke",
  name: "Gradient Stroke",
  category: "outline-stroke",
  tags: ["outline", "stroke", "gradient", "hollow"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke + background-clip:text pseudo (all modern, prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 285, min: 0, max: 360, step: 1, unit: "°" },
    { id: "angle", label: "Angle", type: "angle", default: 90, min: 0, max: 360, step: 1, unit: "°" },
    { id: "width", label: "Stroke", type: "range", default: 2.5, min: 1, max: 6, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    angle: R.pick([0, 45, 90, 135]),
    width: R.pick([1.5, 2, 2.5, 3, 3.5]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const angle = ctx.values.angle as number;
    const w = ctx.values.width as number;
    const c1 = hsl(h, 95, 62);
    const c2 = hsl((h + 55) % 360, 95, 60);
    const c3 = hsl((h + 130) % 360, 92, 64);
    const gradient = `linear-gradient(${angle}deg, ${c1}, ${c2}, ${c3})`;
    // The stroke colour itself cannot be a gradient, so the gradient is clipped
    // into a ::before copy that sits *behind* the glyphs; the root is a
    // transparent-fill outline whose stroke is tinted to read as part of the
    // same gradient. Result: a hollow letterform with a glowing gradient core
    // peeking through a crisp coloured edge.
    const strokeColor = hsl((h + 92) % 360, 96, ctx.theme === "dark" ? 66 : 46);
    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  -webkit-text-stroke: ${w}px ${strokeColor};\n` +
      `  paint-order: stroke fill;\n}\n` +
      `.${ctx.scope}::before {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  top: 0;\n` +
      `  z-index: -1;\n` +
      `  -webkit-text-stroke: 0;\n` +
      `  ${clipText(gradient)}\n}`;
    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
    };
  },
};

export default gradientStroke;
