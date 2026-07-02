import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop } from "@/lib/engine/helpers";

/**
 * Nabla Palette Cycle — PILOT EXEMPLAR for the color-font lane.
 *
 * Nabla is a COLRv1 *vector color font*: every glyph is an isometric 3D block whose
 * extrusion, highlights and blended shadows are baked into the font's own paint layers
 * — NOT CSS text-shadows (that's what the sibling `isometric-3d` effect fakes; this one
 * is the real thing). Nabla ships 7 built-in palettes, each with exactly 9 color entries
 * (indices 0..8) ordered as a highlight→shadow gradient.
 *
 * We recolor those 9 entries via TWO salted `@font-palette-values` blocks (palette A and
 * palette B, each a single-hue light→deep ramp derived from a hue control), then set
 * `font-palette` to A and animate it toward B with a @keyframes cycle. In Chromium the two
 * resolved palettes interpolate smoothly (CSS Fonts L4 palette animation); elsewhere
 * `font-palette` is not interpolatable so it flips discretely at the midpoint — acceptable.
 *
 * Lane pattern to copy: force the family via `font:` (the engine loads it and hides the
 * Font control), emit the palette blocks in `propertyRules` exactly like @property, salt
 * every palette name with `prop(scope, …)`, and reference it bare (`font-palette: --name`,
 * no `var()`).
 */
const nablaIso: EffectDefinition = {
  id: "nabla-iso",
  name: "Nabla Palette Cycle",
  category: "threed-depth",
  tags: ["animated", "color-font", "3d", "isometric", "palette"],
  caps: ["pure"],
  font: "'Nabla', system-ui",
  pngSupport: "partial",
  supports:
    "Color font (COLRv1); palette animation is smooth in Chromium, stepped elsewhere.",
  controls: [
    { id: "hueA", label: "Palette A", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "hueB", label: "Palette B", type: "range", default: 320, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Cycle",
      type: "range",
      default: 6,
      min: 2,
      max: 12,
      step: 0.5,
      unit: "s",
      when: (v) => Boolean(v.animate),
    },
    {
      id: "animate",
      label: "Cycle",
      type: "toggle",
      default: true,
      onLabel: "On",
      offLabel: "Off",
    },
  ],
  rand: (R) => {
    const hueA = R.ri(0, 360);
    return {
      hueA,
      // Keep a wide hue gap so the A↔B cycle is clearly visible, never two near-identical tints.
      hueB: (hueA + R.ri(110, 200)) % 360,
      speed: Number(R.rnd(4, 9).toFixed(1)),
      animate: true,
    };
  },
  build: (ctx) => {
    const hueA = ctx.values.hueA as number;
    const hueB = ctx.values.hueB as number;
    const speed = ctx.values.speed as number;
    const animate = ctx.values.animate as boolean;

    // Salted @font-palette-values names (scope-lint enforces the `--${scope}` prefix) and
    // the salted keyframes name.
    const pa = prop(ctx.scope, "pa");
    const pb = prop(ctx.scope, "pb");
    const a = anim(ctx.scope, "palette");

    // A single-hue ramp across Nabla's 9 palette entries. Index 0 is the brightest
    // highlight, index 8 the deepest shadow, so a monotonic light→deep ramp preserves the
    // glyph's built-in isometric depth while flooding the whole block with one hue. Both
    // endpoints are theme-tuned so the block reads on the dark AND light stage (highlights
    // never blow out to white on light; shadows stay visible on dark).
    const rampFor = (h: number): string => {
      const topL = ctx.theme === "dark" ? 84 : 74; // highlight lightness
      const botL = ctx.theme === "dark" ? 42 : 34; // shadow lightness
      const topS = 90;
      const botS = 68;
      const stops = 9;
      const parts: string[] = [];
      for (let i = 0; i < stops; i++) {
        const t = i / (stops - 1);
        const l = Math.round(topL + (botL - topL) * t);
        const s = Math.round(topS + (botS - topS) * t);
        parts.push(`${i} ${hsl(h, s, l)}`);
      }
      return parts.join(",\n    ");
    };

    const paletteBlock = (name: string, h: number): string =>
      `@font-palette-values ${name} {\n` +
      `  font-family: "Nabla";\n` +
      `  base-palette: 0;\n` +
      `  override-colors:\n    ${rampFor(h)};\n` +
      `}`;

    const propertyRules = paletteBlock(pa, hueA) + "\n\n" + paletteBlock(pb, hueB);

    const css =
      `.${ctx.scope} {\n` +
      `  font-palette: ${pa};\n` +
      (animate
        ? `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite alternate;\n`
        : ``) +
      `}`;

    // Interpolate the resolved palette from A toward B; `alternate` sweeps A→B→A forever.
    const keyframes = animate
      ? `@keyframes ${a} {\n` +
        `  from { font-palette: ${pa}; }\n` +
        `  to { font-palette: ${pb}; }\n` +
        `}`
      : undefined;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      // alternate → a full A→B→A cycle is twice the declared duration.
      loopMs: animate ? speed * 2000 : undefined,
    };
  },
};

export default nablaIso;
