import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

const goldFoil: EffectDefinition = {
  id: "gold-foil",
  name: "Gold Foil",
  category: "metallic-holographic",
  tags: ["metallic", "gold", "foil", "luxury", "shine"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Tint", type: "range", default: 45, min: 30, max: 60, step: 1, unit: "°" },
    { id: "shine", label: "Shine", type: "range", default: 45, min: 0, max: 100, step: 1, unit: "%" },
  ],
  rand: (R) => ({ hue: R.ri(38, 52), shine: R.ri(30, 60) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const shine = ctx.values.shine as number;
    // Shine widens the bright specular bands and lifts their luminance.
    const k = shine / 100;
    const hiL = Math.round(84 + 14 * k); // brightest highlight band
    const midL = Math.round(40 - 6 * k); // dark trough that sells the metal
    // A vertical foil gradient: bright top, dark waist, glint near the bottom.
    const gradient =
      `linear-gradient(180deg,\n` +
      `    ${hsl(h + 6, 52, hiL)} 0%,\n` +
      `    ${hsl(h, 54, 64)} 26%,\n` +
      `    ${hsl(h - 4, 55, midL)} 50%,\n` +
      `    ${hsl(h, 54, 58)} 64%,\n` +
      `    ${hsl(h + 8, 52, hiL)} 80%,\n` +
      `    ${hsl(h, 53, 50)} 100%)`;
    // Warm halo + a tight dark grounding edge. text-shadow is invisible on
    // transparent-fill text, so both come from the drop-shadow filter stack.
    const halo = hsl(h, 52, 60, 0.35);
    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(gradient)}\n` +
      `  filter: drop-shadow(0 1px 0 ${hsl(h - 6, 60, 28, 0.7)}) ` +
      `drop-shadow(0 0 ${Math.round(2 + 6 * k)}px ${halo});\n` +
      `}`;
    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default goldFoil;
