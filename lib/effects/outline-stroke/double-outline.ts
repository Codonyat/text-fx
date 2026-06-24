import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/** 8-direction hard offsets at radius r (no blur) — a single faux-stroke ring. */
function ring(r: number, color: string): string[] {
  const d = Number((r * 0.7071).toFixed(2)); // diagonal component
  return [
    `${r}px 0 0 ${color}`,
    `-${r}px 0 0 ${color}`,
    `0 ${r}px 0 ${color}`,
    `0 -${r}px 0 ${color}`,
    `${d}px ${d}px 0 ${color}`,
    `-${d}px ${d}px 0 ${color}`,
    `${d}px -${d}px 0 ${color}`,
    `-${d}px -${d}px 0 ${color}`,
  ];
}

const doubleOutline: EffectDefinition = {
  id: "double-outline",
  name: "Double Outline",
  category: "outline-stroke",
  tags: ["outline", "stroke", "hollow", "double", "concentric"],
  caps: ["pure"],
  pngSupport: "good",
  supports: "layered hard text-shadow (no -webkit-text-stroke needed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 198, min: 0, max: 360, step: 1, unit: "°" },
    { id: "gap", label: "Gap", type: "range", default: 2, min: 1, max: 5, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({ hue: R.ri(0, 360), gap: R.pick([1.5, 2, 2.5, 3]) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const gap = ctx.values.gap as number;
    // Inner ring is the vivid hue; outer ring a complementary deeper shade so the
    // two concentric outlines stay distinct.
    const inner = ctx.theme === "dark" ? hsl(h, 92, 64) : hsl(h, 88, 46);
    const outer = ctx.theme === "dark" ? hsl((h + 180) % 360, 78, 70) : hsl((h + 180) % 360, 82, 38);
    // Outer ring first (rendered underneath), inner ring on top, hugging glyphs.
    const layers = [...ring(gap * 2, outer), ...ring(gap, inner)];
    const css =
      `.${ctx.scope} {\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  text-shadow:\n    ${layers.join(",\n    ")};\n}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default doubleOutline;
