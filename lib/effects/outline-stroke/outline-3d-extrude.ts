import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, offsetStack } from "@/lib/engine/helpers";

/**
 * Extruded outline: hollow letters (transparent fill + a coloured stroke) pushed into
 * 3D by a stacked offset shadow in a deeper shade, so the outline itself reads as a
 * chunky block. Distinct from the glow tube and the concentric double outline.
 */
const outline3dExtrude: EffectDefinition = {
  id: "outline-3d-extrude",
  name: "Extruded Outline",
  category: "outline-stroke",
  tags: ["outline", "stroke", "3d", "extrude", "block"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 45, min: 0, max: 360, step: 1, unit: "°" },
    { id: "stroke", label: "Stroke", type: "range", default: 2, min: 1, max: 4, step: 0.5, unit: "px" },
    { id: "depth", label: "Depth", type: "range", default: 8, min: 3, max: 16, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    stroke: R.pick([1.5, 2, 2.5]),
    depth: R.ri(5, 13),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const strokeW = ctx.values.stroke as number;
    const depth = ctx.values.depth as number;

    const face = ctx.theme === "dark" ? hsl(h, 90, 66) : hsl(h, 85, 46);
    const side = ctx.theme === "dark" ? hsl(h, 60, 30) : hsl(h, 55, 56);

    const css =
      `.${ctx.scope} {\n` +
      `  color: transparent;\n` +
      `  -webkit-text-stroke: ${strokeW}px ${face};\n` +
      `  ${offsetStack(side, depth, 1, 1)}\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default outline3dExtrude;
