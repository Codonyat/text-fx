import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

/**
 * Dock magnify: the macOS dock fisheye, letter by letter. Hovering a glyph scales
 * it up the most; its immediate neighbours swell on a falloff and (optionally) the
 * two-away letters bulge a touch — all via pure `:hover` + adjacent-sibling and
 * `:has()` previous-sibling selectors (no JS, no pointer vars). Letters grow UP from
 * the baseline with a springy overshoot for the elastic dock bounce, and a faint
 * dotted rail under the text hints that the word is interactive at rest.
 */
const dockMagnify: EffectDefinition = {
  id: "dock-magnify",
  name: "Dock Magnify",
  category: "interactive-advanced",
  tags: ["interactive", "hover", "magnify", "dock", "fisheye", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  supports: "macOS-dock fisheye on :hover via :has() + sibling selectors (all modern browsers) — resting preview is plain text.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 265, min: 0, max: 360, step: 1, unit: "°" },
    { id: "magnify", label: "Magnify", type: "range", default: 155, min: 120, max: 200, step: 5, unit: "%" },
    { id: "lift", label: "Lift", type: "range", default: 6, min: 0, max: 16, step: 1, unit: "px" },
    {
      id: "spread",
      label: "Spread",
      type: "toggle",
      default: true,
      onLabel: "Wide",
      offLabel: "Tight",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    magnify: R.pick([145, 150, 155, 160, 165, 175]),
    lift: R.ri(4, 9),
    spread: R.chance(0.7),
  }),
  build: (ctx) => {
    const s = ctx.scope;
    const h = ctx.values.hue as number;
    const peak = round((ctx.values.magnify as number) / 100, 3);
    const lift = ctx.values.lift as number;
    const spread = ctx.values.spread as boolean;

    // Neighbour falloff proportional to the peak, so tuning Magnify keeps the fisheye
    // curve intact (defaults: peak 1.55 → near 1.30 → far 1.12).
    const near = round(1 + (peak - 1) * 0.55, 3);
    const far = round(1 + (peak - 1) * 0.22, 3);

    const dark = ctx.theme === "dark";
    const base = dark ? hsl(h, 22, 84) : hsl(h, 30, 26);
    const accent = dark ? hsl(h, 80, 70) : hsl(h, 74, 46);
    const dot = dark ? hsl(h, 45, 58, 0.5) : hsl(h, 50, 48, 0.45);
    const shadow = hsl(h, 40, dark ? 5 : 22, 0.32);

    // Lift shadow only on the raised letters (resting text stays clean); neighbours
    // get a softer, shorter shadow than the peak. `none` when lift is dialled to 0.
    const liftPeak =
      lift > 0 ? `text-shadow: 0 ${lift}px ${round(lift * 1.5, 1)}px ${shadow};` : "text-shadow: none;";
    const liftNear =
      lift > 0
        ? `text-shadow: 0 ${round(lift * 0.5, 1)}px ${round(lift * 1.1, 1)}px ${shadow};`
        : "text-shadow: none;";

    let css =
      `.${s} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `  cursor: pointer;\n` +
      `  width: fit-content;\n` +
      `  margin-inline: auto;\n` +
      `  padding-bottom: 8px;\n` +
      `  background-image: radial-gradient(circle, ${dot} 0 1.1px, transparent 1.7px);\n` +
      `  background-size: 10px 10px;\n` +
      `  background-repeat: repeat-x;\n` +
      `  background-position: left bottom;\n` +
      `}\n` +
      `.${s} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  position: relative;\n` +
      `  transform-origin: bottom center;\n` +
      `  transition: scale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease, text-shadow 0.3s ease;\n` +
      `}\n` +
      `.${s} .fx-ch:hover {\n` +
      `  scale: ${peak};\n` +
      `  color: ${accent};\n` +
      `  z-index: 3;\n` +
      `  ${liftPeak}\n` +
      `}\n` +
      `.${s} .fx-ch:hover + .fx-ch,\n` +
      `.${s} .fx-ch:has(+ .fx-ch:hover) {\n` +
      `  scale: ${near};\n` +
      `  z-index: 2;\n` +
      `  ${liftNear}\n` +
      `}`;

    if (spread) {
      css +=
        `\n.${s} .fx-ch:hover + .fx-ch + .fx-ch,\n` +
        `.${s} .fx-ch:has(+ .fx-ch + .fx-ch:hover) {\n` +
        `  scale: ${far};\n` +
        `  z-index: 1;\n` +
        `}`;
    }

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
    };
  },
};

export default dockMagnify;
