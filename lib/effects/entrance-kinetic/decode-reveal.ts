import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { anim, hsl, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * Decode reveal: each letter resolves out of a blurred, skewed, jittering state into
 * crisp type, staggered by index so a "decode" sweep runs across the word. Pure CSS —
 * this is a staged glitch/blur entrance, NOT a true random-glyph scramble (that would
 * need a JS runtime the engine doesn't ship). Plays once on mount (per-letter markup).
 */
const decodeReveal: EffectDefinition = {
  id: "decode-reveal",
  name: "Decode Reveal",
  category: "entrance-kinetic",
  tags: ["entrance", "decode", "glitch", "scramble", "reveal", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 160, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Duration",
      type: "range",
      default: 0.9,
      min: 0.4,
      max: 2,
      step: 0.1,
      unit: "s",
    },
    { id: "stagger", label: "Stagger", type: "range", default: 0.06, min: 0.02, max: 0.14, step: 0.01, unit: "s" },
    {
      id: "glitch",
      label: "Glitch Tint",
      type: "toggle",
      default: false,
      onLabel: "On",
      offLabel: "Off",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(0.7, 1.3).toFixed(1)),
    stagger: Number(R.rnd(0.04, 0.1).toFixed(2)),
    glitch: R.chance(0.5),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const stagger = ctx.values.stagger as number;
    const glitch = Boolean(ctx.values.glitch);

    const base = ctx.theme === "dark" ? hsl(h, 35, 86) : hsl(h, 45, 30);
    const flash = hsl((h + 180) % 360, 90, ctx.theme === "dark" ? 66 : 50);
    const a = anim(ctx.scope, "decode");
    const a2 = anim(ctx.scope, "decode-r"); // hover replays the on-load entrance

    // Mid-decode color flash (optional): a complementary tint that snaps back to base.
    const colorMid = glitch ? `\n  40% { color: ${flash}; }\n  70% { color: ${base}; }` : "";

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s cubic-bezier(0.2, 0.8, 0.2, 1) both;\n` +
      `  animation-delay: calc(var(--i) * ${stagger}s);\n` +
      `}\n` +
      hoverReplay(ctx.scope, " .fx-ch", a2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { filter: blur(6px); opacity: 0; transform: translateY(-0.16em) skewX(-14deg); }\n` +
      `  35% { filter: blur(3px); opacity: 1; transform: translateY(0.05em) skewX(10deg); }\n` +
      `  60% { filter: blur(1.5px); transform: translateX(0.06em) skewX(-5deg); }\n` +
      `  82% { filter: blur(0.4px); transform: translateX(-0.02em) skewX(2deg); }\n` +
      `  100% { filter: blur(0); opacity: 1; transform: none; }${colorMid}\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: speed * 1000,
    };
  },
};

export default decodeReveal;
