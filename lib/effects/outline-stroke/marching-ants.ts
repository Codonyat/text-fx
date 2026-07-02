import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * Marching-ants outline: the selection-marquee classic wrapped around the letters.
 * A data-text duplicate (::after) is drawn as a hollow -webkit-text-stroke outline, then
 * chopped into crisp diagonal dashes by a repeating-linear-gradient mask (hard stops).
 * Animating the mask-position by exactly one pattern period slides those dashes forever,
 * so they crawl along the stroke band like marching ants — no SVG contour-following needed.
 * A faint inner fill tint on the root keeps the hollow glyph reading intentional. Monochrome
 * (white on dark / black on light) by default; the Tint control adds a hue. Distinct from the
 * Marching Underline (dashes in a bar beneath the text) and the static solid Outline.
 */
const marchingAnts: EffectDefinition = {
  id: "marching-ants",
  name: "Marching Ants",
  category: "outline-stroke",
  tags: ["outline", "stroke", "hollow", "dashed", "marching-ants", "marquee", "animated"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke masked by an animated repeating-gradient (all modern, prefixed)",
  controls: [
    { id: "dash", label: "Dash", type: "range", default: 8, min: 3, max: 16, step: 1, unit: "px" },
    { id: "speed", label: "Speed", type: "range", default: 4, min: 1.5, max: 10, step: 0.1, unit: "s" },
    { id: "tint", label: "Tint", type: "range", default: 0, min: 0, max: 80, step: 1, unit: "%" },
    {
      id: "hue",
      label: "Hue",
      type: "range",
      default: 210,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
      when: (v) => (v.tint as number) > 0,
    },
  ],
  rand: (R) => {
    const tint = R.chance(0.45) ? R.ri(35, 65) : 0;
    return {
      dash: R.ri(6, 12),
      speed: Number(R.rnd(3, 6).toFixed(1)),
      tint,
      hue: R.ri(0, 360),
    };
  },
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const dash = ctx.values.dash as number;
    const speed = ctx.values.speed as number;
    const tint = ctx.values.tint as number;

    const dark = ctx.theme === "dark";
    // Contrast is guaranteed by pinning lightness to the extremes: near-white ants on the
    // dark stage, near-black on the light one. Tint adds saturation but only nudges the
    // lightness (95→87 / 12→20 at max tint), so even fully tinted variants stay bright.
    const light = dark ? round(95 - tint * 0.1, 1) : round(12 + tint * 0.1, 1);
    const ink = hsl(h, tint, light);
    // Translucent interior fill so the hollow glyph silhouette reads at rest,
    // while the marching stroke stays clearly the star.
    const fill = hsl(h, tint, light, 0.28);

    // Dash-heavy duty cycle (~62% on): a thin 50/50 chop leaves so little lit stroke
    // that the word averages to gray at page scale — wider dashes + a thicker stroke
    // keep the marquee unmistakably bright. `period` is measured along the 45° gradient
    // axis; `tile` is that period projected onto the x/y axes — using it for both
    // mask-size and the position shift keeps the tiling AND the loop perfectly seamless.
    const period = dash * 2;
    const on = round(dash * 1.25, 2);
    const tile = round(period * Math.SQRT2, 2);
    const a = anim(ctx.scope, "march");
    // drop-shadow applies AFTER the mask, so this halo hugs the dashes themselves —
    // lifts perceived brightness without softening the hard dash edges.
    const halo = `drop-shadow(0 0 1px ${ink}) drop-shadow(0 0 6px ${hsl(h, tint, light, 0.4)})`;

    const maskImg =
      `repeating-linear-gradient(45deg, ` +
      `#000 0, #000 ${on}px, transparent ${on}px, transparent ${period}px)`;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  color: ${fill};\n` +
      `  -webkit-text-fill-color: ${fill};\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  pointer-events: none;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  -webkit-text-stroke: 3.5px ${ink};\n` +
      `  filter: ${halo};\n` +
      `  -webkit-mask-image: ${maskImg};\n` +
      `          mask-image: ${maskImg};\n` +
      `  -webkit-mask-size: ${tile}px ${tile}px;\n` +
      `          mask-size: ${tile}px ${tile}px;\n` +
      `  -webkit-mask-repeat: repeat;\n` +
      `          mask-repeat: repeat;\n` +
      `  -webkit-mask-position: 0 0;\n` +
      `          mask-position: 0 0;\n` +
      `  animation: ${a} ${speed}s linear infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  to {\n` +
      `    -webkit-mask-position: ${tile}px 0;\n` +
      `            mask-position: ${tile}px 0;\n` +
      `  }\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default marchingAnts;
