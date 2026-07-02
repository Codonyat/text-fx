import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * Balloon Puff: each letter is filled with an off-center radial gradient that
 * fakes the specular highlight + curved latex shading of an inflated party
 * balloon, plus a soft shadow floating well below for lift, plus a very gentle
 * per-letter scale breathe staggered by --i. Distinct from Filled Outline's flat
 * comic fill+stroke (no stroke here, dimensional not flat) and from Floating's
 * whole-word hover bob (this puffs per letter, always-on, no stroke).
 */
const balloonPuff: EffectDefinition = {
  id: "balloon-puff",
  name: "Balloon Puff",
  category: "threed-depth",
  tags: ["balloon", "inflate", "puffy", "3d", "gradient", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "partial",
  supports: "background-clip:text (prefixed) + filter drop-shadow",
  controls: [
    { id: "hue", label: "Balloon Hue", type: "range", default: 350, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Breathe Speed", type: "range", default: 3.2, min: 1.8, max: 6, step: 0.1, unit: "s" },
    { id: "gloss", label: "Gloss", type: "range", default: 55, min: 15, max: 95, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(2.4, 4.6).toFixed(1)),
    gloss: R.ri(30, 85),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const gloss = ctx.values.gloss as number;
    const g = gloss / 100;

    // Sphere shading: a bright specular spot near the upper-left blends through
    // the saturated balloon hue to a deeper, still-saturated edge (never
    // gray/black — that would read metallic, not latex). Gloss widens & brightens
    // the specular spot.
    const specL = round(78 + g * 16, 0);
    const specStop = round(10 + g * 18, 0);
    const brightL = ctx.theme === "dark" ? 70 : 62;
    const midL = ctx.theme === "dark" ? 50 : 42;
    const edgeL = ctx.theme === "dark" ? 30 : 22;

    const spec = hsl(h, 30, specL);
    const bright = hsl(h, 88, brightL);
    const mid = hsl(h, 92, midL);
    const edge = hsl((h + 8) % 360, 94, edgeL);

    const gradient =
      `radial-gradient(135% 145% at 30% 24%,\n` +
      `      ${spec} 0%,\n` +
      `      ${bright} ${specStop}%,\n` +
      `      ${mid} 58%,\n` +
      `      ${edge} 100%)`;

    // Two-layer shadow: a tight grounding layer right under the glyph plus a
    // soft, wider layer well below — the gap between glyph and diffuse shadow
    // reads as float/lift, like a balloon hovering just off the ground.
    const near = hsl(h, 30, ctx.theme === "dark" ? 5 : 25, 0.35);
    const far = hsl(h, 25, ctx.theme === "dark" ? 3 : 18, 0.28);

    const a = anim(ctx.scope, "puff");

    const css =
      `.${ctx.scope} {\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  background: ${gradient};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  filter: drop-shadow(0 4px 3px ${near}) drop-shadow(0 14px 12px ${far});\n` +
      `  transform-origin: center;\n` +
      `  will-change: transform;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `  animation-delay: calc(var(--i) * 0.12s);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { transform: scale(1); }\n` +
      `  50% { transform: scale(1.04); }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default balloonPuff;
