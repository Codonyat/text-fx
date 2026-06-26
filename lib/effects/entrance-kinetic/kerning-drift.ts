import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { anim, hsl } from "@/lib/engine/helpers";

/**
 * Kerning drift: the letters breathe sideways, each sliding a hair left and right on a
 * shared rhythm but phase-offset by index, so the spacing between glyphs gently opens
 * and closes like type settling into its measure. Transform-only (no reflow), small
 * amplitude to stay readable. Horizontal counterpart to Letter Wave (per-letter loop).
 */
const kerningDrift: EffectDefinition = {
  id: "kerning-drift",
  name: "Kerning Drift",
  category: "entrance-kinetic",
  tags: ["kerning", "drift", "spacing", "breathe", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "amount", label: "Drift", type: "range", default: 3, min: 1, max: 8, step: 0.5, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3.2,
      min: 1.5,
      max: 6,
      step: 0.1,
      unit: "s",
    },
    { id: "hue", label: "Hue", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    amount: R.pick([2, 2.5, 3, 3.5, 4]),
    speed: Number(R.rnd(2.6, 4.2).toFixed(1)),
    hue: R.ri(0, 360),
  }),
  build: (ctx) => {
    const amount = ctx.values.amount as number;
    const speed = ctx.values.speed as number;
    const h = ctx.values.hue as number;

    const base = ctx.theme === "dark" ? hsl(h, 35, 84) : hsl(h, 40, 32);
    const a = anim(ctx.scope, "kern");

    // Negative per-letter delay seeds a travelling phase so the drift is already in
    // motion on first frame (no flat start), and neighbours never move in lockstep.
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  will-change: transform;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `  animation-delay: calc(var(--i) * -0.16s);\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { transform: translateX(-${amount}px); }\n` +
      `  50% { transform: translateX(${amount}px); }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default kerningDrift;
