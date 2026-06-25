import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

/**
 * Gradient link: a clean neutral heading that crossfades into a soft gradient on
 * hover — the understated "fill with colour on hover" treatment from modern docs and
 * marketing links. CSS-only (a data-text copy fades in); resting state is neutral.
 */
const gradientLink: EffectDefinition = {
  id: "gradient-link",
  name: "Gradient Link",
  category: "interactive-advanced",
  tags: ["modern", "interactive", "hover", "gradient", "link", "premium"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "Crossfades to a gradient on :hover via a data-text copy — resting state is neutral.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 250, min: 0, max: 360, step: 1, unit: "°" },
    { id: "shift", label: "Hue Shift", type: "range", default: 45, min: 10, max: 90, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    shift: R.ri(24, 70),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const shift = ctx.values.shift as number;
    const dark = ctx.theme === "dark";

    const neutral = dark ? hsl(h, 14, 86) : hsl(h, 16, 24);
    const l = dark ? 66 : 50;
    const grad = `linear-gradient(100deg, ${hsl(h, 70, l + 4)}, ${hsl((h + shift) % 360, 64, l - 2)})`;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${neutral};\n` +
      `  cursor: pointer;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  ${clipText(grad)}\n` +
      `  opacity: 0;\n` +
      `  transition: opacity 0.35s ease;\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}:hover::before {\n` +
      `  opacity: 1;\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
    };
  },
};

export default gradientLink;
