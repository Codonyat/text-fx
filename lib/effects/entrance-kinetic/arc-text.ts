import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Arc text: the word bows along a curve — each letter is lifted on a parabola by its
 * distance from the centre (so the ends drop by the full Depth regardless of word
 * length) and tilted to follow the slope, reading as an arched headline or a downward
 * smile. The vertical bow dominates the tilt, so it stays distinct from a rotated fan.
 * Bends into the arc on load (per-letter markup; reading order preserved = editable).
 */
const arcText: EffectDefinition = {
  id: "arc-text",
  name: "Arc Text",
  category: "entrance-kinetic",
  tags: ["arc", "arch", "curve", "path", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 56, min: 14, max: 120, step: 1, unit: "px" },
    { id: "tilt", label: "Tilt", type: "range", default: 6, min: 0, max: 16, step: 1, unit: "°" },
    {
      id: "dir",
      label: "Direction",
      type: "select",
      default: "up",
      options: [
        { label: "Arch up", value: "up" },
        { label: "Smile down", value: "down" },
      ],
    },
    {
      id: "speed",
      label: "Bend-in",
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
    depth: R.ri(34, 96),
    tilt: R.ri(3, 12),
    dir: R.pick(["up", "down"]),
    speed: Number(R.rnd(0.4, 1.1).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const depth = ctx.values.depth as number;
    const tilt = ctx.values.tilt as number;
    const d = (ctx.values.dir as string) === "down" ? -1 : 1;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 60, 78) : hsl(h, 62, 42);
    const a = anim(ctx.scope, "arc");
    // Normalised distance from centre, -1 (first) .. +1 (last). The squared term is a
    // parabola: ends drop by the full Depth, centre stays put — a real vertical bow.
    const t = "((var(--i) - var(--mid)) / max(0.5, var(--mid)))";
    const ty = `calc(${t} * ${t} * ${d * depth}px)`;
    const rot = `calc((var(--i) - var(--mid)) * ${d * tilt}deg)`;
    const curved = `translateY(${ty}) rotate(${rot})`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform: ${curved};\n` + // resting curve (also the reduced-motion frame)
      `  animation: ${a} ${speed.toFixed(2)}s ease-out both;\n` +
      `  animation-delay: calc(var(--i) * 0.045s);\n` +
      `}`;

    // `from`-only keyframe: animate from flat up to the resting curve (implicit `to`).
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

export default arcText;
