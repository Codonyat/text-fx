import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Paper-craft depth: stacked offset layers in graduated paper tones (light face
 * down to a deeper edge) plus one soft drop-shadow that lifts the whole cut-out
 * off the page. Distinct from the solid single-colour extrude.
 */
const paperCutout: EffectDefinition = {
  id: "paper-cutout",
  name: "Paper Cutout",
  category: "threed-depth",
  tags: ["paper", "craft", "cutout", "layered", "depth", "3d"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Paper Hue", type: "range", default: 28, min: 0, max: 360, step: 1, unit: "°" },
    { id: "layers", label: "Layers", type: "range", default: 6, min: 2, max: 12, step: 1 },
    { id: "offset", label: "Step", type: "range", default: 2, min: 1, max: 5, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    layers: R.ri(4, 9),
    offset: R.pick([1.5, 2, 2.5, 3]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const layers = ctx.values.layers as number;
    const off = ctx.values.offset as number;

    // Face is the lightest paper; each layer steps a little darker toward the cut edge.
    const L0 = ctx.theme === "dark" ? 86 : 58;
    const L1 = ctx.theme === "dark" ? 50 : 28;
    const face = hsl(h, 40, ctx.theme === "dark" ? 93 : 66);

    const steps: string[] = [];
    for (let i = 1; i <= layers; i++) {
      const t = layers === 1 ? 0 : (i - 1) / (layers - 1);
      const L = Math.round(L0 + (L1 - L0) * t);
      const d = (i * off).toFixed(1);
      steps.push(`${d}px ${d}px 0 ${hsl(h, 38, L)}`);
    }

    // Soft cast under the whole stack for the lifted-paper feel (drop-shadow, not
    // a text-shadow layer, so it blurs cleanly under every cut-out tone).
    const reach = Math.round(off * layers);
    const cast = hsl(h, 30, ctx.theme === "dark" ? 6 : 32, 0.45);

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow: ${steps.join(", ")};\n` +
      `  filter: drop-shadow(${Math.round(reach * 0.6)}px ${reach}px ${Math.round(reach * 0.8)}px ${cast});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default paperCutout;
