import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, fvs } from "@/lib/engine/helpers";

/**
 * Mono shift: the type morphs between a proportional sans and a monospace typewriter
 * face on the Recursive variable font's MONO axis, the letters widening and squaring
 * off in sync. A distinctive proportional↔mono breathing.
 */
const monoShift: EffectDefinition = {
  id: "mono-shift",
  name: "Mono Shift",
  category: "entrance-kinetic",
  tags: ["variable-font", "monospace", "morph", "code", "animated"],
  caps: ["pure"],
  font: "'Recursive', sans-serif",
  pngSupport: "good",
  supports: "Variable-font MONO axis (Recursive) morphing proportional↔monospace.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 130, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3,
      min: 1.5,
      max: 7,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(2, 4.5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const wght = Math.max(300, Math.min(1000, (ctx.values.weight as number) ?? 700));

    const base = ctx.theme === "dark" ? hsl(h, 55, 76) : hsl(h, 58, 40);
    const a = anim(ctx.scope, "mono");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  ${fvs({ wght, MONO: 0.6 })}\n` + // rest already part-mono so the static frame reads
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite alternate;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { ${fvs({ wght, MONO: 0 })} }\n` +
      `  to { ${fvs({ wght, MONO: 1 })} }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 2000,
    };
  },
};

export default monoShift;
