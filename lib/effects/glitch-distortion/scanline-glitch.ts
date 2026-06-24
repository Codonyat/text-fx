import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, dropGlow, clipText } from "@/lib/engine/helpers";

const scanlineGlitch: EffectDefinition = {
  id: "scanline-glitch",
  name: "Scanline Glitch",
  category: "glitch-distortion",
  tags: ["glitch", "scanline", "crt", "retro", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text scanline gradient (all modern, -webkit- prefixed)",
  controls: [
    {
      id: "hue",
      label: "Hue",
      type: "range",
      default: 145,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
    },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 4,
      min: 1,
      max: 10,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.pick([145, 190, 95, 50, 320]),
    speed: Number(R.rnd(2.5, 7).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    // Phosphor-bright on dark, deeper/saturated on light so glyphs stay legible.
    const lit = ctx.theme === "dark" ? hsl(h, 95, 66) : hsl(h, 90, 42);
    const dim = ctx.theme === "dark" ? hsl(h, 90, 30) : hsl(h, 80, 70);
    const glow = hsl(h, 100, 60);

    const scroll = anim(ctx.scope, "scan");
    const flick = anim(ctx.scope, "flick");

    // Fill glyphs with a repeating horizontal band gradient -> CRT scanlines.
    const scanGradient =
      `repeating-linear-gradient(0deg, ` +
      `${lit} 0px, ${lit} 2px, ${dim} 2px, ${dim} 4px)`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(scanGradient)}\n` +
      `  background-size: 100% 8px;\n` +
      `  ${dropGlow(glow, [4, 10])}\n` +
      `  animation:\n` +
      `    ${scroll} ${speed.toFixed(1)}s linear infinite,\n` +
      `    ${flick} ${(speed / 6).toFixed(2)}s steps(1, end) infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${scroll} {\n` +
      `  0%   { background-position: 0 0; }\n` +
      `  100% { background-position: 0 8px; }\n` +
      `}\n` +
      `@keyframes ${flick} {\n` +
      `  0%, 88%, 100% { opacity: 1; }\n` +
      `  90%           { opacity: 0.82; }\n` +
      `  94%           { opacity: 0.96; }\n` +
      `  97%           { opacity: 0.7; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default scanlineGlitch;
