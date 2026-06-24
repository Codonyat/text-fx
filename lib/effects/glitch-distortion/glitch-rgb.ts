import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim } from "@/lib/engine/helpers";

const glitchRgb: EffectDefinition = {
  id: "glitch-rgb",
  name: "Glitch",
  category: "glitch-distortion",
  tags: ["glitch", "rgb", "chromatic", "animated", "datamosh"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "pseudo-element copies + clip-path animation",
  controls: [
    { id: "offset", label: "Shift", type: "range", default: 3, min: 1, max: 8, step: 1, unit: "px" },
  ],
  rand: (R) => ({ offset: R.ri(2, 5) }),
  build: (ctx) => {
    const base = ctx.theme === "dark" ? "#f2f2f2" : "#101010";
    const o = ctx.values.offset as number;
    const a1 = anim(ctx.scope, "g1");
    const a2 = anim(ctx.scope, "g2");
    const css =
      `.${ctx.scope} {\n  position: relative;\n  color: ${base};\n}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n  content: attr(data-text);\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n}\n` +
      `.${ctx.scope}::before {\n  color: #00eaff;\n  transform: translate(-${o}px, 0);\n  mix-blend-mode: screen;\n  animation: ${a1} 2.4s infinite linear alternate-reverse;\n}\n` +
      `.${ctx.scope}::after {\n  color: #ff003c;\n  transform: translate(${o}px, 0);\n  mix-blend-mode: screen;\n  animation: ${a2} 3.1s infinite linear alternate-reverse;\n}`;
    const keyframes =
      `@keyframes ${a1} {\n  0% { clip-path: inset(0 0 82% 0); }\n  25% { clip-path: inset(40% 0 30% 0); }\n  50% { clip-path: inset(70% 0 10% 0); }\n  75% { clip-path: inset(15% 0 55% 0); }\n  100% { clip-path: inset(85% 0 2% 0); }\n}\n` +
      `@keyframes ${a2} {\n  0% { clip-path: inset(60% 0 20% 0); }\n  25% { clip-path: inset(10% 0 70% 0); }\n  50% { clip-path: inset(35% 0 40% 0); }\n  75% { clip-path: inset(80% 0 5% 0); }\n  100% { clip-path: inset(20% 0 60% 0); }\n}`;
    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: 12400,
    };
  },
};

export default glitchRgb;
