import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, hsl } from "@/lib/engine/helpers";

const typewriter: EffectDefinition = {
  id: "typewriter",
  name: "Typewriter",
  category: "entrance-kinetic",
  tags: ["entrance", "typewriter", "typing", "caret", "terminal", "animated"],
  caps: ["pure"],
  pngSupport: "good",
  supports: "clip-path inset() steps() typing + blinking caret",
  controls: [
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 0.12,
      min: 0.04,
      max: 0.35,
      step: 0.01,
      unit: "s/char",
    },
    {
      id: "caretHue",
      label: "Caret Hue",
      type: "range",
      default: 150,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
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
    speed: Number(R.rnd(0.07, 0.2).toFixed(2)),
    caretHue: R.ri(0, 360),
    loop: R.chance(0.5),
  }),
  build: (ctx) => {
    const base = ctx.theme === "dark" ? "#f2f2f2" : "#141414";
    const perChar = ctx.values.speed as number;
    const loop = Boolean(ctx.values.loop);
    const caretHue = ctx.values.caretHue as number;
    const caret =
      ctx.theme === "dark" ? hsl(caretHue, 90, 62) : hsl(caretHue, 85, 45);
    // At least one step so very short strings still animate cleanly.
    const chars = Math.max(1, [...ctx.text].length);
    const typeDur = Number((perChar * chars).toFixed(2));
    const aType = anim(ctx.scope, "type");
    const aCaret = anim(ctx.scope, "caret");
    // Looping reveals, holds, then re-hides via the caret-blink-paired timeline.
    const typeIter = loop ? "infinite" : "1";
    const typeFill = loop ? "" : " forwards";
    const caretBlink = "0.8s";

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  display: inline-block;\n` +
      `  white-space: nowrap;\n` +
      `  overflow: hidden;\n` +
      `  border-right: 2px solid ${caret};\n` +
      `  padding-right: 2px;\n` +
      `  animation:\n` +
      `    ${aType} ${typeDur}s steps(${chars}, end) ${typeIter}${typeFill},\n` +
      `    ${aCaret} ${caretBlink} step-end infinite;\n` +
      `}`;

    const typeKf = loop
      ? `@keyframes ${aType} {\n` +
        `  0% { clip-path: inset(0 100% 0 0); }\n` +
        `  70%, 100% { clip-path: inset(0 0 0 0); }\n` +
        `}`
      : `@keyframes ${aType} {\n` +
        `  from { clip-path: inset(0 100% 0 0); }\n` +
        `  to { clip-path: inset(0 0 0 0); }\n` +
        `}`;
    const caretKf =
      `@keyframes ${aCaret} {\n` +
      `  0%, 100% { border-color: ${caret}; }\n` +
      `  50% { border-color: transparent; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes: `${typeKf}\n${caretKf}`,
      loopMs: loop ? typeDur * 1000 : 800,
    };
  },
};

export default typewriter;
