import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, clipText, round } from "@/lib/engine/helpers";

type RGB = [number, number, number];
interface Stop {
  dark: RGB; // the darker grain line
  light: RGB; // the lighter board face
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const lerpRgb = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

// Wood-tone stops, interpolated pine -> walnut -> mahogany by the Tone control.
const PINE: Stop = { dark: [150, 111, 66], light: [222, 189, 138] };
const WALNUT: Stop = { dark: [96, 64, 38], light: [163, 118, 74] };
const MAHOG: Stop = { dark: [74, 36, 26], light: [140, 74, 49] };

/**
 * Wood grain: glyphs cut from planed timber. An SVG feTurbulence with a strongly
 * ANISOTROPIC baseFrequency (low X / high Y) stretches the noise into long horizontal
 * fibers, which feComponentTransfer remaps into repeating dark/light ring bands over a
 * warm brown base. A grayscale vertical gradient soft-light-blended in adds the planed
 * sheen, and an eroded rim floods a darker outline so letters read as sawn boards.
 * The horizontal fiber direction is the signature — obviously wood, not marble.
 */
const woodGrain: EffectDefinition = {
  id: "wood-grain",
  name: "Wood Grain",
  category: "fill-texture",
  tags: ["wood", "grain", "timber", "material", "texture", "fill", "svg"],
  caps: ["pure", "svgDefs"],
  pngSupport: "partial",
  supports:
    "background-clip:text sheen + SVG feTurbulence/feComponentTransfer wood grain (soft-light feBlend needs a modern browser)",
  controls: [
    { id: "tone", label: "Wood Tone", type: "range", default: 50, min: 0, max: 100, step: 1 },
    { id: "grain", label: "Grain", type: "range", default: 55, min: 0, max: 100, step: 1 },
    { id: "sheen", label: "Sheen", type: "range", default: 55, min: 0, max: 100, step: 1, unit: "%" },
    { id: "figure", label: "Figure", type: "range", default: 7, min: 0, max: 40, step: 1 },
  ],
  rand: (R) => ({
    tone: R.ri(10, 95),
    grain: R.ri(35, 80),
    sheen: R.ri(30, 70),
    figure: R.ri(0, 40),
  }),
  build: (ctx) => {
    const tone = (ctx.values.tone as number) / 100;
    const grain = (ctx.values.grain as number) / 100;
    const sheenAmt = (ctx.values.sheen as number) / 100;
    const seed = ctx.values.figure as number;
    const dark = ctx.theme === "dark";

    // Interpolate the two wood colours through the pine/walnut/mahogany stops.
    const [pa, pb, seg]: [Stop, Stop, number] =
      tone < 0.5 ? [PINE, WALNUT, tone / 0.5] : [WALNUT, MAHOG, (tone - 0.5) / 0.5];
    // Lift a touch on dark stages so the deeper tones still pop off black.
    const adj = (c: RGB): RGB =>
      [0, 1, 2].map((i) => Math.max(0, Math.min(255, Math.round(c[i] + (dark ? 16 : 0))))) as RGB;
    const grainC = adj(lerpRgb(pa.dark, pb.dark, seg));
    const boardC = adj(lerpRgb(pa.light, pb.light, seg));

    // Anisotropy is the whole trick: X frequency stays tiny (features stretch into
    // long horizontal fibers) while Y frequency is high (thin bands stacked
    // vertically). Grain tightens both and adds ring cycles.
    const fx = round(0.01 + grain * 0.006, 3); // 0.010..0.016
    const fy = round(0.1 + grain * 0.2, 3); // 0.10..0.30
    const cycles = Math.round(3 + grain * 5); // 3..8 ring bands

    // Alternate board/grain per channel to build the ring table (linear interp
    // between entries gives soft, natural bands rather than hard stripes).
    const table = (ch: number): string => {
      const out: string[] = [];
      for (let i = 0; i <= 2 * cycles; i++)
        out.push(String(round((i % 2 === 0 ? boardC[ch] : grainC[ch]) / 255, 3)));
      return out.join(" ");
    };

    const edge = [0, 1, 2].map((i) => Math.round(grainC[i] * 0.55));
    const fid = svgId(ctx.scope, "wood");

    // Vertical planed sheen: a bright reflection band across the upper third,
    // gently darkened at the very top and bottom edges. Kept grayscale so the
    // soft-light blend only lightens/darkens the wood without tinting it.
    const bandL = round(50 + 42 * sheenAmt, 1);
    const topL = round(50 - 16 * sheenAmt, 1);
    const botL = round(50 - 22 * sheenAmt, 1);
    const sheen =
      `linear-gradient(180deg, ${hsl(0, 0, topL)} 0%, ${hsl(0, 0, bandL)} 24%, ` +
      `${hsl(0, 0, 52)} 58%, ${hsl(0, 0, botL)} 100%)`;

    const defs =
      `<filter id="${fid}" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}" stitchTiles="stitch" result="noise"/>\n` +
      `  <feColorMatrix in="noise" type="matrix" values="1 1 1 0 -1  1 1 1 0 -1  1 1 1 0 -1  0 0 0 0 1" result="gray"/>\n` +
      `  <feComponentTransfer in="gray" result="wood">\n` +
      `    <feFuncR type="table" tableValues="${table(0)}"/>\n` +
      `    <feFuncG type="table" tableValues="${table(1)}"/>\n` +
      `    <feFuncB type="table" tableValues="${table(2)}"/>\n` +
      `  </feComponentTransfer>\n` +
      `  <feBlend in="SourceGraphic" in2="wood" mode="soft-light" result="litFull"/>\n` +
      `  <feComposite in="litFull" in2="SourceGraphic" operator="in" result="lit"/>\n` +
      `  <feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="inner"/>\n` +
      `  <feComposite in="SourceAlpha" in2="inner" operator="out" result="rim"/>\n` +
      `  <feFlood flood-color="rgb(${edge[0]},${edge[1]},${edge[2]})" flood-opacity="0.55" result="edgeFlood"/>\n` +
      `  <feComposite in="edgeFlood" in2="rim" operator="in" result="edge"/>\n` +
      `  <feMerge>\n    <feMergeNode in="lit"/>\n    <feMergeNode in="edge"/>\n  </feMerge>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(sheen)}\n` +
      `  filter: url(#${fid});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css, defs };
  },
};

export default woodGrain;
