import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Ransom note: every letter is a cut-out clipping on its own paper chip — different
 * typeface, tilt and paper shade per letter (cycled by :nth-child), with a lift
 * shadow. Deliberately mismatched (per-letter markup; overrides the shared font).
 */
const ransomNote: EffectDefinition = {
  id: "ransom-note",
  name: "Ransom Note",
  category: "retro-themed",
  tags: ["ransom", "cutout", "collage", "paper", "per-letter"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  supports: "Per-letter cut-out chips with varied fonts/tilt (overrides the Font control)",
  controls: [
    { id: "tilt", label: "Max Tilt", type: "range", default: 6, min: 0, max: 14, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    tilt: R.ri(3, 11),
  }),
  build: (ctx) => {
    const tilt = ctx.values.tilt as number;
    const lift = hsl(0, 0, 0, 0.35);

    // Paper chips read on any theme; one inverted (black) chip adds the cut-from-news look.
    const css =
      `.${ctx.scope} {\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  padding: 0.02em 0.1em;\n` +
      `  margin: 0 0.03em;\n` +
      `  color: #141414;\n` +
      `  background: #f3efe2;\n` +
      `  box-shadow: 1px 1px 2px ${lift};\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch:nth-child(odd) {\n` +
      `  font-family: Georgia, "Times New Roman", serif;\n` +
      `  transform: rotate(-${tilt}deg);\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch:nth-child(even) {\n` +
      `  font-family: "Courier New", monospace;\n` +
      `  transform: rotate(${Math.max(1, tilt - 2)}deg);\n` +
      `  background: #e7e2d2;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch:nth-child(3n) {\n` +
      `  font-family: Impact, Haettenschweiler, sans-serif;\n` +
      `  transform: rotate(-${Math.max(1, tilt - 3)}deg) scale(1.08);\n` +
      `  background: #ffffff;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch:nth-child(5n) {\n` +
      `  color: #f3efe2;\n` +
      `  background: #161616;\n` +
      `  transform: rotate(${Math.max(1, tilt - 1)}deg);\n` +
      `}`;

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
    };
  },
};

export default ransomNote;
