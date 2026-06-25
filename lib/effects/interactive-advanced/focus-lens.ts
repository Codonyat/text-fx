import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, pointerSnippet } from "@/lib/engine/helpers";

/**
 * Focus lens: the word is soft and out of focus everywhere except under the cursor,
 * where a sharp disc tracks the pointer. A blurred data-text copy reads through the
 * whole word; a second crisp copy is revealed only inside a radial mask at --mx/--my.
 */
const focusLens: EffectDefinition = {
  id: "focus-lens",
  name: "Focus Lens",
  category: "interactive-advanced",
  tags: ["interactive", "pointer", "focus", "blur", "lens", "reveal"],
  caps: ["dataText", "pointer"],
  pngSupport: "partial",
  supports: "Blurred copy + a pointer-tracked sharp disc — static preview is centred.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 195, min: 0, max: 360, step: 1, unit: "°" },
    { id: "blur", label: "Blur", type: "range", default: 6, min: 2, max: 12, step: 1, unit: "px" },
    { id: "radius", label: "Lens Size", type: "range", default: 26, min: 12, max: 50, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    blur: R.ri(4, 10),
    radius: R.ri(18, 40),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const b = ctx.values.blur as number;
    const r = ctx.values.radius as number;
    const r2 = Math.min(95, r + 18);

    const color = ctx.theme === "dark" ? hsl(h, 55, 80) : hsl(h, 55, 38);
    // The blurred copy is muted/desaturated so it reads as out-of-focus depth,
    // distinct from the cursor-flashlight's bright reveal.
    const muted = ctx.theme === "dark" ? hsl(h, 22, 52) : hsl(h, 20, 62);
    const mask = `radial-gradient(circle at var(--mx) var(--my), #000 0%, #000 ${r}%, transparent ${r2}%)`;

    // Base text is transparent; a blurred copy reads everywhere and a sharp copy is
    // masked to the lens. Neither pseudo inherits a filter/mask from the element.
    const css =
      `.${ctx.scope} {\n` +
      `  --mx: 50%;\n` +
      `  --my: 50%;\n` +
      `  position: relative;\n` +
      `  color: transparent;\n` +
      `}\n` +
      `.${ctx.scope}::before,\n.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${color};\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  color: ${muted};\n` +
      `  filter: blur(${b}px);\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  -webkit-mask-image: ${mask};\n` +
      `  mask-image: ${mask};\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default focusLens;
