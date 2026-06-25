import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Mask wipe: a soft-edged gradient mask sweeps across the word, wiping it into view
 * and back out on a loop. Single element — the reveal rides on an oversized
 * mask-image whose position animates.
 */
const maskWipe: EffectDefinition = {
  id: "mask-wipe",
  name: "Mask Wipe",
  category: "entrance-kinetic",
  tags: ["entrance", "mask", "wipe", "reveal", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Animated mask-position on an oversized linear-gradient mask",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 165, min: 0, max: 360, step: 1, unit: "°" },
    { id: "angle", label: "Angle", type: "angle", default: 100, min: 0, max: 180, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3.6,
      min: 1.5,
      max: 8,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    angle: R.ri(70, 130),
    speed: Number(R.rnd(2.5, 5.5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const angle = ctx.values.angle as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 80, 70) : hsl(h, 75, 44);
    const a = anim(ctx.scope, "wipe");
    const mask = `linear-gradient(${angle}deg, #000 33%, transparent 66%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  -webkit-mask-image: ${mask};\n` +
      `  mask-image: ${mask};\n` +
      `  -webkit-mask-size: 320% 100%;\n` +
      `  mask-size: 320% 100%;\n` +
      `  -webkit-mask-repeat: no-repeat;\n` +
      `  mask-repeat: no-repeat;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    // Slide the solid band across the glyphs: hidden -> revealed (hold) -> hidden.
    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { -webkit-mask-position: 130% 0; mask-position: 130% 0; }\n` +
      `  45%, 55% { -webkit-mask-position: -30% 0; mask-position: -30% 0; }\n` +
      `  100% { -webkit-mask-position: 130% 0; mask-position: 130% 0; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default maskWipe;
