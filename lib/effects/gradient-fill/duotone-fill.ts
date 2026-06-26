import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

const duotoneFill: EffectDefinition = {
  id: "duotone-fill",
  name: "Duotone Fill",
  category: "gradient-fill",
  tags: ["gradient", "duotone", "two-tone", "hard-stop", "color"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 330, min: 0, max: 360, step: 1, unit: "°" },
    { id: "angle", label: "Angle", type: "angle", default: 135, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "spread",
      label: "Spread",
      type: "range",
      default: 50,
      min: 20,
      max: 80,
      step: 1,
      unit: "%",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    angle: R.pick([0, 45, 90, 135, 180]),
    spread: R.ri(35, 65),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const angle = ctx.values.angle as number;
    const spread = ctx.values.spread as number;

    // Two analogous tones; nudge lightness so both read on the theme.
    const h2 = (h + 35) % 360;
    const l1 = ctx.theme === "dark" ? 66 : 52;
    const l2 = ctx.theme === "dark" ? 58 : 46;
    const c1 = hsl(h, 60, l1);
    const c2 = hsl(h2, 60, l2);

    // Hard stop: both colors meet at the same position for a crisp split.
    const gradient =
      `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${spread}%, ${c2} ${spread}%, ${c2} 100%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(gradient)}\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default duotoneFill;
