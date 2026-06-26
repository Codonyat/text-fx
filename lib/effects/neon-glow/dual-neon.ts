import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const dualNeon: EffectDefinition = {
  id: "dual-neon",
  name: "Dual Neon",
  category: "neon-glow",
  tags: ["neon", "glow", "dual", "two-tone", "complementary"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Inner Hue", type: "range", default: 300, min: 0, max: 360, step: 1, unit: "°" },
    { id: "split", label: "Split", type: "range", default: 40, min: 20, max: 60, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    split: R.ri(30, 50),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const split = ctx.values.split as number;
    const outerHue = (h + split) % 360;
    const txt = ctx.theme === "dark" ? hsl(h, 40, 96) : hsl(h, 90, 50);
    const inner = hsl(h, 55, 62);
    const outer = hsl(outerHue, 55, 58);
    // Inner tight halo in the base hue, outer wide halo in the split (often
    // complementary) hue — two distinct neon tubes bleeding into one another.
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  text-shadow:\n` +
      `    0 0 3px ${inner},\n` +
      `    0 0 8px ${inner},\n` +
      `    0 0 16px ${inner},\n` +
      `    0 0 24px ${outer},\n` +
      `    0 0 40px ${outer},\n` +
      `    0 0 56px ${outer};\n}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default dualNeon;
