import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, clipText, round } from "@/lib/engine/helpers";

/**
 * Underwater caustics: sunlight webbing on a pool floor, playing across the glyphs.
 * The letters sit in a deep aqua gradient (background-clip:text); an SVG filter builds
 * the light on top of them — feTurbulence fractal noise is spiked by a feComponentTransfer
 * table (a narrow triangular pulse at mid-value isolates the level-set contour of the
 * field → thin, branching, cellular ridge lines), flooded white-cyan, then screened over
 * the glyph and clipped to it via SourceAlpha. TWO layers at different scales/speeds
 * (fine+fast over coarse+slow) give depth, each SMIL-morphing its baseFrequency so the
 * web writhes and crawls organically, with a gentle flood-opacity pulse for the
 * light-through-water shimmer. A soft blue ambient drop-shadow blooms the whole thing.
 * Distinct from Liquid Warp / Wave Crest / Water Fill: the glyph edges are never distorted
 * and there is no waterline — this is the LIGHT phenomenon, not the water body.
 */
const caustics: EffectDefinition = {
  id: "caustics",
  name: "Caustics",
  category: "elemental",
  tags: ["water", "caustics", "underwater", "light", "pool", "svg", "elemental", "animated"],
  caps: ["pure", "svgDefs"],
  pngSupport: "partial",
  supports: "SVG feTurbulence spiked to ridge lines + background-clip:text (SMIL-animated)",
  controls: [
    { id: "hue", label: "Water Hue", type: "range", default: 188, min: 150, max: 260, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Shimmer Speed",
      type: "range",
      default: 5.5,
      min: 2,
      max: 12,
      step: 0.1,
      unit: "s",
    },
    { id: "brightness", label: "Web Brightness", type: "range", default: 1, min: 0.5, max: 1.4, step: 0.05 },
  ],
  rand: (R) => ({
    hue: R.ri(178, 208),
    speed: Number(R.rnd(4, 8).toFixed(1)),
    brightness: Number(R.rnd(0.85, 1.2).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const brightness = ctx.values.brightness as number;
    const dark = ctx.theme === "dark";

    const fid = svgId(ctx.scope, "caustics");

    // Deep-aqua glyph fill: sunlit near the top, sinking to deep teal at the floor.
    // Kept legible on both stages (a touch brighter on dark so it clears the black).
    const t1 = dark ? hsl(h, 68, 46) : hsl(h, 72, 40);
    const t2 = dark ? hsl((h + 6) % 360, 78, 34) : hsl((h + 6) % 360, 82, 30);
    const t3 = dark ? hsl((h + 12) % 360, 85, 24) : hsl((h + 12) % 360, 88, 20);
    const grad = `linear-gradient(180deg, ${t1} 0%, ${t2} 55%, ${t3} 100%)`;

    // Caustic light colours: fine strands are near-white cyan; the slow deep web is a
    // more saturated cyan. Both are screened over the fill, so they only ever brighten.
    const webFine = dark ? hsl(h, 82, 90) : hsl(h, 80, 88);
    const webDeep = dark ? hsl((h + 4) % 360, 88, 76) : hsl((h + 4) % 360, 84, 72);

    // Soft blue ambient bloom (filter drop-shadow — glow guard for clipped text).
    const glow = hsl((h + 4) % 360, 90, 62, 0.5);
    const glow2 = hsl((h + 8) % 360, 95, 55, 0.32);

    const dur = round(speed, 1);
    const durSlow = round(speed * 2, 1);

    // One caustic layer: noise → single-channel field → spiked ridge lines → coloured
    // flood clipped to the ridges. `suffix` keeps every intermediate result name unique.
    const layer = (
      suffix: string,
      freqValues: string,
      seed: number,
      octaves: number,
      layerDur: number,
      color: string,
      floodValues: string,
      floodDur: number,
    ): string => {
      const first = freqValues.split(";")[0].trim();
      return [
        `  <feTurbulence type="fractalNoise" baseFrequency="${first}" numOctaves="${octaves}" seed="${seed}" result="t${suffix}">`,
        `    <animate attributeName="baseFrequency" dur="${layerDur}s" values="${freqValues}" ` +
          `calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" repeatCount="indefinite"/>`,
        `  </feTurbulence>`,
        // Collapse to a single scalar field carried in the alpha channel (red → alpha, RGB → 0).
        `  <feColorMatrix in="t${suffix}" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="f${suffix}"/>`,
        // Narrow triangular pulse at mid-value: isolates the field's level-set → thin ridge lines.
        `  <feComponentTransfer in="f${suffix}" result="r${suffix}">`,
        `    <feFuncA type="table" tableValues="0 0 0 0 1 0 0 0 0"/>`,
        `  </feComponentTransfer>`,
        // Colour the ridges and pulse their intensity (the shimmer).
        `  <feFlood flood-color="${color}" flood-opacity="1" result="fl${suffix}">`,
        `    <animate attributeName="flood-opacity" dur="${floodDur}s" values="${floodValues}" repeatCount="indefinite"/>`,
        `  </feFlood>`,
        `  <feComposite in="fl${suffix}" in2="r${suffix}" operator="in" result="color${suffix}"/>`,
      ].join("\n");
    };

    const layerFine = layer(
      "A",
      "0.013 0.018;0.018 0.014;0.013 0.018",
      4,
      2,
      dur,
      webFine,
      "1;0.72;1",
      round(speed * 0.9, 1),
    );
    const layerDeep = layer(
      "B",
      "0.006 0.009;0.009 0.006;0.006 0.009",
      11,
      2,
      durSlow,
      webDeep,
      "0.9;1;0.9",
      round(speed * 1.3, 1),
    );

    const defs =
      `<filter id="${fid}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">\n` +
      layerFine +
      `\n` +
      layerDeep +
      `\n` +
      // Combine the two webs (screen keeps overlaps as light, never muddy).
      `  <feBlend mode="screen" in="colorA" in2="colorB" result="webs"/>\n` +
      // Web Brightness knob: scale the combined web alpha.
      `  <feComponentTransfer in="webs" result="websAdj">\n` +
      `    <feFuncA type="linear" slope="${round(brightness, 2)}"/>\n` +
      `  </feComponentTransfer>\n` +
      // Clip the light strictly to the glyph, then screen it over the deep-aqua fill.
      `  <feComposite in="websAdj" in2="SourceAlpha" operator="in" result="websIn"/>\n` +
      `  <feBlend mode="screen" in="SourceGraphic" in2="websIn" result="lit"/>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(grad)}\n` +
      `  filter: url(#${fid}) drop-shadow(0 0 5px ${glow}) drop-shadow(0 0 15px ${glow2});\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      defs,
      // Fine layer loops every `speed`s, deep every 2×`speed`s — realign at 2×.
      loopMs: Math.round(speed * 2000),
    };
  },
};

export default caustics;
