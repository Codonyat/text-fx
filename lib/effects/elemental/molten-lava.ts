import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, clipText, dropGlow } from "@/lib/engine/helpers";

/**
 * Molten lava: a bright radial hotspot drifts up and down the glyphs through a
 * yellow→orange→deep-red gradient (clipped to text), with a warm drop-shadow glow
 * (glow guard — filter, not text-shadow). The hotspot position is an animated
 * @property percentage. Distinct from the flickering Fire effect.
 */
const moltenLava: EffectDefinition = {
  id: "molten-lava",
  name: "Molten Lava",
  category: "elemental",
  tags: ["lava", "molten", "magma", "hot", "elemental", "animated"],
  caps: ["property"],
  pngSupport: "partial",
  supports: "background-clip:text + animated @property <percentage> hotspot",
  controls: [
    { id: "hue", label: "Heat Hue", type: "range", default: 18, min: 0, max: 45, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 5,
      min: 2,
      max: 12,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(6, 38),
    speed: Number(R.rnd(3.5, 8).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;

    const core = hsl((h + 30) % 360, 100, 78);
    const mid = hsl(h, 100, 55);
    const deep = hsl(Math.max(0, h - 10), 92, ctx.theme === "dark" ? 26 : 32);
    const glow = hsl(h, 100, 55, 0.5);

    const posVar = prop(ctx.scope, "pos");
    const a = anim(ctx.scope, "flow");

    const gradient =
      `radial-gradient(130% 130% at 50% var(${posVar}),` +
      ` ${core} 0%, ${mid} 38%, ${deep} 74%)`;

    const propertyRules =
      `@property ${posVar} {\n` +
      `  syntax: "<percentage>";\n` +
      `  inherits: false;\n` +
      `  initial-value: 50%;\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${posVar}: 50%;\n` +
      `  ${clipText(gradient)}\n` +
      `  ${dropGlow(glow, [8, 20])}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite alternate;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { ${posVar}: 18%; }\n` +
      `  to { ${posVar}: 82%; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      loopMs: speed * 2000,
    };
  },
};

export default moltenLava;
