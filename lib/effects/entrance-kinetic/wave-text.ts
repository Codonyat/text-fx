import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, anim, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * Wave text: the letters are frozen along a sine ribbon — each offset vertically by
 * sin(index) and tilted by its slope (cos), so the whole word forms a static S-curve.
 * Distinct from letter-wave (a moving uniform bob): this is a fixed wave SHAPE the
 * word settles into (per-letter markup).
 */
const waveText: EffectDefinition = {
  id: "wave-text",
  name: "Wave Text",
  category: "entrance-kinetic",
  tags: ["wave", "sine", "curve", "ribbon", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 280, min: 0, max: 360, step: 1, unit: "°" },
    { id: "amp", label: "Amplitude", type: "range", default: 22, min: 6, max: 48, step: 1, unit: "px" },
    { id: "freq", label: "Frequency", type: "range", default: 85, min: 40, max: 120, step: 5, unit: "°" },
    {
      id: "speed",
      label: "Settle",
      type: "range",
      default: 0.7,
      min: 0.2,
      max: 2,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    amp: R.ri(12, 38),
    freq: R.pick([60, 75, 85, 95, 110]),
    speed: Number(R.rnd(0.4, 1.1).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const amp = ctx.values.amp as number;
    const freq = ctx.values.freq as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? hsl(h, 65, 78) : hsl(h, 65, 44);
    const a = anim(ctx.scope, "wavet");
    const a2 = anim(ctx.scope, "wavet-r"); // hover replays the on-load entrance
    const phase = `var(--i) * ${freq}deg`;
    // Vertical sine offset + a tilt following the wave's slope (cos).
    const curved =
      `translateY(calc(sin(${phase}) * ${amp}px)) ` +
      `rotate(calc(cos(${phase}) * ${Math.round(freq / 4)}deg))`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  transform: ${curved};\n` +
      `  animation: ${a} ${speed.toFixed(2)}s ease-out both;\n` +
      `  animation-delay: calc(var(--i) * 0.04s);\n` +
      `}\n` +
      hoverReplay(ctx.scope, " .fx-ch", a2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { transform: translateY(0) rotate(0deg); opacity: 0; }\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: speed * 1000,
    };
  },
};

export default waveText;
