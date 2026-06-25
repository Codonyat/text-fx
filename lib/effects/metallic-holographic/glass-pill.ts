import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Glass pill: the word set in a frosted glassmorphism chip — a translucent rounded
 * panel with a hairline border, an inset top highlight, a soft drop shadow and a
 * backdrop blur. The "changelog / new feature" badge treatment from modern product UI.
 */
const glassPill: EffectDefinition = {
  id: "glass-pill",
  name: "Glass Pill",
  category: "metallic-holographic",
  tags: ["modern", "glass", "glassmorphism", "pill", "badge", "premium"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Translucent chip with backdrop-filter blur (frosts whatever is behind it)",
  controls: [
    { id: "hue", label: "Tint Hue", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "blur", label: "Frost", type: "range", default: 8, min: 0, max: 18, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    blur: R.ri(5, 14),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const blur = ctx.values.blur as number;
    const dark = ctx.theme === "dark";

    const textColor = dark ? hsl(h, 18, 94) : hsl(h, 24, 18);
    const g1 = dark ? hsl(h, 30, 100, 0.1) : hsl(h, 30, 24, 0.06);
    const g2 = dark ? hsl(h, 30, 100, 0.03) : hsl(h, 30, 24, 0.02);
    const border = dark ? hsl(h, 40, 100, 0.2) : hsl(h, 30, 22, 0.16);
    const innerHi = dark ? "hsl(0 0% 100% / 0.16)" : "hsl(0 0% 100% / 0.7)";
    const drop = dark ? hsl(h, 40, 4, 0.4) : hsl(h, 30, 40, 0.18);

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  padding: 0.3em 0.72em;\n` +
      `  border-radius: 0.55em;\n` +
      `  color: ${textColor};\n` +
      `  background: linear-gradient(180deg, ${g1}, ${g2});\n` +
      `  border: 1px solid ${border};\n` +
      `  box-shadow: inset 0 1px 0 ${innerHi}, 0 10px 30px ${drop};\n` +
      `  -webkit-backdrop-filter: blur(${blur}px);\n` +
      `  backdrop-filter: blur(${blur}px);\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default glassPill;
