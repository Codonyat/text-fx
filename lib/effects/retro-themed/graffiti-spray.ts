import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

/**
 * Graffiti spray: a vivid multi-colour fill clipped to the glyphs, wrapped in a soft
 * same-hue spray haze and dropped with a hard offset for a stencil-tag depth. Bright
 * street-art lettering. Static.
 */
const graffitiSpray: EffectDefinition = {
  id: "graffiti-spray",
  name: "Graffiti Spray",
  category: "retro-themed",
  tags: ["graffiti", "spray", "street", "tag", "paint"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + drop-shadow spray haze",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 130, min: 0, max: 360, step: 1, unit: "°" },
    { id: "spread", label: "Color Spread", type: "range", default: 70, min: 0, max: 160, step: 1, unit: "°" },
    { id: "haze", label: "Spray Haze", type: "range", default: 6, min: 2, max: 14, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    spread: R.ri(30, 130),
    haze: R.ri(3, 10),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const spread = ctx.values.spread as number;
    const haze = ctx.values.haze as number;

    const c1 = hsl(h, 95, 58);
    const c2 = hsl((h + spread) % 360, 95, 56);
    const c3 = hsl((h + spread * 2) % 360, 95, 60);
    const mist = hsl((h + spread) % 360, 95, 60, 0.6);
    const ink = hsl(h, 60, ctx.theme === "dark" ? 8 : 14, 0.7);

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(`linear-gradient(120deg, ${c1}, ${c2}, ${c3})`)}\n` +
      `  filter: drop-shadow(0 0 ${haze}px ${mist}) drop-shadow(3px 4px 0 ${ink});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default graffitiSpray;
