import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, svgId } from "@/lib/engine/helpers";

/**
 * Circle-spin badge: the word rides a FULL circle via SVG <textPath> and the whole
 * ring rotates forever — the eternal spinning-sticker / rubber-stamp composition. The
 * text is repeated (each copy separated by a dot / star / dash) until the ring is
 * filled; every copy comes from ctx.text. An optional static center dot + framing
 * ring sit around the rotating band.
 *
 * Placement is estimation-FREE: each copy is its own <textPath> anchored at an
 * explicit startOffset (i/N of the path) and force-fit to its arc slot with
 * textLength + lengthAdjust="spacingAndGlyphs", so distribution stays even for every
 * font. The per-family advance table only picks the copy count N and gently auto-fits
 * the font-size toward a natural slot fill (so engines that ignore textLength on
 * textPath still fill each slot instead of clumping). Inherited tracking is
 * neutralized on the SVG text: CSS px letter-spacing maps to viewBox user units here
 * (huge at font-size ~9/100) and would pile or scatter the ring glyphs.
 *
 * Geometry lives in a 0..100 viewBox (center 50,50); the text baseline rides radius
 * R=32 so the svg is ~1.4x the ring and glyphs + glow stay fully in view. The whole
 * <svg> is the rotating element (transform-origin defaults to its center) and the
 * emblem circles are rotationally symmetric, so they read as static even though the
 * box spins. Base frame = rotation 0 = a readable badge for posters/reduced-motion.
 * Divergence from arc-text (static shallow arch) and the static spiral coil: this is
 * a CLOSED ring in continuous rotation.
 */
const ADVANCE: Record<string, number> = {
  "'Anton', sans-serif": 0.36,
  "'Archivo Black', sans-serif": 0.62,
  "'Bungee', cursive": 0.72,
  "'Syne', sans-serif": 0.55,
  "'Unbounded', sans-serif": 0.78,
  "'Major Mono Display', monospace": 0.62,
  "'Bricolage Grotesque', sans-serif": 0.5,
  "'Space Mono', monospace": 0.6,
  "'Space Grotesk', sans-serif": 0.52,
};

// NBSP padding survives SVG whitespace trimming (plain spaces at chunk edges do not).
const SEPARATORS: Record<string, string> = {
  dot: " • ",
  star: " ★ ",
  dash: " — ",
};

const circleSpin: EffectDefinition = {
  id: "circle-spin",
  name: "Circle Spin",
  category: "entrance-kinetic",
  tags: ["badge", "circular", "sticker", "seal", "rotate", "textpath", "svg", "animated"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "Rotating SVG <textPath> badge (all modern browsers)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 38, min: 0, max: 360, step: 1, unit: "°" },
    { id: "size", label: "Text Size", type: "range", default: 9, min: 6, max: 14, step: 0.5 },
    { id: "speed", label: "Spin", type: "range", default: 12, min: 3, max: 30, step: 0.5, unit: "s" },
    {
      id: "dir",
      label: "Direction",
      type: "select",
      default: "cw",
      options: [
        { label: "Clockwise", value: "cw" },
        { label: "Counter", value: "ccw" },
      ],
    },
    {
      id: "sep",
      label: "Separator",
      type: "select",
      default: "dot",
      options: [
        { label: "Dot •", value: "dot" },
        { label: "Star ★", value: "star" },
        { label: "Dash —", value: "dash" },
      ],
    },
    { id: "emblem", label: "Emblem", type: "toggle", default: true, onLabel: "Ring", offLabel: "Bare" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    size: Number(R.rnd(8, 11).toFixed(1)),
    speed: R.ri(8, 20),
    dir: R.pick(["cw", "ccw"]),
    sep: R.pick(["dot", "star", "dash"]),
    emblem: R.chance(0.75),
  }),
  build: (ctx) => {
    const scope = ctx.scope;
    const h = ctx.values.hue as number;
    const fs = ctx.values.size as number;
    const dur = ctx.values.speed as number;
    const ccw = (ctx.values.dir as string) === "ccw";
    const sep = SEPARATORS[ctx.values.sep as string] ?? SEPARATORS.dot;
    const emblem = ctx.values.emblem as boolean;
    const dark = ctx.theme === "dark";

    const cx = 50;
    const R = 32; // text-baseline radius; svg (100) ≈ 1.4x the ring

    // Colours tuned to read on BOTH themes (bright on dark, saturated mid-tone on light).
    const ink = dark ? hsl(h, 90, 72) : hsl(h, 82, 40);
    const mark = dark ? hsl(h, 96, 66) : hsl(h, 85, 44);
    const guide = dark ? hsl(h, 55, 60, 0.45) : hsl(h, 45, 45, 0.38);
    const glow = dark ? hsl(h, 95, 65, 0.55) : hsl(h, 80, 50, 0.3);

    // Copy count from a rough per-font advance estimate. The estimate never PLACES
    // glyphs (explicit startOffset + textLength do) — it only sizes the repetition
    // and nudges the font-size so each copy naturally fills its slot.
    const font = (ctx.values.font as string) ?? "'Anton', sans-serif";
    const upper = ((ctx.values.case as string) ?? "none") === "uppercase";
    const adv = (ADVANCE[font] ?? 0.55) * (upper ? 1.1 : 1);
    const glyphs = (Array.from(ctx.text).length || 1) + 3; // + padded separator
    const circ = 2 * Math.PI * R;
    const natural = glyphs * adv * fs;
    const repeats = Math.max(1, Math.min(12, Math.round(circ / natural)));
    const slot = circ / repeats;
    const ideal = slot / (glyphs * adv);
    const fsEff = Math.max(3, Math.min(fs * 1.2, Math.max(fs * 0.6, ideal)));

    const pathId = svgId(scope, "ring");
    // Closed circle path starting at the TOP, sweeping clockwise: top glyphs read
    // upright with ascenders pointing outward — the classic badge orientation.
    const path = `M ${cx},${cx} m 0,${-R} a ${R},${R} 0 1,1 0,${2 * R} a ${R},${R} 0 1,1 0,${-2 * R}`;
    const spin = anim(scope, "spin");

    const css =
      `.${scope} {\n` +
      `  display: inline-block;\n` +
      `  vertical-align: middle;\n` +
      `  width: 4.2em;\n` +
      `  height: 4.2em;\n` +
      `  max-width: 100%;\n` +
      `  overflow: visible;\n` +
      `  filter: drop-shadow(0 0 0.035em ${glow});\n` +
      `  animation: ${spin} ${dur}s linear infinite;\n` +
      `  animation-direction: ${ccw ? "reverse" : "normal"};\n` +
      `}\n` +
      `.${scope} text {\n` +
      `  fill: ${ink};\n` +
      `  dominant-baseline: central;\n` +
      // px letter-spacing = viewBox user units on SVG text: the shared Tracking knob
      // would pile/scatter the ring glyphs, so it is neutralized inside the badge.
      `  letter-spacing: normal;\n` +
      `}\n` +
      `.${scope} .guide {\n` +
      `  fill: none;\n` +
      `  stroke: ${guide};\n` +
      `  stroke-width: 0.8;\n` +
      `}\n` +
      `.${scope} .hub {\n` +
      `  fill: ${mark};\n` +
      `}`;

    const keyframes = `@keyframes ${spin} {\n  to { transform: rotate(360deg); }\n}`;

    const round3 = (n: number) => Math.round(n * 1000) / 1000;
    const copies = Array.from({ length: repeats }, (_, i) =>
      el("textPath", {
        attrs: {
          href: `#${pathId}`,
          startOffset: `${round3((i / repeats) * 100)}%`,
          textLength: round3(slot),
          lengthAdjust: "spacingAndGlyphs",
        },
        children: [text(ctx.text + sep)],
      }),
    );

    const children = [
      el("defs", { children: [el("path", { attrs: { id: pathId, d: path } })] }),
      ...(emblem ? [el("circle", { attrs: { class: "guide", cx, cy: cx, r: 41 } })] : []),
      el("text", { attrs: { "font-size": round3(fsEff) }, children: copies }),
      ...(emblem ? [el("circle", { attrs: { class: "hub", cx, cy: cx, r: 3.2 } })] : []),
    ];

    return {
      root: el("svg", {
        attrs: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 100 100", "aria-hidden": "true" },
        children,
      }),
      css,
      keyframes,
      loopMs: dur * 1000,
    };
  },
};

export default circleSpin;
