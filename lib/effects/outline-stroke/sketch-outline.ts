import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, clipText, round } from "@/lib/engine/helpers";

/**
 * Sketch Outline: hollow, hand-drawn letterforms. The word is stroked (transparent
 * fill, no solid body) and pushed through a gentle SVG turbulence displacement so the
 * pen line WOBBLES like it was drawn by hand — a low-frequency waver, not a melt. Two
 * data-text copies do the classic "sketched" trick: a crisp primary contour plus a
 * fainter, slightly-offset second pass warped by a DIFFERENT turbulence seed, as if the
 * artist went over the line twice. An optional faint diagonal-hatch fill inside the
 * glyphs completes the sketchbook look. Ink presets (graphite / ink-black / ballpoint
 * blue) adapt to the dark stage or paper-white theme. Filter ids are salted; seeds are
 * fixed (deterministic, parity-safe). Static.
 */
const sketchOutline: EffectDefinition = {
  id: "sketch-outline",
  name: "Sketch Outline",
  category: "outline-stroke",
  tags: ["outline", "stroke", "hollow", "sketch", "hand-drawn", "pen", "hatching", "svg"],
  caps: ["svgDefs", "dataText"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke roughened by an SVG feDisplacementMap; hatch via background-clip:text",
  controls: [
    { id: "wobble", label: "Wobble", type: "range", default: 1.6, min: 0.5, max: 3.5, step: 0.1, unit: "px" },
    {
      id: "ink",
      label: "Ink",
      type: "select",
      default: "ink",
      options: [
        { label: "Graphite", value: "graphite" },
        { label: "Ink Black", value: "ink" },
        { label: "Ballpoint Blue", value: "ballpoint" },
      ],
    },
    { id: "hatch", label: "Hatching", type: "toggle", default: true, onLabel: "ON", offLabel: "OFF" },
  ],
  rand: (R) => ({
    wobble: Number(R.rnd(1, 2.4).toFixed(1)),
    ink: R.pick(["graphite", "ink", "ballpoint"]),
    hatch: R.chance(0.6),
  }),
  build: (ctx) => {
    const dark = ctx.theme === "dark";
    const wob = ctx.values.wobble as number;
    const ink = ctx.values.ink as string;
    const hatch = Boolean(ctx.values.hatch);

    // Ink palettes read light on the dark stage, dark on the paper-white theme.
    const PALETTE: Record<string, { h: number; s: number; l: number }> = {
      graphite: { h: 220, s: 6, l: dark ? 80 : 34 },
      ink: { h: 212, s: 14, l: dark ? 90 : 15 },
      ballpoint: { h: 223, s: 80, l: dark ? 74 : 40 },
    };
    const p = PALETTE[ink] ?? PALETTE.ink;
    const line = hsl(p.h, p.s, p.l);
    const hatchLine = hsl(p.h, p.s, p.l, 0.4);

    const fid = svgId(ctx.scope, "wob");
    const fid2 = svgId(ctx.scope, "wob2");

    // Two low-frequency displacement filters: same gentle hand-drawn waver, different
    // seed/frequency so the two stroke copies wobble independently (the "gone over it
    // twice" look). Generous filter region so the wavering edge isn't clipped.
    const defs =
      `<filter id="${fid}" x="-15%" y="-25%" width="130%" height="150%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.014 0.018" numOctaves="2" seed="4" result="n"/>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="n" scale="${wob}" xChannelSelector="R" yChannelSelector="G"/>\n` +
      `</filter>\n` +
      `<filter id="${fid2}" x="-15%" y="-25%" width="130%" height="150%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.02 0.024" numOctaves="2" seed="17" result="n"/>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="n" scale="${round(wob * 0.85, 2)}" xChannelSelector="R" yChannelSelector="G"/>\n` +
      `</filter>`;

    // Faint diagonal hairlines filling the glyph interiors (root text layer, behind the
    // stroked copies). When off, the root text is just an invisible sizing box.
    const hatchGrad = `repeating-linear-gradient(46deg, ${hatchLine} 0, ${hatchLine} 0.6px, transparent 0.6px, transparent 4.5px)`;
    const rootFill = hatch
      ? `  ${clipText(hatchGrad)}\n`
      : `  color: transparent;\n  -webkit-text-fill-color: transparent;\n`;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      rootFill +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  -webkit-text-stroke: 1.6px ${line};\n` +
      `  filter: url(#${fid});\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  -webkit-text-stroke: 1.2px ${line};\n` +
      `  filter: url(#${fid2});\n` +
      `  opacity: 0.5;\n` +
      `  transform: translate(0.8px, -0.6px);\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      defs,
    };
  },
};

export default sketchOutline;
