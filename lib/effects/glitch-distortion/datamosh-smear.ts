import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, round } from "@/lib/engine/helpers";

/**
 * Datamosh pixel-smear: an SVG displacement filter driven by ANISOTROPIC noise
 * (baseFrequency coherent along X, banded along Y) so whole horizontal strips of the
 * glyphs drag sideways like broken video macroblocks. A tinted feFlood ghost, offset
 * and hue-skewed, surfaces on top of the smear. The whole thing is GATED: SMIL
 * `<animate>` runs on calcMode="discrete" with irregular keyTimes so the word sits
 * pristine for long stretches, then suffers a violent stepped burst, then goes clean
 * again — the opposite of a smooth continuous wobble. Filter id is salted; the seed
 * jumps per burst-frame so no two corruption frames look alike. The main burst is
 * anchored to ~0.3s–1.8s of each loop (posters/first impressions sample early), and
 * the filter's RESTING attributes carry a mild smear so SMIL-less static
 * rasterizations still read as datamosh.
 */
const datamoshSmear: EffectDefinition = {
  id: "datamosh-smear",
  name: "Datamosh Smear",
  category: "glitch-distortion",
  tags: ["glitch", "datamosh", "smear", "corruption", "svg", "displacement", "animated"],
  caps: ["pure", "svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence/feDisplacementMap + feFlood ghost, SMIL-gated bursts via filter:url(#…)",
  controls: [
    { id: "intensity", label: "Burst Force", type: "range", default: 44, min: 8, max: 80, step: 1, unit: "px" },
    { id: "frequency", label: "Burst Rate", type: "range", default: 4, min: 1, max: 10, step: 0.5 },
    { id: "hue", label: "Hue Skew", type: "range", default: 300, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    intensity: R.ri(30, 60),
    frequency: Number(R.rnd(3, 6).toFixed(1)),
    hue: R.ri(0, 360),
  }),
  build: (ctx) => {
    const intensity = ctx.values.intensity as number;
    const frequency = ctx.values.frequency as number;
    const h = ctx.values.hue as number;

    // Clean stretches must read perfectly on both themes; the burst does the damage.
    const base = ctx.theme === "dark" ? "#eef1f4" : "#15181c";
    const tint = ctx.theme === "dark" ? hsl(h, 96, 62) : hsl(h, 92, 48);

    const fid = svgId(ctx.scope, "mosh");

    const period = round(13 / frequency, 2);

    // Burst timeline: [normalizedTime, burstLevel]. level 0 = pristine (held via
    // discrete stepping). The MAIN burst is anchored in ABSOLUTE time — in progress
    // from ~0.3s to ~1.8s of every loop — so posters/screenshots sampling the first
    // couple of seconds always catch the corruption. t=0 holds a mild resting smear
    // (never a dead-clean first frame); a brief second micro-burst hits late, leaving
    // the long clean stretch in between.
    const bStart = round(Math.min(0.3 / period, 0.2), 4);
    const bEnd = round(Math.min(1.8 / period, 0.72), 4);
    const burstPos = [0, 0.12, 0.24, 0.35, 0.5, 0.62, 0.76, 0.88];
    const burstLvl = [1.0, 0.4, 0.9, 0.2, 0.7, 1.0, 0.35, 0.85];
    const rest = 0.22;
    const frames: Array<[number, number]> = [[0.0, rest]];
    burstPos.forEach((k, i) => {
      frames.push([round(bStart + (bEnd - bStart) * k, 4), burstLvl[i]]);
    });
    frames.push([bEnd, 0]);
    frames.push([0.84, 0.9], [0.865, 0.3], [0.885, 0.75], [0.905, 0], [1.0, 0]);

    const keyTimes = frames.map(([t]) => t).join(";");
    const scaleVals = frames.map(([, l]) => round(l * intensity, 1)).join(";");
    const opacityVals = frames.map(([, l]) => round(l * 0.72, 3)).join(";");
    // Signed sideways jitter for the tinted ghost — only shows when level > 0.
    const dxVals = frames
      .map(([, l], i) => round(l * intensity * 0.5 * (i % 2 === 0 ? 1 : -1), 1))
      .join(";");
    // Reshuffle the noise field every frame so each corruption frame differs.
    const seedVals = frames.map((_, i) => (i * 5 + 2) % 19).join(";");

    const dur = `${period}s`;

    // Resting (pre-SMIL) attribute values = the mild smear level, so static
    // rasterizations (PNG/poster contexts that don't advance SMIL) read as datamosh.
    const restScale = round(rest * intensity, 1);
    const restOpacity = round(rest * 0.72, 3);
    const restDx = round(rest * intensity * 0.5, 1);

    const defs =
      `<filter id="${fid}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">\n` +
      `  <feTurbulence type="turbulence" baseFrequency="0.01 0.14" numOctaves="1" seed="2" result="noise">\n` +
      `    <animate attributeName="seed" dur="${dur}" keyTimes="${keyTimes}" values="${seedVals}" calcMode="discrete" repeatCount="indefinite"/>\n` +
      `  </feTurbulence>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="noise" scale="${restScale}" xChannelSelector="R" yChannelSelector="G" result="smear">\n` +
      `    <animate attributeName="scale" dur="${dur}" keyTimes="${keyTimes}" values="${scaleVals}" calcMode="discrete" repeatCount="indefinite"/>\n` +
      `  </feDisplacementMap>\n` +
      `  <feFlood flood-color="${tint}" flood-opacity="${restOpacity}" result="flood">\n` +
      `    <animate attributeName="flood-opacity" dur="${dur}" keyTimes="${keyTimes}" values="${opacityVals}" calcMode="discrete" repeatCount="indefinite"/>\n` +
      `  </feFlood>\n` +
      `  <feComposite in="flood" in2="smear" operator="in" result="ghost0"/>\n` +
      `  <feOffset in="ghost0" dx="${restDx}" dy="0" result="ghost">\n` +
      `    <animate attributeName="dx" dur="${dur}" keyTimes="${keyTimes}" values="${dxVals}" calcMode="discrete" repeatCount="indefinite"/>\n` +
      `  </feOffset>\n` +
      `  <feMerge>\n` +
      `    <feMergeNode in="ghost"/>\n` +
      `    <feMergeNode in="smear"/>\n` +
      `  </feMerge>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  filter: url(#${fid});\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      defs,
      loopMs: Math.round(period * 1000),
    };
  },
};

export default datamoshSmear;
