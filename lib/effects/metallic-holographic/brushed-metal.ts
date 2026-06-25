import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Brushed metal: a tintable vertical metal gradient (light bands top and bottom,
 * shadowed middle) overlaid with fine vertical striations, clipped to the glyphs.
 * A matte machined-aluminium finish — distinct from the glossy chrome bevel.
 */
const brushedMetal: EffectDefinition = {
  id: "brushed-metal",
  name: "Brushed Metal",
  category: "metallic-holographic",
  tags: ["metal", "brushed", "aluminium", "matte", "metallic"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + metal gradient with repeating striations",
  controls: [
    { id: "hue", label: "Tint", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    { id: "sat", label: "Tint Strength", type: "range", default: 12, min: 0, max: 40, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    sat: R.ri(4, 26),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const s = ctx.values.sat as number;
    const dark = ctx.theme === "dark";

    const hi = hsl(h, s, dark ? 92 : 86);
    const mid = hsl(h, s, dark ? 52 : 46);
    const lo = hsl(h, s, dark ? 70 : 64);
    const cast = hsl(h, 30, dark ? 6 : 40, 0.4);

    // Vertical specular ramp + fine vertical brush lines.
    const ramp = `linear-gradient(180deg, ${hi} 0%, ${mid} 34%, ${lo} 52%, ${mid} 70%, ${hi} 100%)`;
    const brush =
      `repeating-linear-gradient(90deg,` +
      ` hsl(0 0% 100% / 0.06) 0 1px, hsl(0 0% 0% / 0.05) 1px 2px, transparent 2px 4px)`;

    const css =
      `.${ctx.scope} {\n` +
      `  background: ${brush}, ${ramp};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  filter: drop-shadow(0 2px 1px ${cast});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default brushedMetal;
