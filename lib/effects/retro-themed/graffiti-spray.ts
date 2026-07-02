import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId } from "@/lib/engine/helpers";

/**
 * Graffiti spray-paint: street-art block lettering — a vivid saturated fill wrapped in
 * a thick contrasting keyline (block-fill + keyline look), with the glyph edges roughed
 * up by a subtle SVG feTurbulence/feDisplacementMap so they fray like aerosol on a wall
 * (spray, not print grunge). A blurred data-text copy mists a soft overspray halo in a
 * second colour around the letters, and an optional masked ::after strip runs wet paint
 * drips off their bottoms. Static; the filter/prop ids are salted and the turbulence seed
 * is fixed so renders stay deterministic (parity-safe).
 */
const graffitiSpray: EffectDefinition = {
  id: "graffiti-spray",
  name: "Graffiti Spray",
  category: "retro-themed",
  tags: ["graffiti", "spray", "street-art", "paint", "svg", "filter", "retro"],
  caps: ["svgDefs", "dataText"],
  pngSupport: "partial",
  supports:
    "SVG feDisplacementMap edge-roughen + data-text overspray/drip copies + -webkit-text-stroke keyline",
  controls: [
    { id: "fillHue", label: "Fill", type: "range", default: 330, min: 0, max: 360, step: 1, unit: "°" },
    { id: "oversprayHue", label: "Overspray", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "drips", label: "Drips", type: "toggle", default: true, onLabel: "ON", offLabel: "OFF" },
  ],
  rand: (R) => {
    const fillHue = R.ri(0, 360);
    // Overspray sits well off the fill hue so the mist reads as a second colour.
    const oversprayHue = (fillHue + R.pick([150, 165, 180, 200])) % 360;
    return { fillHue, oversprayHue, drips: R.chance(0.7) };
  },
  build: (ctx) => {
    const fh = ctx.values.fillHue as number;
    const oh = ctx.values.oversprayHue as number;
    const drips = ctx.values.drips as boolean;

    const dark = ctx.theme === "dark";
    // Vivid block fill; a near-white keyline on the dark stage / near-black on light so
    // the thick outline stays legible against both the fill and the background.
    const fill = dark ? hsl(fh, 92, 60) : hsl(fh, 88, 50);
    const keyline = dark ? hsl(0, 0, 96) : hsl(0, 0, 10);
    // Saturated overspray reads as a mist behind the letters on either paper.
    const overspray = dark ? hsl(oh, 95, 62) : hsl(oh, 85, 52);
    // Wetter, deeper shade of the fill for the running drips.
    const drip = dark ? hsl(fh, 92, 50) : hsl(fh, 85, 42);

    const strokeW = 4;
    const fid = svgId(ctx.scope, "spray");

    // Fine, low-amplitude turbulence = aerosol edge fray, not torn print grunge. Fixed
    // seed keeps every render identical (parity-safe). Generous region so the blurred
    // halo + translated drips are not clipped by the filter box.
    const defs =
      `<filter id="${fid}" x="-35%" y="-35%" width="170%" height="185%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="2" seed="4" result="n"/>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G"/>\n` +
      `</filter>`;

    let css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${fill};\n` +
      `  -webkit-text-fill-color: ${fill};\n` +
      `  -webkit-text-stroke: ${strokeW}px ${keyline};\n` +
      // paint-order keeps the thick keyline outside the fill so it doesn't eat the faces.
      `  paint-order: stroke fill;\n` +
      `  filter: url(#${fid});\n` +
      `}\n` +
      // Overspray halo: a blurred, slightly enlarged copy behind the letters.
      `.${ctx.scope}::before {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  z-index: -1;\n` +
      `  color: ${overspray};\n` +
      `  -webkit-text-fill-color: ${overspray};\n` +
      `  -webkit-text-stroke: 0;\n` +
      `  filter: blur(7px);\n` +
      `  transform: scale(1.09);\n` +
      `  pointer-events: none;\n` +
      `}`;

    if (drips) {
      // A copy masked to its lower edge and nudged down: paint that ran off the glyphs.
      const mask = `linear-gradient(to bottom, transparent 72%, #000 90%)`;
      css +=
        `\n.${ctx.scope}::after {\n` +
        `  content: attr(data-text);\n` +
        `  position: absolute;\n` +
        `  inset: 0;\n` +
        `  z-index: -1;\n` +
        `  color: ${drip};\n` +
        `  -webkit-text-fill-color: ${drip};\n` +
        `  -webkit-text-stroke: 0;\n` +
        `  -webkit-mask-image: ${mask};\n` +
        `  mask-image: ${mask};\n` +
        `  transform: translateY(0.22em);\n` +
        `  pointer-events: none;\n` +
        `}`;
    }

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      defs,
    };
  },
};

export default graffitiSpray;
