import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

const neonGlow: EffectDefinition = {
  id: "neon-glow",
  name: "Neon Glow",
  category: "neon-glow",
  tags: ["neon", "glow", "light", "animated"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 320, min: 0, max: 360, step: 1, unit: "°" },
    { id: "flicker", label: "Flicker", type: "toggle", default: true },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3,
      min: 1,
      max: 6,
      step: 0.1,
      unit: "s",
      when: (v) => Boolean(v.flicker),
    },
  ],
  rand: (R) => ({ hue: R.ri(0, 360), flicker: R.chance(0.5), speed: Number(R.rnd(2, 5).toFixed(1)) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const txt = ctx.theme === "dark" ? hsl(h, 30, 97) : hsl(h, 90, 52);
    const g1 = hsl(h, 100, 60);
    const g2 = hsl((h + 22) % 360, 100, 55);
    const flicker = Boolean(ctx.values.flicker);
    const speed = ctx.values.speed as number;
    const a = anim(ctx.scope, "flicker");
    const animDecl = flicker ? `\n  animation: ${a} ${speed.toFixed(1)}s infinite;` : "";
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  text-shadow:\n    0 0 5px ${g1},\n    0 0 12px ${g1},\n    0 0 28px ${g2},\n    0 0 56px ${g2};` +
      `${animDecl}\n}`;
    const keyframes = flicker
      ? `@keyframes ${a} {\n  0%, 92%, 100% { opacity: 1; }\n  93% { opacity: .55; }\n  95% { opacity: 1; }\n  97% { opacity: .72; }\n}`
      : undefined;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: flicker ? speed * 1000 : undefined,
    };
  },
};

export default neonGlow;
