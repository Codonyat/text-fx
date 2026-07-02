import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

/**
 * Torn Paper Split: the word ripped in half like a torn paper scrap. A brighter
 * "fiber" copy of the word rests at base as the backing; two paper-face copies
 * (data-text) are clipped to the top and bottom of a single JAGGED tear seam — an
 * irregular zigzag polygon whose points are generated deterministically in build()
 * from the tear-angle and jaggedness knobs (build is pure; only the control VALUES
 * are randomized) — then nudged a few px apart and rotated in opposite directions.
 * The offset uncovers the fiber backing along the rip so the raw torn edge catches
 * light, and a soft shadow under the halves reads as depth. Warm paper tint, static.
 * Deliberately unlike sliced-type's razor-clean straight cut: this is a rough,
 * organic tear along one seam (not distress-stamp's eroded-everywhere grain).
 */
const tornPaper: EffectDefinition = {
  id: "torn-paper",
  name: "Torn Paper Split",
  category: "retro-themed",
  tags: ["retro", "paper", "torn", "rip", "collage", "clip-path"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "data-text top/bottom halves clipped along a jagged clip-path tear seam",
  controls: [
    { id: "angle", label: "Tear Angle", type: "range", default: -6, min: -14, max: 14, step: 1, unit: "°" },
    { id: "jag", label: "Jaggedness", type: "range", default: 8, min: 3, max: 14, step: 1, unit: "%" },
    { id: "separation", label: "Separation", type: "range", default: 7, min: 2, max: 16, step: 1, unit: "px" },
    { id: "tint", label: "Paper Tint", type: "range", default: 40, min: 0, max: 60, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    angle: R.ri(-12, 12),
    jag: R.ri(6, 12),
    separation: R.ri(5, 11),
    tint: R.ri(24, 52),
  }),
  build: (ctx) => {
    const angle = ctx.values.angle as number;
    const jag = ctx.values.jag as number;
    const sep = ctx.values.separation as number;
    const h = ctx.values.tint as number;
    const dark = ctx.theme === "dark";

    // Paper face + brighter torn-fiber backing; the tint stays low-saturation so it
    // reads as an off-white / kraft paper, not a colored card. Both fully legible on
    // the near-black dark stage AND the near-white light stage.
    const paper = dark ? hsl(h, 14, 82) : hsl(h, 26, 75);
    const fiber = dark ? hsl(h, 9, 96) : hsl(h, 17, 90);
    const stroke = dark ? hsl(h, 16, 32) : hsl(h, 18, 44);
    const strokeW = dark ? 0.45 : 0.6;
    const shadow = dark ? "rgba(0,0,0,0.55)" : "rgba(48,40,28,0.3)";

    // --- Deterministic jagged tear seam (pure; NO Math.random / Date) ----------
    // A hashed pseudo-random in [0,1) keyed by the point index gives an irregular,
    // organic zigzag that is identical on every render for the same knob values.
    const SEG = 14;
    const hash = (k: number): number => {
      const s = Math.sin((k + 1) * 12.9898) * 43758.5453;
      return s - Math.floor(s);
    };
    const seam: string[] = [];
    for (let k = 0; k <= SEG; k++) {
      // Organic horizontal jitter, with the endpoints pinned to the frame edges.
      const jx = (hash(k + 100) - 0.5) * 0.55;
      const x = k === 0 ? 0 : k === SEG ? 100 : round(((k + jx) / SEG) * 100, 2);
      // Seam centreline tilts with the angle; the hashed vertical offset is the jag.
      const center = 50 + angle * (2 * (x / 100) - 1);
      const off = (hash(k) - 0.5) * 2 * jag;
      const y = round(Math.min(88, Math.max(12, center + off)), 2);
      seam.push(`${x}% ${y}%`);
    }
    // The two halves share the exact seam vertices, so they tile the box perfectly
    // at rest — the transforms below are what open the rip.
    const topPoly = `0% 0%, 100% 0%, ` + seam.slice().reverse().join(", ");
    const botPoly = seam.join(", ") + `, 100% 100%, 0% 100%`;

    // Halves pull apart across the tear and rotate in opposite directions.
    const vy = round(sep * 0.5, 2);
    const hx = round(sep * 0.18, 2);
    const rot = round(Math.min(sep * 0.35, 4.5), 2);

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  color: ${fiber};\n` +
      `  text-shadow: 0 ${round(sep * 0.28, 2)}px ${round(sep * 0.55, 2)}px ${shadow};\n` +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${paper};\n` +
      `  -webkit-text-stroke: ${strokeW}px ${stroke};\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  clip-path: polygon(${topPoly});\n` +
      `  transform: translate(-${hx}px, -${vy}px) rotate(-${rot}deg);\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  clip-path: polygon(${botPoly});\n` +
      `  transform: translate(${hx}px, ${vy}px) rotate(${rot}deg);\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
    };
  },
};

export default tornPaper;
