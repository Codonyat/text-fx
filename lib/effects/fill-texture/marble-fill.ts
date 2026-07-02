import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, round } from "@/lib/engine/helpers";

/**
 * Marble material fill: glyphs carved from polished stone. Multi-octave SVG
 * fractal noise is knife-edge thresholded (a spiked 33-entry feComponentTransfer
 * table + alpha contrast boost) so two noise iso-lines become thin, meandering,
 * high-contrast veins, flooded with the vein tint and composited INSIDE the
 * glyph shapes over a stone-base gradient. A specular top streak adds polish
 * and a soft contact drop-shadow grounds the letters. Static. Presets:
 * white Carrara (gray veins), black Nero (pale veins), green Verde (calcite veins).
 */

type Stone = {
  bh: number; bs: number; bl: number; // stone base hsl
  deepL: number; // gradient foot lightness
  liftMax: number; // polish -> top-light lightness lift ceiling
  vh: number; vs: number; vl: number; vo: number; // vein tint + opacity
};

function stone(preset: string, dark: boolean): Stone {
  switch (preset) {
    case "nero": // polished black marble: near-black field, clearly pale veins
      return dark
        ? { bh: 225, bs: 8, bl: 20, deepL: 12, liftMax: 22, vh: 215, vs: 8, vl: 88, vo: 0.9 }
        : { bh: 225, bs: 10, bl: 13, deepL: 8, liftMax: 26, vh: 215, vs: 10, vl: 90, vo: 0.85 };
    case "verde": // deep green serpentine with pale calcite veining
      return dark
        ? { bh: 158, bs: 32, bl: 40, deepL: 30, liftMax: 18, vh: 140, vs: 12, vl: 92, vo: 0.8 }
        : { bh: 160, bs: 36, bl: 30, deepL: 22, liftMax: 20, vh: 140, vs: 14, vl: 90, vo: 0.8 };
    case "carrara": // white statuary marble with cool gray veins
    default:
      return dark
        ? { bh: 35, bs: 12, bl: 92, deepL: 84, liftMax: 6, vh: 222, vs: 10, vl: 42, vo: 0.75 }
        : { bh: 35, bs: 10, bl: 74, deepL: 58, liftMax: 12, vh: 222, vs: 12, vl: 32, vo: 0.9 };
  }
}

const marbleFill: EffectDefinition = {
  id: "marble-fill",
  name: "Marble",
  category: "fill-texture",
  tags: ["marble", "stone", "material", "veins", "texture", "svg", "fill", "premium"],
  caps: ["pure", "svgDefs"],
  pngSupport: "partial",
  supports: "background-clip:text stone base + SVG feTurbulence vein filter via filter:url(#…)",
  controls: [
    {
      id: "preset",
      label: "Stone",
      type: "select",
      default: "carrara",
      options: [
        { label: "Carrara (white)", value: "carrara" },
        { label: "Nero (black)", value: "nero" },
        { label: "Verde (green)", value: "verde" },
      ],
    },
    { id: "scale", label: "Vein Scale", type: "range", default: 55, min: 30, max: 90, step: 1, unit: "%" },
    { id: "polish", label: "Polish", type: "range", default: 55, min: 0, max: 100, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    preset: R.pick(["carrara", "nero", "verde"]),
    scale: R.ri(40, 72),
    polish: R.ri(38, 74),
  }),
  build: (ctx) => {
    const preset = (ctx.values.preset as string) || "carrara";
    const scale = ctx.values.scale as number;
    const polish = ctx.values.polish as number;
    const dark = ctx.theme === "dark";
    const s = stone(preset, dark);

    // Vein Scale -> turbulence frequency (larger scale = broader veins = lower
    // freq). Stretched Y frequency gives the veining a directional, quarried grain.
    const fx = round(0.0395 - (scale / 100) * 0.0315, 4);
    const fy = round(fx * 1.6, 4);

    // Polish -> a top-light sheen: lift the head of the base gradient and lay a
    // specular streak across the upper third of the glyphs.
    const p = polish / 100;
    const topL = Math.min(98, s.bl + Math.round(p * s.liftMax));
    const sheen = round(p * (dark ? 0.3 : 0.16), 2);

    const base = hsl(s.bh, s.bs, s.bl);
    const light = hsl(s.bh, s.bs, topL);
    const deep = hsl(s.bh, s.bs, s.deepL);
    const veinColor = hsl(s.vh, s.vs, s.vl);

    const fid = svgId(ctx.scope, "marble");

    // Knife-edge threshold: 65-entry table over the fractal-noise alpha channel —
    // narrow spikes at 0.375 and 0.625 turn two iso-lines of the noise field into
    // THIN meandering vein lines; the follow-up alpha x3 boost saturates the vein
    // cores solid while keeping the edges tight (crisp lines, not smoke). A second,
    // soft transfer of the same field becomes the faint cloudy mottle real marble
    // has around its veining.
    const table = Array.from({ length: 65 }, (_, i) => (i === 24 || i === 40 ? "1" : "0")).join(" ");
    const cloudOp = round(s.vo * 0.16, 2);

    const defs =
      `<filter id="${fid}" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="5" seed="15" stitchTiles="stitch" result="turb"/>\n` +
      `  <feComponentTransfer in="turb" result="veinsSoft">\n` +
      `    <feFuncA type="table" tableValues="${table}"/>\n` +
      `  </feComponentTransfer>\n` +
      `  <feColorMatrix in="veinsSoft" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 0" result="veinMask"/>\n` +
      `  <feComponentTransfer in="turb" result="cloudMask">\n` +
      `    <feFuncA type="table" tableValues="0 0 0.4 1"/>\n` +
      `  </feComponentTransfer>\n` +
      `  <feFlood flood-color="${veinColor}" flood-opacity="${s.vo}" result="veinFill"/>\n` +
      `  <feComposite in="veinFill" in2="veinMask" operator="in" result="veins"/>\n` +
      `  <feFlood flood-color="${veinColor}" flood-opacity="${cloudOp}" result="cloudFill"/>\n` +
      `  <feComposite in="cloudFill" in2="cloudMask" operator="in" result="clouds"/>\n` +
      `  <feMerge result="marbleField">\n` +
      `    <feMergeNode in="clouds"/>\n` +
      `    <feMergeNode in="veins"/>\n` +
      `  </feMerge>\n` +
      `  <feComposite in="marbleField" in2="SourceGraphic" operator="in" result="textMarble"/>\n` +
      `  <feMerge>\n` +
      `    <feMergeNode in="SourceGraphic"/>\n` +
      `    <feMergeNode in="textMarble"/>\n` +
      `  </feMerge>\n` +
      `</filter>`;

    const shadow = `drop-shadow(0 2px 3px ${hsl(220, 20, 6, dark ? 0.5 : 0.3)})`;

    // When the stone tone sits close to the stage tone (white-on-white Carrara in
    // light mode, black-on-black Nero in dark mode) a hairline stroke in the vein
    // tint cuts the slab edge out of the background.
    const stageL = dark ? 4 : 97;
    const edge =
      Math.abs(s.bl - stageL) < 30
        ? `  -webkit-text-stroke: 1px ${hsl(s.vh, s.vs, s.vl, 0.5)};\n`
        : "";

    const css =
      `.${ctx.scope} {\n` +
      `  background:\n` +
      `    linear-gradient(168deg, ${hsl(0, 0, 100, sheen)} 0%, transparent 38%),\n` +
      `    linear-gradient(178deg, ${light} 0%, ${base} 55%, ${deep} 100%);\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      edge +
      `  filter: url(#${fid}) ${shadow};\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css, defs };
  },
};

export default marbleFill;
