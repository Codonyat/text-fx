import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { anim, hsl, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

const emphasisPop: EffectDefinition = {
  id: "emphasis-pop",
  name: "Emphasis Pop",
  category: "decoration-underline",
  tags: ["decoration", "emphasis", "crown", "per-letter", "entrance", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  supports: "text-emphasis (Chromium, Firefox, Safari)",
  controls: [
    {
      id: "markStyle",
      label: "Mark Style",
      type: "select",
      default: "dot",
      options: [
        { label: "Dot", value: "dot" },
        { label: "Circle", value: "circle" },
        { label: "Sesame", value: "sesame" },
        { label: "Triangle", value: "triangle" },
      ],
    },
    {
      id: "hue",
      label: "Mark Hue",
      type: "range",
      default: 340,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
    },
    {
      id: "speed",
      label: "Stagger",
      type: "range",
      default: 0.06,
      min: 0.02,
      max: 0.16,
      step: 0.01,
      unit: "s/letter",
    },
  ],
  rand: (R) => ({
    markStyle: R.pick(["dot", "circle", "sesame", "triangle"]),
    hue: R.ri(0, 360),
    speed: Number(R.rnd(0.03, 0.1).toFixed(2)),
  }),
  build: (ctx) => {
    const markStyle = ctx.values.markStyle as string;
    const h = ctx.values.hue as number;
    const stagger = ctx.values.speed as number;
    // Text stays theme-neutral — the dotted crown above each glyph carries the color.
    const txt = ctx.theme === "dark" ? hsl(0, 0, 92) : hsl(0, 0, 15);
    const mark = ctx.theme === "dark" ? hsl(h, 85, 68) : hsl(h, 75, 46);
    const a = anim(ctx.scope, "pop");
    const a2 = anim(ctx.scope, "pop-r"); // hover replays the once-only entrance

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  white-space: pre;\n` +
      `  line-height: 2.4;\n` +
      `  padding-top: 0.4em;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  will-change: opacity, transform;\n` +
      `  transform-origin: bottom center;\n` +
      `  -webkit-text-emphasis: filled ${markStyle} ${mark};\n` +
      `  text-emphasis: filled ${markStyle} ${mark};\n` +
      `  -webkit-text-emphasis-position: over right;\n` +
      `  text-emphasis-position: over right;\n` +
      `  animation: ${a} 0.5s cubic-bezier(.34,1.56,.64,1) both;\n` +
      `  animation-delay: calc(var(--i) * ${stagger}s);\n` +
      `}\n` +
      hoverReplay(ctx.scope, " .fx-ch", a2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { opacity: 0; transform: translateY(14px) scale(0.4); }\n` +
      `  100% { opacity: 1; transform: translateY(0) scale(1); }\n` +
      `}`;

    // Total loop = last letter's delay + one anim duration.
    const n = Math.max(1, [...ctx.text].length);
    const loopMs = (stagger * (n - 1) + 0.5) * 1000;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs,
    };
  },
};

export default emphasisPop;
