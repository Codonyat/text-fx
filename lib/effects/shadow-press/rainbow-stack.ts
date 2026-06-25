import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Rainbow stacked shadow: a flat face over a chain of hard offset shadows whose hue
 * walks each step, building a candy-coloured 3D ribbon behind the letters. A
 * playful, multi-hue take on the solid extrude.
 */
const rainbowStack: EffectDefinition = {
  id: "rainbow-stack",
  name: "Rainbow Stack",
  category: "shadow-press",
  tags: ["shadow", "rainbow", "stack", "offset", "3d"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Start Hue", type: "range", default: 0, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 8, min: 3, max: 16, step: 1, unit: "px" },
    { id: "step", label: "Hue Step", type: "range", default: 28, min: 8, max: 60, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    depth: R.ri(5, 13),
    step: R.ri(16, 46),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const depth = ctx.values.depth as number;
    const step = ctx.values.step as number;

    const face = ctx.theme === "dark" ? hsl(h, 18, 96) : hsl(h, 25, 18);
    const sat = ctx.theme === "dark" ? 80 : 70;
    const lum = ctx.theme === "dark" ? 58 : 52;

    const layers: string[] = [];
    for (let i = 1; i <= depth; i++) {
      layers.push(`${i}px ${i}px 0 ${hsl((h + i * step) % 360, sat, lum)}`);
    }

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow: ${layers.join(", ")};\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default rainbowStack;
