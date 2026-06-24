import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

const rainbowFill: EffectDefinition = {
  id: "rainbow-fill",
  name: "Rainbow Fill",
  category: "gradient-fill",
  tags: ["gradient", "rainbow", "spectrum", "color"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "angle", label: "Angle", type: "angle", default: 90, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "saturation",
      label: "Saturation",
      type: "range",
      default: 90,
      min: 40,
      max: 100,
      step: 1,
      unit: "%",
    },
  ],
  rand: (R) => ({
    angle: R.ri(0, 360),
    saturation: R.ri(70, 100),
  }),
  build: (ctx) => {
    const angle = ctx.values.angle as number;
    const sat = ctx.values.saturation as number;
    // Keep lightness readable on either theme.
    const light = ctx.theme === "dark" ? 62 : 50;

    // Full-spectrum sweep across the hue wheel for a crisp rainbow.
    const stops = 7;
    const colors: string[] = [];
    for (let i = 0; i < stops; i++) {
      const h = Math.round((360 / (stops - 1)) * i) % 360;
      const pct = Math.round((100 / (stops - 1)) * i);
      colors.push(`${hsl(h, sat, light)} ${pct}%`);
    }
    const gradient = `linear-gradient(${angle}deg, ${colors.join(", ")})`;

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

export default rainbowFill;
