import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { anim, hsl } from "@/lib/engine/helpers";

const staggerReveal: EffectDefinition = {
  id: "stagger-reveal",
  name: "Stagger Reveal",
  category: "entrance-kinetic",
  tags: ["entrance", "stagger", "reveal", "rise", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    {
      id: "hue",
      label: "Hue",
      type: "range",
      default: 210,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
    },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 0.06,
      min: 0.02,
      max: 0.16,
      step: 0.01,
      unit: "s/letter",
    },
    {
      id: "rise",
      label: "Rise",
      type: "range",
      default: 28,
      min: 4,
      max: 80,
      step: 1,
      unit: "px",
    },
    {
      id: "loop",
      label: "Loop",
      type: "toggle",
      default: false,
      onLabel: "Loop",
      offLabel: "Once",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(0.03, 0.1).toFixed(2)),
    rise: R.ri(16, 56),
    loop: R.chance(0.3),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const stagger = ctx.values.speed as number;
    const rise = ctx.values.rise as number;
    const loop = Boolean(ctx.values.loop);
    const tint = ctx.theme === "dark" ? hsl(h, 75, 70) : hsl(h, 70, 42);
    const a = anim(ctx.scope, "rise");
    const iter = loop ? "infinite" : "1";
    const fill = loop ? "" : " both";
    const dur = loop ? 2.4 : 0.6;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${tint};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  will-change: opacity, transform;\n` +
      `  animation: ${a} ${dur}s cubic-bezier(.2,.7,.2,1) ${iter}${fill};\n` +
      `  animation-delay: calc(var(--i) * ${stagger}s);\n` +
      `}`;

    const keyframes = loop
      ? `@keyframes ${a} {\n` +
        `  0%, 70%, 100% { opacity: 1; transform: translateY(0); filter: blur(0); }\n` +
        `  35% { opacity: 0; transform: translateY(${rise}px); filter: blur(3px); }\n` +
        `}`
      : `@keyframes ${a} {\n` +
        `  from { opacity: 0; transform: translateY(${rise}px); filter: blur(3px); }\n` +
        `  to { opacity: 1; transform: translateY(0); filter: blur(0); }\n` +
        `}`;

    // Total loop = last letter's delay + one anim duration.
    const n = Math.max(1, [...ctx.text].length);
    const loopMs = (stagger * (n - 1) + dur) * 1000;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs,
    };
  },
};

export default staggerReveal;
