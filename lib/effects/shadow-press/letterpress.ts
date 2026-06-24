import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const letterpress: EffectDefinition = {
  id: "letterpress",
  name: "Letterpress",
  category: "shadow-press",
  tags: ["letterpress", "pressed", "inset", "engrave", "subtle"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "depth", label: "Depth", type: "range", default: 1, min: 0.5, max: 3, step: 0.5, unit: "px" },
    { id: "tint", label: "Tint Hue", type: "range", default: 30, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    depth: R.pick([0.5, 1, 1.5, 2]),
    tint: R.ri(0, 360),
  }),
  build: (ctx) => {
    const d = ctx.values.depth as number;
    const tint = ctx.values.tint as number;
    // Pressed look: the glyph tone matches the background, with a light
    // highlight cast BELOW and a dark shadow ABOVE so it appears recessed.
    const dark = ctx.theme === "dark";
    // Text sits near the background tone so the relief carries the legibility.
    const txt = dark ? hsl(tint, 12, 28) : hsl(tint, 14, 60);
    const highlight = dark ? hsl(tint, 18, 42, 0.7) : hsl(tint, 30, 100, 0.85);
    const shadow = dark ? hsl(tint, 40, 4, 0.85) : hsl(tint, 25, 35, 0.55);
    const dd = Number(d.toFixed(1));
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      // highlight below (positive y), shadow above (negative y) = inset.
      `  text-shadow:\n` +
      `    0 ${dd}px ${Math.max(0, dd - 0.5)}px ${highlight},\n` +
      `    0 -${dd}px ${Math.max(0, dd - 0.5)}px ${shadow};\n` +
      `}`;
    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default letterpress;
