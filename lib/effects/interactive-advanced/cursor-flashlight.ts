import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, pointerSnippet } from "@/lib/engine/helpers";

/**
 * Cursor flashlight: the word sits dim until your cursor sweeps over it, lighting a
 * bright glowing disc that tracks the pointer. The lit copy (data-text) is revealed
 * through a radial mask centred on --mx/--my, which the studio feeds from the cursor.
 */
const cursorFlashlight: EffectDefinition = {
  id: "cursor-flashlight",
  name: "Cursor Flashlight",
  category: "interactive-advanced",
  tags: ["interactive", "pointer", "flashlight", "spotlight", "reveal", "animated"],
  caps: ["dataText", "pointer"],
  pngSupport: "partial",
  supports: "Follows the cursor via a pointer-tracked radial mask — static preview shows the centred disc.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 45, min: 0, max: 360, step: 1, unit: "°" },
    { id: "radius", label: "Beam Size", type: "range", default: 28, min: 16, max: 48, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    radius: R.ri(22, 40),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const r = ctx.values.radius as number;
    const r2 = Math.min(95, r + 20);

    // Dim base stays faintly legible outside the beam (lifted on dark themes).
    const dim = ctx.theme === "dark" ? hsl(h, 20, 40) : hsl(h, 24, 70);
    const lit = ctx.theme === "dark" ? hsl(h, 58, 64) : hsl(h, 55, 46);
    const halo = hsl(h, 60, 60);
    const mask = `radial-gradient(circle at var(--mx) var(--my), #000 0%, #000 ${r}%, transparent ${r2}%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  --mx: 50%;\n` +
      `  --my: 50%;\n` +
      `  position: relative;\n` +
      `  color: ${dim};\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${lit};\n` +
      `  text-shadow: 0 0 8px ${halo};\n` +
      `  -webkit-mask-image: ${mask};\n` +
      `  mask-image: ${mask};\n` +
      `  pointer-events: none;\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default cursorFlashlight;
