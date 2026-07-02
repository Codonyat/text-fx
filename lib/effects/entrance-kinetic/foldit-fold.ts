import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, fvs } from "@/lib/engine/helpers";

/**
 * Foldit Fold — origami paper breathe on a COLRv1 *variable* color font.
 *
 * Foldit's glyphs are folded paper strips whose crease highlights and shadows are baked
 * into the font's own vector paint layers (a light→deep gradient along each ribbon). Its
 * single `wght` axis (100..900) drives the fold: low weight = thin, near-flat ribbons;
 * high weight = the strips fold up into dense, dimensional letterforms. We animate
 * `font-variation-settings: 'wght'` on a slow ease-in-out `alternate` loop so the word
 * continuously FOLDS and UNFOLDS like origami — and that axis animation works in every
 * modern browser (unlike the sibling `weight-pulse`, which just fattens a plain sans).
 *
 * Colour-font lane pairing (see the Nabla pilot): two salted `@font-palette-values` ramps
 * recolour Foldit's baked crease gradient to one "paper hue" — a light/airy ramp for the
 * unfolded state, a deeper/saturated ramp for the folded peak. Animating `font-palette`
 * from A→B *in the same keyframes* deepens the colour exactly as the paper folds. Palette
 * interpolation is smooth only in Chromium (it steps at the midpoint elsewhere), but the
 * fold itself is smooth everywhere.
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
    { id: "fold", label: "Fold", type: "range", default: 780, min: 500, max: 900, step: 10 },
    { id: "unfold", label: "Unfold", type: "range", default: 200, min: 100, max: 400, step: 10 },
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
    fold: R.ri(72, 88) * 10, // deep, clearly folded peak
    unfold: R.ri(14, 28) * 10, // thin, near-flat ribbons
    speed: Number(R.rnd(4, 7).toFixed(1)), // slow, calm breathe
    hue: R.ri(0, 360),
    recolor: R.chance(0.75), // mostly tinted; sometimes Foldit's native paper palette
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

    // Rest at a folded-leaning weight so the poster / reduced-motion / SSR frame shows
    // richly dimensional paper rather than flat ribbons.
    const restW = Math.round(unfold * 0.35 + fold * 0.65);

    // A single-hue highlight→shadow ramp flooded across Foldit's palette entries. Keeping
    // it monotonic light→deep preserves the glyph's baked crease shading while tinting the
    // whole strip to the chosen paper hue. Over-covering the index range is harmless: any
    // index past the base palette's size is simply ignored.
    const STOPS = 12;
    const ramp = (topL: number, botL: number, topS: number, botS: number): string => {
      const parts: string[] = [];
      for (let i = 0; i < STOPS; i++) {
        const t = i / (STOPS - 1);
        const l = Math.round(topL + (botL - topL) * t);
        const s = Math.round(topS + (botS - topS) * t);
        parts.push(`${i} ${hsl(hue, s, l)}`);
      }
      return parts.join(",\n    ");
    };

    const paletteBlock = (name: string, rampStr: string): string =>
      `@font-palette-values ${name} {\n` +
      `  font-family: "Foldit";\n` +
      `  base-palette: 0;\n` +
      `  override-colors:\n    ${rampStr};\n` +
      `}`;

    // Theme-tuned so the paper reads on the dark AND light stage: highlights never blow out
    // to white on light; folded shadows stay visible on dark.
    const paletteA = ramp(dark ? 90 : 80, dark ? 60 : 52, 80, 90);
    const paletteB = ramp(dark ? 78 : 68, dark ? 36 : 30, 92, 98);

    const propertyRules = recolor
      ? paletteBlock(pa, paletteA) + "\n\n" + paletteBlock(pb, paletteB)
      : undefined;

    const css =
      `.${ctx.scope} {\n` +
      `  ${fvs({ wght: restW })}\n` +
      (recolor ? `  font-palette: ${pb};\n` : ``) +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite alternate;\n` +
      `}`;

    // wght + font-palette animate together: the colour deepens as the paper folds.
    const kfLine = (w: number, palette: string): string =>
      `${fvs({ wght: w })}${recolor ? ` font-palette: ${palette};` : ``}`;
    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { ${kfLine(unfold, pa)} }\n` +
      `  to { ${kfLine(fold, pb)} }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      // alternate → a full unfold→fold→unfold cycle is twice the declared duration.
      loopMs: speed * 2000,
    };
  },
};

export default folditFold;
