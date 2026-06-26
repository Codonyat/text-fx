import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

/**
 * Crystalline ice: glyphs filled with a cool light-blue vertical gradient
 * (background-clip:text), edged with a thin frosty stroke and lit by a single
 * restrained cold drop-shadow glow. Gradient/transparent fill -> glow MUST be a
 * filter: drop-shadow(), never text-shadow (it would be invisible). Static.
 */
const ice: EffectDefinition = {
  id: "ice",
  name: "Ice",
  category: "elemental",
  tags: ["ice", "frost", "crystal", "cold", "gradient", "elemental"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + -webkit-text-stroke (all modern, -webkit- prefixed)",
  controls: [
    {
      id: "hue",
      label: "Hue",
      type: "range",
      default: 200,
      min: 180,
      max: 220,
      step: 1,
      unit: "°",
    },
  ],
  rand: (R) => ({ hue: R.ri(188, 214) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;

    // Frosty highlight at the top fading to a deeper glacial blue below.
    const top = ctx.theme === "dark" ? hsl(h, 60, 96) : hsl(h, 70, 88);
    const mid = hsl(h, 80, 78);
    const bottom = hsl(h, 85, 60);

    const stroke = ctx.theme === "dark" ? hsl(h, 40, 100, 0.55) : hsl(h, 55, 100, 0.85);
    const glow = hsl(h, 90, 70, 0.35);

    // Single restrained cold glow. On gradient/clipped text only
    // filter: drop-shadow() is visible (text-shadow would be invisible).
    const coldGlow = `filter: drop-shadow(0 0 6px ${glow});`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(`linear-gradient(180deg, ${top} 0%, ${mid} 45%, ${bottom} 100%)`)}\n` +
      `  -webkit-text-stroke: 1px ${stroke};\n` +
      `  ${coldGlow}\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default ice;
