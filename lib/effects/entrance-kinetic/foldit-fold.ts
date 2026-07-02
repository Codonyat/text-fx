import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, fvs } from "@/lib/engine/helpers";

/**
 * Foldit Fold — origami paper breathe on a COLRv1 *variable* color font.
 *
 * Foldit's glyphs are folded paper strips whose crease highlights and shadows are baked
 * into the font's own vector paint layers. Its single `wght` axis (100..900) drives the
 * fold: low weight = thin, near-flat ribbons; high weight = the strips fold up into
 * dense, dimensional letterforms. We rest FOLDED and animate `font-variation-settings:
 * 'wght'` on a slow loop that dwells at the heavy end (0–16% and 84–100% of the cycle),
 * unfolding briefly at the midpoint — so every poster/screenshot frame shows the
 * dimensional folded state, and the thin ribbons are only a passing origami "breath".
 * The wght animation is smooth in every modern browser.
 *
 * Colour-font lane pairing (see the Nabla pilot): Foldit's CPAL palette 0 has EXACTLY
 * 4 entries, all grays — 0 #404040 (crease shadow), 1 #bfbfbf (light face),
 * 2 #808080 (mid face), 3 #c2c2c2 (highlight) — i.e. the font is natively monochrome
 * paper. Two salted `@font-palette-values` blocks override those 4 indices (and ONLY
 * those — extra indices would dilute the ramp across entries that don't exist) with a
 * hue-tinted ramp that keeps the native shadow<mid<light<highlight ordering but widens
 * the contrast: palette B is deep & saturated for the folded state, palette A light &
 * airy for the unfolded dip. `font-palette` animates in the same keyframes so the
 * colour deepens exactly as the paper folds (smooth in Chromium, stepped at the
 * midpoint elsewhere — acceptable, the fold itself is smooth everywhere).
 */
const folditFold: EffectDefinition = {
  id: "foldit-fold",
  name: "Foldit Fold",
  category: "entrance-kinetic",
  tags: ["animated", "color-font", "variable-font", "origami", "fold", "paper"],
  caps: ["pure"],
  font: "'Foldit', sans-serif",
  pngSupport: "partial",
  supports:
    "COLRv1 variable color font (all modern browsers); paper-hue palette recolor is Chromium-smooth, stepped elsewhere.",
  controls: [
    { id: "fold", label: "Fold", type: "range", default: 820, min: 500, max: 900, step: 10 },
    { id: "unfold", label: "Unfold", type: "range", default: 220, min: 100, max: 400, step: 10 },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 5,
      min: 2,
      max: 10,
      step: 0.1,
      unit: "s",
    },
    {
      id: "hue",
      label: "Paper",
      type: "range",
      default: 28,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
      when: (v) => Boolean(v.recolor),
    },
    {
      id: "recolor",
      label: "Recolor",
      type: "toggle",
      default: true,
      onLabel: "On",
      offLabel: "Off",
    },
  ],
  rand: (R) => ({
    fold: R.ri(74, 90) * 10, // deep, clearly folded dwell
    unfold: R.ri(16, 30) * 10, // thin ribbons for the brief unfold dip
    speed: Number(R.rnd(3.5, 6.5).toFixed(1)),
    hue: R.ri(0, 360),
    // Native Foldit is gray-on-gray paper; shuffle always tints it (the toggle stays
    // for a deliberate monochrome-paper look).
    recolor: true,
  }),
  build: (ctx) => {
    const fold = ctx.values.fold as number;
    const unfold = ctx.values.unfold as number;
    const speed = ctx.values.speed as number;
    const hue = ctx.values.hue as number;
    const recolor = ctx.values.recolor as boolean;
    const dark = ctx.theme === "dark";

    const a = anim(ctx.scope, "fold");
    const pa = prop(ctx.scope, "pa"); // palette A — unfolded / light & airy
    const pb = prop(ctx.scope, "pb"); // palette B — folded / deep & saturated

    // Hue-tinted overrides for Foldit's 4 palette entries, keeping the native role of
    // each index (0 shadow · 1 light · 2 mid · 3 highlight) but widening the contrast
    // so the creases pop. [saturation, lightness] per index, theme-tuned so shadows
    // stay visible on the dark stage and highlights don't blow out on the light one.
    const deepSL: [number, number][] = dark
      ? [[95, 30], [90, 70], [95, 50], [85, 82]]
      : [[95, 24], [90, 60], [95, 44], [85, 72]];
    const airySL: [number, number][] = dark
      ? [[75, 45], [85, 80], [80, 62], [70, 90]]
      : [[80, 38], [85, 72], [82, 56], [75, 80]];

    const paletteBlock = (name: string, sl: [number, number][]): string =>
      `@font-palette-values ${name} {\n` +
      `  font-family: "Foldit";\n` +
      `  base-palette: 0;\n` +
      `  override-colors:\n    ${sl
        .map(([s, l], i) => `${i} ${hsl(hue, s, l)}`)
        .join(",\n    ")};\n` +
      `}`;

    const propertyRules = recolor
      ? paletteBlock(pb, deepSL) + "\n\n" + paletteBlock(pa, airySL)
      : undefined;

    // Rest = fully folded with the deep palette, so posters, PNG export and
    // reduced-motion all show the dimensional state.
    const css =
      `.${ctx.scope} {\n` +
      `  ${fvs({ wght: fold })}\n` +
      (recolor ? `  font-palette: ${pb};\n` : ``) +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    // Dwell folded, unfold briefly at the midpoint; the palette lightens as the paper
    // opens and deepens as it folds back up.
    const foldedFrame = `${fvs({ wght: fold })}${recolor ? ` font-palette: ${pb};` : ``}`;
    const openFrame = `${fvs({ wght: unfold })}${recolor ? ` font-palette: ${pa};` : ``}`;
    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 16% { ${foldedFrame} }\n` +
      `  50% { ${openFrame} }\n` +
      `  84%, 100% { ${foldedFrame} }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      loopMs: speed * 1000,
    };
  },
};

export default folditFold;
