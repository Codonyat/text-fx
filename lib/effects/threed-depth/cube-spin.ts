import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { splitText } from "@/lib/engine/split";
import { anim, hsl } from "@/lib/engine/helpers";

// Half the cube's height (em). The face box is ~1em tall (line-height:1), so a
// translateZ of half that gives a square cross-section prism — a real cube drum.
const HALF = 0.5;

/**
 * Cube Spin: every letter is a solid 3D cube that tumbles forward on its horizontal
 * axis, dwelling on each face long enough to read before clunking to the next, and
 * staggered so the whole word ripples through space. Four faces share the same glyph;
 * only the front one is ever square-on to you, and the net rotation at each dwell is
 * exactly zero so the letter always lands upright (never mirrored). Side faces pick up
 * a colored tint as they turn away, selling honest depth (per-letter markup).
 *
 * Diverges from Flip In 3D (a flat card that swings in ONCE on entrance): this is a
 * persistent four-face solid stepping forever.
 */
const cubeSpin: EffectDefinition = {
  id: "cube-spin",
  name: "Cube Spin",
  category: "threed-depth",
  tags: ["3d", "cube", "rotate", "tumble", "spin", "depth", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "partial",
  controls: [
    {
      id: "speed",
      label: "Tumble",
      type: "range",
      default: 6,
      min: 3,
      max: 12,
      step: 0.5,
      unit: "s",
    },
    { id: "hue", label: "Side Tint", type: "range", default: 265, min: 0, max: 360, step: 1, unit: "°" },
    { id: "stagger", label: "Stagger", type: "range", default: 130, min: 0, max: 320, step: 10, unit: "ms" },
  ],
  rand: (R) => ({
    speed: Number(R.rnd(4.5, 8).toFixed(1)),
    hue: R.ri(0, 360),
    stagger: R.ri(80, 220),
  }),
  build: (ctx) => {
    const cycle = ctx.values.speed as number;
    const hue = ctx.values.hue as number;
    const stagger = Math.round(ctx.values.stagger as number);
    const quarter = Number((cycle / 4).toFixed(3)); // one face-step of the loop

    const dark = ctx.theme === "dark";
    // Front-facing glyph reads at maximum contrast; side faces fade toward a saturated
    // tint as they rotate away. Both chosen to sit on the dark AND light stage.
    const bright = dark ? hsl(hue, 22, 96) : hsl(hue, 48, 24);
    const tint = dark ? hsl(hue, 78, 62) : hsl(hue, 72, 44);

    const drum = anim(ctx.scope, "drum");
    const light = anim(ctx.scope, "light");

    const parts = splitText(ctx.text, "grapheme");
    const face = (glyph: string, cls: string, k: number) =>
      el("span", { attrs: { class: `fx-face ${cls}` }, vars: { "--k": k }, children: [text(glyph)] });
    const nodes = parts.map((seg, i) => {
      if (seg === " ") {
        return el("span", { attrs: { class: "fx-gap" }, children: [text(" ")] });
      }
      return el("span", {
        attrs: { class: "fx-cube" },
        vars: { "--i": i },
        children: [
          face(seg, "fx-front", 0),
          face(seg, "fx-top", 1),
          face(seg, "fx-back", 2),
          face(seg, "fx-bottom", 3),
        ],
      });
    });

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${bright};\n` +
      `  white-space: pre;\n` +
      `  perspective: 1000px;\n` +
      `  perspective-origin: 50% 45%;\n` +
      `}\n` +
      `.${ctx.scope} .fx-gap {\n` +
      `  display: inline-block;\n` +
      `}\n` +
      `.${ctx.scope} .fx-cube {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  vertical-align: middle;\n` +
      `  transform-style: preserve-3d;\n` +
      `  will-change: transform;\n` +
      `  animation: ${drum} ${cycle}s cubic-bezier(0.5, 0.05, 0.35, 1.1) infinite;\n` +
      `  animation-delay: calc(var(--i) * -${stagger}ms);\n` +
      `}\n` +
      `.${ctx.scope} .fx-face {\n` +
      `  color: ${bright};\n` +
      `  line-height: 1;\n` +
      `  align-items: center;\n` +
      `  justify-content: center;\n` +
      `  backface-visibility: hidden;\n` +
      `  -webkit-backface-visibility: hidden;\n` +
      `  animation: ${light} ${cycle}s ease-in-out infinite;\n` +
      `  animation-delay: calc(var(--i) * -${stagger}ms + (var(--k) - 4) * ${quarter}s);\n` +
      `}\n` +
      // The front face stays in flow so the cube shrink-wraps to the glyph's advance;
      // the other three are absolutely overlaid on that exact box.
      `.${ctx.scope} .fx-front {\n` +
      `  position: relative;\n` +
      `  display: inline-flex;\n` +
      `  transform: rotateX(0deg) translateZ(${HALF}em);\n` +
      `}\n` +
      `.${ctx.scope} .fx-top,\n` +
      `.${ctx.scope} .fx-back,\n` +
      `.${ctx.scope} .fx-bottom {\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  display: flex;\n` +
      `}\n` +
      `.${ctx.scope} .fx-top { transform: rotateX(90deg) translateZ(${HALF}em); }\n` +
      `.${ctx.scope} .fx-back { transform: rotateX(180deg) translateZ(${HALF}em); }\n` +
      `.${ctx.scope} .fx-bottom { transform: rotateX(270deg) translateZ(${HALF}em); }`;

    // Step-tumble: hold on each face (readable), then a quick 90deg clunk to the next.
    // -360deg at 100% is one full turn, so the loop closes seamlessly.
    const drumKf =
      `@keyframes ${drum} {\n` +
      `  0%, 19% { transform: rotateX(0deg); }\n` +
      `  25%, 44% { transform: rotateX(-90deg); }\n` +
      `  50%, 69% { transform: rotateX(-180deg); }\n` +
      `  75%, 94% { transform: rotateX(-270deg); }\n` +
      `  100% { transform: rotateX(-360deg); }\n` +
      `}`;

    // Per-face lighting, phase-offset (via --k in the delay) so each face is brightest
    // exactly while it holds front, and dims to the tint as it swings to the back.
    const lightKf =
      `@keyframes ${light} {\n` +
      `  0%, 19% { color: ${bright}; opacity: 1; }\n` +
      `  50% { color: ${tint}; opacity: 0.36; }\n` +
      `  94%, 100% { color: ${bright}; opacity: 1; }\n` +
      `}`;

    return {
      root: el("div", { children: nodes }),
      css,
      keyframes: `${drumKf}\n${lightKf}`,
      loopMs: Math.round(cycle * 1000),
    };
  },
};

export default cubeSpin;
