import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { anim, hsl } from "@/lib/engine/helpers";

const letterWave: EffectDefinition = {
  id: "letter-wave",
  name: "Letter Wave",
  category: "entrance-kinetic",
  tags: ["entrance", "wave", "bob", "bounce", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    {
      id: "amplitude",
      label: "Amplitude",
      type: "range",
      default: 8,
      min: 2,
      max: 40,
      step: 1,
      unit: "px",
    },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 2.6,
      min: 0.6,
      max: 4,
      step: 0.1,
      unit: "s",
    },
    {
      id: "hue",
      label: "Hue",
      type: "range",
      default: 280,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
    },
    {
      id: "tintWave",
      label: "Color Wave",
      type: "toggle",
      default: false,
      onLabel: "On",
      offLabel: "Off",
    },
  ],
  rand: (R) => ({
    amplitude: R.ri(5, 12),
    speed: Number(R.rnd(2.2, 3).toFixed(1)),
    hue: R.ri(0, 360),
    tintWave: R.chance(0.4),
  }),
  build: (ctx) => {
    const amp = ctx.values.amplitude as number;
    const speed = ctx.values.speed as number;
    const h = ctx.values.hue as number;
    const tintWave = Boolean(ctx.values.tintWave);
    const base = ctx.theme === "dark" ? hsl(h, 45, 72) : hsl(h, 45, 45);
    const aWave = anim(ctx.scope, "wave");
    const aTint = anim(ctx.scope, "tint");

    // Negative delay seeds each letter at a different point in the cycle so the
    // wave is travelling from first render (no flat "start" frame).
    const phaseStep = 0.1;

    const tintDecl = tintWave
      ? `,\n    ${aTint} ${(speed * 2).toFixed(1)}s linear infinite`
      : "";
    const tintDelay = tintWave
      ? `\n  animation-delay: calc(var(--i) * -${phaseStep}s), calc(var(--i) * -${(phaseStep * 2).toFixed(2)}s);`
      : `\n  animation-delay: calc(var(--i) * -${phaseStep}s);`;

    const c2 = hsl((h + 120) % 360, 45, ctx.theme === "dark" ? 72 : 45);
    const c3 = hsl((h + 240) % 360, 45, ctx.theme === "dark" ? 72 : 45);

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  will-change: transform;\n` +
      `  animation:\n` +
      `    ${aWave} ${speed.toFixed(1)}s ease-in-out infinite${tintDecl};` +
      `${tintDelay}\n` +
      `}`;

    const waveKf =
      `@keyframes ${aWave} {\n` +
      `  0%, 100% { transform: translateY(${amp}px); }\n` +
      `  50% { transform: translateY(-${amp}px); }\n` +
      `}`;
    const tintKf = tintWave
      ? `\n@keyframes ${aTint} {\n` +
        `  0%, 100% { color: ${base}; }\n` +
        `  33% { color: ${c2}; }\n` +
        `  66% { color: ${c3}; }\n` +
        `}`
      : "";

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes: `${waveKf}${tintKf}`,
      // Wave and tint cycles are harmonically aligned (tint = 2x wave).
      loopMs: tintWave ? speed * 2000 : speed * 1000,
    };
  },
};

export default letterWave;
