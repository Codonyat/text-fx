import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Echo trail: a stack of hue-shifted, fading text-shadow clones trailing behind
 * the glyphs while the whole word drifts side to side — a clean motion-trail /
 * after-image, not a chromatic glitch.
 */
const echoTrail: EffectDefinition = {
  id: "echo-trail",
  name: "Echo Trail",
  category: "interactive-advanced",
  tags: ["echo", "trail", "after-image", "motion", "animated"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "count", label: "Echoes", type: "range", default: 5, min: 2, max: 8, step: 1 },
    { id: "spread", label: "Hue Spread", type: "range", default: 32, min: 0, max: 60, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3.2,
      min: 1.5,
      max: 7,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    count: R.ri(3, 7),
    spread: R.ri(15, 50),
    speed: Number(R.rnd(2, 5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const count = ctx.values.count as number;
    const spread = ctx.values.spread as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 90, 70) : hsl(h, 85, 46);
    const gap = 7;

    // Each echo sits further behind and fades; hue walks so the trail rainbows out.
    const echoes: string[] = [];
    for (let i = 1; i <= count; i++) {
      const dx = -(i * gap);
      const eh = (h + i * spread) % 360;
      const alpha = Number((0.6 * (1 - i / (count + 1))).toFixed(2));
      echoes.push(`${dx}px 0 0 ${hsl(eh, 85, ctx.theme === "dark" ? 62 : 50, alpha)}`);
    }

    const a = anim(ctx.scope, "drift");
    const range = Math.round(count * gap * 0.7);

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  text-shadow: ${echoes.join(", ")};\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite alternate;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { transform: translateX(-${range}px); }\n` +
      `  to { transform: translateX(${range}px); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      // Alternate runs out-and-back over 2x the declared duration.
      loopMs: speed * 2000,
    };
  },
};

export default echoTrail;
