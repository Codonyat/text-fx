import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, glowShadow } from "@/lib/engine/helpers";

/**
 * Neon framed sign: glowing text inside a glowing rounded border box (outer + inset
 * box-shadow halos), the whole sign breathing on a loop. Solid fill, so the text
 * glow is a layered text-shadow.
 */
const neonSignFrame: EffectDefinition = {
  id: "neon-sign-frame",
  name: "Neon Sign",
  category: "neon-glow",
  tags: ["neon", "glow", "sign", "frame", "border", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "text-shadow + box-shadow (outer/inset) glow on a bordered box",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 320, min: 0, max: 360, step: 1, unit: "°" },
    { id: "glow", label: "Glow", type: "range", default: 14, min: 6, max: 28, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Pulse",
      type: "range",
      default: 3.5,
      min: 1.5,
      max: 7,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    glow: R.ri(9, 22),
    speed: Number(R.rnd(2.5, 5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const g = ctx.values.glow as number;
    const speed = ctx.values.speed as number;

    const tube = hsl(h, 95, 66);
    const core = ctx.theme === "dark" ? "#fff" : hsl(h, 90, 90);
    const line = hsl(h, 90, 60);
    const halo = hsl(h, 100, 60, 0.85);
    const a = anim(ctx.scope, "buzz");

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  padding: 0.18em 0.34em;\n` +
      `  border: 2px solid ${line};\n` +
      `  border-radius: 0.32em;\n` +
      `  color: ${tube};\n` +
      `  ${glowShadow(tube, [g * 0.4, g], core)}\n` +
      `  box-shadow: 0 0 ${g * 0.6}px ${halo}, 0 0 ${g * 1.6}px ${halo}, inset 0 0 ${g * 0.5}px ${halo};\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { opacity: 1; }\n` +
      `  50% { opacity: 0.86; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default neonSignFrame;
