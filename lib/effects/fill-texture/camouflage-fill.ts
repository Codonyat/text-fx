import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

// Four camo palettes (base + three blobs). Tones are kept mid so they read when
// clipped to text on either theme; the build nudges lightness per theme.
const PALETTES: Record<string, [number, number, number][]> = {
  // [hue, sat, lightness]
  army: [[95, 25, 28], [82, 30, 38], [70, 18, 20], [50, 22, 45]],
  desert: [[40, 45, 55], [35, 50, 42], [28, 35, 30], [48, 40, 65]],
  navy: [[210, 45, 30], [200, 40, 45], [225, 35, 20], [190, 30, 55]],
  urban: [[220, 6, 30], [0, 0, 55], [0, 0, 18], [220, 8, 72]],
};

/**
 * Camouflage fill: several soft radial blobs over a base tone, multiply-blended
 * and clipped to the glyphs. Static — a textured material fill, not a gradient.
 */
const camouflageFill: EffectDefinition = {
  id: "camouflage-fill",
  name: "Camouflage",
  category: "fill-texture",
  tags: ["camo", "camouflage", "military", "blobs", "material", "pattern"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + layered radial-gradient blobs",
  controls: [
    {
      id: "palette",
      label: "Palette",
      type: "select",
      default: "army",
      options: [
        { label: "Army", value: "army" },
        { label: "Desert", value: "desert" },
        { label: "Navy", value: "navy" },
        { label: "Urban", value: "urban" },
      ],
    },
    { id: "scale", label: "Blob Size", type: "range", default: 55, min: 30, max: 80, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    palette: R.pick(["army", "desert", "navy", "urban"]),
    scale: R.ri(38, 72),
  }),
  build: (ctx) => {
    const key = (ctx.values.palette as string) in PALETTES ? (ctx.values.palette as string) : "army";
    const scale = ctx.values.scale as number;
    const dl = ctx.theme === "dark" ? 8 : -4; // lift on dark, deepen on light
    const [b, c1, c2, c3] = PALETTES[key].map(([h, s, l]) =>
      hsl(h, s, Math.max(8, Math.min(88, l + dl))),
    );

    // Soft blobs at fixed positions over a solid base; multiply fuses the edges.
    const css =
      `.${ctx.scope} {\n` +
      `  background:\n` +
      `    radial-gradient(${scale}% ${scale}% at 22% 28%, ${c1}, transparent 70%),\n` +
      `    radial-gradient(${scale}% ${scale}% at 78% 22%, ${c2}, transparent 70%),\n` +
      `    radial-gradient(${scale}% ${scale}% at 60% 80%, ${c3}, transparent 70%),\n` +
      `    radial-gradient(${scale}% ${scale}% at 30% 72%, ${c2}, transparent 70%),\n` +
      `    ${b};\n` +
      `  background-blend-mode: multiply;\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default camouflageFill;
