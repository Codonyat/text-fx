import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Color split: two offset duotone copies of the word (via data-text pseudo-elements,
 * screen-blended) sit either side of a neutral core for a static chromatic-aberration
 * print look — no jitter, fully recolorable. Distinct from the animated RGB glitch.
 */
const colorSplit: EffectDefinition = {
  id: "color-split",
  name: "Color Split",
  category: "glitch-distortion",
  tags: ["duotone", "color-split", "chromatic", "offset", "print"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "Two screen-blended data-text copies offset either side",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "offset", label: "Offset", type: "range", default: 4, min: 1, max: 10, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    offset: R.ri(2, 7),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const o = ctx.values.offset as number;

    const base = ctx.theme === "dark" ? hsl(h, 10, 90) : hsl(h, 14, 16);
    const c1 = hsl(h, 95, ctx.theme === "dark" ? 60 : 52);
    const c2 = hsl((h + 180) % 360, 95, ctx.theme === "dark" ? 62 : 54);

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${base};\n` +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  mix-blend-mode: screen;\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  color: ${c1};\n` +
      `  transform: translate(-${o}px, 0);\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  color: ${c2};\n` +
      `  transform: translate(${o}px, 0);\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
    };
  },
};

export default colorSplit;
