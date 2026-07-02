import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, hsl, round } from "@/lib/engine/helpers";

/**
 * SCROLL GLITCH INTENSITY — a reader-driven chromatic tear.
 *
 * Two `data-text` pseudo copies (a cyan and a magenta ghost) whose horizontal
 * translate offset, vertical shudder, clip-path slice bands and opacity all scale
 * with the element's distance from the scrollport CENTRE. Enter from the bottom →
 * maximum RGB-tear; glide to the middle → the text self-heals to clean, legible
 * type; leave off the top → it shreds apart again. Pure CSS, driven by
 * `animation-timeline: view()`.
 *
 * Lane rules (worker-contract addendum A) baked in:
 *  1. BASE `.scope` rule = the FINAL, legible state — clean text carrying only the
 *     subtlest permanent chromatic hint (a 1px cyan/magenta fringe). That is the
 *     ONLY frame thumbnails / posters / SSR / OG / PNG and non-supporting browsers
 *     (Firefox) ever see — never a mid-scrub tear.
 *  2. The scrub is ADDED only inside `@supports (animation-timeline: view())` AND
 *     only when `ctx.mode !== "thumbnail"`.
 *  3. The `animation` shorthand RESETS `animation-timeline`, so the shorthand is
 *     declared first (no duration → auto timeline-span), then the timeline + range.
 *  4. Everything generated is salted off `ctx.scope`; the deterministic PRNG that
 *     shapes the slices depends ONLY on control values, never on the scope, so
 *     re-scoping stays a pure token swap.
 *
 * Diverges from `glitch-rgb` (the autonomous, always-tearing time loop): this one
 * is CLEAN at rest, and the tear magnitude is mapped to reader scroll position —
 * 0%/100% = max glitch (edges), 50% = healed (centre).
 */
const scrollGlitch: EffectDefinition = {
  id: "scroll-glitch",
  name: "Scroll Glitch",
  category: "glitch-distortion",
  tags: ["glitch", "rgb", "chromatic", "scroll", "animated", "datamosh"],
  caps: ["dataText", "scroll"],
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    { id: "intensity", label: "Intensity", type: "range", default: 1, min: 0.5, max: 2, step: 0.05 },
    { id: "hue", label: "Hue", type: "range", default: 184, min: 0, max: 360, step: 1, unit: "°" },
    { id: "slices", label: "Slices", type: "range", default: 5, min: 3, max: 9, step: 1 },
  ],
  rand: (R) => ({
    intensity: Number(R.rnd(0.8, 1.5).toFixed(2)),
    hue: R.pick([184, 190, 200, 300, 320, 350]),
    slices: R.ri(4, 7),
  }),
  build: (ctx) => {
    const intensity = ctx.values.intensity as number;
    const hue = ctx.values.hue as number;
    const slices = ctx.values.slices as number;
    const dark = ctx.theme === "dark";

    // The chromatic pair: a "cyan" ghost at `hue` and a "magenta" ghost ~130° away.
    // Both read as a distinct channel split on either stage.
    const h2 = (hue + 130) % 360;
    const S = dark ? 100 : 95;
    const L = dark ? 58 : 46;
    const c1 = hsl(hue, S, L); // leans left
    const c2 = hsl(h2, S, L); // leans right
    // Legible base text on both themes; the ghosts blend against it.
    const baseColor = dark ? "#f2f4f7" : "#14161c";
    // screen pops the colored ghosts on black; multiply keeps them vivid on white.
    const blend = dark ? "screen" : "multiply";

    const off = 6 * intensity; // px — dominant horizontal split at the edges
    const vjit = 1.5 * intensity; // px — subtle vertical shudder
    const baseOp = 0.42; // ghost opacity when healed (centre)
    const maxOp = dark ? 0.9 : 0.85; // ghost opacity at full tear (edges)

    // Deterministic, scope-independent PRNG → stable slice bands (build is pure).
    const rnd = (n: number) => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    // One @keyframes track for a ghost travelling in `dir` (-1 left / +1 right).
    // Envelope m = |progress - 0.5| * 2 → 1 at both ends, 0 dead centre, so the
    // tear scales up toward the scrollport edges and heals in the middle.
    const track = (name: string, dir: number, seed: number) => {
      const rows: string[] = [];
      const stops = slices * 2; // symmetric about the centre stop
      for (let i = 0; i <= stops; i++) {
        const p = i / stops;
        const pct = round(p * 100, 2);
        const m = Math.abs(p - 0.5) * 2;
        const alt = i % 2 === 0 ? 1 : -1; // alternating shudder → glitchy, not a wobble
        const jx = rnd(seed + i * 3.1) * 2 - 1;
        const jy = rnd(seed + i * 5.7 + 2) * 2 - 1;
        // Direction preserved (cyan always left, magenta always right); jitter only
        // modulates the magnitude, all faded to 0 at the centre.
        const x = round((off * dir + off * 0.7 * jx * alt) * m, 2);
        const y = round(vjit * jy * alt * m, 2);
        const t0 = round(rnd(seed + i * 2.3 + 11) * 40 * m, 1);
        const b0 = round(rnd(seed + i * 4.9 + 17) * 40 * m, 1);
        const op = round(baseOp + (maxOp - baseOp) * m, 3);
        rows.push(
          `  ${pct}% { transform: translate(${x}px, ${y}px); clip-path: inset(${t0}% 0 ${b0}% 0); opacity: ${op}; }`,
        );
      }
      return `@keyframes ${name} {\n${rows.join("\n")}\n}`;
    };

    const a1 = anim(ctx.scope, "sg1");
    const a2 = anim(ctx.scope, "sg2");

    // BASE = clean legible text + a permanent 1px chromatic hint. The only frame
    // static consumers and non-supporting browsers ever render.
    let css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${baseColor};\n` +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  top: 0;\n` +
      `  width: 100%;\n` +
      `  pointer-events: none;\n` +
      `  mix-blend-mode: ${blend};\n` +
      `  opacity: ${baseOp};\n` +
      `}\n` +
      `.${ctx.scope}::before {\n  color: ${c1};\n  transform: translate(-1px, 0);\n}\n` +
      `.${ctx.scope}::after {\n  color: ${c2};\n  transform: translate(1px, 0);\n}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      // Shorthand first (resets animation-timeline), then timeline + range. `both`
      // fill holds the max-glitch endpoints while the element is off-screen; the
      // full `cover 0% cover 100%` travel lands the healed 50% frame at centre.
      css +=
        `\n\n@supports (animation-timeline: view()) {\n` +
        `  .${ctx.scope}::before {\n` +
        `    animation: ${a1} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover 0% cover 100%;\n` +
        `  }\n` +
        `  .${ctx.scope}::after {\n` +
        `    animation: ${a2} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover 0% cover 100%;\n` +
        `  }\n` +
        `}`;
      keyframes = track(a1, -1, 1) + "\n" + track(a2, 1, 1000);
    }

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      runtime: "none", // anonymous view() timeline is pure CSS — no listener shipped
    };
  },
};

export default scrollGlitch;
