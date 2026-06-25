import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

/**
 * Frosted glass: a translucent glassy fill (bright top fading to a cooler base),
 * edged with a thin light stroke and wrapped in a soft frosty halo. A cool
 * glassmorphism sheen — theme-aware so it reads on light or dark. Static.
 */
const glassFrost: EffectDefinition = {
  id: "glass-frost",
  name: "Frosted Glass",
  category: "metallic-holographic",
  tags: ["glass", "frosted", "glassmorphism", "translucent", "sheen"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text translucent gradient + light stroke + frost halo",
  controls: [
    { id: "hue", label: "Tint", type: "range", default: 205, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const dark = ctx.theme === "dark";

    const g1 = dark ? hsl(h, 30, 94, 0.92) : hsl(h, 38, 58, 0.9);
    const g2 = dark ? hsl(h, 36, 76, 0.5) : hsl(h, 42, 40, 0.55);
    const stroke = dark ? hsl(h, 45, 100, 0.55) : hsl(h, 45, 28, 0.5);
    const halo = hsl(h, 60, dark ? 82 : 60, 0.4);

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(`linear-gradient(180deg, ${g1} 0%, ${g2} 100%)`)}\n` +
      `  -webkit-text-stroke: 0.5px ${stroke};\n` +
      `  filter: drop-shadow(0 1px 4px ${halo}) drop-shadow(0 0 1px ${halo});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default glassFrost;
