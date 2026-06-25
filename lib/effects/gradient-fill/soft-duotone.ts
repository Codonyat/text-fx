import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText } from "@/lib/engine/helpers";

/**
 * Soft duotone: a refined two-tone gradient in close, muted hues — the editorial
 * gradient you see on modern headings, not the bold poster split. Low saturation and
 * a gentle angle keep it tasteful. Static.
 */
const softDuotone: EffectDefinition = {
  id: "soft-duotone",
  name: "Soft Duotone",
  category: "gradient-fill",
  tags: ["modern", "minimal", "gradient", "duotone", "editorial", "premium"],
  caps: ["pure"],
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 250, min: 0, max: 360, step: 1, unit: "°" },
    { id: "shift", label: "Hue Shift", type: "range", default: 40, min: 10, max: 90, step: 1, unit: "°" },
    { id: "angle", label: "Angle", type: "angle", default: 105, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    shift: R.ri(24, 70),
    angle: R.pick([90, 105, 120, 135]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const shift = ctx.values.shift as number;
    const angle = ctx.values.angle as number;
    const dark = ctx.theme === "dark";
    const l = dark ? 66 : 50;

    // Muted, close hues — restrained on purpose (saturation kept mid, not max).
    const c1 = hsl(h, 58, l + 4);
    const c2 = hsl((h + shift) % 360, 52, l - 4);
    const grad = `linear-gradient(${angle}deg, ${c1}, ${c2})`;

    const css = `.${ctx.scope} {\n  ${clipText(grad)}\n}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default softDuotone;
