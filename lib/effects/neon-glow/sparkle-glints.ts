import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round, clipText } from "@/lib/engine/helpers";

/**
 * Sparkle Glints: a handful of four-point star glints — crossed thin linear-gradient
 * rays plus a small radial core, screen-blended so they read as light — scattered over
 * the word and winking in and out on staggered timers. Diamond twinkle on jewelry
 * lettering: the letters themselves stay a clean, readable metallic fill; the glints
 * are pure light sitting on top, never sweeping, just blinking in place at fixed spots.
 * Distinct from Starfield (dots baked INSIDE the glyph fill, static) and Shine Sweep
 * (one highlight bar sliding across) — this is several discrete flares appearing and
 * vanishing in place.
 */

const SPARKLE_SPOTS: { x: number; y: number; scale: number }[] = [
  { x: 9, y: 30, scale: 1 },
  { x: 24, y: 74, scale: 0.8 },
  { x: 41, y: 14, scale: 1.15 },
  { x: 58, y: 66, scale: 0.85 },
  { x: 76, y: 24, scale: 1.05 },
  { x: 91, y: 70, scale: 0.9 },
];

const CORE_EM = 0.44;
const RAY_LEN_EM = 1.55;
const RAY_THICK_EM = 0.15;
// Fraction of the loop each glint spends rising+falling around its own peak.
const WINDOW = 0.085;

function tri(t: number, peak: number, w: number): number {
  const d = Math.abs(t - peak);
  return d >= w ? 0 : 1 - d / w;
}

function sizeStr(full: number, intensity: number): string {
  return `${round(full * Math.max(intensity, 0.02), 3)}em`;
}

/** One pseudo-element's worth of glints: static background-image/position layers plus
 *  a keyframes block that scales each layer's background-size independently, so a
 *  single `animation` on a single pseudo can stagger several glints' wink timing. */
function buildGlintLayer(
  animName: string,
  spots: { x: number; y: number; scale: number }[],
  bright: string,
  mid: string,
  speed: number,
  phase: number,
): { css: string; keyframes: string } {
  const n = spots.length;
  const peaks = spots.map((_, i) =>
    Math.min(1 - WINDOW - 0.005, Math.max(WINDOW + 0.005, (i + 0.5) / n + phase)),
  );

  const images: string[] = [];
  const positions: string[] = [];
  const fullSizes: { w: number; h: number }[] = [];
  spots.forEach((spot) => {
    const pos = `${spot.x}% ${spot.y}%`;
    // Small radial core.
    images.push(`radial-gradient(circle, ${bright} 0%, ${mid} 42%, transparent 72%)`);
    positions.push(pos);
    fullSizes.push({ w: CORE_EM * spot.scale, h: CORE_EM * spot.scale });
    // Horizontal ray (tapers along its width).
    images.push(`linear-gradient(90deg, transparent 0%, ${bright} 50%, transparent 100%)`);
    positions.push(pos);
    fullSizes.push({ w: RAY_LEN_EM * spot.scale, h: RAY_THICK_EM * spot.scale });
    // Vertical ray (tapers along its height) — crosses the horizontal ray at the core.
    images.push(`linear-gradient(180deg, transparent 0%, ${bright} 50%, transparent 100%)`);
    positions.push(pos);
    fullSizes.push({ w: RAY_THICK_EM * spot.scale, h: RAY_LEN_EM * spot.scale });
  });

  const stops = new Set<number>([0, 1]);
  peaks.forEach((p) => {
    stops.add(round(Math.max(0, p - WINDOW), 4));
    stops.add(round(p, 4));
    stops.add(round(Math.min(1, p + WINDOW), 4));
  });
  const sorted = Array.from(stops).sort((a, b) => a - b);

  const rules = sorted.map((t) => {
    const sizes: string[] = [];
    spots.forEach((_, i) => {
      const intensity = tri(t, peaks[i], WINDOW);
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
    `  animation: ${animName} ${speed.toFixed(1)}s ease-in-out infinite;`;

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

    // Sparkle color: near-white core+rays, or a vivid tint of the chosen hue.
    const sparkleHue = white ? 0 : hue;
    const sparkleSat = white ? 0 : 88;
    const bright = hsl(sparkleHue, sparkleSat, white ? 100 : 78, 1);
    const mid = hsl(sparkleHue, sparkleSat, white ? 92 : 64, 0.55);

    const active = SPARKLE_SPOTS.slice(0, count);
    const half = Math.ceil(count / 2);
    const beforeSpots = active.slice(0, half);
    const afterSpots = active.slice(half);

    const scope = ctx.scope;
    const animBefore = anim(scope, "glint-a");
    const animAfter = anim(scope, "glint-b");

    const before = buildGlintLayer(animBefore, beforeSpots, bright, mid, speed, 0);
    const after = buildGlintLayer(animAfter, afterSpots, bright, mid, speed, 0.14);

    // Clean metallic base fill, kept mid-tone (never near-white/near-black) on BOTH
    // themes so the screen-blended glints always have contrast to brighten against —
    // a cool platinum tint for white sparkles, a tint of the chosen hue otherwise.
    const gemHue = white ? 210 : hue;
    const gemSat = white ? 8 : 22;
    const gemTop = ctx.theme === "dark" ? hsl(gemHue, gemSat, 46) : hsl(gemHue, gemSat + 2, 26);
    const gemMid = ctx.theme === "dark" ? hsl(gemHue, gemSat - 2, 32) : hsl(gemHue, gemSat, 17);
    const gemBottom = ctx.theme === "dark" ? hsl(gemHue, gemSat, 50) : hsl(gemHue, gemSat + 2, 30);
    const gem = `linear-gradient(155deg, ${gemTop} 0%, ${gemMid} 55%, ${gemBottom} 100%)`;

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
