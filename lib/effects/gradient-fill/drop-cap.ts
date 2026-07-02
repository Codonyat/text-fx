import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Illuminated Drop Cap: a manuscript versal. Only the first letter is enlarged and
 * ornamented via ::first-letter — a rich gradient fill (background-clip:text), a thin
 * neutral contrast stroke, and a small soft drop-shadow (filter, since text-shadow is
 * invisible on transparent-fill clipped text) — while the rest of the word stays plain
 * and quiet. The contrast between the two IS the effect. An optional padded tint + ring
 * "frame" sits behind the cap for a fuller illuminated-initial feel. Static.
 */
const dropCap: EffectDefinition = {
  id: "drop-cap",
  name: "Drop Cap",
  category: "gradient-fill",
  tags: ["drop-cap", "illuminated", "manuscript", "versal", "editorial", "gradient"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Gradient fill on ::first-letter via background-clip:text (all modern browsers, -webkit- prefixed)",
  controls: [
    { id: "scale", label: "Cap Scale", type: "range", default: 2.2, min: 1.6, max: 3.2, step: 0.1, unit: "×" },
    { id: "hue", label: "Cap Hue", type: "range", default: 40, min: 0, max: 360, step: 1, unit: "°" },
    { id: "frame", label: "Frame", type: "toggle", default: true, onLabel: "On", offLabel: "Off" },
  ],
  rand: (R) => ({
    scale: Number(R.rnd(1.8, 2.8).toFixed(1)),
    hue: R.ri(0, 360),
    frame: R.chance(0.6),
  }),
  build: (ctx) => {
    const scale = ctx.values.scale as number;
    const hue = ctx.values.hue as number;
    const frame = Boolean(ctx.values.frame);
    const dark = ctx.theme === "dark";

    // The rest of the word: plain, quiet, high-contrast against the stage — the
    // deliberate foil to the ornamented cap.
    const plain = dark ? hsl(0, 0, 94) : hsl(0, 0, 14);

    // The illuminated cap: a rich diagonal gradient, bright highlight to a deep base,
    // tuned by hue. A neutral (not hue-tied) rim keeps it crisp on either theme.
    const capGrad =
      `linear-gradient(155deg,\n` +
      `    ${hsl(hue + 16, 78, dark ? 80 : 66)} 0%,\n` +
      `    ${hsl(hue, 85, dark ? 58 : 46)} 48%,\n` +
      `    ${hsl(hue - 12, 72, dark ? 34 : 26)} 100%)`;
    const strokeColor = dark ? hsl(0, 0, 96, 0.9) : hsl(0, 0, 8, 0.9);
    const shadowColor = hsl(hue - 8, 50, dark ? 8 : 20, 0.5);
    // Optional frame: a soft tinted patch (outer box-shadow — painted behind the
    // clipped gradient background, so it only shows through the gaps around the
    // glyph, never over it) plus a crisp thin ring.
    const tint = dark ? hsl(hue, 42, 22, 0.32) : hsl(hue, 55, 90, 0.75);
    const ring = dark ? hsl(hue, 45, 62, 0.55) : hsl(hue, 45, 35, 0.45);

    const frameCss = frame
      ? `  padding: 0.04em 0.1em;\n` +
        `  border-radius: 0.08em;\n` +
        `  outline: 0.01em solid ${ring};\n` +
        `  outline-offset: 0.04em;\n` +
        `  box-shadow: 0 0 0.06em 0.1em ${tint};\n`
      : "";

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${plain};\n` +
      `}\n` +
      `.${ctx.scope}::first-letter {\n` +
      `  font-size: ${scale}em;\n` +
      `  font-weight: 800;\n` +
      `  line-height: 1;\n` +
      `  background: ${capGrad};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-stroke: 0.01em ${strokeColor};\n` +
      `  filter: drop-shadow(0.015em 0.025em 0.025em ${shadowColor});\n` +
      frameCss +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default dropCap;
