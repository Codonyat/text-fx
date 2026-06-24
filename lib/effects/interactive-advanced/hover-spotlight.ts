import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

// CSS-only spotlight reveal. The text sits dim behind a radial-gradient mask
// pinned to the centre; on :hover the mask radius grows to fill the glyphs,
// "switching the lights on". No JS / pointer tracking — pure :hover transition.
const hoverSpotlight: EffectDefinition = {
  id: "hover-spotlight",
  name: "Hover Spotlight",
  category: "interactive-advanced",
  tags: ["interactive", "hover", "spotlight", "reveal", "mask", "animated"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "Reveals on :hover via a radial-gradient mask — static preview is dim.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 45, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Reveal Speed",
      type: "range",
      default: 0.5,
      min: 0.1,
      max: 1.5,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(0.3, 0.9).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;

    // Dim base reads on the active theme; lit colour is the saturated spotlight.
    const dim = ctx.theme === "dark" ? hsl(h, 18, 30) : hsl(h, 22, 72);
    const lit = ctx.theme === "dark" ? hsl(h, 95, 62) : hsl(h, 90, 48);
    const halo = hsl(h, 100, 60);

    const sweep = anim(ctx.scope, "sweep");

    // The lit copy is masked: a small bright disc at centre, transparent beyond.
    // On hover the mask blows out to 250% so the whole word lights up.
    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${dim};\n` +
      `  transition: color ${speed.toFixed(2)}s ease;\n` +
      `  cursor: pointer;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${lit};\n` +
      `  text-shadow:\n    0 0 8px ${halo},\n    0 0 22px ${halo};\n` +
      `  -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 0%, #000 18%, transparent 42%);\n` +
      `  mask-image: radial-gradient(circle at 50% 50%, #000 0%, #000 18%, transparent 42%);\n` +
      `  -webkit-mask-size: 30% 60%;\n` +
      `  mask-size: 30% 60%;\n` +
      `  -webkit-mask-position: center;\n` +
      `  mask-position: center;\n` +
      `  -webkit-mask-repeat: no-repeat;\n` +
      `  mask-repeat: no-repeat;\n` +
      `  transition: -webkit-mask-size ${speed.toFixed(2)}s ease, mask-size ${speed.toFixed(2)}s ease;\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}:hover::after {\n` +
      `  -webkit-mask-size: 250% 250%;\n` +
      `  mask-size: 250% 250%;\n` +
      `}\n` +
      // Gentle idle breathing of the resting spotlight so the static preview reads.
      `.${ctx.scope}::after {\n` +
      `  animation: ${sweep} 3.2s ease-in-out infinite;\n` +
      `}\n` +
      `.${ctx.scope}:hover::after {\n` +
      `  animation: none;\n` +
      `}`;

    const keyframes =
      `@keyframes ${sweep} {\n` +
      `  0%, 100% { -webkit-mask-size: 28% 55%; mask-size: 28% 55%; }\n` +
      `  50% { -webkit-mask-size: 40% 75%; mask-size: 40% 75%; }\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: 3200,
    };
  },
};

export default hoverSpotlight;
