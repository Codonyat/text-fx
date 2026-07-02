import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, dropGlow, round } from "@/lib/engine/helpers";

/**
 * Equalizer bars fill: the glyphs are filled with a music-visualizer bar meter.
 * Each column is one background layer — a full-width gradient carrying a single
 * vertical band — scaled by its own animated `@property <percentage>` height and
 * anchored to the baseline. Per-bar durations + negative start offsets desync the
 * columns so they pump independently, like a meter dancing to a track. Purely
 * visual rhythm; no audio is involved. Distinct from the static uniform Stripe Fill
 * (these bars are LIVE and bounce) and Water Fill (one shared level vs. many columns).
 */
const equalizerBars: EffectDefinition = {
  id: "equalizer-bars",
  name: "Equalizer Bars",
  category: "fill-texture",
  tags: ["fill", "texture", "equalizer", "music", "bars", "meter", "visualizer", "animated"],
  caps: ["pure", "property"],
  pngSupport: "partial",
  supports: "background-clip:text + animated @property <percentage> bar heights",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "spectrum",
      label: "Color",
      type: "toggle",
      default: true,
      onLabel: "Spectrum",
      offLabel: "Single Hue",
    },
    {
      id: "spread",
      label: "Spectrum Spread",
      type: "range",
      default: 22,
      min: 8,
      max: 45,
      step: 1,
      unit: "°",
      when: (v) => Boolean(v.spectrum),
    },
    { id: "bars", label: "Bars", type: "range", default: 8, min: 5, max: 14, step: 1 },
    { id: "barWidth", label: "Bar Width", type: "range", default: 62, min: 35, max: 90, step: 1, unit: "%" },
    { id: "speed", label: "Bounce", type: "range", default: 1.4, min: 0.6, max: 3, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    spectrum: R.chance(0.6),
    spread: R.ri(14, 32),
    bars: R.ri(6, 11),
    barWidth: R.pick([52, 60, 68, 76]),
    speed: Number(R.rnd(1.0, 1.9).toFixed(2)),
  }),
  build: (ctx) => {
    const hue = ctx.values.hue as number;
    const spectrum = Boolean(ctx.values.spectrum);
    const spread = ctx.values.spread as number;
    const n = ctx.values.bars as number;
    const barW = ctx.values.barWidth as number;
    const speed = ctx.values.speed as number;
    const dark = ctx.theme === "dark";

    // Deterministic 0..1 hash from an integer (pure — no Math.random / Date).
    const hash01 = (k: number): number => {
      const x = Math.sin(k * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };

    // Dark in-glyph base + a faint neon outline so the letter shapes read on both
    // themes even when a column's bar is short.
    const base = hsl(hue, 48, dark ? 15 : 14);
    const stroke = dark ? hsl(hue, 55, 55, 0.5) : hsl(hue, 60, 34, 0.55);
    const glow = hsl(hue, 95, 60, dark ? 0.35 : 0.28);

    const slot = 100 / n;
    const half = ((barW / 100) * slot) / 2;

    const layers: string[] = [];
    const heightVars: string[] = [];
    const propRules: string[] = [];
    const anims: string[] = [];
    const kfs: string[] = [];
    const durs: number[] = [];

    for (let i = 0; i < n; i++) {
      const hVar = prop(ctx.scope, `h${i}`);
      const a = anim(ctx.scope, `b${i}`);

      const barHue = spectrum ? ((((hue + i * spread) % 360) + 360) % 360) : hue;
      const color = hsl(barHue, 92, dark ? 60 : 52);

      // One vertical color band, transparent either side, scaled by var(--hN).
      const center = slot * (i + 0.5);
      const x1 = round(center - half, 2);
      const x2 = round(center + half, 2);
      const image = `linear-gradient(90deg, transparent 0 ${x1}%, ${color} ${x1}% ${x2}%, transparent ${x2}%)`;
      layers.push(`${image} center bottom / 100% var(${hVar}) no-repeat`);

      // Static/poster resting height — a varied frozen-meter snapshot.
      const init = round(30 + hash01(i * 4 + 1) * 62, 0);
      heightVars.push(`  ${hVar}: ${init}%;`);
      propRules.push(
        `@property ${hVar} {\n  syntax: "<percentage>";\n  inherits: false;\n  initial-value: ${init}%;\n}`,
      );

      // Independent bounce: per-bar duration + negative offset desync the columns.
      const dur = round(speed * (0.7 + hash01(i * 7 + 3) * 0.8), 2);
      const delay = round(-hash01(i * 9 + 5) * dur, 2);
      durs.push(dur);
      anims.push(`${a} ${dur}s ease-in-out ${delay}s infinite`);

      const k1 = round(28 + hash01(i * 5 + 2) * 66, 0);
      const k2 = round(20 + hash01(i * 5 + 3) * 75, 0);
      const k3 = round(30 + hash01(i * 5 + 4) * 64, 0);
      const k4 = round(24 + hash01(i * 5 + 6) * 70, 0);
      kfs.push(
        `@keyframes ${a} {\n` +
          `  0%, 100% { ${hVar}: ${init}%; }\n` +
          `  20% { ${hVar}: ${k1}%; }\n` +
          `  40% { ${hVar}: ${k2}%; }\n` +
          `  60% { ${hVar}: ${k3}%; }\n` +
          `  80% { ${hVar}: ${k4}%; }\n` +
          `}`,
      );
    }

    const css =
      `.${ctx.scope} {\n` +
      `${heightVars.join("\n")}\n` +
      `  background:\n    ${layers.join(",\n    ")};\n` +
      `  background-color: ${base};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-stroke: 0.75px ${stroke};\n` +
      `  ${dropGlow(glow, [5])}\n` +
      `  animation: ${anims.join(", ")};\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes: kfs.join("\n\n"),
      propertyRules: propRules.join("\n\n"),
      loopMs: Math.round(Math.max(...durs) * 1000),
    };
  },
};

export default equalizerBars;
