import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const dropShadow: EffectDefinition = {
  id: "drop-shadow",
  name: "Drop Shadow",
  category: "shadow-press",
  tags: ["shadow", "drop", "soft", "depth"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Shadow Hue", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "blur", label: "Blur", type: "range", default: 8, min: 0, max: 30, step: 1, unit: "px" },
    { id: "distance", label: "Distance", type: "range", default: 6, min: 0, max: 24, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    blur: R.ri(4, 16),
    distance: R.ri(3, 12),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const blur = ctx.values.blur as number;
    const dist = ctx.values.distance as number;
    // Text reads against the theme background; shadow is a tinted dark cast.
    const txt = ctx.theme === "dark" ? hsl(h, 25, 96) : hsl(h, 40, 22);
    const shadow = ctx.theme === "dark" ? hsl(h, 55, 6, 0.7) : hsl(h, 45, 30, 0.4);
    // 45deg-ish soft cast: offset proportionally on x and y.
    const dx = Math.round(dist * 0.7);
    const dy = dist;
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  text-shadow: ${dx}px ${dy}px ${blur}px ${shadow};\n` +
      `}`;
    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default dropShadow;
