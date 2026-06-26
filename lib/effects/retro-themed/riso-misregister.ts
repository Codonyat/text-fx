import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Risograph misregistration: the word is printed in two spot-ink layers that don't
 * quite line up, the way a cheap duplicator drifts between passes. The base ink sits
 * still; a second-hue copy (data-text) is nudged a few px on the diagonal and blended
 * — multiply on light "paper", screen on dark — so the overlap reads as a third tone
 * and the misaligned fringes show. Static. The blend mode keeps both inks legible.
 */
const risoMisregister: EffectDefinition = {
  id: "riso-misregister",
  name: "Riso Misregister",
  category: "retro-themed",
  tags: ["riso", "print", "misregister", "duotone", "offset", "retro"],
  caps: ["dataText"],
  pngSupport: "partial",
  supports: "data-text spot-ink copy offset + mix-blend-mode (multiply/screen)",
  controls: [
    { id: "hue", label: "Ink", type: "range", default: 205, min: 0, max: 360, step: 1, unit: "°" },
    { id: "spread", label: "Ink Gap", type: "range", default: 150, min: 90, max: 220, step: 5, unit: "°" },
    { id: "offset", label: "Misalign", type: "range", default: 3, min: 1, max: 9, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    spread: R.pick([120, 150, 180]),
    offset: R.ri(2, 5),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const spread = ctx.values.spread as number;
    const o = ctx.values.offset as number;
    const h2 = (h + spread) % 360;

    const dark = ctx.theme === "dark";
    const blend = dark ? "screen" : "multiply";
    // Saturated, slightly chalky spot inks that survive the blend on either paper.
    const inkA = dark ? hsl(h, 78, 60) : hsl(h, 82, 48);
    const inkB = dark ? hsl(h2, 80, 62) : hsl(h2, 84, 50);

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${inkA};\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${inkB};\n` +
      `  transform: translate(${o}px, ${o}px);\n` +
      `  mix-blend-mode: ${blend};\n` +
      `  pointer-events: none;\n` +
      `}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
    };
  },
};

export default risoMisregister;
