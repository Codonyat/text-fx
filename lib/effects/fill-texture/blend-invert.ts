import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * Background-inverting text. The scope carries its OWN backdrop (a bold two-tone
 * diagonal stripe band on ::before) that drifts forever; a near-white duplicate of
 * the text (::after, content: attr(data-text)) sits on top with
 * mix-blend-mode: difference. Wherever a dark stripe sits under a glyph the letter
 * reads bright; wherever a light stripe sits under it the letter reads dark — and
 * because the band keeps drifting, that invert boundary sweeps continuously through
 * the letterforms. `isolation: isolate` on the scope is load-bearing: it walls the
 * blend inside this element so it never composites against the page behind it.
 * The real (raw) text stays in the DOM for editing/accessibility but is painted
 * transparent — only the blended duplicate is visible.
 */
const blendInvert: EffectDefinition = {
  id: "blend-invert",
  name: "Blend Invert",
  category: "fill-texture",
  tags: ["blend-mode", "invert", "duotone", "stripes", "drift", "animated"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "mix-blend-mode: difference over an isolated ::before/::after pair (all modern browsers)",
  controls: [
    { id: "hue", label: "Backdrop Hue", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Drift Speed", type: "range", default: 5, min: 2, max: 12, step: 0.5, unit: "s" },
    { id: "angle", label: "Band Angle", type: "angle", default: 35, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(3, 8).toFixed(1)),
    angle: R.ri(0, 360),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const angle = ctx.values.angle as number;

    // Bold stripe band: a dark tone and a light tone at the same hue, hard-stopped.
    const dark = hsl(h, 70, 16);
    const light = hsl(h, 52, 84);
    // Near-white duplicate: difference(white, dark) reads bright, difference(white, light)
    // reads near-black — the invert swap that makes the boundary pop as it sweeps through.
    const nearWhite = "hsl(0 0% 97%)";
    const shadow = ctx.theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.22)";

    // One full stripe period of drift, always along the gradient's own axis (its normal
    // direction), so the loop is seamless for ANY band angle — motion parallel to the
    // stripes themselves would be invisible, so only the perpendicular component matters.
    const bandPx = 40;
    const period = bandPx * 2;
    const rad = (angle * Math.PI) / 180;
    const dx = round(period * Math.sin(rad), 2);
    const dy = round(-period * Math.cos(rad), 2);

    const drift = anim(ctx.scope, "drift");

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  isolation: isolate;\n` +
      `  color: transparent;\n` +
      `  box-shadow: 0 14px 30px ${shadow};\n` +
      `  border-radius: 0.1em;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  inset: -0.22em -0.42em;\n` +
      `  border-radius: 0.14em;\n` +
      `  background-image: repeating-linear-gradient(${angle}deg, ${dark} 0px, ${dark} ${bandPx}px, ${light} ${bandPx}px, ${light} ${period}px);\n` +
      `  animation: ${drift} ${speed.toFixed(1)}s linear infinite;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${nearWhite};\n` +
      `  mix-blend-mode: difference;\n` +
      `  pointer-events: none;\n` +
      `}`;

    const keyframes =
      `@keyframes ${drift} {\n` +
      `  from { background-position: 0px 0px; }\n` +
      `  to   { background-position: ${dx}px ${dy}px; }\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default blendInvert;
