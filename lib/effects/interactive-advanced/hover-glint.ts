import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Hover glint: a bright diagonal highlight bar parked off-screen sweeps across the
 * word on hover, like light catching glass. CSS-only (overflow-clipped pseudo, no
 * JavaScript); the resting preview is the clean base colour.
 */
const hoverGlint: EffectDefinition = {
  id: "hover-glint",
  name: "Hover Glint",
  category: "interactive-advanced",
  tags: ["interactive", "hover", "glint", "shine", "sweep"],
  caps: ["pure"],
  pngSupport: "good",
  supports: "Glint sweeps on :hover via an overflow-clipped ::before bar — static preview is clean.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Sweep",
      type: "range",
      default: 0.6,
      min: 0.25,
      max: 1.4,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(0.4, 0.9).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const base = ctx.theme === "dark" ? hsl(h, 35, 84) : hsl(h, 40, 28);

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  overflow: hidden;\n` +
      `  color: ${base};\n` +
      `  cursor: pointer;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  top: 0;\n` +
      `  left: -75%;\n` +
      `  width: 50%;\n` +
      `  height: 100%;\n` +
      `  background: linear-gradient(115deg, transparent 0%, hsl(0 0% 100% / 0.7) 50%, transparent 100%);\n` +
      `  transform: skewX(-18deg);\n` +
      `  transition: left ${speed.toFixed(2)}s ease;\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}:hover::before {\n` +
      `  left: 125%;\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default hoverGlint;
