import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const wavyUnderline: EffectDefinition = {
  id: "wavy-underline",
  name: "Wavy Underline",
  category: "decoration-underline",
  tags: ["underline", "decoration", "wavy", "squiggle"],
  caps: ["pure"],
  pngSupport: "good",
  supports: "text-decoration-style:wavy (all modern browsers)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 340, min: 0, max: 360, step: 1, unit: "°" },
    { id: "thickness", label: "Thickness", type: "range", default: 3, min: 1, max: 8, step: 1, unit: "px" },
    { id: "offset", label: "Offset", type: "range", default: 4, min: 1, max: 12, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    thickness: R.ri(2, 5),
    offset: R.ri(2, 8),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const thickness = ctx.values.thickness as number;
    const offset = ctx.values.offset as number;
    const txt = ctx.theme === "dark" ? hsl(h, 25, 96) : hsl(h, 45, 18);
    const line = ctx.theme === "dark" ? hsl(h, 90, 62) : hsl(h, 85, 50);
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  text-decoration-line: underline;\n` +
      `  text-decoration-style: wavy;\n` +
      `  text-decoration-color: ${line};\n` +
      `  text-decoration-thickness: ${thickness}px;\n` +
      `  text-underline-offset: ${offset}px;\n` +
      `  text-decoration-skip-ink: none;\n` +
      `}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default wavyUnderline;
