import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

const fadeIn: EffectDefinition = {
  id: "fade-in",
  name: "Fade In",
  category: "entrance-kinetic",
  tags: ["entrance", "fade", "rise", "intro", "animated"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 1.2,
      min: 0.4,
      max: 3,
      step: 0.1,
      unit: "s",
    },
    {
      id: "rise",
      label: "Rise",
      type: "range",
      default: 24,
      min: 0,
      max: 80,
      step: 1,
      unit: "px",
    },
    {
      id: "loop",
      label: "Loop",
      type: "toggle",
      default: false,
      onLabel: "Loop",
      offLabel: "Once",
    },
  ],
  rand: (R) => ({
    speed: Number(R.rnd(0.8, 2).toFixed(1)),
    rise: R.ri(12, 48),
    loop: R.chance(0.3),
  }),
  build: (ctx) => {
    const base = ctx.theme === "dark" ? "#f2f2f2" : "#141414";
    const speed = ctx.values.speed as number;
    const rise = ctx.values.rise as number;
    const loop = Boolean(ctx.values.loop);
    const a = anim(ctx.scope, "fade");
    const a2 = anim(ctx.scope, "fade-r"); // hover replays the once-only entrance
    // Once: play once and hold final state (forwards). Loop: gentle infinite.
    const iter = loop ? "infinite" : "1";
    const fill = loop ? "" : " both";
    const timing = loop ? "ease-in-out" : "cubic-bezier(.2,.7,.2,1)";
    const dur = loop ? (speed * 2).toFixed(1) : speed.toFixed(1);
    // Once mode sits static after mount; let a hover restart it. Loop already repeats.
    const hoverCss = loop ? "" : `\n${hoverReplay(ctx.scope, "", a2)}`;
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  display: inline-block;\n` +
      `  will-change: opacity, transform;\n` +
      `  animation: ${a} ${dur}s ${timing} ${iter}${fill};\n` +
      `}` +
      hoverCss;
    const keyframes = loop
      ? `@keyframes ${a} {\n` +
        `  0%, 100% { opacity: .35; transform: translateY(${(rise * 0.4).toFixed(1)}px); }\n` +
        `  50% { opacity: 1; transform: translateY(0); }\n` +
        `}`
      : `@keyframes ${a} {\n` +
        `  from { opacity: 0; transform: translateY(${rise}px); }\n` +
        `  to { opacity: 1; transform: translateY(0); }\n` +
        `}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes: loop ? keyframes : `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: loop ? speed * 2000 : speed * 1000,
    };
  },
};

export default fadeIn;
