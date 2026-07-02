import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, svgId, round } from "@/lib/engine/helpers";

/**
 * TV Static: the glyphs are filled with harsh black-and-white broadcast snow. An SVG
 * feTurbulence (high baseFrequency) is desaturated and hard-thresholded to pure B/W
 * speckle via feColorMatrix + feComponentTransfer, then composited "in" to the glyphs'
 * alpha so the noise only lives inside the word's silhouette. A SMIL <animate> steps the
 * turbulence seed (calcMode="discrete") so the static crawls frame-to-frame like a dead
 * channel. An optional low-vertical-frequency band screens over it for a soft rolling sync
 * bar, plus a faint cool tint and a subtle CSS brightness flicker. The filter/keyframe names
 * are salted; seeds are fixed strings so renders stay deterministic (parity-safe).
 *
 * Noise statistics matter here: type="fractalNoise" is REQUIRED — its channel values are
 * spec'd as (sum+1)/2, centered at 0.5, so the discrete threshold at 0.5 yields a genuine
 * ~50/50 black/white speckle at every frame (including the static poster frame).
 * type="turbulence" outputs |sum|, biased toward 0, which thresholds to near-solid black
 * (invisible on the dark theme). A small theme-adaptive luminance bias tips the split
 * toward the speckle color that contrasts the stage: white-heavy on dark, black-heavy on
 * light — so the word stays punchy on both themes.
 */
const tvStatic: EffectDefinition = {
  id: "tv-static",
  name: "TV Static",
  category: "glitch-distortion",
  tags: ["glitch", "static", "noise", "crt", "analog", "svg", "animated"],
  caps: ["pure", "svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence snow (SMIL-animated seed) composited to text via filter:url(#…)",
  controls: [
    {
      id: "scale",
      label: "Noise Scale",
      type: "range",
      default: 6,
      min: 3,
      max: 10,
      step: 0.1,
    },
    {
      id: "speed",
      label: "Crawl Speed",
      type: "range",
      default: 6,
      min: 1,
      max: 10,
      step: 0.1,
    },
    {
      id: "roll",
      label: "Roll Bar",
      type: "toggle",
      default: true,
      onLabel: "On",
      offLabel: "Off",
    },
  ],
  rand: (R) => ({
    scale: Number(R.rnd(5, 8).toFixed(1)),
    speed: Number(R.rnd(5, 8).toFixed(1)),
    roll: R.chance(0.75),
  }),
  build: (ctx) => {
    const scale = ctx.values.scale as number;
    const speed = ctx.values.speed as number;
    const roll = ctx.values.roll as boolean;

    // Higher Noise Scale -> finer, denser snow (higher turbulence frequency).
    const freq = round(0.28 + scale * 0.072, 3);
    // Faster Crawl -> shorter per-cycle duration over the 16 discrete seed frames.
    const snowDur = round(16 / (5 + speed * 2.2), 2);
    const rollDur = round(13 - speed * 0.6, 1);

    const fid = svgId(ctx.scope, "static");
    const flick = anim(ctx.scope, "flick");

    // Tip the 50/50 threshold toward the speckle tone that contrasts the stage.
    const bias = ctx.theme === "dark" ? "0.05" : "-0.05";

    // Stepped seeds -> authentic frame-to-frame snow; linear seeds -> soft morphing roll.
    const snowSeeds = "2;11;5;14;3;9;15;6;12;1;8;13;4;10;7;2";
    const rollSeeds = "3;6;9;6;3";

    // Optional roll bar: a low vertical-frequency band forced to faint white, screened on.
    const rollBlock = roll
      ? `  <feTurbulence type="fractalNoise" baseFrequency="0.0015 0.022" numOctaves="1" seed="3" result="rn">\n` +
        `    <animate attributeName="seed" values="${rollSeeds}" dur="${rollDur}s" calcMode="linear" repeatCount="indefinite"/>\n` +
        `  </feTurbulence>\n` +
        `  <feColorMatrix in="rn" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0.5 0 0 -0.12" result="band"/>\n` +
        `  <feBlend in="snow" in2="band" mode="screen" result="lit"/>\n`
      : "";
    const preClip = roll ? "lit" : "snow";

    const defs =
      `<filter id="${fid}" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="1" stitchTiles="stitch" result="noise">\n` +
      `    <animate attributeName="seed" values="${snowSeeds}" dur="${snowDur}s" calcMode="discrete" repeatCount="indefinite"/>\n` +
      `  </feTurbulence>\n` +
      `  <feColorMatrix in="noise" type="matrix" values="0.34 0.33 0.33 0 ${bias}  0.34 0.33 0.33 0 ${bias}  0.34 0.33 0.33 0 ${bias}  0 0 0 0 1" result="gray"/>\n` +
      `  <feComponentTransfer in="gray" result="snow">\n` +
      `    <feFuncR type="discrete" tableValues="0 1"/>\n` +
      `    <feFuncG type="discrete" tableValues="0 1"/>\n` +
      `    <feFuncB type="discrete" tableValues="0 1"/>\n` +
      `  </feComponentTransfer>\n` +
      rollBlock +
      `  <feComposite in="${preClip}" in2="SourceGraphic" operator="in" result="clipped"/>\n` +
      `  <feColorMatrix in="clipped" type="matrix" values="0.94 0 0 0 0  0 0.96 0 0 0  0 0 1 0 0  0 0 0 1 0"/>\n` +
      `</filter>`;

    // Solid opaque glyphs supply the alpha mask; the filter replaces their color with snow.
    const css =
      `.${ctx.scope} {\n` +
      `  color: #000;\n` +
      `  filter: url(#${fid});\n` +
      `  animation: ${flick} 3.6s linear infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${flick} {\n` +
      `  0%, 100% { opacity: 1; }\n` +
      `  8%       { opacity: 0.85; }\n` +
      `  9%       { opacity: 1; }\n` +
      `  41%      { opacity: 0.93; }\n` +
      `  42%      { opacity: 1; }\n` +
      `  73%      { opacity: 0.88; }\n` +
      `  74%      { opacity: 1; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      defs,
      loopMs: Math.round(snowDur * 1000),
    };
  },
};

export default tvStatic;
