import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Western wood: a saloon-sign plank — a vertical light-to-dark wood ramp overlaid
 * with fine vertical grain lines, clipped to the glyphs, with a thin carved edge and
 * a grounding shadow. Static.
 */
const westernWood: EffectDefinition = {
  id: "western-wood",
  name: "Western Wood",
  category: "retro-themed",
  tags: ["wood", "western", "saloon", "plank", "grain"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + wood ramp with grain striations",
  controls: [
    { id: "hue", label: "Wood Tone", type: "range", default: 28, min: 10, max: 45, step: 1, unit: "°" },
    { id: "grain", label: "Grain", type: "range", default: 4, min: 2, max: 9, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(16, 40),
    grain: R.ri(3, 7),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const grain = ctx.values.grain as number;
    const dark = ctx.theme === "dark";

    const light = hsl(h, 48, dark ? 56 : 50);
    const mid = hsl(h, 52, dark ? 40 : 36);
    const deep = hsl(h, 58, dark ? 26 : 24);
    const edge = hsl(h, 60, 16);
    const cast = hsl(h, 50, dark ? 6 : 30, 0.45);

    const grainLines =
      `repeating-linear-gradient(88deg,` +
      ` transparent 0 ${grain}px, hsl(0 0% 0% / 0.14) ${grain}px ${grain + 1}px)`;
    const plank = `linear-gradient(180deg, ${light} 0%, ${mid} 45%, ${deep} 72%, ${mid} 100%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  background: ${grainLines}, ${plank};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-stroke: 0.5px ${edge};\n` +
      `  filter: drop-shadow(0 3px 2px ${cast});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default westernWood;
