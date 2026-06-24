import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const sticker: EffectDefinition = {
  id: "sticker",
  name: "Sticker",
  category: "retro-themed",
  tags: ["sticker", "comic", "cartoon", "outline"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke + paint-order",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 0, min: 0, max: 360, step: 1, unit: "°" },
    { id: "stroke", label: "Outline", type: "range", default: 4, min: 2, max: 8, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({ hue: R.ri(0, 360), stroke: R.pick([3, 4, 5]) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const w = ctx.values.stroke as number;
    const stroke = hsl(h, 85, 55);
    const css =
      `.${ctx.scope} {\n  color: #fff;\n  -webkit-text-stroke: ${w}px ${stroke};\n` +
      `  paint-order: stroke fill;\n  filter: drop-shadow(4px 6px 0 rgba(0,0,0,.28));\n}`;
    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default sticker;
