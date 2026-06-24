import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const isometric3d: EffectDefinition = {
  id: "isometric-3d",
  name: "Isometric 3D",
  category: "threed-depth",
  tags: ["3d", "isometric", "extrude", "depth", "shadow"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 265, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 16, min: 4, max: 32, step: 1 },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    depth: R.ri(10, 24),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const n = Math.round(ctx.values.depth as number);

    // Fixed isometric direction: classic 2:1 pixel-art iso (~26.57deg), extruding
    // to the lower-right. Each layer steps 2px across for every 1px down.
    const dx = 2;
    const dy = 1;

    const face = ctx.theme === "dark" ? hsl(h, 70, 70) : hsl(h, 65, 52);
    // Walk the extrude from a mid tone down to a dark base so the side face has
    // a subtle iso gradient (top edge lighter than the grounded bottom).
    const topL = ctx.theme === "dark" ? 46 : 50;
    const botL = ctx.theme === "dark" ? 24 : 32;

    const layers: string[] = [];
    for (let i = 1; i <= n; i++) {
      const t = n === 1 ? 0 : (i - 1) / (n - 1);
      const l = Number((topL + (botL - topL) * t).toFixed(1));
      const sideColor = hsl(h, 55, l);
      layers.push(`${i * dx}px ${i * dy}px 0 ${sideColor}`);
    }
    // Contact shadow beyond the extrude tip to anchor the block in space.
    layers.push(`${(n + 1) * dx}px ${(n + 1) * dy}px 10px rgba(0,0,0,.4)`);

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow:\n    ${layers.join(",\n    ")};\n}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default isometric3d;
