import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * Bulge text: a fish-eye on the word — the centre letters scale up and the ends taper
 * down via cos() of each letter's distance from the middle. The lens pops in on load
 * (per-letter markup).
 */
const bulgeText: EffectDefinition = {
  id: "bulge-text",
  name: "Bulge Text",
  category: "entrance-kinetic",
  tags: ["bulge", "fisheye", "lens", "scale", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 45, min: 0, max: 360, step: 1, unit: "°" },
    { id: "step", label: "Falloff", type: "range", default: 26, min: 12, max: 34, step: 1, unit: "°" },
    { id: "amount", label: "Bulge", type: "range", default: 38, min: 20, max: 70, step: 1, unit: "%" },
    {
      id: "speed",
      label: "Pop-in",
      type: "range",
      default: 0.6,
      min: 0.2,
      max: 2,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    step: R.ri(20, 30),
    amount: R.ri(30, 55),
    speed: Number(R.rnd(0.4, 1).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const step = ctx.values.step as number;
    const k = ((ctx.values.amount as number) / 100).toFixed(2);
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 75, 74) : hsl(h, 72, 44);
    const a = anim(ctx.scope, "bulge");
    const a2 = anim(ctx.scope, "bulge-r"); // hover replays the on-load entrance
    // cos peaks (=1) at the centre letter and falls toward the ends; max(0, cos) clamps
    // the far letters to scale 1 so the ends never shrink below baseline (k<1 already
    // guarantees a positive scale). A little tracking absorbs the centre letters' growth.
    const curved = `scale(calc(1 + max(0, cos((var(--i) - var(--mid)) * ${step}deg)) * ${k}))`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  letter-spacing: 0.08em;\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform-origin: 50% 100%;\n` +
      `  transform: ${curved};\n` +
      `  animation: ${a} ${speed.toFixed(2)}s ease-out both;\n` +
      `  animation-delay: calc(var(--i) * 0.035s);\n` +
      `}\n` +
      hoverReplay(ctx.scope, " .fx-ch", a2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { transform: scale(0.6); opacity: 0; }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: speed * 1000,
    };
  },
};

export default bulgeText;
