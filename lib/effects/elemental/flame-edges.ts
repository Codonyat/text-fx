import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, clipText, round } from "@/lib/engine/helpers";

/**
 * Flame edges: the glyph contours WRITHE like live fire. An SVG feTurbulence
 * (type "turbulence", high-frequency, anisotropic toward vertical) drives a
 * feDisplacementMap whose SMIL <animate> boils the noise and surges the
 * displacement — fast, sharp flame tongues, not liquid-warp's slow underwater
 * wobble. The letters are filled with a vertical fire gradient (deep-red base →
 * orange → white-yellow tips) clipped to text, wrapped in a warm drop-shadow
 * glow (glow guard). hue-shift walks the whole palette from fire to blue-flame.
 */
const flameEdges: EffectDefinition = {
  id: "flame-edges",
  name: "Flame Edges",
  category: "elemental",
  tags: ["fire", "flame", "turbulence", "svg", "displacement", "animated", "elemental"],
  caps: ["pure", "svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence + feDisplacementMap (SMIL-animated) over background-clip:text",
  controls: [
    { id: "heat", label: "Heat", type: "range", default: 9, min: 4, max: 22, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 1.6,
      min: 0.8,
      max: 4,
      step: 0.1,
      unit: "s",
    },
    { id: "hueShift", label: "Fire → Blue", type: "range", default: 0, min: 0, max: 200, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    heat: R.ri(7, 13),
    speed: Number(R.rnd(1.1, 2.2).toFixed(1)),
    // Mostly classic fire; occasionally a cool blue flame.
    hueShift: R.chance(0.22) ? R.ri(165, 200) : R.ri(0, 14),
  }),
  build: (ctx) => {
    const heat = ctx.values.heat as number;
    const speed = ctx.values.speed as number;
    const h = ctx.values.hueShift as number;
    const dark = ctx.theme === "dark";

    // Fire palette anchored on warm hues; hue-shift slides the whole ramp toward
    // cyan/blue so the same stops read as a blue flame. Tips stay near-white on
    // dark, drop to a saturated gold on light so they don't wash out.
    const core = hsl((50 + h) % 360, dark ? 94 : 96, dark ? 95 : 62);
    const yellow = hsl((44 + h) % 360, 100, dark ? 62 : 52);
    const orange = hsl((26 + h) % 360, 100, dark ? 55 : 48);
    const deep = hsl((6 + h) % 360, dark ? 90 : 86, dark ? 33 : 40);
    const glow = hsl((26 + h) % 360, 100, 55, dark ? 0.5 : 0.32);

    // Rising fire: deep-red base at the bottom, white-yellow licking tips at top.
    const gradient =
      `linear-gradient(to top, ${deep} 0%, ${orange} 34%, ${yellow} 66%, ${core} 100%)`;

    const fid = svgId(ctx.scope, "flame");
    const seed = 4;
    const dur = speed.toFixed(2);
    // Sharp, fine, vertically-biased turbulence (higher Y freq = flame tongues);
    // it breathes between two frequency states while the seed boils the field.
    const bf1 = "0.018 0.042";
    const bf2 = "0.03 0.062";
    const scaleHi = heat;
    const scaleLo = round(heat * 0.5, 1);

    const defs =
      `<filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%">\n` +
      `  <feTurbulence type="turbulence" baseFrequency="${bf1}" numOctaves="3" seed="${seed}" result="noise">\n` +
      `    <animate attributeName="baseFrequency" dur="${dur}s" ` +
      `values="${bf1};${bf2};${bf1}" repeatCount="indefinite"/>\n` +
      `    <animate attributeName="seed" dur="${dur}s" ` +
      `values="${seed};${seed + 8};${seed}" repeatCount="indefinite"/>\n` +
      `  </feTurbulence>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scaleHi}" ` +
      `xChannelSelector="R" yChannelSelector="G">\n` +
      `    <animate attributeName="scale" dur="${dur}s" ` +
      `values="${scaleLo};${scaleHi};${scaleLo}" repeatCount="indefinite"/>\n` +
      `  </feDisplacementMap>\n` +
      `</filter>`;

    const g1 = round(6 + heat * 0.4, 1);
    const g2 = round(14 + heat * 0.7, 1);

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(gradient)}\n` +
      `  filter: url(#${fid}) drop-shadow(0 0 ${g1}px ${glow}) drop-shadow(0 0 ${g2}px ${glow});\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      defs,
      loopMs: speed * 1000,
    };
  },
};

export default flameEdges;
