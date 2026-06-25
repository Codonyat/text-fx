import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, clipText, dropGlow } from "@/lib/engine/helpers";

/**
 * Oil-slick: a dark petrol sheen — deep blue/violet/green/magenta conic iridescence
 * with a soft diagonal highlight band, clipped to the glyphs and slowly rotating via
 * an animated @property angle. Moodier than the bright holographic foil.
 */
const oilSlick: EffectDefinition = {
  id: "oil-slick",
  name: "Oil Slick",
  category: "metallic-holographic",
  tags: ["oil", "slick", "petrol", "iridescent", "holographic", "animated"],
  caps: ["property"],
  pngSupport: "partial",
  supports: "background-clip:text + animated @property <angle> conic iridescence",
  controls: [
    { id: "hue", label: "Base Hue", type: "range", default: 230, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 8,
      min: 3,
      max: 18,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(5, 13).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const l = ctx.theme === "dark" ? 42 : 38;
    // Petrol iridescence: low-lightness, high-sat hues striding around the wheel.
    const c0 = hsl(h, 85, l);
    const c1 = hsl((h + 60) % 360, 90, l + 8);
    const c2 = hsl((h + 150) % 360, 85, l + 2);
    const c3 = hsl((h + 240) % 360, 90, l + 6);
    const c4 = hsl((h + 310) % 360, 88, l + 4);

    const angleVar = prop(ctx.scope, "angle");
    const a = anim(ctx.scope, "slick");
    const glow = hsl((h + 150) % 360, 80, 55, 0.35);

    const sheen = `linear-gradient(115deg, transparent 30%, hsl(0 0% 100% / 0.18) 50%, transparent 70%)`;
    const conic =
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
      `  ${clipText(`${sheen}, ${conic}`)}\n` +
      `  ${dropGlow(glow, [10])}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes = `@keyframes ${a} {\n  to { ${angleVar}: 360deg; }\n}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      loopMs: speed * 1000,
    };
  },
};

export default oilSlick;
