import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, glowShadow } from "@/lib/engine/helpers";

/**
 * Terminal phosphor: glowing CRT-monitor text with a power-on flicker — irregular
 * brightness stutters like an old phosphor screen warming up. Solid fill, so the
 * glow is a layered text-shadow.
 */
const terminalPhosphor: EffectDefinition = {
  id: "terminal-phosphor",
  name: "Terminal Phosphor",
  category: "glitch-distortion",
  tags: ["terminal", "crt", "phosphor", "screen", "flicker", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "text-shadow glow + irregular opacity/brightness flicker",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 130, min: 0, max: 360, step: 1, unit: "°" },
    { id: "glow", label: "Glow", type: "range", default: 5, min: 2, max: 16, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Flicker",
      type: "range",
      default: 4,
      min: 2,
      max: 9,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.pick([130, 130, 95, 35, 190]),
    glow: R.ri(3, 9),
    speed: Number(R.rnd(3, 6).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const g = ctx.values.glow as number;
    const speed = ctx.values.speed as number;

    const phosphor = hsl(h, 55, 60);
    const core = hsl(h, 45, 88);
    const a = anim(ctx.scope, "phosphor");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${phosphor};\n` +
      `  ${glowShadow(phosphor, [g * 0.5, g], core)}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s steps(1, end) infinite;\n` +
      `}`;

    // Steady phosphor with the faintest shimmer — barely-there brightness dips.
    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { opacity: 1; }\n` +
      `  6% { opacity: 0.94; }\n` +
      `  8% { opacity: 1; }\n` +
      `  9% { opacity: 0.97; }\n` +
      `  11% { opacity: 1; }\n` +
      `  52% { opacity: 1; }\n` +
      `  53% { opacity: 0.96; }\n` +
      `  55% { opacity: 1; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default terminalPhosphor;
