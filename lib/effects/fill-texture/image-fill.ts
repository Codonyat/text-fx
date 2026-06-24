import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText, dropGlow } from "@/lib/engine/helpers";

// Glyphs filled with a built-in, photographic-looking "image": several layered
// radial + linear gradients that read like a soft sunset/aurora scene. No URL.
const imageFill: EffectDefinition = {
  id: "image-fill",
  name: "Image Fill",
  category: "fill-texture",
  tags: ["fill", "texture", "gradient", "photographic", "scenic"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 28, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({ hue: R.ri(0, 360) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    // A scene built from layered gradients: warm "sun", cool sky, accent bloom,
    // and a deep base wash. Layered front-to-back (first layer paints on top).
    const sun = hsl(h, 95, 66);
    const sunCore = hsl((h + 8) % 360, 100, 78);
    const sky = hsl((h + 200) % 360, 70, 48);
    const skyDeep = hsl((h + 220) % 360, 75, 30);
    const bloom = hsl((h + 320) % 360, 90, 62);
    const haze = hsl((h + 40) % 360, 85, 58);
    const base = hsl((h + 180) % 360, 65, 40);

    const image =
      `radial-gradient(120% 90% at 22% 18%, ${sunCore} 0%, ${sun} 16%, transparent 42%),\n    ` +
      `radial-gradient(90% 80% at 82% 30%, ${bloom} 0%, transparent 45%),\n    ` +
      `radial-gradient(140% 120% at 70% 92%, ${haze} 0%, transparent 55%),\n    ` +
      `linear-gradient(150deg, ${sky} 0%, ${skyDeep} 55%, ${base} 100%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(image)}\n` +
      `  background-size: 100% 100%;\n` +
      `  ${dropGlow(hsl(h, 90, 55, 0.45), [10])}\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default imageFill;
