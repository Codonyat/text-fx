import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

/**
 * N-direction hard offset copies at Euclidean radius r — one solid faux-outline
 * ring (the double-outline dilation trick: a filled glyph translated in `steps`
 * directions unions into the glyph grown by r). Stack rings of decreasing radius
 * to bracket the letters with concentric sewn bands.
 */
function ring(r: number, color: string, steps: number): string[] {
  const out: string[] = [];
  for (let k = 0; k < steps; k++) {
    const a = (2 * Math.PI * k) / steps;
    const dx = round(Math.cos(a) * r, 2);
    const dy = round(Math.sin(a) * r, 2);
    out.push(`${dx}px ${dy}px 0 ${color}`);
  }
  return out;
}

/**
 * Varsity chenille letterman patch. The glyphs are filled with a fuzzy chenille
 * fiber texture (an overlaid span, background-clip:text) — two low-contrast
 * repeating-radial-gradient fiber fields at mismatched pitches/centres interfere
 * into an irregular fabric fuzz over a softly sheened team-colour base. The root
 * copy draws THREE nested sewn rings (cream felt / deep team band / dark stitch,
 * ordered per theme so the silhouette ring always contrasts the page) from stacked
 * multi-directional hard text-shadows at increasing radii, plus a soft directional
 * filter drop-shadow so the whole patch reads appliqued onto the page. Team
 * defaults span crimson / navy / forest with theme-fixed lightness floors so even
 * the darkest team hue stays legible. Static.
 */
const varsityPatch: EffectDefinition = {
  id: "varsity-patch",
  name: "Varsity Patch",
  category: "fill-texture",
  tags: ["fill", "texture", "varsity", "letterman", "chenille", "patch", "collegiate", "outline"],
  caps: ["pure"],
  pngSupport: "partial",
  supports:
    "background-clip:text fuzz + layered hard text-shadow rings + filter drop-shadow (all modern browsers)",
  controls: [
    { id: "hue", label: "Team Hue", type: "range", default: 348, min: 0, max: 360, step: 1, unit: "°" },
    { id: "rings", label: "Rings", type: "range", default: 3, min: 2, max: 3, step: 1 },
    { id: "fuzz", label: "Fuzz", type: "range", default: 2.6, min: 1, max: 4, step: 0.1 },
  ],
  rand: (R) => ({
    // Tasteful team colours only — crimson / navy / royal / forest / burnt / gold.
    hue: R.pick([348, 350, 222, 216, 142, 150, 14, 44]),
    rings: R.pick([3, 3, 2]),
    fuzz: Number(R.rnd(1.8, 3.4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const count = (ctx.values.rings as number) === 2 ? 2 : 3;
    const d = ctx.values.fuzz as number;
    const dark = ctx.theme === "dark";

    // --- Chenille team-colour fill: low-contrast tonal fuzz over a sheened base ---
    // Lightness is THEME-FIXED (never hue-derived), so no team-hue roll — navy is
    // the worst case — can sink the fill below legibility on the dark stage.
    const S = 70;
    const L = dark ? 56 : 46;
    const fillHi = hsl(h, S, L + 6);
    const fillLo = hsl(h, S, L - 6);
    // Fiber tones sit ~±19 L from the base at half alpha, so the texture stays soft
    // and fabric-like (fuzz, not a high-contrast halftone) while still reading on dark.
    const hiFiber = hsl(h, S - 14, Math.min(L + 20, 90), dark ? 0.55 : 0.5);
    const loFiber = hsl(h, Math.min(S + 10, 92), Math.max(L - 18, 14), 0.45);
    // Fuzz density -> fiber pitch (higher density = finer). Two mismatched pitches
    // + offset centres make the two ring fields interfere into an irregular pile.
    const p1 = round(5.4 - d * 0.7, 2);
    const p2 = round(p1 * 1.34, 2);
    const fuzz =
      `repeating-radial-gradient(circle at 30% 26%, ${hiFiber} 0, ${hiFiber} 0.6px, transparent 0.6px, transparent ${p1}px), ` +
      `repeating-radial-gradient(circle at 72% 74%, ${loFiber} 0, ${loFiber} 0.7px, transparent 0.7px, transparent ${p2}px), ` +
      `linear-gradient(178deg, ${fillHi}, ${fillLo})`;

    // --- Sewn rings: cream felt / deep team band / dark stitch ---
    // The OUTERMOST ring is the patch's silhouette against the page, so its tone is
    // theme-driven: bright cream felt on the dark stage (widened so it carries the
    // outline), dark edge stitch on the light stage. The opposite tone moves inward
    // as the stitch ring hugging the glyphs. Cream is theme-FIXED bright — never
    // derived from the team hue, so a navy roll can't dim the silhouette.
    const t = 2.6; // base ring band width
    const steps = 12;
    const cream = hsl(45, 60, 93);
    const team = hsl(h, Math.min(S + 14, 92), dark ? 38 : 30);
    const edge = hsl(h, 40, dark ? 14 : 12);
    // Listed outer -> inner: the last (smallest radius) band paints on top, hugging
    // the glyph, exactly like double-outline's stacking.
    const bands = dark
      ? count === 3
        ? [{ r: t * 3.4, c: cream }, { r: t * 2, c: team }, { r: t, c: edge }]
        : [{ r: t * 2.4, c: cream }, { r: t, c: edge }]
      : count === 3
        ? [{ r: t * 3, c: edge }, { r: t * 2, c: team }, { r: t, c: cream }]
        : [{ r: t * 2, c: edge }, { r: t, c: cream }];
    const layers = bands.flatMap((b) => ring(b.r, b.c, steps));

    // Soft directional shadow so the appliqued patch lifts off the page.
    const appliq = hsl(0, 0, 0, dark ? 0.5 : 0.42);

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  text-shadow:\n    ${layers.join(",\n    ")};\n` +
      `  filter: drop-shadow(2px 5px 4px ${appliq});\n` +
      `}\n` +
      `.${ctx.scope} .fx-fuzz {\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  top: 0;\n` +
      `  width: 100%;\n` +
      `  background: ${fuzz};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `}`;

    // Root copy carries the rings + appliqué shadow (transparent fill, so only its
    // text-shadows show); the overlaid fuzz span provides the visible chenille fill.
    return {
      root: el("div", {
        children: [
          text(ctx.text),
          el("span", {
            attrs: { class: "fx-fuzz", "aria-hidden": "true" },
            children: [text(ctx.text)],
          }),
        ],
      }),
      css,
    };
  },
};

export default varsityPatch;
