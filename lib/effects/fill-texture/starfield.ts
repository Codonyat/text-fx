import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText, dropGlow } from "@/lib/engine/helpers";

// Deep night-sky fill: scattered radial-gradient "stars" of varying size over a
// deep tinted gradient, clipped into the glyphs.
const starfield: EffectDefinition = {
  id: "starfield",
  name: "Starfield",
  category: "fill-texture",
  tags: ["fill", "texture", "stars", "space", "night", "galaxy"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 250, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({ hue: R.ri(0, 360) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;

    // Deep tinted sky base — kept rich but light enough that the glyphs read on a
    // dark stage (too dark and the text vanishes against the background).
    const skyTop = hsl(h, 60, 40);
    const skyMid = hsl((h + 18) % 360, 58, 30);
    const skyBottom = hsl((h + 40) % 360, 55, 21);

    // Star colors: bright cores with a faint nebula tint.
    const star = "#ffffff";
    const starWarm = hsl((h + 200) % 360, 100, 88);
    const nebula = hsl((h + 300) % 360, 85, 60);

    // Multiple star layers at different sizes/positions for a scattered look.
    // Each "star" is a tiny radial-gradient dot fading to transparent.
    const fill =
      `radial-gradient(50% 60% at 78% 20%, ${nebula}55 0%, transparent 60%),\n    ` +
      `radial-gradient(1.5px 1.5px at 18% 24%, ${star} 0%, transparent 100%),\n    ` +
      `radial-gradient(1px 1px at 42% 12%, ${starWarm} 0%, transparent 100%),\n    ` +
      `radial-gradient(2px 2px at 64% 34%, ${star} 0%, transparent 100%),\n    ` +
      `radial-gradient(1px 1px at 86% 48%, ${star} 0%, transparent 100%),\n    ` +
      `radial-gradient(1.5px 1.5px at 30% 62%, ${starWarm} 0%, transparent 100%),\n    ` +
      `radial-gradient(1px 1px at 54% 78%, ${star} 0%, transparent 100%),\n    ` +
      `radial-gradient(2px 2px at 12% 84%, ${star} 0%, transparent 100%),\n    ` +
      `radial-gradient(1px 1px at 72% 88%, ${starWarm} 0%, transparent 100%),\n    ` +
      `radial-gradient(1px 1px at 92% 72%, ${star} 0%, transparent 100%),\n    ` +
      `linear-gradient(165deg, ${skyTop} 0%, ${skyMid} 55%, ${skyBottom} 100%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(fill)}\n` +
      `  background-size: 100% 100%;\n` +
      `  ${dropGlow(hsl(h, 70, 62, 0.38), [10])}\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default starfield;
