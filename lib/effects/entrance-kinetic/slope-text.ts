import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Slope text: the word sits on a straight diagonal incline — each letter stepped
 * vertically by its index and the whole set tilted to match, climbing or descending.
 * Slides onto the slope on load (per-letter markup).
 */
const slopeText: EffectDefinition = {
  id: "slope-text",
  name: "Slope Text",
  category: "entrance-kinetic",
  tags: ["slope", "diagonal", "incline", "tilt", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 160, min: 0, max: 360, step: 1, unit: "°" },
    { id: "slope", label: "Slope", type: "range", default: 10, min: 3, max: 22, step: 1, unit: "px" },
    { id: "tilt", label: "Tilt", type: "range", default: 8, min: 1, max: 20, step: 1, unit: "°" },
    {
      id: "dir",
      label: "Direction",
      type: "select",
      default: "up",
      options: [
        { label: "Climb up", value: "up" },
        { label: "Descend", value: "down" },
      ],
    },
    {
      id: "speed",
      label: "Slide-in",
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
    slope: R.ri(5, 18),
    tilt: R.ri(4, 16),
    dir: R.pick(["up", "down"]),
    speed: Number(R.rnd(0.4, 1.1).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const slope = ctx.values.slope as number;
    const tilt = ctx.values.tilt as number;
    const asc = (ctx.values.dir as string) !== "down";
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 60, 76) : hsl(h, 62, 42);
    const a = anim(ctx.scope, "slope");
    // Climb: letters to the right sit higher (negative Y); descend: the reverse.
    const m = asc ? -slope : slope;
    const rot = asc ? -tilt : tilt;
    const curved = `translateY(calc((var(--i) - var(--mid)) * ${m}px)) rotate(${rot}deg)`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform: ${curved};\n` +
      `  animation: ${a} ${speed.toFixed(2)}s ease-out both;\n` +
      `  animation-delay: calc(var(--i) * 0.04s);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { transform: translateY(0) rotate(0deg); opacity: 0; }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default slopeText;
