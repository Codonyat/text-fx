import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round, clipText } from "@/lib/engine/helpers";

/**
 * SCROLL LANE (addendum A) — a "Scroll gradient reveal".
 *
 * Two stacked copies of the text share one grid cell: a dim monochrome GHOST
 * underneath and a vivid multi-stop gradient (clipped to the glyphs) on top. As
 * the element travels the scrollport (`animation-timeline: view()`), an animated
 * `mask-position` wipes the vivid layer INTO the glyphs — the colour floods in
 * from the reveal edge over the grey ghost and completes near viewport centre,
 * then holds full. A subtle `hue-rotate` slides the incoming colours as they
 * land. No JS — pure CSS.
 *
 * Lane rules baked in (vs. the autonomous looping `gradient-flow`, which this
 * deliberately diverges from):
 *  1. BASE `.fx-vivid` = the FINAL, fully-revealed vibrant gradient (no mask).
 *     That is what thumbnails / posters / SSR / OG / PNG and non-supporting
 *     browsers (Firefox) show — a finished gradient, never a mid-scrub frame.
 *  2. The mask + scrub are ADDED only inside `@supports (animation-timeline:
 *     view())` AND only when `ctx.mode !== "thumbnail"`.
 *  3. The `animation` shorthand resets `animation-timeline`, so it is declared
 *     first, then the timeline + range after it.
 *  4. Everything generated is salted off `ctx.scope`; anonymous `view()` only.
 */

type Dir = { ang: number; size: string; hidden: string; revealed: string };

// Per-direction wipe geometry. `ang` orients BOTH the mask (black on the reveal
// origin) and the colour gradient (start hue on the origin) so they stay coherent.
// A 250% mask over-size with a 42%→58% feather guarantees a clean full hide at the
// `hidden` position and a clean full reveal at the `revealed` position (verified:
// window lands entirely in the transparent / black band at each extreme).
const DIRS: Record<string, Dir> = {
  ltr: { ang: 90, size: "250% 100%", hidden: "100% 50%", revealed: "0% 50%" },
  rtl: { ang: 270, size: "250% 100%", hidden: "0% 50%", revealed: "100% 50%" },
  down: { ang: 180, size: "100% 250%", hidden: "50% 100%", revealed: "50% 0%" },
  diag: { ang: 135, size: "250% 250%", hidden: "100% 100%", revealed: "0% 0%" },
};

const scrollReveal: EffectDefinition = {
  id: "scroll-reveal",
  name: "Scroll Gradient Reveal",
  category: "gradient-fill",
  tags: ["gradient", "reveal", "color", "scroll", "animated"],
  caps: ["pure", "scroll"],
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    { id: "span", label: "Hue Span", type: "range", default: 150, min: 40, max: 300, step: 1, unit: "°" },
    {
      id: "dir",
      label: "Wipe",
      type: "select",
      default: "ltr",
      options: [
        { label: "Right", value: "ltr" },
        { label: "Left", value: "rtl" },
        { label: "Down", value: "down" },
        { label: "Diagonal", value: "diag" },
      ],
    },
    { id: "finish", label: "Reveal End", type: "range", default: 50, min: 30, max: 90, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    span: R.ri(90, 220),
    dir: R.pick(["ltr", "ltr", "rtl", "down", "diag"]),
    finish: R.ri(42, 62),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const span = ctx.values.span as number;
    const finish = ctx.values.finish as number;
    const d = DIRS[(ctx.values.dir as string)] ?? DIRS.ltr;
    const dark = ctx.theme === "dark";

    // Vivid multi-stop gradient (the final glyph fill). Brighter on dark stages,
    // deeper + a touch less bright on light stages so saturated colour reads on
    // white. A gentle lightness arc adds a soft centre sheen.
    const vs = dark ? 88 : 80;
    const baseL = dark ? 63 : 51;
    const sheen = [-3, 2, 6, 2, -3];
    const stops = [0, 1, 2, 3, 4]
      .map((i) => hsl(Math.round((h + (span * i) / 4) % 360), vs, round(baseL + sheen[i], 1)))
      .join(", ");

    // Dim monochrome ghost — the un-revealed starting state. A desaturated grey
    // with a hint of the base hue, tuned to read on BOTH themes.
    const ghost = dark ? hsl(h, 10, 60) : hsl(h, 13, 54);

    const gradient = `linear-gradient(${d.ang}deg, ${stops})`;
    const mask = `linear-gradient(${d.ang}deg, #000 42%, transparent 58%)`;
    // Subtle hue slide as colours land (scaled by span, capped so it never garish).
    const slide = Math.min(28, Math.round(span * 0.12));
    const a = anim(ctx.scope, "reveal");

    // BASE = fully-revealed vivid gradient (the only frame static consumers see).
    let css =
      `.${ctx.scope} {\n  display: inline-grid;\n}\n` +
      `.${ctx.scope} > span {\n  grid-area: 1 / 1;\n}\n` +
      `.${ctx.scope} .fx-ghost {\n  color: ${ghost};\n}\n` +
      `.${ctx.scope} .fx-vivid {\n  ${clipText(gradient)}\n}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      css +=
        `\n\n@supports (animation-timeline: view()) {\n` +
        `  .${ctx.scope} .fx-vivid {\n` +
        `    -webkit-mask-image: ${mask};\n` +
        `    mask-image: ${mask};\n` +
        `    -webkit-mask-repeat: no-repeat;\n` +
        `    mask-repeat: no-repeat;\n` +
        `    -webkit-mask-size: ${d.size};\n` +
        `    mask-size: ${d.size};\n` +
        `    animation: ${a} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover 0% cover ${finish}%;\n` +
        `  }\n` +
        `}`;
      keyframes =
        `@keyframes ${a} {\n` +
        `  0%   { -webkit-mask-position: ${d.hidden}; mask-position: ${d.hidden}; filter: hue-rotate(${slide}deg); }\n` +
        `  100% { -webkit-mask-position: ${d.revealed}; mask-position: ${d.revealed}; filter: hue-rotate(0deg); }\n` +
        `}`;
    }

    return {
      root: el("div", {
        children: [
          el("span", { attrs: { class: "fx-ghost", "aria-hidden": "true" }, children: [text(ctx.text)] }),
          el("span", { attrs: { class: "fx-vivid" }, children: [text(ctx.text)] }),
        ],
      }),
      css,
      keyframes,
      runtime: "none", // anonymous view() timeline is pure CSS — no listener shipped
    };
  },
};

export default scrollReveal;
