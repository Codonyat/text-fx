import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Fan text: the letters splay out like a hand of cards — each rotated about a low
 * pivot by its distance from the centre, so the word arcs into a fan. Splays open on
 * load (per-letter markup).
 */
const fanText: EffectDefinition = {
  id: "fan-text",
  name: "Fan Text",
  category: "entrance-kinetic",
  tags: ["fan", "splay", "cards", "rotate", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 25, min: 0, max: 360, step: 1, unit: "°" },
    { id: "spread", label: "Spread", type: "range", default: 9, min: 3, max: 18, step: 1, unit: "°" },
    { id: "pivot", label: "Pivot Depth", type: "range", default: 180, min: 80, max: 320, step: 10, unit: "px" },
    {
      id: "speed",
      label: "Splay-in",
      type: "range",
      default: 0.7,
      min: 0.2,
      max: 2,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    spread: R.ri(5, 15),
    pivot: R.ri(120, 280),
    speed: Number(R.rnd(0.4, 1.1).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const spread = ctx.values.spread as number;
    const pivot = ctx.values.pivot as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 70, 74) : hsl(h, 70, 44);
    const a = anim(ctx.scope, "fan");
    // Rotate each letter about a pivot well below the baseline -> a splayed fan.
    const curved = `rotate(calc((var(--i) - var(--mid)) * ${spread}deg))`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform-origin: 50% ${pivot}px;\n` +
      `  transform: ${curved};\n` +
      `  animation: ${a} ${speed.toFixed(2)}s ease-out both;\n` +
      `  animation-delay: calc(var(--i) * 0.045s);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { transform: rotate(0deg); opacity: 0; }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default fanText;
