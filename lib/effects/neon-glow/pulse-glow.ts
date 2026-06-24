import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

const pulseGlow: EffectDefinition = {
  id: "pulse-glow",
  name: "Pulse Glow",
  category: "neon-glow",
  tags: ["neon", "glow", "pulse", "breathe", "animated"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 145, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Speed", type: "range", default: 2.6, min: 1, max: 6, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(1.8, 4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const txt = ctx.theme === "dark" ? hsl(h, 60, 92) : hsl(h, 95, 50);
    const c1 = hsl(h, 100, 60);
    const c2 = hsl((h + 18) % 360, 100, 55);
    const a = anim(ctx.scope, "pulse");
    // Steady inner core (constant) + outer halo that the keyframes animate via the
    // full text-shadow — blur radius and opacity both breathe in and out.
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  text-shadow:\n    0 0 4px ${c1},\n    0 0 10px ${c1},\n    0 0 22px ${c2},\n    0 0 40px ${c2};\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n}`;
    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% {\n` +
      `    text-shadow:\n      0 0 4px ${c1},\n      0 0 10px ${c1},\n      0 0 22px ${c2},\n      0 0 40px ${c2};\n` +
      `  }\n` +
      `  50% {\n` +
      `    text-shadow:\n      0 0 7px ${c1},\n      0 0 18px ${c1},\n      0 0 40px ${c2},\n      0 0 72px ${c2};\n` +
      `  }\n}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default pulseGlow;
