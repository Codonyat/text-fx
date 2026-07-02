import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText, dropGlow, pointerSnippet } from "@/lib/engine/helpers";

/**
 * Gradient follow: a multi-hue radial gradient fills the glyphs from a focal point
 * that tracks the cursor (--mx/--my), so the colour wheel slides under the text as
 * you move. A pointer-reactive gradient fill.
 */
const gradientFollow: EffectDefinition = {
  id: "gradient-follow",
  name: "Gradient Follow",
  category: "gradient-fill",
  tags: ["gradient", "pointer", "interactive", "radial", "follow"],
  caps: ["pointer"],
  pngSupport: "partial",
  supports: "background-clip:text radial gradient centred on the pointer (--mx/--my).",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 270, min: 0, max: 360, step: 1, unit: "°" },
    { id: "spread", label: "Spread", type: "range", default: 22, min: 10, max: 60, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    spread: R.ri(14, 36),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const spread = ctx.values.spread as number;
    const l = ctx.theme === "dark" ? 62 : 52;

    const c1 = hsl(h, 58, l + 4);
    const c2 = hsl((h + spread) % 360, 58, l);
    const c3 = hsl((h + spread * 2) % 360, 56, l);
    const edge = hsl((h + spread * 3) % 360, 52, l - 4);
    const glow = hsl(h, 55, 58, 0.22);

    const grad =
      `radial-gradient(circle at var(--mx) var(--my),` +
      ` ${c1} 0%, ${c2} 32%, ${c3} 62%, ${edge} 100%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  --mx: 50%;\n` +
      `  --my: 50%;\n` +
      `  ${clipText(grad)}\n` +
      `  ${dropGlow(glow, [7])}\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default gradientFollow;
