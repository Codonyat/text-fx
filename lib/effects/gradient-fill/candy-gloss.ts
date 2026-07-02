import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText, round } from "@/lib/engine/helpers";

const candyGloss: EffectDefinition = {
  id: "candy-gloss",
  name: "Candy Gloss",
  category: "gradient-fill",
  tags: ["gradient", "candy", "glossy", "gummy", "juicy", "saturated", "color"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Candy Hue", type: "range", default: 340, min: 0, max: 360, step: 1, unit: "°" },
    { id: "gloss", label: "Gloss", type: "range", default: 55, min: 10, max: 100, step: 1, unit: "%" },
    { id: "strokeOn", label: "Stroke", type: "toggle", default: true, onLabel: "On", offLabel: "Off" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    gloss: R.ri(35, 80),
    strokeOn: R.chance(0.75),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const gloss = ctx.values.gloss as number;
    const strokeOn = ctx.values.strokeOn as boolean;
    const g = gloss / 100;

    // Wet hard-candy shell: saturation stays very high top-to-bottom (no gray/silver
    // ramp — that would read metallic) while lightness sweeps bright sugary top to a
    // deep juicy base.
    const topL = ctx.theme === "dark" ? 74 : 70;
    const midL = ctx.theme === "dark" ? 50 : 45;
    const botL = ctx.theme === "dark" ? 30 : 25;
    const base =
      `linear-gradient(180deg,\n` +
      `    ${hsl(h, 90, topL)} 0%,\n` +
      `    ${hsl(h, 95, midL)} 55%,\n` +
      `    ${hsl(h + 4, 88, botL)} 100%)`;

    // Soft-edged specular band across the upper third: a white highlight layer,
    // painted above the base gradient and clipped to the same glyphs — the classic
    // hard-candy/gummy "wet" gloss. Gloss strength widens & brightens the band.
    const hiA = round(0.3 + 0.55 * g, 2);
    const midA = round(0.12 + 0.28 * g, 2);
    const reach = round(28 + 12 * g, 0);
    const highlight =
      `linear-gradient(180deg,\n` +
      `    rgba(255,255,255,${hiA}) 0%,\n` +
      `    rgba(255,255,255,${midA}) 15%,\n` +
      `    rgba(255,255,255,0) ${reach}%)`;
    const layered = `${highlight},\n    ${base}`;

    // Thin darker stroke to "contain the juice" — a deep, still-saturated shade of
    // the same hue, never black/gray, so the candy read holds.
    const strokeColor = hsl(h - 2, 80, 15);
    const strokeLine = strokeOn ? `  -webkit-text-stroke: 0.035em ${strokeColor};\n` : "";

    // Filter (never text-shadow — the fill is transparent under background-clip:text):
    // a hairline contact line plus a soft, tight lift shadow for a bit of dimension.
    const contact = hsl(h - 6, 70, 12, 0.55);
    const lift = ctx.theme === "dark" ? "rgba(0,0,0,.42)" : "rgba(0,0,0,.26)";

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(layered)}\n` +
      strokeLine +
      `  filter: drop-shadow(0 1px 0 ${contact}) drop-shadow(0 4px 5px ${lift});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default candyGloss;
