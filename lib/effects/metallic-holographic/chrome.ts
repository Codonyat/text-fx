import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

const chrome: EffectDefinition = {
  id: "chrome",
  name: "Chrome",
  category: "metallic-holographic",
  tags: ["metallic", "chrome", "metal", "shine"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Tint", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({ hue: R.ri(0, 360) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const gradient =
      `linear-gradient(180deg,\n    ${hsl(h, 20, 96)} 0%,\n    ${hsl(h, 26, 78)} 38%,\n` +
      `    ${hsl(h, 38, 42)} 50%,\n    ${hsl(h, 30, 72)} 62%,\n    ${hsl(h, 20, 98)} 100%)`;
    const css =
      `.${ctx.scope} {\n  ${clipText(gradient)}\n  filter: drop-shadow(0 2px 1px rgba(0,0,0,.45));\n}`;
    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default chrome;
