import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText, dropGlow } from "@/lib/engine/helpers";

const candyStripe: EffectDefinition = {
  id: "candy-stripe",
  name: "Candy Stripe",
  category: "retro-themed",
  tags: ["candy", "stripes", "retro", "circus", "peppermint", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 350, min: 0, max: 360, step: 1, unit: "°" },
    { id: "angle", label: "Angle", type: "angle", default: 45, min: 0, max: 360, step: 1, unit: "°" },
    { id: "width", label: "Stripe Width", type: "range", default: 14, min: 6, max: 30, step: 1, unit: "px" },
    { id: "animate", label: "Animate", type: "toggle", default: true },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 6,
      min: 2,
      max: 14,
      step: 0.1,
      unit: "s",
      when: (v) => Boolean(v.animate),
    },
  ],
  rand: (R) => ({
    hue: R.pick([350, 5, 145, 210]),
    angle: R.pick([45, 135, 60]),
    width: R.ri(10, 20),
    animate: R.chance(0.7),
    speed: Number(R.rnd(4, 9).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const angle = ctx.values.angle as number;
    const w = ctx.values.width as number;
    const animate = Boolean(ctx.values.animate);
    const speed = ctx.values.speed as number;

    // Candy-cane: a saturated color band alternating with a near-white band.
    const color = hsl(h, 90, 55);
    const lightBand = ctx.theme === "dark" ? hsl(h, 60, 96) : "#ffffff";
    const half = w / 2;

    // Hard-edged repeating stripes (no soft transitions => crisp candy look).
    const stripes =
      `repeating-linear-gradient(${angle}deg, ` +
      `${color} 0, ${color} ${half}px, ` +
      `${lightBand} ${half}px, ${lightBand} ${w}px)`;

    // Soft halo in the candy color survives the clipped/transparent fill.
    const glowColor = ctx.theme === "dark" ? hsl(h, 90, 55, 0.55) : hsl(h, 85, 50, 0.4);

    const a = anim(ctx.scope, "march");
    const animDecl = animate
      ? `\n  animation: ${a} ${speed.toFixed(1)}s linear infinite;`
      : "";

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(stripes)}\n` +
      `  background-size: ${w * 4}px ${w * 4}px;\n` +
      `  ${dropGlow(glowColor, [6])}` +
      `${animDecl}\n}`;

    // Shift the background by exactly one stripe period so the loop is seamless.
    const keyframes = animate
      ? `@keyframes ${a} {\n` +
        `  0% { background-position: 0 0; }\n` +
        `  100% { background-position: ${w * 4}px 0; }\n}`
      : undefined;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: animate ? speed * 1000 : undefined,
    };
  },
};

export default candyStripe;
