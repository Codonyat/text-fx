import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, clipText, dropGlow } from "@/lib/engine/helpers";

const conicSpin: EffectDefinition = {
  id: "conic-spin",
  name: "Conic Spin",
  category: "gradient-fill",
  tags: ["gradient", "conic", "spin", "rotate", "color", "animated"],
  caps: ["property"],
  pngSupport: "partial",
  supports: "background-clip:text + animated @property <angle>",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 6,
      min: 2,
      max: 14,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(4, 10).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;

    // A full-spectrum conic wheel anchored on the chosen hue so the rotation
    // sweeps every part of the gradient through the glyphs.
    const c0 = hsl(h, 95, 60);
    const c1 = hsl((h + 72) % 360, 95, 58);
    const c2 = hsl((h + 144) % 360, 95, 62);
    const c3 = hsl((h + 216) % 360, 95, 58);
    const c4 = hsl((h + 288) % 360, 95, 60);

    const angleVar = prop(ctx.scope, "angle");
    const a = anim(ctx.scope, "spin");
    const glow = ctx.theme === "dark" ? hsl(h, 90, 55, 0.45) : hsl(h, 80, 45, 0.3);

    const gradient =
      `conic-gradient(from var(${angleVar}), ` +
      `${c0}, ${c1}, ${c2}, ${c3}, ${c4}, ${c0})`;

    const propertyRules =
      `@property ${angleVar} {\n` +
      `  syntax: "<angle>";\n` +
      `  inherits: false;\n` +
      `  initial-value: 0deg;\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${angleVar}: 0deg;\n` +
      `  ${clipText(gradient)}\n` +
      `  ${dropGlow(glow, [12])}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  to { ${angleVar}: 360deg; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      loopMs: speed * 1000,
    };
  },
};

export default conicSpin;
