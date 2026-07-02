import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, dropGlow, round } from "@/lib/engine/helpers";

/**
 * Wave Crest: liquid fill whose surface is a REAL rolling wave. The waterline holds
 * at mid-height (unlike Water Fill's flat tide that rises/falls) but the surface is a
 * travelling sine crest — an SVG wave tile used as a repeat-x mask on a data-text copy,
 * scrolled one wavelength via mask-position so the crest visibly rolls along the text,
 * while a slow translateY bob makes the whole body swell. Below the crest a deep aqua
 * gradient fills the glyphs (background-clip:text); above it the letters read as a
 * hollow stroked outline. A second data-text copy, masked to a thin stroke riding the
 * exact same wave, is the bright FOAM line catching the crest (drop-shadow bloom — glow
 * guard, never text-shadow on clipped text).
 */
const waveCrest: EffectDefinition = {
  id: "wave-crest",
  name: "Wave Crest",
  category: "elemental",
  tags: ["water", "wave", "liquid", "foam", "surf", "ocean", "elemental", "animated"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "background-clip:text + an SVG wave mask travelled via mask-position",
  controls: [
    { id: "hue", label: "Water Hue", type: "range", default: 194, min: 150, max: 260, step: 1, unit: "°" },
    { id: "wave", label: "Wave Height", type: "range", default: 12, min: 4, max: 20, step: 1, unit: "%" },
    {
      id: "speed",
      label: "Travel Speed",
      type: "range",
      default: 3.2,
      min: 1.5,
      max: 8,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(180, 205),
    wave: R.ri(8, 15),
    speed: Number(R.rnd(2.4, 4.6).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const amp = ctx.values.wave as number;
    const speed = ctx.values.speed as number;
    const dark = ctx.theme === "dark";

    // SVG tile geometry (0..100 box; surface baseline at mid, stretched to fill the mask).
    const W = 100;
    const Hgt = 100;
    const mid = 50;
    const q = 25;
    const half = 50;
    const foamW = round(3 + amp * 0.32, 1); // foam band thickness (svg units)
    const period = round(0.9 + amp * 0.02, 2); // wavelength in em (bigger waves roll longer)

    // Theme-adapted palette (reads on both the dark and light stage).
    const outline = dark ? hsl(h, 48, 72, 0.9) : hsl(h, 62, 34, 0.92);
    const wTop = dark ? hsl(h, 70, 50) : hsl(h, 72, 46);
    const wBot = dark ? hsl((h + 10) % 360, 78, 30) : hsl((h + 10) % 360, 82, 30);
    const foam = dark ? hsl(h, 60, 90) : hsl(h, 66, 92);
    const foamGlow = hsl(h, 90, 80, 0.6);

    // One seamless sine period (Q up to the crest at W/4, T mirrors through the trough
    // at 3W/4) — slopes match across the tile edge so repeat-x rolls without a seam.
    const curve = `M0,${mid} Q${q},${mid - amp} ${half},${mid} T${W},${mid}`;

    // Water mask: the area BELOW the wave is opaque (shows the fill); above is hollow.
    const waterSvg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hgt}" ` +
      `viewBox="0 0 ${W} ${Hgt}" preserveAspectRatio="none">` +
      `<path d="${curve} L${W},${Hgt} L0,${Hgt} Z" fill="#000"/></svg>`;
    // Foam mask: the wave curve stroked (no fill) → a thin band riding the surface.
    const foamSvg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hgt}" ` +
      `viewBox="0 0 ${W} ${Hgt}" preserveAspectRatio="none">` +
      `<path d="${curve}" fill="none" stroke="#000" stroke-width="${foamW}" stroke-linecap="round"/></svg>`;
    const waterUri = `data:image/svg+xml,${encodeURIComponent(waterSvg)}`;
    const foamUri = `data:image/svg+xml,${encodeURIComponent(foamSvg)}`;

    const travel = anim(ctx.scope, "travel");
    const bob = anim(ctx.scope, "bob");
    const bobDur = round(speed * 1.5, 2);

    const maskBlock = (uri: string) =>
      `  -webkit-mask-image: url("${uri}");\n` +
      `  mask-image: url("${uri}");\n` +
      `  -webkit-mask-repeat: repeat-x;\n` +
      `  mask-repeat: repeat-x;\n` +
      `  -webkit-mask-size: ${period}em 100%;\n` +
      `  mask-size: ${period}em 100%;\n` +
      `  -webkit-mask-position: 0 0;\n` +
      `  mask-position: 0 0;\n`;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  -webkit-text-stroke: 1.5px ${outline};\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `}\n` +
      `.${ctx.scope}::before, .${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  pointer-events: none;\n` +
      `  animation: ${travel} ${speed.toFixed(1)}s linear infinite, ${bob} ${bobDur}s ease-in-out infinite;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  background: linear-gradient(to bottom, ${wTop} 0%, ${wBot} 100%);\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      maskBlock(waterUri) +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  color: ${foam};\n` +
      `  -webkit-text-fill-color: ${foam};\n` +
      maskBlock(foamUri) +
      `  ${dropGlow(foamGlow, [3, 6])}\n` +
      `}`;

    const keyframes =
      `@keyframes ${travel} {\n` +
      `  from { -webkit-mask-position: 0 0; mask-position: 0 0; }\n` +
      `  to { -webkit-mask-position: -${period}em 0; mask-position: -${period}em 0; }\n` +
      `}\n` +
      `@keyframes ${bob} {\n` +
      `  0%, 100% { transform: translateY(0.045em); }\n` +
      `  50% { transform: translateY(-0.045em); }\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      // Travel loops every `speed`s, bob every 1.5×`speed`s — they realign at 3×`speed`.
      loopMs: Math.round(speed * 3000),
    };
  },
};

export default waveCrest;
