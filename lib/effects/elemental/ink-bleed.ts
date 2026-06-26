import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, round } from "@/lib/engine/helpers";

/**
 * Ink bleed: solid ink that has soaked a little way into absorbent paper. An
 * feMorphology dilate fattens the glyphs, a turbulence-fed feDisplacementMap frays
 * the edge into capillary fingers, and a small blur feathers it — letters stay
 * separate (unlike the metaball fusion of Gooey) and settled (unlike the dripping
 * Melt Drip or the punched-out holes of Distress Stamp). A faint same-ink text-shadow
 * sells the soak into the page. Static; filter id salted, seeds fixed (parity-safe).
 */
const inkBleed: EffectDefinition = {
  id: "ink-bleed",
  name: "Ink Bleed",
  category: "elemental",
  tags: ["ink", "bleed", "paper", "print", "svg", "filter"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "SVG feMorphology + feDisplacementMap + feGaussianBlur via filter:url(#…)",
  controls: [
    { id: "hue", label: "Ink Hue", type: "range", default: 222, min: 0, max: 360, step: 1, unit: "°" },
    { id: "bleed", label: "Bleed", type: "range", default: 0.8, min: 0.2, max: 2.4, step: 0.1, unit: "px" },
    { id: "rough", label: "Feather", type: "range", default: 3, min: 1, max: 7, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    bleed: Number(R.rnd(0.5, 1.4).toFixed(1)),
    rough: R.ri(2, 5),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const bleed = ctx.values.bleed as number;
    const rough = ctx.values.rough as number;
    const feather = round(bleed * 1.1, 2);

    // Deep, slightly desaturated ink that reads on either paper.
    const ink = ctx.theme === "dark" ? hsl(h, 38, 72) : hsl(h, 55, 26);
    const soak = ctx.theme === "dark" ? hsl(h, 45, 60, 0.5) : hsl(h, 50, 32, 0.45);
    const fid = svgId(ctx.scope, "bleed");

    // dilate (spread) -> displace with fine noise (ragged capillary edge) -> light
    // blur (feather). Order keeps letterforms intact while wetting their outline.
    const defs =
      `<filter id="${fid}" x="-25%" y="-25%" width="150%" height="150%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.06 0.07" numOctaves="2" seed="11" result="n"/>\n` +
      `  <feMorphology in="SourceGraphic" operator="dilate" radius="${bleed}" result="fat"/>\n` +
      `  <feDisplacementMap in="fat" in2="n" scale="${rough}" xChannelSelector="R" yChannelSelector="G" result="ragged"/>\n` +
      `  <feGaussianBlur in="ragged" stdDeviation="${feather}"/>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${ink};\n` +
      `  filter: url(#${fid});\n` +
      `  text-shadow: 0 0 ${round(feather * 2, 1)}px ${soak};\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      defs,
    };
  },
};

export default inkBleed;
