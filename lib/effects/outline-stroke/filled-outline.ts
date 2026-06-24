import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const filledOutline: EffectDefinition = {
  id: "filled-outline",
  name: "Filled Outline",
  category: "outline-stroke",
  tags: ["outline", "stroke", "filled", "bordered"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke + paint-order (all modern, prefixed)",
  controls: [
    { id: "fillHue", label: "Fill Hue", type: "range", default: 48, min: 0, max: 360, step: 1, unit: "°" },
    { id: "strokeHue", label: "Stroke Hue", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "width", label: "Stroke", type: "range", default: 2.5, min: 0.5, max: 7, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({
    fillHue: R.ri(0, 360),
    strokeHue: R.ri(0, 360),
    width: R.pick([1.5, 2, 2.5, 3, 4]),
  }),
  build: (ctx) => {
    const fh = ctx.values.fillHue as number;
    const sh = ctx.values.strokeHue as number;
    const w = ctx.values.width as number;
    // Fill reads bright on dark, deep on light; stroke contrasts in lightness so
    // the border stays legible against the fill regardless of the chosen hues.
    const fill = ctx.theme === "dark" ? hsl(fh, 92, 62) : hsl(fh, 88, 48);
    const stroke = ctx.theme === "dark" ? hsl(sh, 80, 22) : hsl(sh, 85, 30);
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${fill};\n` +
      `  -webkit-text-fill-color: ${fill};\n` +
      `  -webkit-text-stroke: ${w}px ${stroke};\n` +
      // paint-order keeps the stroke outside the fill so thick widths don't eat
      // into the letterforms.
      `  paint-order: stroke fill;\n}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default filledOutline;
