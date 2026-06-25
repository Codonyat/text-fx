import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, offsetStack } from "@/lib/engine/helpers";

/**
 * Perspective tilt: the word leans back into the page on a CSS 3D perspective, with
 * a stacked offset shadow extruding toward the viewer so it reads as a solid slab
 * receding in space. Static.
 */
const perspectiveTilt: EffectDefinition = {
  id: "perspective-tilt",
  name: "Perspective Tilt",
  category: "threed-depth",
  tags: ["3d", "perspective", "tilt", "depth", "rotate"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    { id: "tiltX", label: "Tilt X", type: "range", default: 28, min: -45, max: 45, step: 1, unit: "°" },
    { id: "tiltY", label: "Tilt Y", type: "range", default: -22, min: -45, max: 45, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 8, min: 2, max: 16, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    tiltX: R.ri(10, 38),
    tiltY: R.ri(-35, 35),
    depth: R.ri(5, 13),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const tiltX = ctx.values.tiltX as number;
    const tiltY = ctx.values.tiltY as number;
    const depth = ctx.values.depth as number;

    const face = ctx.theme === "dark" ? hsl(h, 70, 72) : hsl(h, 70, 46);
    const side = ctx.theme === "dark" ? hsl(h, 50, 30) : hsl(h, 45, 58);

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  color: ${face};\n` +
      `  transform: perspective(520px) rotateX(${tiltX}deg) rotateY(${tiltY}deg);\n` +
      `  transform-style: preserve-3d;\n` +
      `  ${offsetStack(side, depth, -1, 1)}\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default perspectiveTilt;
