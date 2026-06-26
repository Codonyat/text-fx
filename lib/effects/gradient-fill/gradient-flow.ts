import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText } from "@/lib/engine/helpers";

const gradientFlow: EffectDefinition = {
  id: "gradient-flow",
  name: "Gradient Flow",
  category: "gradient-fill",
  tags: ["gradient", "color", "animated", "flow"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 280, min: 0, max: 360, step: 1, unit: "°" },
    { id: "angle", label: "Angle", type: "angle", default: 90, min: 0, max: 360, step: 1, unit: "°" },
    { id: "animate", label: "Animate", type: "toggle", default: true },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 6,
      min: 2,
      max: 12,
      step: 0.1,
      unit: "s",
      when: (v) => Boolean(v.animate),
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    angle: R.ri(0, 360),
    animate: R.chance(0.75),
    speed: Number(R.rnd(4, 9).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const a = ctx.values.angle as number;
    const c1 = hsl(h, 58, 60);
    const c2 = hsl((h + 18) % 360, 56, 58);
    const c3 = hsl((h + 40) % 360, 55, 62);
    const animate = Boolean(ctx.values.animate);
    const speed = ctx.values.speed as number;
    const an = anim(ctx.scope, "flow");
    const animDecl = animate ? `\n  animation: ${an} ${speed.toFixed(1)}s ease infinite;` : "";
    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(`linear-gradient(${a}deg, ${c1}, ${c2}, ${c3})`)}\n` +
      `  background-size: 220% 220%;` +
      `${animDecl}\n}`;
    const keyframes = animate
      ? `@keyframes ${an} {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}`
      : undefined;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: animate ? speed * 1000 : undefined,
    };
  },
};

export default gradientFlow;
