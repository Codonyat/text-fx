import type { EffectDefinition } from "@/lib/engine/types";
import { anim, prop, hsl, fvs, round } from "@/lib/engine/helpers";
import { el, text } from "@/lib/engine/markup";

/**
 * Honk Shine — Ek Type's Honk is a COLRv1 *variable color font* built from Indian
 * truck-art lettering: every glyph ships its own ornate multi-color paint layers plus
 * TWO bespoke axes. MORF (0..45) morphs the decoration simple→baroque; SHLN (0..100)
 * slides a baked-in specular shine line through the letterforms. Nothing here is painted
 * in CSS — the font performs its own show; we just choreograph its axes.
 *
 * Unlike the sibling color-font effect Nabla Palette Cycle (which recolors a static
 * isometric block by animating `font-palette` between two override ramps), Honk keeps one
 * of its EIGHT curated built-in palettes (selected via a salted `@font-palette-values`
 * with `base-palette`, no override) and instead animates the letterforms themselves.
 *
 * Both axes ride a SINGLE pure-CSS keyframe timeline (caps: "pure" — no @property):
 * across one loop MORF breathes once, slowly, min→max→min (the ornament inhaling and
 * exhaling), while SHLN washes the specular back and forth several times (the star of the
 * show). Folding a fast shine into a slow morph on one linear track keeps the shine
 * clearly quicker than the morph without a hard 100→0 reset pop — the sweep count is the
 * "Shine speed" control, so speeding the shimmer never disturbs the gentle morph cadence.
 */

// One full morph inhale→exhale takes this long; the shine rides on top of it.
const PERIOD_S = 8;
// The morph never fully flattens — it breathes within this span below the chosen peak.
const MORPH_SPAN = 18;

const honkShine: EffectDefinition = {
  id: "honk-shine",
  name: "Honk Shine",
  category: "retro-themed",
  tags: ["animated", "color-font", "retro", "ornate", "shine"],
  caps: ["pure"],
  font: "'Honk', system-ui",
  pngSupport: "partial",
  supports:
    "Color font (COLRv1) with animated MORF/SHLN axes and base-palette selection; renders in current Chrome, Firefox and Safari.",
  controls: [
    {
      // Number of shine passes per morph loop — more passes = a quicker shimmer, while
      // the ornament keeps breathing at the same slow cadence.
      id: "shine",
      label: "Shine speed",
      type: "range",
      default: 4,
      min: 2,
      max: 8,
      step: 1,
    },
    {
      // Peak ornateness (MORF). The decoration breathes from MORPH_SPAN below this up to
      // this value and back, so higher = more baroque at the crest of the breath.
      id: "morph",
      label: "Ornament",
      type: "range",
      default: 40,
      min: 20,
      max: 45,
      step: 1,
    },
    {
      // Honk ships 8 built-in truck-art palettes — pick one via base-palette (no recolor).
      id: "palette",
      label: "Palette",
      type: "select",
      default: "0",
      options: [
        { label: "Palette 1", value: "0" },
        { label: "Palette 2", value: "1" },
        { label: "Palette 3", value: "2" },
        { label: "Palette 4", value: "3" },
        { label: "Palette 5", value: "4" },
        { label: "Palette 6", value: "5" },
        { label: "Palette 7", value: "6" },
        { label: "Palette 8", value: "7" },
      ],
    },
  ],
  rand: (R) => ({
    shine: R.ri(3, 6),
    morph: R.ri(34, 45),
    palette: R.pick(["0", "1", "2", "3", "4", "5", "6", "7"]),
  }),
  build: (ctx) => {
    const shine = ctx.values.shine as number; // shine passes per loop
    const morph = ctx.values.morph as number; // peak MORF (ornateness)
    const paletteIdx = Number(ctx.values.palette as string);

    const morfMax = morph;
    const morfMin = Math.max(0, morph - MORPH_SPAN);

    const a = anim(ctx.scope, "honk");
    const pa = prop(ctx.scope, "pa"); // salted @font-palette-values name

    // Build ONE keyframe track. SHLN alternates 0↔100 at every half-pass boundary so the
    // specular sweeps back and forth (seamless — it starts and ends off the same edge, no
    // reset pop). MORF is sampled from a triangle wave over the same track, so it rises to
    // the ornate crest at the midpoint and settles back exactly once per loop.
    const halfPasses = 2 * shine;
    const steps: string[] = [];
    for (let i = 0; i <= halfPasses; i++) {
      const pct = round((100 * i) / halfPasses, 2);
      const shln = i % 2 === 1 ? 100 : 0;
      const t = i / halfPasses; // 0..1 over the loop
      const tri = t <= 0.5 ? t * 2 : (1 - t) * 2; // 0 → 1 → 0
      const morf = round(morfMin + (morfMax - morfMin) * tri, 2);
      steps.push(`  ${pct}% { ${fvs({ MORF: morf, SHLN: shln })} }`);
    }
    const keyframes = `@keyframes ${a} {\n${steps.join("\n")}\n}`;

    // Select one of Honk's 8 curated palettes (no override-colors — keep the truck-art
    // multicolor as designed; it carries its own high contrast on either theme).
    const propertyRules =
      `@font-palette-values ${pa} {\n` +
      `  font-family: "Honk";\n` +
      `  base-palette: ${paletteIdx};\n` +
      `}`;

    // A gentle theme-aware halo lifts the colored glyphs off the stage on BOTH themes
    // (Honk fills the glyph with color, so a plain text-shadow shows behind it — no
    // background-clip here, so this is legal and needs no dropGlow). Dark stage gets a
    // faint light rim + soft drop; light stage gets a soft dark drop.
    const shadow =
      ctx.theme === "dark"
        ? `text-shadow: 0 0 2px ${hsl(0, 0, 100, 0.22)}, 0 3px 8px ${hsl(0, 0, 0, 0.5)};`
        : `text-shadow: 0 2px 6px ${hsl(0, 0, 0, 0.22)};`;

    // Static base (posters / reduced-motion SSR cards, where the animation is stripped):
    // a rich resting frame — fully ornate with the shine sitting mid-glyph. The running
    // animation overrides this from 0%. A negative delay starts the live studio partway
    // in, so the first visible frame is already mid-breath rather than the plainest state.
    const css =
      `.${ctx.scope} {\n` +
      `  ${fvs({ MORF: morfMax, SHLN: 55 })}\n` +
      `  ${shadow}\n` +
      `  animation: ${a} ${PERIOD_S}s linear -${(PERIOD_S * 0.3).toFixed(2)}s infinite;\n` +
      `  font-palette: ${pa};\n` +
      `  will-change: font-variation-settings;\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      loopMs: PERIOD_S * 1000,
    };
  },
};

export default honkShine;
