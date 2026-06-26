import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, prop, hsl, dropGlow } from "@/lib/engine/helpers";

/**
 * Water-fill: hollow stroked glyphs with a water level that rises and falls. The
 * waterline is a hard gradient stop driven by an animated @property percentage; a
 * cool drop-shadow keeps the clipped fill lit (glow guard — never text-shadow).
 */
const waterFill: EffectDefinition = {
  id: "water-fill",
  name: "Water Fill",
  category: "elemental",
  tags: ["water", "liquid", "fill", "rising", "elemental", "animated"],
  caps: ["property"],
  pngSupport: "partial",
  supports: "background-clip:text + animated @property <percentage> waterline",
  controls: [
    { id: "hue", label: "Water Hue", type: "range", default: 185, min: 140, max: 260, step: 1, unit: "°" },
    { id: "low", label: "Low Tide", type: "range", default: 25, min: 0, max: 50, step: 1, unit: "%" },
    { id: "high", label: "High Tide", type: "range", default: 85, min: 55, max: 100, step: 1, unit: "%" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 4.5,
      min: 2,
      max: 10,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(170, 200),
    low: R.ri(10, 35),
    high: R.ri(70, 95),
    speed: Number(R.rnd(3, 7).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const low = ctx.values.low as number;
    const high = ctx.values.high as number;
    const speed = ctx.values.speed as number;

    const w1 = hsl(h, 55, ctx.theme === "dark" ? 40 : 38); // deep
    const w2 = hsl((h + 14) % 360, 58, ctx.theme === "dark" ? 62 : 56); // surface
    const outline = ctx.theme === "dark" ? hsl(h, 40, 70, 0.85) : hsl(h, 45, 38, 0.85);
    const glow = hsl(h, 55, 60, 0.4);

    const levelVar = prop(ctx.scope, "level");
    const a = anim(ctx.scope, "tide");

    // Water below the line, transparent (hollow) above it.
    const gradient =
      `linear-gradient(to top, ${w1} 0%, ${w2} var(${levelVar}), transparent var(${levelVar}))`;

    const propertyRules =
      `@property ${levelVar} {\n` +
      `  syntax: "<percentage>";\n` +
      `  inherits: false;\n` +
      `  initial-value: ${low}%;\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${levelVar}: ${low}%;\n` +
      `  -webkit-text-stroke: 1.5px ${outline};\n` +
      `  background: ${gradient};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  ${dropGlow(glow, [10])}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite alternate;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { ${levelVar}: ${low}%; }\n` +
      `  to { ${levelVar}: ${high}%; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      // Alternate rise-and-fall over 2x the declared duration.
      loopMs: speed * 2000,
    };
  },
};

export default waterFill;
