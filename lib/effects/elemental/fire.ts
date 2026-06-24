import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Flame text: solid hot-yellow glyphs wrapped in layered orange/red glow that
 * flickers (animated text-shadow + color). Solid fill -> text-shadow is the
 * correct glow path and PNG support is good. Flicker stays well under 3Hz.
 */
const fire: EffectDefinition = {
  id: "fire",
  name: "Fire",
  category: "elemental",
  tags: ["fire", "flame", "glow", "hot", "animated", "elemental"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    {
      id: "intensity",
      label: "Intensity",
      type: "range",
      default: 5,
      min: 1,
      max: 10,
      step: 1,
    },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 2.2,
      min: 0.8,
      max: 5,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    intensity: R.ri(3, 9),
    speed: Number(R.rnd(1.4, 3.2).toFixed(1)),
  }),
  build: (ctx) => {
    const intensity = ctx.values.intensity as number;
    const speed = ctx.values.speed as number;
    const a = anim(ctx.scope, "flicker");

    // Hot core reads as near-white in dark, deeper amber in light for contrast.
    const core = ctx.theme === "dark" ? hsl(48, 100, 92) : hsl(40, 100, 58);
    const yellow = hsl(48, 100, 60);
    const orange = hsl(28, 100, 52);
    const red = hsl(8, 100, 48);

    // Blur radius scales with intensity for a bigger, hotter flame.
    const s = 0.6 + intensity * 0.16;
    const b1 = (4 * s).toFixed(1);
    const b2 = (10 * s).toFixed(1);
    const b3 = (20 * s).toFixed(1);
    const b4 = (38 * s).toFixed(1);
    const b5 = (62 * s).toFixed(1);

    // Shadows rise upward (negative y) like real flame licks.
    const shadow = (lift: number) =>
      [
        `0 0 ${b1}px ${yellow}`,
        `0 ${(-1 * lift).toFixed(1)}px ${b2}px ${yellow}`,
        `0 ${(-2 * lift).toFixed(1)}px ${b3}px ${orange}`,
        `0 ${(-3 * lift).toFixed(1)}px ${b4}px ${orange}`,
        `0 ${(-4 * lift).toFixed(1)}px ${b5}px ${red}`,
      ].join(",\n    ");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${core};\n` +
      `  text-shadow:\n    ${shadow(2)};\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { text-shadow:\n    ${shadow(1.4)};\n    opacity: 1; }\n` +
      `  25% { text-shadow:\n    ${shadow(2.6)};\n    opacity: .94; }\n` +
      `  50% { text-shadow:\n    ${shadow(1.8)};\n    opacity: 1; }\n` +
      `  62% { text-shadow:\n    ${shadow(3)};\n    opacity: .88; }\n` +
      `  78% { text-shadow:\n    ${shadow(2)};\n    opacity: 1; }\n` +
      `  100% { text-shadow:\n    ${shadow(1.4)};\n    opacity: 1; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default fire;
