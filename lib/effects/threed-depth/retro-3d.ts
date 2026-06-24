import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const retro3d: EffectDefinition = {
  id: "retro-3d",
  name: "Retro 3D",
  category: "threed-depth",
  tags: ["3d", "retro", "80s", "two-tone", "depth", "shadow"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 330, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 8, min: 2, max: 16, step: 1 },
  ],
  rand: (R) => ({
    hue: R.pick([330, 300, 195, 45, 16]),
    depth: R.ri(5, 11),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const n = Math.round(ctx.values.depth as number);

    // Two-tone 80s look: bright face color, complementary saturated shadow color
    // offset straight down-left to fake a chunky extruded slab.
    const face = ctx.theme === "dark" ? hsl(h, 90, 66) : hsl(h, 88, 52);
    const sh = (h + 200) % 360; // near-complementary, the classic retro pairing
    const shadow = ctx.theme === "dark" ? hsl(sh, 80, 50) : hsl(sh, 78, 46);
    const outline = ctx.theme === "dark" ? hsl(h, 25, 12) : hsl(h, 18, 96);

    const dx = -1;
    const dy = 1;
    const layers: string[] = [];
    // First a 1px contrast outline ring so the face pops off the slab.
    layers.push(`1px 0 0 ${outline}`);
    layers.push(`0 1px 0 ${outline}`);
    // Then the solid extruded slab in the second tone.
    for (let i = 1; i <= n; i++) layers.push(`${i * dx}px ${i * dy}px 0 ${shadow}`);
    // A soft ambient drop under the slab to ground it.
    layers.push(`${(n + 1) * dx}px ${n + 3}px 8px rgba(0,0,0,.35)`);

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

export default retro3d;
