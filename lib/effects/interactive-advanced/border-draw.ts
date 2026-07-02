import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

/**
 * Border draw-around: hovering the word traces a rectangular frame around it like a
 * pen. `::before` owns the top+right sides (width then height growing from the
 * top-left corner); `::after` owns the bottom+left sides (width then height growing
 * from the bottom-right corner). Width/height transitions are staggered with
 * transition-delay (rather than a single `transform: scale()`, which can't stagger
 * its own X/Y sub-components) so all four sides draw in sequence, corner to corner.
 * Un-hover retracts in the reverse order — the resting rule declares its own,
 * oppositely-ordered delays, since a CSS transition always uses the delay declared
 * on the state being transitioned INTO. A faint background corner-tick pattern on
 * the root keeps a hint of the frame visible at rest so posters aren't blank.
 */
const borderDraw: EffectDefinition = {
  id: "border-draw",
  name: "Border Draw",
  category: "interactive-advanced",
  tags: ["interactive", "hover", "border", "frame", "outline", "draw"],
  caps: ["pure"],
  pngSupport: "good",
  supports:
    "Sequential :hover border draw via staggered width/height transitions on ::before/::after — faint corner ticks hint the frame at rest.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "thickness", label: "Thickness", type: "range", default: 3, min: 1, max: 6, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Draw Speed",
      type: "range",
      default: 0.16,
      min: 0.08,
      max: 0.35,
      step: 0.01,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    thickness: R.ri(2, 5),
    speed: Number(R.rnd(0.1, 0.26).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const thickness = ctx.values.thickness as number;
    const speed = ctx.values.speed as number;

    const line = ctx.theme === "dark" ? hsl(h, 82, 68) : hsl(h, 75, 38);
    const hint = ctx.theme === "dark" ? hsl(h, 55, 64, 0.32) : hsl(h, 55, 40, 0.28);

    // Per-segment draw duration; segments run top -> right -> bottom -> left.
    const s1 = speed.toFixed(2);
    const s2 = round(speed * 2, 2).toFixed(2);
    const s3 = round(speed * 3, 2).toFixed(2);

    // Faint always-on corner ticks (two tiny bars per corner) hint the frame at rest.
    const tickLen = 10;
    const tickLayer = `linear-gradient(${hint}, ${hint})`;
    const tickImages = Array(8).fill(tickLayer).join(", ");
    const tickPositions = ["0 0", "0 0", "100% 0", "100% 0", "100% 100%", "100% 100%", "0 100%", "0 100%"].join(
      ", ",
    );
    const horiz = `${tickLen}px ${thickness}px`;
    const vert = `${thickness}px ${tickLen}px`;
    const tickSizes = [horiz, vert, horiz, vert, horiz, vert, horiz, vert].join(", ");

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  padding: 0.3em 0.55em;\n` +
      `  cursor: pointer;\n` +
      `  background-image: ${tickImages};\n` +
      `  background-repeat: no-repeat;\n` +
      `  background-position: ${tickPositions};\n` +
      `  background-size: ${tickSizes};\n` +
      `}\n` +
      `.${ctx.scope}::before,\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  box-sizing: border-box;\n` +
      `  width: 0%;\n` +
      `  height: 0%;\n` +
      `  border: 0 solid transparent;\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      // ::before = top + right sides, anchored at the top-left corner.
      `.${ctx.scope}::before {\n` +
      `  top: 0;\n` +
      `  left: 0;\n` +
      `  border-top-width: ${thickness}px;\n` +
      `  border-right-width: ${thickness}px;\n` +
      `  border-top-color: ${line};\n` +
      `  border-right-color: ${line};\n` +
      // Exit (leave-hover) order: right retracts, then top.
      `  transition: height ${s1}s linear ${s2}s, width ${s1}s linear ${s3}s;\n` +
      `}\n` +
      // ::after = bottom + left sides, anchored at the bottom-right corner.
      `.${ctx.scope}::after {\n` +
      `  bottom: 0;\n` +
      `  right: 0;\n` +
      `  border-bottom-width: ${thickness}px;\n` +
      `  border-left-width: ${thickness}px;\n` +
      `  border-bottom-color: ${line};\n` +
      `  border-left-color: ${line};\n` +
      // Exit order: left retracts first, then bottom.
      `  transition: width ${s1}s linear ${s1}s, height ${s1}s linear 0s;\n` +
      `}\n` +
      // Enter (hover-in) order: top draws, then right.
      `.${ctx.scope}:hover::before {\n` +
      `  width: 100%;\n` +
      `  height: 100%;\n` +
      `  transition: width ${s1}s linear 0s, height ${s1}s linear ${s1}s;\n` +
      `}\n` +
      // Enter order: bottom draws, then left — closing the loop.
      `.${ctx.scope}:hover::after {\n` +
      `  width: 100%;\n` +
      `  height: 100%;\n` +
      `  transition: width ${s1}s linear ${s2}s, height ${s1}s linear ${s3}s;\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default borderDraw;
