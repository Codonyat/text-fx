import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round, clipText } from "@/lib/engine/helpers";

/**
 * Sparkle Glints: a handful of four-point star glints — crossed thin linear-gradient
 * rays plus a hot radial core, screen-blended so they read as light — scattered over
 * the word and winking in and out on staggered, overlapping timers. Diamond twinkle
 * on jewelry lettering: the letters keep a bright polished-metal fill; the glints are
 * pure light sitting on top, never sweeping, just blinking in place at fixed spots.
 * Distinct from Starfield (dots baked INSIDE the glyph fill, static) and Shine Sweep
 * (one highlight bar sliding across) — this is several discrete flares appearing and
 * vanishing in place, with duty cycles overlapped so 2-3 are always visible.
 */

const SPARKLE_SPOTS: { x: number; y: number; scale: number }[] = [
  { x: 9, y: 30, scale: 1 },
  { x: 24, y: 74, scale: 0.85 },
  { x: 41, y: 14, scale: 1.2 },
  { x: 58, y: 66, scale: 0.9 },
  { x: 76, y: 24, scale: 1.1 },
  { x: 91, y: 70, scale: 0.95 },
];

const CORE_EM = 0.62;
const RAY_LEN_EM = 2.4;
const RAY_THICK_EM = 0.2;
// Wink envelope (fractions of the loop): full brightness within PLATEAU of the peak,
// linear rise/fall out to WINDOW. Wide enough that staggered glints overlap — at any
// moment 2-3 glints are lit (and frame 0 / posters catch glint 0 at full peak).
const WINDOW = 0.28;
const PLATEAU = 0.11;

/** Circular (loop-wrapped) wink intensity: 1 on the plateau, linear falloff to 0. */
function wink(t: number, peak: number): number {
  let d = Math.abs(t - peak);
  if (d > 0.5) d = 1 - d;
  if (d >= WINDOW) return 0;
  if (d <= PLATEAU) return 1;
  return 1 - (d - PLATEAU) / (WINDOW - PLATEAU);
}

const wrap01 = (x: number): number => ((x % 1) + 1) % 1;

function sizeStr(full: number, intensity: number): string {
  return `${round(full * Math.max(intensity, 0.02), 3)}em`;
}

/** One pseudo-element's worth of glints: static background-image/position layers plus
 *  a keyframes block that scales each layer's background-size independently, so a
 *  single `animation` on a single pseudo staggers several glints' wink timing. */
function buildGlintLayer(
  animName: string,
  spots: { x: number; y: number; scale: number }[],
  peaks: number[],
  hot: string,
  bright: string,
  mid: string,
  speed: number,
): { css: string; keyframes: string } {
  const images: string[] = [];
  const positions: string[] = [];
  const fullSizes: { w: number; h: number }[] = [];
  spots.forEach((spot) => {
    const pos = `${spot.x}% ${spot.y}%`;
    // Radial core with a white-hot center.
    images.push(
      `radial-gradient(circle, ${hot} 0%, ${bright} 30%, ${mid} 55%, transparent 76%)`,
    );
    positions.push(pos);
    fullSizes.push({ w: CORE_EM * spot.scale, h: CORE_EM * spot.scale });
    // Horizontal ray, tapering to the tips with a hot center.
    images.push(
      `linear-gradient(90deg, transparent 0%, ${mid} 32%, ${hot} 50%, ${mid} 68%, transparent 100%)`,
    );
    positions.push(pos);
    fullSizes.push({ w: RAY_LEN_EM * spot.scale, h: RAY_THICK_EM * spot.scale });
    // Vertical ray — crosses the horizontal ray at the core (four-point star).
    images.push(
      `linear-gradient(180deg, transparent 0%, ${mid} 32%, ${hot} 50%, ${mid} 68%, transparent 100%)`,
    );
    positions.push(pos);
    fullSizes.push({ w: RAY_THICK_EM * spot.scale, h: RAY_LEN_EM * spot.scale });
  });

  // Keyframe stops at every envelope breakpoint (wrapped into [0,1]) — the wink
  // function is piecewise linear between them, so interpolation is exact, and the
  // wrap makes 0% and 100% identical for a seamless loop.
  const stops = new Set<number>([0, 1]);
  peaks.forEach((p) => {
    [p - WINDOW, p - PLATEAU, p + PLATEAU, p + WINDOW].forEach((b) => {
      stops.add(round(wrap01(b), 4));
    });
  });
  const sorted = Array.from(stops).sort((a, b) => a - b);

  const rules = sorted.map((t) => {
    const sizes: string[] = [];
    spots.forEach((_, i) => {
      const intensity = wink(t, peaks[i]);
      const core = fullSizes[i * 3];
      const rh = fullSizes[i * 3 + 1];
      const rv = fullSizes[i * 3 + 2];
      sizes.push(`${sizeStr(core.w, intensity)} ${sizeStr(core.h, intensity)}`);
      sizes.push(`${sizeStr(rh.w, intensity)} ${sizeStr(rh.h, intensity)}`);
      sizes.push(`${sizeStr(rv.w, intensity)} ${sizeStr(rv.h, intensity)}`);
    });
    return `  ${round(t * 100, 2)}% { background-size: ${sizes.join(", ")}; }`;
  });

  const keyframes = `@keyframes ${animName} {\n${rules.join("\n")}\n}`;
  const css =
    `  background-image:\n    ${images.join(",\n    ")};\n` +
    `  background-position: ${positions.join(", ")};\n` +
    `  animation: ${animName} ${speed.toFixed(1)}s linear infinite;`;

  return { css, keyframes };
}

const sparkleGlints: EffectDefinition = {
  id: "sparkle-glints",
  name: "Sparkle Glints",
  category: "neon-glow",
  tags: ["neon", "glow", "sparkle", "glint", "twinkle", "jewelry", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Screen-blended background layers on ::before/::after (all modern browsers)",
  controls: [
    {
      id: "hue",
      label: "Sparkle Hue",
      type: "range",
      default: 45,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
      when: (v) => !v.white,
    },
    { id: "white", label: "Sparkle Color", type: "toggle", default: true, onLabel: "White", offLabel: "Hue" },
    { id: "count", label: "Count", type: "range", default: 5, min: 4, max: 6, step: 1 },
    { id: "speed", label: "Speed", type: "range", default: 2.4, min: 1.6, max: 3.6, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    white: R.chance(0.5),
    count: R.ri(4, 6),
    speed: Number(R.rnd(1.8, 3.2).toFixed(1)),
  }),
  build: (ctx) => {
    const white = Boolean(ctx.values.white);
    const hue = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const rawCount = Math.round(ctx.values.count as number);
    const count = Math.min(6, Math.max(4, rawCount));

    // Sparkle color: white-hot center + near-white body, or a vivid tint of the hue.
    const sparkleHue = white ? 0 : hue;
    const sparkleSat = white ? 0 : 85;
    const hot = white ? "#ffffff" : hsl(sparkleHue, 45, 98);
    const bright = hsl(sparkleHue, sparkleSat, white ? 100 : 80, 1);
    const mid = hsl(sparkleHue, sparkleSat, white ? 94 : 66, 0.7);

    const active = SPARKLE_SPOTS.slice(0, count);
    // Evenly staggered peaks around the loop; glint 0 peaks at t=0 so the first
    // frame (and SSR posters / thumbnails) always catches lit glints.
    const peaks = active.map((_, i) => round(i / count, 4));
    const half = Math.ceil(count / 2);
    const beforeSpots = active.slice(0, half);
    const afterSpots = active.slice(half);
    const beforePeaks = peaks.slice(0, half);
    const afterPeaks = peaks.slice(half);

    const scope = ctx.scope;
    const animBefore = anim(scope, "glint-a");
    const animAfter = anim(scope, "glint-b");

    const before = buildGlintLayer(animBefore, beforeSpots, beforePeaks, hot, bright, mid, speed);
    const after = buildGlintLayer(animAfter, afterSpots, afterPeaks, hot, bright, mid, speed);

    // Polished-metal base fill: bright crown, dark waist, bright lower glint — lively
    // and premium, with enough dark mass at the waist that the screen-blended glints
    // still pop on BOTH themes (on light stages the glints only show over the glyph
    // strokes, so the light-theme ramp stays deliberately darker overall).
    const gemHue = white ? 210 : hue;
    const gemSat = white ? 10 : 32;
    const gem =
      ctx.theme === "dark"
        ? `linear-gradient(172deg,\n    ${hsl(gemHue, gemSat, 90)} 0%,\n    ${hsl(gemHue, gemSat + 4, 66)} 38%,\n    ${hsl(gemHue, gemSat + 8, 42)} 52%,\n    ${hsl(gemHue, gemSat + 4, 70)} 64%,\n    ${hsl(gemHue, gemSat, 92)} 100%)`
        : `linear-gradient(172deg,\n    ${hsl(gemHue, gemSat + 6, 52)} 0%,\n    ${hsl(gemHue, gemSat + 10, 33)} 38%,\n    ${hsl(gemHue, gemSat + 12, 20)} 52%,\n    ${hsl(gemHue, gemSat + 10, 36)} 64%,\n    ${hsl(gemHue, gemSat + 6, 55)} 100%)`;

    const css =
      `.${scope} {\n` +
      `  position: relative;\n` +
      `  ${clipText(gem)}\n` +
      `}\n` +
      `.${scope}::before,\n.${scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  pointer-events: none;\n` +
      `  mix-blend-mode: screen;\n` +
      `  background-repeat: no-repeat;\n` +
      `}\n` +
      `.${scope}::before {\n${before.css}\n}\n` +
      `.${scope}::after {\n${after.css}\n}`;

    const keyframes = `${before.keyframes}\n\n${after.keyframes}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default sparkleGlints;
