import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText, dropGlow } from "@/lib/engine/helpers";

// Bold repeating diagonal two-tone stripe pattern clipped into the glyphs.
const stripeFill: EffectDefinition = {
  id: "stripe-fill",
  name: "Stripe Fill",
  category: "fill-texture",
  tags: ["fill", "texture", "stripes", "pattern", "diagonal"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 50, min: 0, max: 360, step: 1, unit: "°" },
    { id: "angle", label: "Angle", type: "angle", default: 45, min: 0, max: 360, step: 1, unit: "°" },
    { id: "width", label: "Stripe Width", type: "range", default: 14, min: 4, max: 40, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    angle: R.pick([45, 135, 0, 90]),
    width: R.ri(8, 24),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const angle = ctx.values.angle as number;
    const w = ctx.values.width as number;
    const half = w / 2;

    // Two-tone bold stripes; second tone is a complementary, slightly darker band.
    const c1 = hsl(h, 92, ctx.theme === "dark" ? 62 : 52);
    const c2 = hsl((h + 28) % 360, 88, ctx.theme === "dark" ? 40 : 34);

    const pattern =
      `repeating-linear-gradient(${angle}deg,\n    ` +
      `${c1} 0px, ${c1} ${half}px,\n    ` +
      `${c2} ${half}px, ${c2} ${w}px)`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(pattern)}\n` +
      `  ${dropGlow(hsl(h, 90, 50, 0.4), [8])}\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default stripeFill;
