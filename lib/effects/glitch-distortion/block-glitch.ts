import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Block glitch: a solid word with a coloured bar that flickers across horizontal
 * bands via stepped clip-path keyframes (screen blend), plus a tiny positional
 * jump. A blocky data-corruption look — no chromatic split, no data-text needed.
 */
const blockGlitch: EffectDefinition = {
  id: "block-glitch",
  name: "Block Glitch",
  category: "glitch-distortion",
  tags: ["glitch", "block", "corruption", "clip", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Stepped clip-path bands on a ::before block (screen blend)",
  controls: [
    { id: "hue", label: "Block Hue", type: "range", default: 320, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 2.6,
      min: 1,
      max: 6,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(1.6, 4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 12, 92) : hsl(h, 20, 14);
    const block = hsl(h, 95, 60);
    const aPos = anim(ctx.scope, "jump");
    const aBlk = anim(ctx.scope, "bands");

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${base};\n` +
      `  animation: ${aPos} ${(speed * 1.3).toFixed(1)}s steps(1) infinite;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  background: ${block};\n` +
      `  mix-blend-mode: screen;\n` +
      `  pointer-events: none;\n` +
      `  animation: ${aBlk} ${speed.toFixed(1)}s steps(1) infinite;\n` +
      `}`;

    const bandsKf =
      `@keyframes ${aBlk} {\n` +
      `  0%, 100% { clip-path: inset(100% 0 0 0); }\n` +
      `  10% { clip-path: inset(18% 0 64% 0); }\n` +
      `  22% { clip-path: inset(70% 0 8% 0); }\n` +
      `  35% { clip-path: inset(40% 0 42% 0); }\n` +
      `  48% { clip-path: inset(100% 0 0 0); }\n` +
      `  62% { clip-path: inset(8% 0 80% 0); }\n` +
      `  74% { clip-path: inset(55% 0 28% 0); }\n` +
      `  88% { clip-path: inset(100% 0 0 0); }\n` +
      `}`;
    const jumpKf =
      `@keyframes ${aPos} {\n` +
      `  0%, 100% { transform: translateX(0); }\n` +
      `  20% { transform: translateX(-2px); }\n` +
      `  35% { transform: translateX(3px); }\n` +
      `  62% { transform: translateX(-1px); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes: `${bandsKf}\n${jumpKf}`,
      loopMs: Math.round(speed * 1.3 * 1000),
    };
  },
};

export default blockGlitch;
