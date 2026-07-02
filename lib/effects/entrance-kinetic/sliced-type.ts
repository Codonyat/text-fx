import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, hoverReplay, cloneKeyframes, round } from "@/lib/engine/helpers";

/**
 * Sliced Type: a designed katana cut, not a glitch. The word (data-text) is split
 * into two complementary halves along a tunable diagonal — one pseudo-copy clipped
 * to everything above the line, the other clipped to everything below it. On
 * entrance the two halves start sheared apart perpendicular to the cut, hold a
 * beat, then settle — but not quite flush: a permanent 1-3px hairline gap along
 * the seam is the signature. Monochrome, no RGB tints, no jitter.
 */
const slicedType: EffectDefinition = {
  id: "sliced-type",
  name: "Sliced Type",
  category: "entrance-kinetic",
  tags: ["entrance", "slice", "cut", "diagonal", "kinetic", "animated"],
  caps: ["dataText"],
  pngSupport: "partial",
  controls: [
    {
      id: "angle",
      label: "Slice Angle",
      type: "range",
      default: 16,
      min: -30,
      max: 30,
      step: 1,
      unit: "°",
    },
    { id: "gap", label: "Gap", type: "range", default: 1.5, min: 0.5, max: 3, step: 0.5, unit: "px" },
    { id: "speed", label: "Speed", type: "range", default: 1, min: 0.5, max: 2.2, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({
    angle: R.ri(-28, 28),
    gap: Number(R.rnd(1, 2.5).toFixed(1)),
    speed: Number(R.rnd(0.7, 1.5).toFixed(2)),
  }),
  build: (ctx) => {
    const angle = ctx.values.angle as number;
    const gap = ctx.values.gap as number;
    const speed = ctx.values.speed as number;

    const base = ctx.theme === "dark" ? "#f4f4f4" : "#141414";

    // Diagonal cut line crossing the box left-to-right; halfShift keeps it well
    // inside 0-100% for the whole control range (tan(30deg) ~= 0.577).
    const rad = (angle * Math.PI) / 180;
    const halfShift = Math.tan(rad) * 50;
    const lineTop = round(50 - halfShift, 2);
    const lineBot = round(50 + halfShift, 2);
    const topPoly = `0% 0%, 100% 0%, 100% ${lineBot}%, 0% ${lineTop}%`;
    const botPoly = `0% ${lineTop}%, 100% ${lineBot}%, 100% 100%, 0% 100%`;

    // Unit normal to the cut line, pointing "up" out of the top piece; the bottom
    // piece uses the opposite sign so both halves separate away from the seam.
    const nx = round(Math.sin(rad), 4);
    const ny = round(-Math.cos(rad), 4);
    const travel = 14; // entrance shear distance (px) each half travels before settling

    const topRestX = round(nx * gap, 2);
    const topRestY = round(ny * gap, 2);
    const botRestX = round(-nx * gap, 2);
    const botRestY = round(-ny * gap, 2);
    const topStartX = round(nx * travel, 2);
    const topStartY = round(ny * travel, 2);
    const botStartX = round(-nx * travel, 2);
    const botStartY = round(-ny * travel, 2);

    const dur = speed.toFixed(2);
    const timing = "cubic-bezier(.22,1,.36,1)";

    const aTop = anim(ctx.scope, "top");
    const aTopR = anim(ctx.scope, "top-r");
    const aBot = anim(ctx.scope, "bot");
    const aBotR = anim(ctx.scope, "bot-r");

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  color: transparent;\n` +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${base};\n` +
      `  pointer-events: none;\n` +
      `  will-change: transform;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  clip-path: polygon(${topPoly});\n` +
      `  animation: ${aTop} ${dur}s ${timing} 1 both;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  clip-path: polygon(${botPoly});\n` +
      `  animation: ${aBot} ${dur}s ${timing} 1 both;\n` +
      `}\n` +
      `${hoverReplay(ctx.scope, "::before", aTopR)}\n` +
      `${hoverReplay(ctx.scope, "::after", aBotR)}`;

    const topKf =
      `@keyframes ${aTop} {\n` +
      `  0%, 40% { transform: translate(${topStartX}px, ${topStartY}px); }\n` +
      `  100% { transform: translate(${topRestX}px, ${topRestY}px); }\n` +
      `}`;
    const botKf =
      `@keyframes ${aBot} {\n` +
      `  0%, 40% { transform: translate(${botStartX}px, ${botStartY}px); }\n` +
      `  100% { transform: translate(${botRestX}px, ${botRestY}px); }\n` +
      `}`;
    const keyframes =
      `${topKf}\n${botKf}\n${cloneKeyframes(topKf, aTop, aTopR)}\n${cloneKeyframes(botKf, aBot, aBotR)}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default slicedType;
