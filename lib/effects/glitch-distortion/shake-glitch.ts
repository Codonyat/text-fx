import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim } from "@/lib/engine/helpers";

const shakeGlitch: EffectDefinition = {
  id: "shake-glitch",
  name: "Shake Glitch",
  category: "glitch-distortion",
  tags: ["glitch", "shake", "jitter", "rgb", "chromatic", "animated"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "pseudo-element copies + translate jitter (no clip-path)",
  controls: [
    {
      id: "offset",
      label: "Shake",
      type: "range",
      default: 3,
      min: 1,
      max: 9,
      step: 0.5,
      unit: "px",
    },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 0.6,
      min: 0.2,
      max: 2,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    offset: Number(R.rnd(2, 6).toFixed(1)),
    speed: Number(R.rnd(0.35, 1.1).toFixed(2)),
  }),
  build: (ctx) => {
    const base = ctx.theme === "dark" ? "#f4f4f4" : "#121212";
    const o = ctx.values.offset as number;
    const speed = ctx.values.speed as number;
    // Two copies shake on slightly different periods so they never sync up.
    const dur1 = speed;
    const dur2 = Number((speed * 1.27).toFixed(3));
    const a1 = anim(ctx.scope, "shakeA");
    const a2 = anim(ctx.scope, "shakeB");

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${base};\n` +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  top: 0;\n` +
      `  width: 100%;\n` +
      `  pointer-events: none;\n` +
      `  mix-blend-mode: screen;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  color: #00e5ff;\n` +
      `  animation: ${a1} ${dur1.toFixed(3)}s steps(1, end) infinite;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  color: #ff2bb0;\n` +
      `  animation: ${a2} ${dur2.toFixed(3)}s steps(1, end) infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a1} {\n` +
      `  0%   { transform: translate(-${o}px, ${(o * 0.4).toFixed(2)}px); }\n` +
      `  20%  { transform: translate(${(o * 0.6).toFixed(2)}px, -${(o * 0.5).toFixed(2)}px); }\n` +
      `  40%  { transform: translate(-${(o * 0.5).toFixed(2)}px, -${(o * 0.2).toFixed(2)}px); }\n` +
      `  60%  { transform: translate(${o}px, ${(o * 0.3).toFixed(2)}px); }\n` +
      `  80%  { transform: translate(-${(o * 0.3).toFixed(2)}px, ${(o * 0.6).toFixed(2)}px); }\n` +
      `  100% { transform: translate(-${o}px, ${(o * 0.4).toFixed(2)}px); }\n` +
      `}\n` +
      `@keyframes ${a2} {\n` +
      `  0%   { transform: translate(${o}px, -${(o * 0.4).toFixed(2)}px); }\n` +
      `  20%  { transform: translate(-${(o * 0.5).toFixed(2)}px, ${(o * 0.5).toFixed(2)}px); }\n` +
      `  40%  { transform: translate(${(o * 0.4).toFixed(2)}px, ${(o * 0.3).toFixed(2)}px); }\n` +
      `  60%  { transform: translate(-${o}px, -${(o * 0.3).toFixed(2)}px); }\n` +
      `  80%  { transform: translate(${(o * 0.3).toFixed(2)}px, -${(o * 0.6).toFixed(2)}px); }\n` +
      `  100% { transform: translate(${o}px, -${(o * 0.4).toFixed(2)}px); }\n` +
      `}`;

    // Loop length = LCM-ish window where both periods realign for clean poster timing.
    const loopMs = Math.round(dur1 * dur2 * 100) * 10;
    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs,
    };
  },
};

export default shakeGlitch;
