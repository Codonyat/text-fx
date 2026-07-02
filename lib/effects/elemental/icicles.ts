import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText, dropGlow, anim, round } from "@/lib/engine/helpers";

/**
 * Icicles: frozen crystalline lettering with a band of sharp icicle spikes hanging
 * off the bottom edge of the text. The glyphs get a cold blue-white vertical fill
 * (background-clip:text) plus a frosty stroke — paler and colder than `ice`. The
 * signature is the `::after` strip below the baseline: a vertical ice gradient masked
 * by TWO layered conic-gradient triangle rows at different wavelengths/heights, so the
 * spikes read organic rather than a perfect zigzag. A slow specular "glint" sweeps
 * across the ice. Gradient/clipped fill -> glow MUST be filter: drop-shadow() (glow
 * guard), never text-shadow.
 */
const icicles: EffectDefinition = {
  id: "icicles",
  name: "Icicles",
  category: "elemental",
  tags: ["ice", "icicles", "frost", "winter", "crystal", "cold", "elemental", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + masked conic-gradient icicles (all modern, -webkit- prefixed)",
  controls: [
    {
      id: "hue",
      label: "Ice Hue",
      type: "range",
      default: 202,
      min: 175,
      max: 220,
      step: 1,
      unit: "°",
    },
    {
      id: "len",
      label: "Icicle Length",
      type: "range",
      default: 0.5,
      min: 0.25,
      max: 0.95,
      step: 0.05,
      unit: "em",
    },
    {
      id: "frost",
      label: "Frost",
      type: "range",
      default: 0.6,
      min: 0,
      max: 1,
      step: 0.05,
    },
  ],
  rand: (R) => ({
    hue: R.ri(182, 212),
    len: Number(R.rnd(0.4, 0.7).toFixed(2)),
    frost: Number(R.rnd(0.45, 0.8).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const len = ctx.values.len as number;
    const frost = ctx.values.frost as number;
    const dark = ctx.theme === "dark";

    // --- Crystalline fill on the glyphs (colder & paler than `ice`). ---
    const fillTop = dark ? hsl(h, 45, 98) : hsl(h, 68, 84);
    const fillMid = dark ? hsl(h, 72, 84) : hsl(h, 80, 66);
    const fillBot = dark ? hsl(h, 82, 66) : hsl(h, 85, 48);

    const strokeA = round(0.42 + frost * 0.42, 2);
    const strokeW = round(0.8 + frost * 1.3, 2);
    const strokeCol = dark ? hsl(h, 40, 100, strokeA) : hsl(h, 55, 100, strokeA);

    const glowCol = dark ? hsl(h, 88, 78, round(0.18 + frost * 0.22, 2)) : hsl(h, 70, 72, round(0.16 + frost * 0.2, 2));
    const gBlur = round(4 + frost * 7, 1);

    // --- Icicle strip colors (translucent blue-white; tips fade out). ---
    const icTop = dark ? hsl(h, 58, 95, 0.95) : hsl(h, 68, 88, 0.92);
    const icMid = dark ? hsl(h, 76, 82, 0.82) : hsl(h, 78, 70, 0.85);
    const icTip = dark ? hsl(h, 84, 74, 0.12) : hsl(h, 82, 55, 0.22);
    const glint = dark ? hsl(h, 50, 100, 0.55) : hsl(h, 45, 100, 0.65);
    const edge = dark ? hsl(h, 85, 62, 0.45) : hsl(h, 55, 35, 0.4);

    // --- Two triangle (apex-down) rows at different wavelengths & heights. ---
    // Conic wedge from the bottom-centre of each tile, opening straight up -> a
    // downward-pointing icicle. Base ~= tile width (slight overlap => a connected
    // frozen rim at the top), so `atan` keeps base constant while length varies.
    const w1 = 0.46;
    const w2 = 0.3;
    const overlap = 1.06;
    const h1 = round(len, 3);
    const h2 = round(Math.max(0.14, len * 0.56), 3);
    const half1 = round((Math.atan((w1 * overlap) / 2 / h1) * 180) / Math.PI, 1);
    const half2 = round((Math.atan((w2 * overlap) / 2 / h2) * 180) / Math.PI, 1);
    const offset = round(w1 * 0.5, 3);
    const spike = (half: number): string =>
      `conic-gradient(from ${-half}deg at 50% 100%, #fff ${round(half * 2, 1)}deg, transparent 0)`;
    const maskLayers = `${spike(half1)}, ${spike(half2)}`;

    const a = anim(ctx.scope, "glint");
    const dur = 5;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  ${clipText(`linear-gradient(180deg, ${fillTop} 0%, ${fillMid} 44%, ${fillBot} 100%)`)}\n` +
      `  -webkit-text-stroke: ${strokeW}px ${strokeCol};\n` +
      `  ${dropGlow(glowCol, [gBlur, round(gBlur * 0.5, 1)])}\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  right: 0;\n` +
      `  top: 100%;\n` +
      `  margin-top: -0.12em;\n` +
      `  height: ${h1}em;\n` +
      `  pointer-events: none;\n` +
      `  background:\n` +
      `    linear-gradient(100deg, transparent 42%, ${glint} 50%, transparent 58%),\n` +
      `    linear-gradient(180deg, ${icTop} 0%, ${icMid} 44%, ${icTip} 100%);\n` +
      `  background-size: 260% 100%, 100% 100%;\n` +
      `  background-repeat: no-repeat, no-repeat;\n` +
      `  background-position: -60% 0, 0 0;\n` +
      `  -webkit-mask-image: ${maskLayers};\n` +
      `  mask-image: ${maskLayers};\n` +
      `  -webkit-mask-size: ${w1}em ${h1}em, ${w2}em ${h2}em;\n` +
      `  mask-size: ${w1}em ${h1}em, ${w2}em ${h2}em;\n` +
      `  -webkit-mask-repeat: repeat-x, repeat-x;\n` +
      `  mask-repeat: repeat-x, repeat-x;\n` +
      `  -webkit-mask-position: 0 0, ${offset}em 0;\n` +
      `  mask-position: 0 0, ${offset}em 0;\n` +
      `  filter: drop-shadow(0 1px 1.4px ${edge});\n` +
      `  animation: ${a} ${dur}s ease-in-out infinite;\n` +
      `}`;

    // Slow glint: the specular streak sweeps across in the first third, then rests
    // off-screen — a quiet, occasional "drip" flash rather than a constant shimmer.
    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { background-position: -60% 0, 0 0; }\n` +
      `  32% { background-position: 165% 0, 0 0; }\n` +
      `  100% { background-position: 165% 0, 0 0; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: dur * 1000,
    };
  },
};

export default icicles;
