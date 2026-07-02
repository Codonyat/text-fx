import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, round } from "@/lib/engine/helpers";

/**
 * Particle dissolve — Thanos-snap typography. An SVG filter shatters the glyph body
 * into fine dust: a high-frequency feTurbulence feeds a feDisplacementMap whose scale
 * ramps from 0 (formed) to violent (pixels scatter into speckle), a feGaussianBlur
 * softens the grains, a feOffset pulls the whole cloud in the drift direction, and a
 * feComponentTransfer fades the alpha to nothing. SMIL animates every attribute in sync
 * with a long FORMED hold, a dissolve-out, a brief gone stretch, then a reform. Distinct
 * from Smoke Drift (per-letter blur/fade in place) — this SCATTERS the letterforms into
 * a directional drift of particles and re-forms. The resting (t=0 / SMIL-less) state is
 * the formed word, so posters and static rasterizers read legible text; filter id salted,
 * noise seed fixed (parity-safe).
 */
const particleDissolve: EffectDefinition = {
  id: "particle-dissolve",
  name: "Particle Dissolve",
  category: "elemental",
  tags: ["dissolve", "particles", "dust", "disintegrate", "thanos", "svg", "displacement", "animated"],
  caps: ["pure", "svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence/feDisplacementMap dissolve, SMIL-animated (scale/blur/offset/alpha) via filter:url(#…)",
  controls: [
    { id: "speed", label: "Speed", type: "range", default: 6, min: 4, max: 12, step: 0.5, unit: "s" },
    { id: "scatter", label: "Scatter", type: "range", default: 72, min: 24, max: 120, step: 2, unit: "px" },
    { id: "drift", label: "Drift", type: "angle", default: 45, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    speed: Number(R.rnd(5, 8).toFixed(1)),
    scatter: R.ri(56, 92),
    // Ash rises: bias the drift up-and-to-a-side (math coords, 90° = straight up).
    drift: R.pick([30, 45, 60, 90, 120, 135, 150]),
  }),
  build: (ctx) => {
    const speed = ctx.values.speed as number;
    const scatter = ctx.values.scatter as number;
    const drift = ctx.values.drift as number;

    // Warm-neutral ash that stays legible on either stage.
    const ash = ctx.theme === "dark" ? hsl(28, 12, 87) : hsl(24, 14, 23);
    const fid = svgId(ctx.scope, "dissolve");

    // Drift vector from the angle (SVG +y points down, so up = negative dy).
    const rad = (drift * Math.PI) / 180;
    const driftMag = round(scatter * 0.45, 1);
    const dx = round(Math.cos(rad) * driftMag, 1);
    const dy = round(-Math.sin(rad) * driftMag, 1);
    const blur = round(scatter * 0.085, 1);

    // One shared timeline: formed hold → dissolve out → brief gone → reform → formed
    // tail. t=0 sits FORMED so posters/first frames catch legible text. Every filter
    // attribute's RESTING value (below) equals its formed keyframe, so SMIL-less
    // rasterizers render the intact word too.
    const kt = "0;0.34;0.52;0.6;0.82;1";
    const scaleVals = `0;0;${scatter};${scatter};0;0`;
    const blurVals = `0;0;${blur};${blur};0;0`;
    const dxVals = `0;0;${dx};${dx};0;0`;
    const dyVals = `0;0;${dy};${dy};0;0`;
    const alphaVals = "1;1;0;0;1;1";
    const dur = `${speed}s`;

    const defs =
      `<filter id="${fid}" x="-75%" y="-75%" width="250%" height="250%" color-interpolation-filters="sRGB">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="3" seed="7" result="dust"/>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="dust" scale="0" xChannelSelector="R" yChannelSelector="G" result="scatter">\n` +
      `    <animate attributeName="scale" dur="${dur}" keyTimes="${kt}" values="${scaleVals}" repeatCount="indefinite"/>\n` +
      `  </feDisplacementMap>\n` +
      `  <feGaussianBlur in="scatter" stdDeviation="0" result="soft">\n` +
      `    <animate attributeName="stdDeviation" dur="${dur}" keyTimes="${kt}" values="${blurVals}" repeatCount="indefinite"/>\n` +
      `  </feGaussianBlur>\n` +
      `  <feOffset in="soft" dx="0" dy="0" result="cloud">\n` +
      `    <animate attributeName="dx" dur="${dur}" keyTimes="${kt}" values="${dxVals}" repeatCount="indefinite"/>\n` +
      `    <animate attributeName="dy" dur="${dur}" keyTimes="${kt}" values="${dyVals}" repeatCount="indefinite"/>\n` +
      `  </feOffset>\n` +
      `  <feComponentTransfer in="cloud">\n` +
      `    <feFuncA type="linear" slope="1" intercept="0">\n` +
      `      <animate attributeName="slope" dur="${dur}" keyTimes="${kt}" values="${alphaVals}" repeatCount="indefinite"/>\n` +
      `    </feFuncA>\n` +
      `  </feComponentTransfer>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${ash};\n` +
      `  filter: url(#${fid});\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      defs,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default particleDissolve;
