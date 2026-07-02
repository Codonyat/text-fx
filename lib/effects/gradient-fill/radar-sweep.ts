import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, clipText, dropGlow, round } from "@/lib/engine/helpers";

// Sonar scope. The glyphs rest DIM (low-alpha wash + optional concentric rings),
// and a single bright conic BEAM with a long decaying trail spins around the
// centre via an animated @property <angle>, lighting each letter as it passes.
// Diverges from conic-spin (a full spinning colour WHEEL) — here almost the whole
// word is dim and only the rotating wedge is lit.
const radarSweep: EffectDefinition = {
  id: "radar-sweep",
  name: "Radar Sweep",
  category: "gradient-fill",
  tags: ["gradient", "conic", "radar", "sweep", "scan", "reveal", "animated"],
  caps: ["pure", "property"],
  pngSupport: "partial",
  supports: "background-clip:text + animated @property <angle> (conic sweep)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 135, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Sweep Speed",
      type: "range",
      default: 4,
      min: 2,
      max: 8,
      step: 0.1,
      unit: "s",
    },
    {
      id: "trail",
      label: "Trail Length",
      type: "range",
      default: 150,
      min: 60,
      max: 300,
      step: 5,
      unit: "°",
    },
    {
      id: "rings",
      label: "Scope Rings",
      type: "toggle",
      default: true,
      onLabel: "On",
      offLabel: "Off",
    },
  ],
  rand: (R) => {
    // Favour classic radar phosphors: green, amber, blue — with a little jitter.
    const band = R.pick([135, 145, 40, 205]);
    return {
      hue: (band + R.ri(-8, 8) + 360) % 360,
      speed: Number(R.rnd(3, 5.5).toFixed(1)),
      trail: R.ri(110, 210),
      rings: R.chance(0.7),
    };
  },
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const trail = ctx.values.trail as number;
    const rings = Boolean(ctx.values.rings);
    const dark = ctx.theme === "dark";

    // Bright rotating beam: opaque leading edge, decaying tail -> transparent.
    const bright = dark ? hsl(h, 96, 70) : hsl(h, 88, 40);
    const brightMid = dark ? hsl(h, 92, 64, 0.8) : hsl(h, 82, 45, 0.85);
    const mid = dark ? hsl(h, 85, 58, 0.35) : hsl(h, 75, 48, 0.35);

    // Resting dim scope fill (low alpha, still legible on dark AND light stages).
    const dimA = dark ? hsl(h, 32, 60, 0.42) : hsl(h, 45, 42, 0.5);
    const dimB = dark ? hsl(h, 28, 46, 0.5) : hsl(h, 40, 34, 0.58);

    const angleVar = prop(ctx.scope, "ang");
    const a = anim(ctx.scope, "sweep");

    // The bright leading line sits at the `from` angle (360deg); the trail decays
    // backward (counter-clockwise, the just-swept side) over `trail` degrees.
    const d0 = round(360 - trail, 1);
    const d1 = round(360 - trail * 0.5, 1);
    const d2 = round(360 - trail * 0.15, 1);
    const beam =
      `conic-gradient(from var(${angleVar}), ` +
      `transparent 0deg, transparent ${d0}deg, ` +
      `${mid} ${d1}deg, ${brightMid} ${d2}deg, ${bright} 360deg)`;

    // Dim layer: optional faint concentric scope rings, else a flat phosphor wash.
    const dimLayer = rings
      ? `repeating-radial-gradient(circle at 50% 50%, ` +
        `${dimA} 0px, ${dimA} 5px, ${dimB} 5px, ${dimB} 9px)`
      : dimA;

    const glow = dark ? hsl(h, 90, 55, 0.35) : hsl(h, 70, 45, 0.22);

    const propertyRules =
      `@property ${angleVar} {\n` +
      `  syntax: "<angle>";\n` +
      `  inherits: false;\n` +
      `  initial-value: 0deg;\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${angleVar}: 0deg;\n` +
      `  ${clipText(`${beam}, ${dimLayer}`)}\n` +
      `  ${dropGlow(glow, [5])}\n` +
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

export default radarSweep;
