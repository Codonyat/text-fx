import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * Neon sign self-drawing tube: the word is an inline <svg><text> with a transparent
 * fill and a coloured stroke = the glass tube. The stroke DRAWS ITSELF by animating
 * stroke-dashoffset (a generous fixed dasharray, since per-glyph path lengths are
 * unknowable) while a matching drop-shadow halo brightens as the draw completes. Once
 * lit it holds with a faint buzz, powers down in a broken-sign flicker, then silently
 * resets and redraws — an infinite loop, so no one-shot hover-replay is needed.
 *
 * The SVG text inherits the shared font: the engine sets font-family/weight/tracking on
 * the scope (the <svg>) and the SVG viewport inherits font-size from the studio/export
 * wrapper, so the tube matches every other effect's metrics. Base (non-animated) values
 * are the fully-lit, fully-drawn frame, so posters / PNG / reduced-motion rest on a
 * presentable lit sign rather than a hidden one.
 */
const neonTubeDraw: EffectDefinition = {
  id: "neon-tube-draw",
  name: "Neon Tube Draw",
  category: "neon-glow",
  tags: ["neon", "glow", "sign", "tube", "draw", "svg", "animated"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "SVG <text> stroke self-draw + drop-shadow glow (all modern browsers)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Draw Speed", type: "range", default: 6, min: 1, max: 10, step: 1 },
    { id: "glow", label: "Glow", type: "range", default: 18, min: 6, max: 40, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: R.ri(4, 8),
    glow: R.ri(12, 28),
  }),
  build: (ctx) => {
    const scope = ctx.scope;
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const g = ctx.values.glow as number;
    const dark = ctx.theme === "dark";

    // Glass-tube stroke + a bright core and a wide coloured halo, all tuned to read on
    // BOTH themes (a saturated mid-tone tube keeps contrast against a white stage).
    const tube = dark ? hsl(h, 100, 70) : hsl(h, 95, 52);
    const core = dark ? hsl(h, 100, 90) : hsl(h, 100, 70);
    const halo = dark ? hsl(h, 100, 58, 0.9) : hsl(h, 95, 55, 0.85);

    // Layered drop-shadow glow at intensity k (0 = dark, 1 = lit, >1 = ignition bloom).
    // Same layer count in every keyframe so the filter interpolates smoothly.
    const gf = (k: number) =>
      `drop-shadow(0 0 ${round(g * 0.14 * k, 1)}px ${core}) ` +
      `drop-shadow(0 0 ${round(g * 0.5 * k, 1)}px ${tube}) ` +
      `drop-shadow(0 0 ${round(g * 1.15 * k, 1)}px ${halo})`;

    // Content-derived, definite width (em, so it scales with the inherited font-size and
    // never collapses inside a shrink-to-fit export/poster box). text-anchor:middle keeps
    // the word centred whatever the estimate; overflow:visible lets the glow/tube spill.
    const chars = Array.from(ctx.text).length || 1;
    const w = round(Math.min(Math.max(chars * 0.62, 4), 24), 2);

    // Longer loop = slower draw. dur scales the whole cycle (draw ≈ first quarter).
    const dur = (15 - speed) * 1000;
    const sign = anim(scope, "sign");

    const css =
      `.${scope} {\n` +
      `  display: inline-block;\n` +
      `  vertical-align: middle;\n` +
      `  width: ${w}em;\n` +
      `  max-width: 100%;\n` +
      `  height: 1.3em;\n` +
      `  overflow: visible;\n` +
      `}\n` +
      `.${scope} text {\n` +
      `  fill: transparent;\n` +
      `  stroke: ${tube};\n` +
      `  stroke-width: 0.045em;\n` +
      `  stroke-linejoin: round;\n` +
      `  stroke-linecap: round;\n` +
      `  text-anchor: middle;\n` +
      `  dominant-baseline: central;\n` +
      `  stroke-dasharray: 1000 800;\n` +
      `  stroke-dashoffset: 0;\n` +
      `  opacity: 1;\n` +
      `  filter: ${gf(1)};\n` +
      `  animation: ${sign} ${dur}ms ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${sign} {\n` +
      `  0%   { stroke-dashoffset: 1000; opacity: 0.35; filter: ${gf(0)}; }\n` +
      `  8%   { opacity: 0.85; }\n` +
      `  26%  { stroke-dashoffset: 0; opacity: 1; filter: ${gf(0.9)}; }\n` +
      `  30%  { filter: ${gf(1.45)}; }\n` +
      `  38%  { filter: ${gf(1)}; }\n` +
      `  49%  { filter: ${gf(1)}; }\n` +
      `  51%  { filter: ${gf(0.72)}; }\n` +
      `  53%  { filter: ${gf(1.05)}; }\n` +
      `  66%  { opacity: 1; filter: ${gf(1)}; }\n` +
      `  69%  { opacity: 0.28; filter: ${gf(0.22)}; }\n` +
      `  71%  { opacity: 1; filter: ${gf(1.12)}; }\n` +
      `  73%  { opacity: 0.14; filter: ${gf(0.1)}; }\n` +
      `  75%  { opacity: 0.9; filter: ${gf(0.78)}; }\n` +
      `  77%  { opacity: 0.08; filter: ${gf(0.05)}; }\n` +
      `  80%  { opacity: 0.55; filter: ${gf(0.4)}; }\n` +
      `  84%  { stroke-dashoffset: 0; opacity: 0; filter: ${gf(0)}; }\n` +
      `  100% { stroke-dashoffset: 1000; opacity: 0; filter: ${gf(0)}; }\n` +
      `}`;

    return {
      root: el("svg", {
        attrs: { xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true" },
        children: [
          el("text", { attrs: { x: "50%", y: "50%" }, children: [text(ctx.text)] }),
        ],
      }),
      css,
      keyframes,
      loopMs: dur,
    };
  },
};

export default neonTubeDraw;
