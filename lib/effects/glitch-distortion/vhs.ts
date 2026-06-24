import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, dropGlow, clipText } from "@/lib/engine/helpers";

const vhs: EffectDefinition = {
  id: "vhs",
  name: "VHS",
  category: "glitch-distortion",
  tags: ["glitch", "vhs", "chroma", "retro", "analog", "scanline", "animated"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "background-clip:text scanlines + pseudo-element chroma copies",
  controls: [
    {
      id: "offset",
      label: "Chroma Bleed",
      type: "range",
      default: 3,
      min: 1,
      max: 8,
      step: 0.5,
      unit: "px",
    },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 5,
      min: 1,
      max: 12,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    offset: Number(R.rnd(2, 5).toFixed(1)),
    speed: Number(R.rnd(3, 8).toFixed(1)),
  }),
  build: (ctx) => {
    const o = ctx.values.offset as number;
    const speed = ctx.values.speed as number;

    // Base glyphs filled with faint horizontal scanlines (transparent-fill -> dropGlow).
    const litBase = ctx.theme === "dark" ? "#ededed" : "#161616";
    const dimBase = ctx.theme === "dark" ? hsl(0, 0, 62) : hsl(0, 0, 42);
    const baseGradient =
      `repeating-linear-gradient(0deg, ` +
      `${litBase} 0px, ${litBase} 3px, ${dimBase} 3px, ${dimBase} 4px)`;
    const baseGlow = ctx.theme === "dark" ? hsl(190, 90, 60, 0.5) : hsl(190, 70, 45, 0.4);

    const jitter = anim(ctx.scope, "jitter");
    const bleedR = anim(ctx.scope, "bleedR");
    const bleedB = anim(ctx.scope, "bleedB");
    const scan = anim(ctx.scope, "scan");

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  ${clipText(baseGradient)}\n` +
      `  background-size: 100% 7px;\n` +
      `  ${dropGlow(baseGlow, [2, 6])}\n` +
      `  animation:\n` +
      `    ${jitter} ${(speed / 8).toFixed(2)}s steps(2, end) infinite,\n` +
      `    ${scan} ${speed.toFixed(1)}s linear infinite;\n` +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  top: 0;\n` +
      `  width: 100%;\n` +
      `  pointer-events: none;\n` +
      `  mix-blend-mode: screen;\n` +
      `  opacity: 0.85;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  color: #ff3b30;\n` +
      `  transform: translate(-${o}px, 0);\n` +
      `  animation: ${bleedR} ${(speed * 0.83).toFixed(2)}s ease-in-out infinite;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  color: #2f9bff;\n` +
      `  transform: translate(${o}px, 0);\n` +
      `  animation: ${bleedB} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${jitter} {\n` +
      `  0%   { transform: translateY(0); }\n` +
      `  50%  { transform: translateY(${(o * 0.5).toFixed(2)}px); }\n` +
      `  100% { transform: translateY(0); }\n` +
      `}\n` +
      `@keyframes ${scan} {\n` +
      `  0%   { background-position: 0 0; }\n` +
      `  100% { background-position: 0 7px; }\n` +
      `}\n` +
      `@keyframes ${bleedR} {\n` +
      `  0%, 100% { transform: translate(-${o}px, 0); }\n` +
      `  45%      { transform: translate(-${(o * 1.6).toFixed(2)}px, ${(o * 0.4).toFixed(2)}px); }\n` +
      `  70%      { transform: translate(-${(o * 0.5).toFixed(2)}px, -${(o * 0.3).toFixed(2)}px); }\n` +
      `}\n` +
      `@keyframes ${bleedB} {\n` +
      `  0%, 100% { transform: translate(${o}px, 0); }\n` +
      `  40%      { transform: translate(${(o * 1.6).toFixed(2)}px, -${(o * 0.4).toFixed(2)}px); }\n` +
      `  75%      { transform: translate(${(o * 0.5).toFixed(2)}px, ${(o * 0.3).toFixed(2)}px); }\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default vhs;
