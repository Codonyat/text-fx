import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

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
    // A calm, restrained 3-stop wash at ~55% saturation: a soft warm-to-cool
    // diagonal sweep with no glow. Layered front-to-back (first layer on top).
    const start = hsl(h, 55, 62);
    const mid = hsl((h + 30) % 360, 55, 50);
    const end = hsl((h + 60) % 360, 55, 40);

    const image = `linear-gradient(150deg, ${start} 0%, ${mid} 55%, ${end} 100%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(image)}\n` +
      `  background-size: 100% 100%;\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default imageFill;
