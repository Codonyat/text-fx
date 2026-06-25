import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, fvs } from "@/lib/engine/helpers";

/**
 * Casual morph: the letterforms themselves reshape between a precise linear sans and
 * a relaxed, hand-drawn casual style (Recursive's CASL axis), with a touch of slant
 * at the casual extreme. A showcase of true glyph morphing in pure CSS.
 */
const casualMorph: EffectDefinition = {
  id: "casual-morph",
  name: "Casual Morph",
  category: "entrance-kinetic",
  tags: ["variable-font", "casual", "morph", "letterform", "animated"],
  caps: ["pure"],
  font: "'Recursive', sans-serif",
  pngSupport: "good",
  supports: "Variable-font CASL (+slnt) axes (Recursive) morphing linear↔casual.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 35, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3.4,
      min: 1.5,
      max: 7,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(2.4, 5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const wght = Math.max(300, Math.min(1000, (ctx.values.weight as number) ?? 700));

    const base = ctx.theme === "dark" ? hsl(h, 70, 74) : hsl(h, 70, 44);
    const a = anim(ctx.scope, "casual");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  ${fvs({ wght, CASL: 0.55, slnt: -4 })}\n` + // rest already casual so the static frame is on-message
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { ${fvs({ wght, CASL: 0, slnt: 0 })} }\n` +
      `  50% { ${fvs({ wght, CASL: 1, slnt: -8 })} }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default casualMorph;
