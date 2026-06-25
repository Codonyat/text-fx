import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Melt drip: a second copy of the word (data-text) masked to its lower edge oozes
 * downward and fades on a loop, so the letters look like they are slowly melting and
 * dripping off the baseline.
 */
const meltDrip: EffectDefinition = {
  id: "melt-drip",
  name: "Melt Drip",
  category: "elemental",
  tags: ["melt", "drip", "ooze", "liquid", "elemental", "animated"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "data-text copy masked to its base, animated downward",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 12, min: 0, max: 360, step: 1, unit: "°" },
    { id: "drip", label: "Drip", type: "range", default: 0.5, min: 0.2, max: 0.9, step: 0.05, unit: "em" },
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
    drip: Number(R.rnd(0.35, 0.7).toFixed(2)),
    speed: Number(R.rnd(2.4, 5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const drip = ctx.values.drip as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 85, 64) : hsl(h, 80, 46);
    const ooze = hsl(h, 90, 56);
    const a = anim(ctx.scope, "ooze");
    const mask = `linear-gradient(to bottom, transparent 52%, #000 78%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${base};\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${ooze};\n` +
      `  -webkit-mask-image: ${mask};\n` +
      `  mask-image: ${mask};\n` +
      `  pointer-events: none;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { transform: translateY(0); opacity: 0.85; }\n` +
      `  100% { transform: translateY(${drip}em); opacity: 0; }\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default meltDrip;
