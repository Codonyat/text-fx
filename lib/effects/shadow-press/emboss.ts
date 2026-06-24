import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const emboss: EffectDefinition = {
  id: "emboss",
  name: "Emboss",
  category: "shadow-press",
  tags: ["emboss", "raised", "relief", "bevel", "subtle"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "depth", label: "Depth", type: "range", default: 1.5, min: 0.5, max: 4, step: 0.5, unit: "px" },
    { id: "tint", label: "Tint Hue", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    depth: R.pick([1, 1.5, 2, 2.5]),
    tint: R.ri(0, 360),
  }),
  build: (ctx) => {
    const d = ctx.values.depth as number;
    const tint = ctx.values.tint as number;
    // Raised relief: opposite of letterpress. A dark shadow falls BELOW and a
    // light highlight sits ABOVE so the glyph appears to pop off the surface.
    const dark = ctx.theme === "dark";
    const txt = dark ? hsl(tint, 12, 32) : hsl(tint, 14, 58);
    const highlight = dark ? hsl(tint, 22, 55, 0.8) : hsl(tint, 35, 100, 0.95);
    const shadow = dark ? hsl(tint, 45, 3, 0.9) : hsl(tint, 25, 30, 0.6);
    const dd = Number(d.toFixed(1));
    const soft = Number((dd * 0.6).toFixed(1));
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      // highlight above (negative y), shadow below (positive y) = raised.
      `  text-shadow:\n` +
      `    0 -${dd}px ${soft}px ${highlight},\n` +
      `    0 ${dd}px ${soft}px ${shadow};\n` +
      `}`;
    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default emboss;
