import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, svgId, round } from "@/lib/engine/helpers";

/**
 * Spiral text: the word winds INWARD along a true Archimedean coil. An inline <svg>
 * holds one <path> — the spiral, sampled from r = rInner + b·θ in build() into a dense
 * polyline that runs from the OUTER end to the centre — and a <text><textPath> bound to
 * it, so the letters flow from outside toward the middle, rotating to follow the tangent.
 * The same path is stroked as a faint guide coil, and a userSpace radialGradient fills
 * both text and coil so they fade toward the centre (a depth cue that reads at any length).
 *
 * Divergence: arc-text is a single shallow parabolic bow; this is a multi-turn coil built
 * from SVG textPath — a fundamentally different composition. It is also a STATIC inward
 * coil, not a closed rotating ring: no ring, an open spiral, and the optional Spin toggle
 * (off by default) rotates the whole coil for a slow drilling illusion when wanted.
 *
 * The <text> inherits the shared font/weight/tracking/case (the engine sets them on the
 * scoped <svg>); only the SVG-local font-size is fixed so glyph size stays proportional to
 * the coil pitch regardless of the ambient studio/export font. viewBox is sized to the
 * spiral (not the reverse), so the coil fills the frame at any turn count.
 */
const spiralText: EffectDefinition = {
  id: "spiral-text",
  name: "Spiral Text",
  category: "entrance-kinetic",
  tags: ["spiral", "coil", "vortex", "svg", "textpath", "circular"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  controls: [
    { id: "turns", label: "Turns", type: "range", default: 2.4, min: 1.5, max: 3.8, step: 0.1 },
    { id: "start", label: "Start Angle", type: "angle", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    { id: "hue", label: "Ink Hue", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    { id: "spin", label: "Spin", type: "toggle", default: false, onLabel: "ON", offLabel: "OFF" },
  ],
  rand: (R) => ({
    turns: Number(R.rnd(1.8, 3.0).toFixed(1)),
    start: R.ri(0, 360),
    hue: R.ri(0, 360),
  }),
  build: (ctx) => {
    const scope = ctx.scope;
    const turns = ctx.values.turns as number;
    const startDeg = ctx.values.start as number;
    const h = ctx.values.hue as number;
    const spin = Boolean(ctx.values.spin);
    const dark = ctx.theme === "dark";

    // --- Geometry (arbitrary user units; the viewBox is fitted to them below). Fixing
    // these ratios keeps glyph size proportional to the coil whatever the ambient font. ---
    const FS = 100; // SVG-local font-size
    const rInner = 62; // centre hole so the innermost letters aren't crushed at r=0
    const pitch = 150; // radial gap per turn (> ~1.5·FS, so adjacent coils never overlap)
    const b = pitch / (2 * Math.PI);
    const tMax = 2 * Math.PI * turns;
    const rMax = rInner + b * tMax; // outer radius = rInner + pitch·turns
    const phi0 = (startDeg * Math.PI) / 180;

    // Traverse OUTER -> INNER: r shrinks while the plotted angle INCREASES, which is
    // screen-clockwise in SVG's y-down space — the convention that keeps textPath glyphs
    // upright with their tops pointing OUTWARD (readable from outside as you wind in).
    const samples = Math.max(72, Math.round(turns * 36));
    let d = "";
    for (let k = 0; k <= samples; k++) {
      const s = (k / samples) * tMax;
      const r = rMax - b * s;
      const phi = phi0 + s;
      const x = round(r * Math.cos(phi), 2);
      const y = round(r * Math.sin(phi), 2);
      d += k === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }

    const half = round(rMax + 105, 1); // margin: glyph ascent (~0.72·FS) + guide + pad
    const vb = `${-half} ${-half} ${round(half * 2, 1)} ${round(half * 2, 1)}`;

    const pathId = svgId(scope, "coil");
    const gradId = svgId(scope, "ink");
    const spinName = anim(scope, "spin");
    const spinDur = 26000;
    const guideW = round(FS * 0.05, 1);

    // Theme-adapted ink; the coil reuses the ink gradient at a low stroke-opacity so it
    // stays a faint wire that ALSO fades toward the centre (the per-arc fade).
    const ink = dark ? hsl(h, 85, 70) : hsl(h, 78, 42);

    const rootRule = [
      `.${scope} {`,
      `  display: block;`,
      `  width: min(100%, 58vmin, 11em);`,
      `  height: auto;`,
      `  aspect-ratio: 1 / 1;`,
      `  margin-inline: auto;`,
      `  overflow: visible;`,
      spin ? `  transform-origin: 50% 50%;` : ``,
      spin ? `  animation: ${spinName} ${spinDur}ms linear infinite;` : ``,
      `}`,
    ]
      .filter(Boolean)
      .join("\n");

    const css = [
      rootRule,
      `.${scope} .fx-coil {`,
      `  fill: none;`,
      `  stroke: url(#${gradId});`,
      `  stroke-opacity: ${dark ? 0.22 : 0.26};`,
      `  stroke-width: ${guideW}px;`,
      `  stroke-linecap: round;`,
      `}`,
      `.${scope} text {`,
      `  font-size: ${FS}px;`,
      `  fill: url(#${gradId});`,
      `}`,
      `.${scope} .fx-g0 { stop-color: ${ink}; stop-opacity: 0.5; }`,
      `.${scope} .fx-g1 { stop-color: ${ink}; stop-opacity: 1; }`,
    ].join("\n");

    const keyframes = spin
      ? `@keyframes ${spinName} {\n  to { transform: rotate(360deg); }\n}`
      : undefined;

    return {
      root: el("svg", {
        attrs: { xmlns: "http://www.w3.org/2000/svg", viewBox: vb, "aria-hidden": "true" },
        children: [
          el("defs", {
            children: [
              el("radialGradient", {
                attrs: {
                  id: gradId,
                  gradientUnits: "userSpaceOnUse",
                  cx: 0,
                  cy: 0,
                  r: round(rMax, 1),
                },
                children: [
                  el("stop", { attrs: { class: "fx-g0", offset: "0%" } }),
                  el("stop", { attrs: { class: "fx-g1", offset: "100%" } }),
                ],
              }),
            ],
          }),
          el("path", { attrs: { id: pathId, class: "fx-coil", d } }),
          el("text", {
            children: [
              el("textPath", { attrs: { href: `#${pathId}` }, children: [text(ctx.text)] }),
            ],
          }),
        ],
      }),
      css,
      keyframes,
      loopMs: spin ? spinDur : undefined,
    };
  },
};

export default spiralText;
