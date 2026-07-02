import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, pointerSnippet, round } from "@/lib/engine/helpers";

/**
 * Cursor repel: every letter knows its own position across the word, compares it
 * to the cursor (--mx) and slides/leans AWAY. Letters nearest the pointer lift and
 * bloom; the whole line fans open around it. Purely spatial (tracks WHERE the
 * cursor is), unlike hover-ripple's time wave.
 *
 * The maths — all resolved inside each letter's own transform box:
 *   --pos  this letter's CENTRE as a % across the text box:  (i + 0.5) / n * 100%
 *   --dx   signed horizontal distance from the cursor:       pos - mx   (a %)
 *   --adx  |dx| via max(dx, -dx)  → proximity magnitude       (a %)
 *   --near falloff proximity, radius%..0 as the letter gets further out
 *
 *   translate-x = dx * strength (clamped) → letters push AWAY (dx>0 ⇒ right of the
 *     cursor ⇒ moves right). Only %→% arithmetic, no unit division, so it is
 *     bullet-proof. translateX(%) is read against the LETTER's own width — the feel
 *     is tuned by `strength`, exactness isn't needed.
 *   translate-y = near * -lift → letters NEAREST the cursor rise the most.
 *   rotate = clamp(±1, dx/50%) * tilt → letters lean away, the fan widening with
 *     distance. This one DOES convert %→number via the `/ 50%` unit-division trick
 *     (a % over a % is a plain number); it lives in its OWN `rotate` property so any
 *     engine that rejects the division merely drops the tilt, never the core repel.
 *
 * Resting fallback (--mx: 50%): the middle letters gather and bloom, the ends fan
 * out — a lively centre-parting for posters/SSR where there is no live cursor.
 */
const cursorRepel: EffectDefinition = {
  id: "cursor-repel",
  name: "Cursor Repel",
  category: "interactive-advanced",
  tags: ["interactive", "pointer", "repel", "scatter", "magnetic", "per-letter", "animated"],
  caps: ["perLetter", "pointer"],
  split: "grapheme",
  pngSupport: "partial",
  supports:
    "Letters scatter from the cursor via pointer-tracked per-letter transforms — the static preview shows the resting centre bloom.",
  controls: [
    { id: "strength", label: "Repel", type: "range", default: 0.6, min: 0.2, max: 1, step: 0.05 },
    { id: "radius", label: "Falloff", type: "range", default: 45, min: 25, max: 70, step: 1, unit: "%" },
    { id: "lift", label: "Lift", type: "range", default: 0.85, min: 0.3, max: 1.8, step: 0.05 },
    { id: "tilt", label: "Tilt", type: "range", default: 14, min: 0, max: 26, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    strength: Number(R.rnd(0.45, 0.8).toFixed(2)),
    radius: R.ri(36, 56),
    lift: Number(R.rnd(0.65, 1.2).toFixed(2)),
    tilt: R.ri(9, 20),
  }),
  build: (ctx) => {
    const strength = ctx.values.strength as number;
    const radius = ctx.values.radius as number;
    const lift = ctx.values.lift as number;
    const tilt = ctx.values.tilt as number;

    // Solid, legible base + a vivid accent that blooms on the letters closest to the
    // cursor. `base` is declared first as a hard fallback so a browser without
    // color-mix still renders legible text on both themes.
    const base = ctx.theme === "dark" ? hsl(228, 14, 88) : hsl(230, 22, 22);
    const accent = ctx.theme === "dark" ? hsl(288, 90, 74) : hsl(288, 78, 50);

    // Reach ~90% accent by the time proximity hits the falloff radius.
    const bloom = round(90 / radius, 3);

    // Horizontal cap so the outermost letters can't fly off the line.
    const CAP = 62;

    const css =
      `.${ctx.scope} {\n` +
      `  --mx: 50%;\n` +
      `  --my: 50%;\n` +
      `  white-space: pre;\n` +
      `  color: ${base};\n` +
      `  cursor: crosshair;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  --pos: calc((var(--i) + 0.5) / var(--n) * 100%);\n` +
      `  --dx: calc(var(--pos) - var(--mx));\n` +
      `  --adx: max(var(--dx), calc(-1 * var(--dx)));\n` +
      `  --near: max(0%, calc(${radius}% - var(--adx)));\n` +
      `  translate: clamp(-${CAP}%, calc(var(--dx) * ${strength}), ${CAP}%) calc(var(--near) * -${lift});\n` +
      `  rotate: calc(clamp(-1, var(--dx) / 50%, 1) * ${tilt}deg);\n` +
      `  color: ${base};\n` +
      `  color: color-mix(in oklab, ${base}, ${accent} clamp(0%, calc(var(--near) * ${bloom}), 100%));\n` +
      `  transition: translate 0.5s cubic-bezier(0.22, 1, 0.36, 1),\n` +
      `    rotate 0.5s cubic-bezier(0.22, 1, 0.36, 1), color 0.4s ease;\n` +
      `  will-change: translate, rotate;\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default cursorRepel;
