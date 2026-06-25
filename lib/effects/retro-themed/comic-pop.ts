import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, offsetStack } from "@/lib/engine/helpers";

/**
 * Comic-book pop: a bright solid fill with a heavy ink outline (paint-order so the
 * stroke sits under the fill) and a chained ink offset that reads as a chunky
 * cartoon depth. Distinct from sticker (single hard shadow) and retro-3d (slab).
 */
const comicPop: EffectDefinition = {
  id: "comic-pop",
  name: "Comic Pop",
  category: "retro-themed",
  tags: ["comic", "cartoon", "outline", "pop", "bold"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Fill Hue", type: "range", default: 50, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 6, min: 2, max: 12, step: 1, unit: "px" },
    { id: "stroke", label: "Ink", type: "range", default: 3, min: 1, max: 6, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    depth: R.ri(4, 10),
    stroke: R.pick([2, 2.5, 3, 3.5, 4]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const depth = ctx.values.depth as number;
    const stroke = ctx.values.stroke as number;

    // Bright cartoon fill; ink stays near-black on both themes (comic convention).
    const fill = ctx.theme === "dark" ? hsl(h, 95, 62) : hsl(h, 92, 55);
    const ink = ctx.theme === "dark" ? hsl(h, 40, 8) : hsl(h, 50, 10);

    // Chained ink offset down-right gives the chunky comic depth (paint-order
    // keeps the outline behind the fill so the face stays crisp).
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${fill};\n` +
      `  -webkit-text-stroke: ${stroke}px ${ink};\n` +
      `  paint-order: stroke fill;\n` +
      `  ${offsetStack(ink, depth, 1, 1)}\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default comicPop;
