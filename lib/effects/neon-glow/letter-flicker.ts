import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { anim, hsl, round } from "@/lib/engine/helpers";
import { splitText } from "@/lib/engine/split";

/**
 * Letter Flicker: a worn vintage neon sign where the tubes don't blink in sync. Every
 * letter runs its own flicker loop, staggered by `var(--i)` and bucketed into a few
 * duration groups so the sign never pulses as one unit (unlike neon-glow.ts's optional
 * whole-word flicker). One letter — deterministically picked from the text so posters
 * and exports stay stable — is the "dying tube": it stutters harder and holds a genuinely
 * long dark dwell while its neighbors keep glowing steadily.
 */
const letterFlicker: EffectDefinition = {
  id: "letter-flicker",
  name: "Letter Flicker",
  category: "neon-glow",
  tags: ["neon", "flicker", "glow", "vintage", "sign", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 340, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Speed", type: "range", default: 3.2, min: 1.5, max: 6, step: 0.1, unit: "s" },
    { id: "intensity", label: "Dropout", type: "range", default: 60, min: 10, max: 100, step: 1, unit: "%" },
    { id: "dyingBias", label: "Dying Letter", type: "range", default: 55, min: 0, max: 100, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(2.2, 4.4).toFixed(1)),
    intensity: R.ri(35, 85),
    dyingBias: R.ri(20, 90),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const intensity = ctx.values.intensity as number;
    const dyingBias = ctx.values.dyingBias as number;

    const onColor = ctx.theme === "dark" ? hsl(h, 25, 95) : hsl(h, 90, 48);
    const g1 = hsl(h, 70, 60);
    const g2 = hsl((h + 14) % 360, 75, 52);
    const g3 = hsl((h + 28) % 360, 60, 40);

    // Two dip depths for steady letters: a shallow buzz and an occasional deeper blip.
    const dimDeep = round(0.85 - (intensity / 100) * 0.72, 2);
    const dimSoft = round(Math.min(0.95, dimDeep + 0.32), 2);
    // The dying tube's dark dwell goes darker still, and holds longer as bias rises.
    const dyingDeep = round(Math.max(0.02, dimDeep - 0.3), 2);
    const holdEnd = round(50 + 6 + (dyingBias / 100) * 16, 1); // dark hold ends 56%..72%
    const recover = round(holdEnd + 3, 1);

    const aFlicker = anim(ctx.scope, "flicker");
    const aDying = anim(ctx.scope, "dying");

    // Pick the "dying" letter(s) deterministically from the text so posters/exports are
    // stable — skip whitespace so the broken tube always lands on a visible glyph.
    const parts = splitText(ctx.text, "grapheme");
    const nonSpace: number[] = [];
    parts.forEach((c, i) => {
      if (c.trim().length > 0) nonSpace.push(i);
    });
    const dyingIdx: number[] = [];
    if (nonSpace.length > 0) {
      dyingIdx.push(nonSpace[Math.floor(nonSpace.length * 0.62)]);
      if (dyingBias > 68 && nonSpace.length >= 6) {
        const second = nonSpace[Math.floor(nonSpace.length * 0.17)];
        if (second !== dyingIdx[0]) dyingIdx.push(second);
      }
    }
    const dyingSelector = dyingIdx.map((i) => `.${ctx.scope} .fx-ch:nth-child(${i + 1})`).join(", ");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${onColor};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  text-shadow: 0 0 3px ${onColor}, 0 0 9px ${g1}, 0 0 18px ${g2}, 0 0 36px ${g3};\n` +
      `  animation: ${aFlicker} ${speed.toFixed(1)}s steps(1, end) infinite;\n` +
      `  animation-delay: calc(var(--i) * -0.67s);\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch:nth-child(3n+1) { animation-duration: ${(speed * 0.8).toFixed(2)}s; }\n` +
      `.${ctx.scope} .fx-ch:nth-child(3n+2) { animation-duration: ${(speed * 1.18).toFixed(2)}s; }\n` +
      `.${ctx.scope} .fx-ch:nth-child(4n) { animation-duration: ${(speed * 1.42).toFixed(2)}s; }` +
      (dyingSelector
        ? `\n${dyingSelector} {\n` +
          `  animation: ${aDying} ${(speed * 1.7).toFixed(2)}s steps(1, end) infinite;\n` +
          `  animation-delay: calc(var(--i) * -0.31s);\n` +
          `}`
        : "");

    const keyframes =
      `@keyframes ${aFlicker} {\n` +
      `  0%, 100% { opacity: 1; }\n` +
      `  4% { opacity: ${dimSoft}; }\n` +
      `  6% { opacity: 1; }\n` +
      `  47% { opacity: 1; }\n` +
      `  49% { opacity: ${dimDeep}; }\n` +
      `  52% { opacity: 1; }\n` +
      `  91% { opacity: 1; }\n` +
      `  93% { opacity: ${dimSoft}; }\n` +
      `  95% { opacity: 1; }\n` +
      `}\n` +
      `@keyframes ${aDying} {\n` +
      `  0%, 30% { opacity: 1; }\n` +
      `  32% { opacity: ${dyingDeep}; }\n` +
      `  35% { opacity: 1; }\n` +
      `  38% { opacity: ${dyingDeep}; }\n` +
      `  41% { opacity: .7; }\n` +
      `  44% { opacity: ${dyingDeep}; }\n` +
      `  50%, ${holdEnd}% { opacity: ${dyingDeep}; }\n` +
      `  ${recover}% { opacity: 1; }\n` +
      `  80% { opacity: 1; }\n` +
      `  82% { opacity: ${dyingDeep}; }\n` +
      `  85%, 100% { opacity: 1; }\n` +
      `}`;

    const maxDur = dyingSelector ? speed * 1.7 : speed * 1.42;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      loopMs: Math.round(maxDur * 1000),
    };
  },
};

export default letterFlicker;
