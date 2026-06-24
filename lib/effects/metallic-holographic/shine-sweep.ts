import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

const shineSweep: EffectDefinition = {
  id: "shine-sweep",
  name: "Shine Sweep",
  category: "metallic-holographic",
  tags: ["metallic", "shine", "sweep", "highlight", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + animated background-position (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Tint", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Speed", type: "range", default: 3.5, min: 1.5, max: 8, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({ hue: R.ri(0, 360), speed: Number(R.rnd(2.5, 6).toFixed(1)) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const an = anim(ctx.scope, "sweep");

    // Static metallic base: bright crown, dark waist, lower glint.
    const base =
      `linear-gradient(180deg,\n` +
      `      ${hsl(h, 18, 92)} 0%,\n` +
      `      ${hsl(h, 24, 70)} 40%,\n` +
      `      ${hsl(h, 34, 40)} 50%,\n` +
      `      ${hsl(h, 26, 66)} 62%,\n` +
      `      ${hsl(h, 18, 94)} 100%)`;
    // Moving highlight bar: a narrow bright diagonal stripe that slides across.
    // Oversized (300% wide) so animating background-position-x sweeps it through.
    const sweep =
      `linear-gradient(115deg,\n` +
      `      transparent 38%,\n` +
      `      ${hsl(h, 30, 100, 0.0)} 44%,\n` +
      `      ${hsl(h, 20, 100, 0.9)} 50%,\n` +
      `      ${hsl(h, 30, 100, 0.0)} 56%,\n` +
      `      transparent 62%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  background-image:\n    ${sweep},\n    ${base};\n` +
      `  background-size: 300% 100%, 100% 100%;\n` +
      `  background-position: 150% 0, 0 0;\n` +
      `  background-repeat: no-repeat;\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  filter: drop-shadow(0 1px 0 ${hsl(h, 30, 24, 0.7)});\n` +
      `  animation: ${an} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;
    // Only the sweep (first) layer moves; the base layer stays put.
    const keyframes =
      `@keyframes ${an} {\n` +
      `  0% { background-position: 150% 0, 0 0; }\n` +
      `  100% { background-position: -50% 0, 0 0; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default shineSweep;
