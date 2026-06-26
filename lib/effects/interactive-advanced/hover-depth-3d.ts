import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, offsetStack } from "@/lib/engine/helpers";

/**
 * Hover depth: the word lies flat until hovered, then pops up off the page — a
 * stacked offset shadow extrudes underneath while the face lifts up-left. CSS-only
 * transition (no JavaScript); resting preview is flat.
 */
const hoverDepth3d: EffectDefinition = {
  id: "hover-depth-3d",
  name: "Hover Depth",
  category: "interactive-advanced",
  tags: ["interactive", "hover", "3d", "depth", "extrude"],
  caps: ["pure"],
  pngSupport: "good",
  supports: "Extrudes on :hover via a stacked offset shadow — static preview is flat.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 265, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 5, min: 3, max: 16, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 0.25,
      min: 0.1,
      max: 0.6,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    depth: R.ri(4, 8),
    speed: Number(R.rnd(0.15, 0.4).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const depth = ctx.values.depth as number;
    const speed = ctx.values.speed as number;

    const face = ctx.theme === "dark" ? hsl(h, 80, 70) : hsl(h, 75, 48);
    const side = ctx.theme === "dark" ? hsl(h, 35, 28) : hsl(h, 32, 60);
    const lift = Math.round(depth * 0.6);

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  cursor: pointer;\n` +
      `  transition: transform ${speed.toFixed(2)}s ease, text-shadow ${speed.toFixed(2)}s ease;\n` +
      `}\n` +
      `.${ctx.scope}:hover {\n` +
      `  transform: translate(-${lift}px, -${lift}px);\n` +
      `  ${offsetStack(side, depth, 1, 1)}\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default hoverDepth3d;
