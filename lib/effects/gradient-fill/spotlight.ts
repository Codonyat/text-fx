import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

/**
 * Spotlight: a near-white (or near-black on light themes) heading lit by a soft
 * off-centre gradient, the way premium product sites treat hero type. Almost
 * monochrome — just a whisper of hue. Static and restrained.
 */
const spotlight: EffectDefinition = {
  id: "spotlight",
  name: "Spotlight",
  category: "gradient-fill",
  tags: ["modern", "minimal", "gradient", "light", "premium"],
  caps: ["pure"],
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Tint Hue", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "tint", label: "Tint", type: "range", default: 16, min: 0, max: 40, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    tint: R.ri(8, 28),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const s = ctx.values.tint as number;
    const dark = ctx.theme === "dark";

    // Bright soft highlight to a gently dimmed tone — a single light source top-left.
    const hi = dark ? hsl(h, s, 98) : hsl(h, s + 6, 36);
    const lo = dark ? hsl(h, s, 66) : hsl(h, s + 8, 10);
    const grad = `radial-gradient(135% 135% at 30% 18%, ${hi} 0%, ${lo} 100%)`;
    const shadow = dark ? hsl(h, 30, 4, 0.5) : hsl(h, 20, 40, 0.25);

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(grad)}\n` +
      `  filter: drop-shadow(0 1px 1px ${shadow});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default spotlight;
