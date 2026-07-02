import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, prop, round } from "@/lib/engine/helpers";

/**
 * A neon tube whose hue travels the color wheel forever. A salted @property
 * <number> holds the current hue in degrees; keyframes animate it 0→360 past the
 * chosen start, and every color (letter fill + glow halo) reads it live via
 * var() — so the browser recomputes the whole glow each frame as the registered
 * property interpolates. Unlike Neon Glow / Pulse Glow (fixed hue, size/flicker
 * animate instead), the size here stays put and only the COLOR cycles.
 */
const colorCycleGlow: EffectDefinition = {
  id: "color-cycle-glow",
  name: "Color-Cycle Glow",
  category: "neon-glow",
  tags: ["neon", "glow", "color", "rainbow", "property", "animated"],
  caps: ["pure", "property"],
  pngSupport: "partial",
  supports: "Animated @property hue-cycle (Chrome 85+, Safari 16.4+, Firefox 128+)",
  controls: [
    { id: "startHue", label: "Start Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Speed", type: "range", default: 9, min: 4, max: 20, step: 0.1, unit: "s" },
    { id: "glow", label: "Glow", type: "range", default: 1, min: 0.6, max: 1.8, step: 0.05 },
    { id: "saturation", label: "Saturation", type: "range", default: 72, min: 30, max: 100, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    startHue: R.ri(0, 360),
    speed: Number(R.rnd(6, 14).toFixed(1)),
    glow: Number(R.rnd(0.85, 1.4).toFixed(2)),
    saturation: R.ri(55, 90),
  }),
  build: (ctx) => {
    const startHue = ctx.values.startHue as number;
    const speed = ctx.values.speed as number;
    const glow = ctx.values.glow as number;
    const sat = ctx.values.saturation as number;
    const dark = ctx.theme === "dark";

    // Registered custom property carrying the live hue (plain <number> = degrees,
    // same convention hsl() uses elsewhere in this codebase).
    const hueVar = prop(ctx.scope, "hue");
    const a = anim(ctx.scope, "cycle");

    // Letter fill stays bright/tinted (dark stage) or deep/saturated (light stage)
    // so the traveling hue reads clearly against either background.
    const textL = dark ? 80 : 38;
    const coreL = dark ? 68 : 50;
    const haloL = dark ? 55 : 42;

    const b = (px: number) => round(px * glow, 1);
    const textColor = `hsl(var(${hueVar}) ${sat}% ${textL}%)`;
    const coreColor = `hsl(var(${hueVar}) ${sat}% ${coreL}%)`;
    // Halo band sits a touch further round the wheel than the core for a subtle
    // chromatic bleed at the glow edge, like a slightly detuned neon tube.
    const haloColor = `hsl(calc(var(${hueVar}) + 24) ${sat}% ${haloL}%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${hueVar}: ${startHue};\n` +
      `  color: ${textColor};\n` +
      `  text-shadow:\n` +
      `    0 0 ${b(4)}px ${coreColor},\n` +
      `    0 0 ${b(10)}px ${coreColor},\n` +
      `    0 0 ${b(22)}px ${haloColor},\n` +
      `    0 0 ${b(40)}px ${haloColor};\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const propertyRules =
      `@property ${hueVar} {\n` +
      `  syntax: "<number>";\n` +
      `  inherits: false;\n` +
      `  initial-value: ${startHue};\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { ${hueVar}: ${startHue}; }\n` +
      `  100% { ${hueVar}: ${startHue + 360}; }\n` +
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

export default colorCycleGlow;
