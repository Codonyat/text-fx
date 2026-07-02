import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim, hoverReplay, cloneKeyframes, round } from "@/lib/engine/helpers";

/**
 * Swoosh in: each glyph flies in along a curved CSS motion path — sweeping up from the
 * lower-left, arcing over the top and gliding down to rest — banking along the curve via
 * offset-rotate:auto and staggered by index. Where Falling Letters drops straight down
 * under gravity, this arcs and banks like a paper plane (per-letter markup).
 */
const swooshIn: EffectDefinition = {
  id: "swoosh-in",
  name: "Swoosh In",
  category: "entrance-kinetic",
  tags: ["entrance", "swoosh", "curve", "motion-path", "bank", "glide", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  supports: "CSS Motion Path (all modern browsers)",
  pngSupport: "partial",
  controls: [
    { id: "depth", label: "Curve", type: "range", default: 90, min: 40, max: 150, step: 2, unit: "px" },
    { id: "speed", label: "Duration", type: "range", default: 1, min: 0.5, max: 2.2, step: 0.05, unit: "s" },
    { id: "stagger", label: "Stagger", type: "range", default: 70, min: 20, max: 160, step: 5, unit: "ms" },
    { id: "hue", label: "Hue", type: "range", default: 205, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    depth: R.ri(60, 120),
    speed: Number(R.rnd(0.8, 1.4).toFixed(2)),
    stagger: R.ri(45, 110),
    hue: R.ri(0, 360),
  }),
  build: (ctx) => {
    const depth = ctx.values.depth as number;
    const speed = ctx.values.speed as number;
    const stagger = ctx.values.stagger as number;
    const h = ctx.values.hue as number;

    const d = depth;
    const p = (x: number) => round(x, 1);
    // Banking swoosh, ending at (0,0) = the glyph's natural inline position. It starts
    // lower-left and pitched up, arcs over the top, then the final control point sits at
    // y=0 so the end tangent is horizontal — with offset-rotate:auto the glyph un-banks
    // to 0° exactly as it settles, so there's no twist on landing.
    const path =
      `path('M ${p(-1.5 * d)} ${p(0.5 * d)} ` +
      `C ${p(-0.9 * d)} ${p(-0.55 * d)}, ${p(-0.28 * d)} 0, 0 0')`;

    const base = ctx.theme === "dark" ? hsl(h, 72, 68) : hsl(h, 64, 44);
    const a = anim(ctx.scope, "swoosh");
    const a2 = anim(ctx.scope, "swoosh-r"); // hover restarts the on-load entrance

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  offset-path: ${path};\n` +
      `  offset-rotate: auto;\n` +
      `  animation: ${a} ${speed.toFixed(2)}s cubic-bezier(0.22, 0.61, 0.36, 1) both;\n` +
      `  animation-delay: calc(var(--i) * ${stagger}ms);\n` +
      `}\n` +
      hoverReplay(ctx.scope, " .fx-ch", a2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { offset-distance: 0%; opacity: 0; transform: scale(0.72); }\n` +
      `  55% { opacity: 1; }\n` +
      `  100% { offset-distance: 100%; opacity: 1; transform: scale(1); }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: speed * 1000,
    };
  },
};

export default swooshIn;
