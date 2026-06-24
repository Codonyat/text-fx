import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, glowShadow, round } from "@/lib/engine/helpers";

const softGlow: EffectDefinition = {
  id: "soft-glow",
  name: "Soft Glow",
  category: "neon-glow",
  tags: ["neon", "glow", "soft", "halo", "ambient"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    { id: "blur", label: "Blur", type: "range", default: 18, min: 6, max: 40, step: 1, unit: "px" },
    { id: "alpha", label: "Glow", type: "range", default: 0.7, min: 0.2, max: 1, step: 0.05 },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    blur: R.ri(10, 32),
    alpha: Number(R.rnd(0.45, 0.9).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const blur = ctx.values.blur as number;
    const alpha = ctx.values.alpha as number;
    // No white core: text fill is a soft tint of the hue itself.
    const txt = ctx.theme === "dark" ? hsl(h, 70, 80) : hsl(h, 75, 45);
    const glow = hsl(h, 100, 62, alpha);
    const halo = hsl(h, 100, 58, round(alpha * 0.65));
    // Three concentric blurred layers, growing softer outward — no bright core.
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  ${glowShadow(halo, [round(blur * 0.5, 0), round(blur, 0), round(blur * 2.2, 0)], glow)}\n}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default softGlow;
