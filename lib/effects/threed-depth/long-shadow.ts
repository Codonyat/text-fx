import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const longShadow: EffectDefinition = {
  id: "long-shadow",
  name: "Long Shadow",
  category: "threed-depth",
  tags: ["3d", "long-shadow", "flat", "depth", "shadow"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 38, min: 0, max: 360, step: 1, unit: "°" },
    { id: "length", label: "Length", type: "range", default: 34, min: 10, max: 80, step: 1 },
    { id: "angle", label: "Angle", type: "angle", default: 45, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    length: R.ri(24, 60),
    angle: R.pick([45, 135, 225, 315]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const len = Math.round(ctx.values.length as number);
    const angle = ctx.values.angle as number;

    // Face is the saturated brand color; the trailing shadow is a darker,
    // desaturated tint of the same hue so the long shadow reads as cast depth.
    const face = ctx.theme === "dark" ? hsl(h, 55, 62) : hsl(h, 55, 48);
    const shadow = ctx.theme === "dark" ? hsl(h, 40, 22) : hsl(h, 35, 70);

    // Unit step along the chosen angle (1px-ish per layer for a smooth flat trail).
    const rad = (angle * Math.PI) / 180;
    const sx = Math.cos(rad);
    const sy = Math.sin(rad);

    const layers: string[] = [];
    for (let i = 1; i <= len; i++) {
      const x = Number((i * sx).toFixed(2));
      const y = Number((i * sy).toFixed(2));
      layers.push(`${x}px ${y}px 0 ${shadow}`);
    }

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow:\n    ${layers.join(",\n    ")};\n}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default longShadow;
