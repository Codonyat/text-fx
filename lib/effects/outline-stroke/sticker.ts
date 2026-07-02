import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const sticker: EffectDefinition = {
  id: "sticker",
  name: "Sticker",
  category: "outline-stroke",
  tags: ["outline", "stroke", "sticker", "die-cut", "bold"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke + paint-order (all modern, prefixed)",
  controls: [
    { id: "fillHue", label: "Fill Hue", type: "range", default: 340, min: 0, max: 360, step: 1, unit: "°" },
    { id: "fillSat", label: "Fill Saturation", type: "range", default: 20, min: 0, max: 100, step: 1, unit: "%" },
    { id: "borderWidth", label: "Border", type: "range", default: 6, min: 3, max: 12, step: 0.5, unit: "px" },
    { id: "offset", label: "Shadow Offset", type: "range", default: 8, min: 2, max: 16, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    fillHue: R.ri(0, 360),
    fillSat: R.ri(0, 85),
    borderWidth: R.pick([4, 5, 6, 7, 8, 9]),
    offset: R.ri(4, 12),
  }),
  build: (ctx) => {
    const fh = ctx.values.fillHue as number;
    const fs = ctx.values.fillSat as number;
    const bw = ctx.values.borderWidth as number;
    const o = ctx.values.offset as number;
    // Fill: bright and saturated on dark stages, deeper/inkier on light stages so it
    // never washes out against the pale page — at low fillSat it reads as an
    // off-white/grey vinyl fill on both themes, at high fillSat it's a vivid hue-tint.
    const fill = ctx.theme === "dark" ? hsl(fh, fs, 78) : hsl(fh, fs, 40);
    // Border: the die-cut vinyl edge — near-white on dark stages (pops like a sticker
    // under a work light), near-black on light stages (reads as a bold cut outline).
    // A whisper of the fill hue keeps it from feeling like flat grayscale.
    const border = ctx.theme === "dark" ? hsl(fh, 14, 97) : hsl(fh, 20, 10);
    // Shadow: a neutral, zero-blur hard drop tied loosely to the fill hue so the whole
    // sticker reads as one physical object sitting on the page (no colored glow — a
    // real cast shadow, not a light source).
    const shadow = ctx.theme === "dark" ? hsl(fh, 18, 20) : hsl(fh, 18, 16);
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${fill};\n` +
      `  -webkit-text-fill-color: ${fill};\n` +
      `  -webkit-text-stroke: ${bw}px ${border};\n` +
      // paint-order keeps the fat border outside the fill so it reads as a die-cut
      // edge instead of eating into the letterforms.
      `  paint-order: stroke fill;\n` +
      `  text-shadow: ${o}px ${o}px 0 ${shadow};\n` +
      `}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default sticker;
