import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

/**
 * Halation: the warm photographic bloom that high-contrast type picks up on film —
 * a soft red-orange edge bleed haloing the letters, not the hot monochrome ring of a
 * neon tube. The fill stays bright and crisp; concentric warm text-shadow layers (the
 * inner ones tighter and hotter, the outer ones wide and faint) do the blooming.
 * Solid fill, so text-shadow is the right tool. Static — a restrained, cinematic glow.
 */
const halation: EffectDefinition = {
  id: "halation",
  name: "Halation",
  category: "neon-glow",
  tags: ["glow", "halation", "bloom", "film", "cinematic", "soft"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 18, min: 0, max: 360, step: 1, unit: "°" },
    { id: "bloom", label: "Bloom", type: "range", default: 18, min: 6, max: 44, step: 1, unit: "px" },
    { id: "intensity", label: "Intensity", type: "range", default: 0.7, min: 0.25, max: 1, step: 0.05 },
  ],
  rand: (R) => ({
    // Bias toward warm hues where halation reads as film bloom, not neon.
    hue: R.chance(0.75) ? R.ri(6, 44) : R.ri(0, 360),
    bloom: R.ri(12, 30),
    intensity: Number(R.rnd(0.55, 0.9).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const b = ctx.values.bloom as number;
    const a = ctx.values.intensity as number;

    // Bright, near-clipped fill (the highlight the bloom radiates from).
    const txt = ctx.theme === "dark" ? hsl(h, 45, 92) : hsl(h, 72, 44);
    // Warm halo: a hot tight core, then progressively wider/fainter, with a slight
    // hue drift across the layers so the bloom feels chromatic rather than flat.
    const hot = hsl(h + 6, 95, 66, a);
    const mid = hsl(h - 6, 92, 58, round(a * 0.8));
    const wide = hsl(h + 12, 95, 60, round(a * 0.45));
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  text-shadow:\n` +
      `    0 0 ${round(b * 0.35, 1)}px ${hot},\n` +
      `    0 0 ${round(b * 0.9, 1)}px ${mid},\n` +
      `    0 0 ${round(b * 1.8, 1)}px ${wide},\n` +
      `    0 0 ${round(b * 3, 1)}px ${wide};\n` +
      `}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default halation;
