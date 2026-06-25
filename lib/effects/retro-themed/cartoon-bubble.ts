import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Cartoon bubble: a bright fill ringed by two concentric outlines — an inner white
 * ring and a thick outer ink ring — built from stacked data-text copies behind the
 * face (transparent fill + -webkit-text-stroke). Classic sticker/comic bubble.
 */
const cartoonBubble: EffectDefinition = {
  id: "cartoon-bubble",
  name: "Cartoon Bubble",
  category: "retro-themed",
  tags: ["cartoon", "comic", "bubble", "sticker", "outline"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "Stacked data-text copies with concentric -webkit-text-stroke rings",
  controls: [
    { id: "hue", label: "Fill Hue", type: "range", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    { id: "ring", label: "White Ring", type: "range", default: 5, min: 2, max: 10, step: 0.5, unit: "px" },
    { id: "ink", label: "Ink Ring", type: "range", default: 11, min: 5, max: 18, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    ring: R.pick([4, 5, 6, 7]),
    ink: R.pick([9, 11, 13, 15]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const ring = ctx.values.ring as number;
    const inkW = ctx.values.ink as number;

    const fill = hsl(h, 92, 60);
    const white = "#fff";
    const ink = hsl(h, 55, 12);
    const drop = hsl(h, 50, 10, 0.4);

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  isolation: isolate;\n` +
      `  color: ${fill};\n` +
      `  filter: drop-shadow(2px 3px 0 ${drop});\n` +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: transparent;\n` +
      `  paint-order: stroke fill;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  -webkit-text-stroke: ${ring}px ${white};\n` +
      `  z-index: -1;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  -webkit-text-stroke: ${inkW}px ${ink};\n` +
      `  z-index: -2;\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
    };
  },
};

export default cartoonBubble;
