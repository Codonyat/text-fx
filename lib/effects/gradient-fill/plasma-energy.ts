import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, clipText } from "@/lib/engine/helpers";

/**
 * Plasma energy: the word as contained ball-lightning. A conic gradient clipped to
 * the glyphs spins via an animated @property <angle>, WHILE a second @property <number>
 * hue oscillates so every colour shifts at once — the swirl never resolves into a tidy
 * colour wheel. A white-hot radial core sits over the vortex, and a strong electric
 * drop-shadow glow BREATHES (blur + magenta⇄cyan colour) so the whole thing reads as
 * humming, ionised energy. Diverges from Conic Spin (clean wheel, no glow, no hue cycle)
 * and Aurora (soft drifting sky) — this one crackles hot.
 */
const plasmaEnergy: EffectDefinition = {
  id: "plasma-energy",
  name: "Plasma Energy",
  category: "gradient-fill",
  tags: ["gradient", "conic", "plasma", "energy", "electric", "glow", "animated"],
  caps: ["pure", "property"],
  pngSupport: "partial",
  supports: "@property + background-clip:text + drop-shadow glow (Chrome/Edge/Safari 16.4+)",
  controls: [
    {
      id: "hue",
      label: "Energy Hue",
      type: "range",
      default: 275,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
    },
    {
      id: "speed",
      label: "Swirl Speed",
      type: "range",
      default: 7,
      min: 4,
      max: 14,
      step: 0.1,
      unit: "s",
    },
    {
      id: "glow",
      label: "Glow",
      type: "range",
      default: 13,
      min: 5,
      max: 30,
      step: 1,
      unit: "px",
    },
  ],
  rand: (R) => ({
    // Bias the base toward the cool/electric arc (cyan → blue → violet → magenta)
    // so every SHUFFLE still reads as plasma, never a muddy green/yellow wheel.
    hue: R.ri(200, 320),
    speed: Number(R.rnd(5, 9).toFixed(1)),
    glow: R.ri(10, 18),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const g = ctx.values.glow as number;

    const dark = ctx.theme === "dark";
    // Saturated body stays legible on both stages; hot arcs blaze near-white on dark,
    // pulled down on light so they don't vanish into a pale background.
    const baseL = dark ? 62 : 52;
    const hotL = dark ? 94 : 80;
    const coreL = dark ? 96 : 82;

    const hueP = prop(ctx.scope, "hue");
    const angP = prop(ctx.scope, "angle");
    const aSpin = anim(ctx.scope, "spin");
    const aHue = anim(ctx.scope, "huecycle");
    const aPulse = anim(ctx.scope, "pulse");

    // Every stop is expressed relative to the animated --hue, so the whole palette
    // shifts together as it cycles. Two white-hot arcs (70deg, 250deg) rotate like
    // crackling filaments; the conic centre is nudged off-axis for an uneasy swirl.
    const conic =
      `conic-gradient(from var(${angP}) at 46% 48%,` +
      ` hsl(var(${hueP}) 95% ${baseL}%) 0deg,` +
      ` hsl(calc(var(${hueP}) + 35) 100% ${hotL}%) 70deg,` +
      ` hsl(calc(var(${hueP}) + 60) 95% ${baseL}%) 120deg,` +
      ` hsl(calc(var(${hueP}) - 95) 100% ${baseL}%) 190deg,` +
      ` hsl(calc(var(${hueP}) - 60) 100% ${hotL}%) 250deg,` +
      ` hsl(calc(var(${hueP}) - 25) 95% ${baseL}%) 310deg,` +
      ` hsl(var(${hueP}) 95% ${baseL}%) 360deg)`;

    // White-hot core over the vortex (fades to alpha-0 of the SAME hue to avoid a grey
    // fringe). Sits off-centre from the conic pivot so the hot spot and swirl disagree.
    const core =
      `radial-gradient(circle at 54% 40%,` +
      ` hsl(var(${hueP}) 100% ${coreL}% / 0.92) 0%,` +
      ` hsl(var(${hueP}) 100% ${coreL}% / 0) 46%)`;

    // Electric glow colours (resolved at build time so the breathing filter interpolates
    // cleanly on blur alone); the pulse swings the halo magenta ⇄ cyan as it swells.
    const glowA = hsl((h + 30) % 360, 100, dark ? 66 : 54, 0.9);
    const glowB = hsl((((h - 70) % 360) + 360) % 360, 100, dark ? 66 : 54, 0.9);
    const b = (m: number) => (g * m).toFixed(1);
    const restFilter =
      `filter: drop-shadow(0 0 ${b(0.5)}px ${glowA}) drop-shadow(0 0 ${b(1.3)}px ${glowA});`;

    const propertyRules =
      `@property ${angP} {\n` +
      `  syntax: "<angle>";\n` +
      `  inherits: false;\n` +
      `  initial-value: 0deg;\n` +
      `}\n` +
      `@property ${hueP} {\n` +
      `  syntax: "<number>";\n` +
      `  inherits: false;\n` +
      `  initial-value: ${h};\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${angP}: 0deg;\n` +
      `  ${hueP}: ${h};\n` +
      `  ${clipText(`${core}, ${conic}`)}\n` +
      `  ${restFilter}\n` +
      `  animation:\n` +
      `    ${aSpin} ${speed.toFixed(1)}s linear infinite,\n` +
      `    ${aHue} ${(speed * 1.35).toFixed(1)}s ease-in-out infinite,\n` +
      `    ${aPulse} ${(speed * 0.5).toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${aSpin} {\n` +
      `  to { ${angP}: 360deg; }\n` +
      `}\n` +
      `@keyframes ${aHue} {\n` +
      `  0% { ${hueP}: ${h}; }\n` +
      `  25% { ${hueP}: ${h + 55}; }\n` +
      `  50% { ${hueP}: ${h}; }\n` +
      `  75% { ${hueP}: ${h - 55}; }\n` +
      `  100% { ${hueP}: ${h}; }\n` +
      `}\n` +
      `@keyframes ${aPulse} {\n` +
      `  0%, 100% { filter: drop-shadow(0 0 ${b(0.5)}px ${glowA}) drop-shadow(0 0 ${b(1.3)}px ${glowA}); }\n` +
      `  50% { filter: drop-shadow(0 0 ${b(0.95)}px ${glowB}) drop-shadow(0 0 ${b(2.5)}px ${glowB}); }\n` +
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

export default plasmaEnergy;
