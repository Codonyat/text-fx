import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const long45: EffectDefinition = {
  id: "long-45",
  name: "Long Cast 45",
  category: "shadow-press",
  tags: ["shadow", "long", "cast", "45", "dramatic"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Shadow Hue", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "length", label: "Length", type: "range", default: 24, min: 12, max: 80, step: 1 },
  ],
  rand: (R) => ({
    hue: R.ri(200, 240),
    length: R.ri(16, 36),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const len = Math.round(ctx.values.length as number);
    const txt = ctx.theme === "dark" ? hsl(h, 25, 95) : hsl(h, 30, 30);
    // A 45deg long cast that fades out along its length toward transparent.
    // Distinct from a 3D extrude: each step gets progressively lighter/dimmer,
    // simulating a dramatic cast shadow rather than a solid extruded side.
    const baseL = ctx.theme === "dark" ? 10 : 42;
    const baseS = ctx.theme === "dark" ? 30 : 28;
    const layers: string[] = [];
    for (let i = 1; i <= len; i++) {
      const t = i / len; // 0 -> 1 along the cast
      // Fade alpha out toward the tail; lighten slightly for a softer falloff.
      const alpha = Number((0.85 * (1 - t) + 0.04).toFixed(3));
      const light = Math.round(baseL + t * (ctx.theme === "dark" ? 14 : 18));
      layers.push(`${i}px ${i}px 0 ${hsl(h, baseS, light, alpha)}`);
    }
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  text-shadow:\n    ${layers.join(",\n    ")};\n` +
      `}`;
    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default long45;
