import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, pointerSnippet } from "@/lib/engine/helpers";

/**
 * Parallax layers: two shaded copies of the word (data-text) sit behind the face and
 * trail the cursor at increasing rates, so the deeper layers slide further — a sense
 * of stacked 3D depth that responds to the pointer.
 */
const parallaxLayers: EffectDefinition = {
  id: "parallax-layers",
  name: "Parallax Layers",
  category: "threed-depth",
  tags: ["3d", "parallax", "pointer", "depth", "layers", "interactive"],
  caps: ["dataText", "pointer"],
  pngSupport: "partial",
  supports: "Stacked data-text copies translating at different pointer-driven rates.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 285, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 40, min: 15, max: 80, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    depth: R.ri(25, 65),
  }),
  build: (ctx) => {
    const hue = ctx.values.hue as number;
    const d = (ctx.values.depth as number) / 100;
    const k1 = (d * 0.6).toFixed(2);
    const k2 = (d * 1.2).toFixed(2);
    const dark = ctx.theme === "dark";

    const face = dark ? hsl(hue, 80, 78) : hsl(hue, 75, 44);
    const mid = dark ? hsl(hue, 60, 50) : hsl(hue, 55, 62);
    const deep = dark ? hsl(hue, 45, 32) : hsl(hue, 40, 76);

    const layer = (k: string, color: string, z: number) =>
      `.${ctx.scope}::${z === -1 ? "before" : "after"} {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${color};\n` +
      `  z-index: ${z};\n` +
      `  transform: translate(calc((var(--mx) - 50%) * -${k}), calc((var(--my) - 50%) * -${k}));\n` +
      `  transition: transform 0.12s ease-out;\n` +
      `  pointer-events: none;\n` +
      `}`;

    // Rest off-centre so the static poster already shows the staggered layer stack
    // (the pointer then exaggerates it); at 50%/50% the layers would collapse flat.
    const css =
      `.${ctx.scope} {\n` +
      `  --mx: 30%;\n` +
      `  --my: 26%;\n` +
      `  position: relative;\n` +
      `  isolation: isolate;\n` +
      `  color: ${face};\n` +
      `}\n` +
      `${layer(k1, mid, -1)}\n` +
      `${layer(k2, deep, -2)}`;

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default parallaxLayers;
