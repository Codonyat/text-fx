import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText } from "@/lib/engine/helpers";

/**
 * Balloon text: glossy inflated lettering — a radial highlight gradient clipped to
 * the glyphs, a soft same-hue rounded stroke, a grounding drop-shadow, and a gentle
 * inflate/deflate scale pulse. Bouncy, party-balloon energy.
 */
const balloonPuff: EffectDefinition = {
  id: "balloon-puff",
  name: "Balloon",
  category: "retro-themed",
  tags: ["balloon", "inflate", "puffy", "glossy", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text radial gloss + scale pulse",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 350, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Pulse",
      type: "range",
      default: 3,
      min: 1.5,
      max: 6,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(2, 4.5).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;

    const hi = hsl(h, 100, 88);
    const body = hsl(h, 90, 58);
    const deep = hsl(h, 85, 42);
    const edge = hsl(h, 80, ctx.theme === "dark" ? 36 : 40);
    const cast = hsl(h, 60, ctx.theme === "dark" ? 6 : 30, 0.4);
    const a = anim(ctx.scope, "inflate");

    // Off-centre radial highlight reads as a glossy latex sheen.
    const gloss = `radial-gradient(60% 60% at 35% 28%, ${hi} 0%, ${body} 45%, ${deep} 100%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(gloss)}\n` +
      `  -webkit-text-stroke: 1px ${edge};\n` +
      `  filter: drop-shadow(0 6px 6px ${cast});\n` +
      `  transform-origin: center bottom;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { transform: scale(1, 1); }\n` +
      `  50% { transform: scale(1.04, 1.06); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default balloonPuff;
