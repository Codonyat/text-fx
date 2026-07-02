import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, prop, round, pointerSnippet } from "@/lib/engine/helpers";

/**
 * Weight scrub: the cursor becomes a WEIGHT DIAL. Moving horizontally across the word
 * scrubs Recursive's `wght` axis continuously (left = feather-light, right = massive);
 * moving vertically leans the `slnt` axis so the type feels alive under the pointer in
 * two analog axes at once. Both axes are driven by registered `@property <number>`
 * custom properties fed from the pointer's `--mx`/`--my` — the classic percentage→number
 * typed-math trick `var(--mx) / 1%` (verified in Chromium: 50%→650, 100%→1000, 0%→300),
 * with a short transition for buttery motion between pointer samples. Unlike Weight
 * Ripple (a binary :hover wave rippling through per-letter delays), this is a continuous
 * analog scrub of the WHOLE word tracking cursor position live.
 *
 * Fallback: where an engine can't parse the typed-percentage division (older browsers
 * lacking @property / CSS Values 4 same-type division), the invalid calc falls back to
 * each property's `initial-value` — a comfortable mid weight with a slight lean — so the
 * word still renders legibly. Resting frame (pointer at --mx/--my: 50%) is that mid state.
 */
const weightScrub: EffectDefinition = {
  id: "weight-scrub",
  name: "Weight Scrub",
  category: "interactive-advanced",
  tags: ["variable-font", "weight", "slant", "interactive", "pointer", "scrub", "animated"],
  caps: ["pure", "property", "pointer"],
  font: "'Recursive', sans-serif",
  pngSupport: "partial",
  supports:
    "Cursor scrubs Recursive's wght/slnt axes live via pointer-tracked typed math (@property + var()/1%); engines without it rest at a mid weight. Static preview shows the centred resting frame.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 265, min: 0, max: 360, step: 1, unit: "°" },
    { id: "feather", label: "Feather", type: "range", default: 300, min: 300, max: 640, step: 10 },
    { id: "massive", label: "Massive", type: "range", default: 1000, min: 640, max: 1000, step: 10 },
    { id: "slant", label: "Slant", type: "range", default: 8, min: 0, max: 15, step: 1, unit: "°" },
    { id: "smooth", label: "Smoothing", type: "range", default: 0.12, min: 0, max: 0.4, step: 0.01, unit: "s" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    feather: R.ri(300, 400),
    massive: R.ri(860, 1000),
    slant: R.ri(5, 12),
    smooth: Number(R.rnd(0.08, 0.18).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const feather = ctx.values.feather as number; // left-edge weight (--mx: 0%)
    const massive = ctx.values.massive as number; // right-edge weight (--mx: 100%)
    const slant = ctx.values.slant as number; // max forward lean magnitude (--my: 100%)
    const smooth = ctx.values.smooth as number; // transition seconds for butter

    // Weight gained per 1% of horizontal cursor travel; slant per 1% of vertical.
    const wSpan = round((massive - feather) / 100, 4);
    const slSpan = round(-slant / 100, 4);
    // Resting frame (cursor centred at 50%/50%) — also the @property fallback value.
    const wRest = Math.round((feather + massive) / 2);
    const slRest = round(-slant / 2, 2);

    const wProp = prop(ctx.scope, "w");
    const slProp = prop(ctx.scope, "sl");

    // Solid fill that reads on both themes; no glow needed — the drama is the axes.
    const base = ctx.theme === "dark" ? hsl(h, 55, 78) : hsl(h, 60, 42);

    const propertyRules =
      `@property ${wProp} {\n` +
      `  syntax: "<number>";\n` +
      `  inherits: false;\n` +
      `  initial-value: ${wRest};\n` +
      `}\n` +
      `@property ${slProp} {\n` +
      `  syntax: "<number>";\n` +
      `  inherits: false;\n` +
      `  initial-value: ${slRest};\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  --mx: 50%;\n` +
      `  --my: 50%;\n` +
      `  ${wProp}: calc(${feather} + (var(--mx) / 1%) * ${wSpan});\n` +
      `  ${slProp}: calc((var(--my) / 1%) * ${slSpan});\n` +
      `  color: ${base};\n` +
      `  font-variation-settings: 'wght' var(${wProp}), 'slnt' var(${slProp});\n` +
      `  transition: ${wProp} ${smooth}s linear, ${slProp} ${smooth}s linear;\n` +
      `  cursor: ew-resize;\n` +
      `  will-change: font-variation-settings;\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      propertyRules,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default weightScrub;
