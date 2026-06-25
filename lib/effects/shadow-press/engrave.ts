import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Engrave: letters carved into the surface — a low-contrast fill close to the page
 * tone with a shadow along the top and a highlight along the bottom (the inverse of
 * an emboss), so the type reads as debossed. Theme-aware, static.
 */
const engrave: EffectDefinition = {
  id: "engrave",
  name: "Engrave",
  category: "shadow-press",
  tags: ["engrave", "carved", "deboss", "inset", "press"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Tint", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 1, min: 0.5, max: 2.5, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    depth: R.pick([1, 1, 1.5, 2]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const d = ctx.values.depth as number;
    const dark = ctx.theme === "dark";

    // Fill sits close to the background tone so the carve does the reading.
    const face = dark ? hsl(h, 10, 26) : hsl(h, 12, 66);
    const shadow = dark ? hsl(h, 30, 4, 0.8) : hsl(h, 20, 35, 0.55);
    const light = dark ? hsl(h, 15, 55, 0.45) : hsl(0, 0, 100, 0.85);

    // Shadow ABOVE + highlight BELOW = carved-in (opposite of the raised emboss).
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow: 0 -${d}px ${d}px ${shadow}, 0 ${d}px 0 ${light};\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default engrave;
