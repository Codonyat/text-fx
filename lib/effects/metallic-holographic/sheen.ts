import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Sheen: a soft silver/near-white heading with a slow specular highlight gliding
 * across it once in a while — the understated glint premium brands use on a wordmark.
 * Slow and low-contrast by default, nothing like a flashy metallic sweep.
 */
const sheen: EffectDefinition = {
  id: "sheen",
  name: "Sheen",
  category: "metallic-holographic",
  tags: ["modern", "minimal", "sheen", "specular", "premium", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Tint Hue", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Sweep",
      type: "range",
      default: 7,
      min: 3,
      max: 16,
      step: 0.5,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(5, 12).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const dark = ctx.theme === "dark";

    const c1 = dark ? hsl(h, 12, 92) : hsl(h, 16, 30);
    const c2 = dark ? hsl(h, 14, 72) : hsl(h, 18, 14);
    const glint = dark ? "hsl(0 0% 100% / 0.85)" : "hsl(0 0% 100% / 0.6)";

    const a = anim(ctx.scope, "sheen");
    const band = `linear-gradient(100deg, transparent 40%, ${glint} 50%, transparent 60%)`;
    const baseGrad = `linear-gradient(180deg, ${c1}, ${c2})`;

    const css =
      `.${ctx.scope} {\n` +
      `  background: ${band}, ${baseGrad};\n` +
      `  background-size: 240% 100%, 100% 100%;\n` +
      `  background-position: 130% 0, 0 0;\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    // Glide the highlight band across, then pause (it lingers off-screen most of the loop).
    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { background-position: 130% 0, 0 0; }\n` +
      `  45%, 100% { background-position: -130% 0, 0 0; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default sheen;
