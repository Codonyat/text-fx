import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, svgId } from "@/lib/engine/helpers";

/**
 * Scribble underline: a hand-drawn rough rule that draws itself on under the word. A
 * flat ::after bar is warped by an SVG turbulence/displacement filter into a wobbly,
 * ink-pen squiggle, then revealed left-to-right with a scaleX draw-on so it looks
 * sketched in real time. More casual than the tidy Wavy Underline. The filter id is
 * salted; the noise seed is fixed (deterministic, parity-safe).
 */
const scribbleUnderline: EffectDefinition = {
  id: "scribble-underline",
  name: "Scribble Underline",
  category: "decoration-underline",
  tags: ["underline", "decoration", "scribble", "hand-drawn", "sketch", "svg", "animated"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "::after bar roughened by an SVG displacement filter, drawn on via scaleX",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 350, min: 0, max: 360, step: 1, unit: "°" },
    { id: "thickness", label: "Thickness", type: "range", default: 4, min: 2, max: 8, step: 1, unit: "px" },
    { id: "rough", label: "Roughness", type: "range", default: 3, min: 1, max: 6, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Draw",
      type: "range",
      default: 0.9,
      min: 0.3,
      max: 2,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    thickness: R.ri(3, 6),
    rough: R.ri(2, 5),
    speed: Number(R.rnd(0.6, 1.3).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const thickness = ctx.values.thickness as number;
    const rough = ctx.values.rough as number;
    const speed = ctx.values.speed as number;

    const txt = ctx.theme === "dark" ? hsl(h, 22, 94) : hsl(h, 40, 20);
    const line = ctx.theme === "dark" ? hsl(h, 85, 64) : hsl(h, 80, 50);
    const fid = svgId(ctx.scope, "scribble");
    const a = anim(ctx.scope, "draw");

    // Generous vertical room so the displaced bar isn't clipped as it wobbles.
    const defs =
      `<filter id="${fid}" x="-5%" y="-300%" width="110%" height="700%">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.016 0.09" numOctaves="2" seed="9" result="n"/>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="n" scale="${rough}" xChannelSelector="R" yChannelSelector="G"/>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${txt};\n` +
      `  padding-bottom: ${thickness + 6}px;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  right: 0;\n` +
      `  bottom: 2px;\n` +
      `  height: ${thickness}px;\n` +
      `  background: ${line};\n` +
      `  border-radius: ${thickness}px;\n` +
      `  filter: url(#${fid});\n` +
      `  transform-origin: left center;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s cubic-bezier(0.5, 0, 0.5, 1) both;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { transform: scaleX(0); }\n` +
      `  100% { transform: scaleX(1); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      defs,
      loopMs: speed * 1000,
    };
  },
};

export default scribbleUnderline;
