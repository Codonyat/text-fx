import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, dropGlow } from "@/lib/engine/helpers";

const holographic: EffectDefinition = {
  id: "holographic",
  name: "Holographic Foil",
  category: "metallic-holographic",
  tags: ["holographic", "iridescent", "foil", "rainbow", "property", "animated"],
  caps: ["property"],
  pngSupport: "partial",
  supports: "@property <angle> + background-clip:text (Chrome 85+, Safari 16.4+, Firefox 128+)",
  // Static rainbow fallback for engines without @property support.
  fallbackCss:
    "background:conic-gradient(from 0deg,#ff6ec4,#7873f5,#4ade80,#fde047,#ff6ec4);" +
    "-webkit-background-clip:text;background-clip:text;" +
    "-webkit-text-fill-color:transparent;color:transparent;",
  controls: [
    { id: "speed", label: "Speed", type: "range", default: 12, min: 2, max: 14, step: 0.1, unit: "s" },
    { id: "saturation", label: "Saturation", type: "range", default: 50, min: 40, max: 100, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    speed: Number(R.rnd(10, 14).toFixed(1)),
    saturation: R.ri(40, 60),
  }),
  build: (ctx) => {
    const speed = ctx.values.speed as number;
    const sat = ctx.values.saturation as number;
    const an = anim(ctx.scope, "spin");
    const angleVar = prop(ctx.scope, "angle"); // registered <angle>

    // Iridescent stops sweep the full hue wheel; saturation control tunes punch.
    const l1 = 64;
    const l2 = 70;
    const stop = (hue: number, l: number) => hsl(hue, sat, l);
    const conic =
      `conic-gradient(from var(${angleVar}),\n` +
      `      ${stop(300, l2)} 0deg,\n` +
      `      ${stop(255, l1)} 60deg,\n` +
      `      ${stop(190, l2)} 120deg,\n` +
      `      ${stop(140, l1)} 180deg,\n` +
      `      ${stop(55, l2)} 240deg,\n` +
      `      ${stop(15, l1)} 300deg,\n` +
      `      ${stop(300, l2)} 360deg)`;

    // Halo tied to a mid iridescent tone; drop-shadow because fill is transparent.
    const halo = hsl(280, sat, 65, 0.45);
    const css =
      `.${ctx.scope} {\n` +
      `  background: ${conic};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  ${dropGlow(halo, [3, 8])}\n` +
      `  animation: ${an} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    // Typed @property lets the browser interpolate the angle smoothly.
    const propertyRules =
      `@property ${angleVar} {\n` +
      `  syntax: "<angle>";\n` +
      `  inherits: false;\n` +
      `  initial-value: 0deg;\n` +
      `}`;
    const keyframes =
      `@keyframes ${an} {\n` +
      `  to { ${angleVar}: 360deg; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default holographic;
