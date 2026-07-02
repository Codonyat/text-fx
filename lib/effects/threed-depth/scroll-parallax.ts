import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * SCROLL PARALLAX STACK — a data-text extrusion that breathes with the scrollbar.
 *
 * Two shaded `data-text` clones (::before = mid, ::after = deep) sit behind the
 * face in graduated depth shades. Each clone translates VERTICALLY on its own
 * `animation-timeline: view()` keyframes, and the deeper clone travels ~2× further
 * per scroll unit — so as the element rises through the scrollport the stack shears
 * APART (opens) low in the viewport and pulls back into a tight, aligned stack by
 * the time it reaches viewport centre (then holds, via `both`).
 *
 * Diverges from `parallax-layers.ts` (POINTER-tracked drift): this one is driven
 * purely by the SCROLLBAR and rests aligned/closed, not chasing the cursor. No JS.
 *
 * Lane rules (addendum A):
 *  1. BASE `.scope` = the FINAL, legible, CLOSED slight-offset stack — the only
 *     frame thumbnails / posters / SSR / OG / PNG and non-supporting browsers see.
 *  2. The scrub is ADDED only inside `@supports (animation-timeline: view())` and
 *     only when `ctx.mode !== "thumbnail"`. Each clone's animation ENDS on the
 *     closed frame (= the base transform) and `both` holds it, so the resting
 *     studio frame and static consumers agree.
 *  3. The `animation` shorthand resets `animation-timeline`, so it is declared
 *     first, then `animation-timeline` / `animation-range` after it.
 *  4. Everything salted off `ctx.scope`; anonymous `view()` only (no named timelines).
 */
const scrollParallax: EffectDefinition = {
  id: "scroll-parallax",
  name: "Scroll Parallax Stack",
  category: "threed-depth",
  tags: ["3d", "parallax", "depth", "layers", "scroll", "animated"],
  caps: ["dataText", "scroll"],
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    { id: "spread", label: "Depth Spread", type: "range", default: 42, min: 15, max: 90, step: 1, unit: "%" },
    { id: "hue", label: "Layer Hue", type: "range", default: 268, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "dir",
      label: "Direction",
      type: "select",
      default: "down",
      options: [
        { label: "Down", value: "down" },
        { label: "Up", value: "up" },
      ],
    },
  ],
  rand: (R) => ({
    spread: R.ri(28, 66),
    hue: R.ri(0, 360),
    dir: R.pick(["down", "up"]),
  }),
  build: (ctx) => {
    const spread = ctx.values.spread as number;
    const hue = ctx.values.hue as number;
    const dir = (ctx.values.dir as string) === "up" ? -1 : 1;
    const dark = ctx.theme === "dark";

    // Graduated depth shades: the face is the vivid, legible top layer; the clones
    // step toward the stage's own luminance so they read as receding into it —
    // on dark stages they DARKEN going back, on light stages they LIGHTEN.
    const face = dark ? hsl(hue, 55, 82) : hsl(hue, 60, 40);
    const mid = dark ? hsl(hue, 60, 56) : hsl(hue, 50, 60);
    const deep = dark ? hsl(hue, 55, 34) : hsl(hue, 42, 76);

    // Vertical travel is in em (scales with the text). Deeper clone uses factor 1.9,
    // so it both sits deeper when closed AND travels further when the stack opens.
    const amp = (spread / 100) * 0.55; // open-state amplitude unit
    const closeUnit = 0.06; // closed slight-offset unit (base legible stack)
    const midOpen = round(dir * amp, 3);
    const deepOpen = round(dir * amp * 1.9, 3);
    const midClose = round(dir * closeUnit, 3);
    const deepClose = round(dir * closeUnit * 1.9, 3);
    // Constant rightward lean gives the vertical stack dimensional read (not a smear).
    const midHx = round(0.045, 3);
    const deepHx = round(0.045 * 1.9, 3);

    const aMid = anim(ctx.scope, "mid");
    const aDeep = anim(ctx.scope, "deep");

    const layer = (
      pseudo: "before" | "after",
      color: string,
      z: number,
      hx: number,
      close: number,
    ) =>
      `.${ctx.scope}::${pseudo} {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${color};\n` +
      `  z-index: ${z};\n` +
      `  transform: translate(${hx}em, ${close}em);\n` +
      `  pointer-events: none;\n` +
      `  will-change: transform;\n` +
      `}`;

    // BASE = the closed slight-offset stack (final legible frame).
    let css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  isolation: isolate;\n` +
      `  color: ${face};\n` +
      `}\n` +
      `${layer("before", mid, -1, midHx, midClose)}\n` +
      `${layer("after", deep, -2, deepHx, deepClose)}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      // Map each clone's 0%→100% onto the element travelling from entering the
      // bottom of the scrollport (`cover 0%`) up to just before viewport centre
      // (`cover 44%`); `both` then holds the closed 100% frame from centre onward.
      // 0% = sheared open, 100% = closed — so it opens low, closes at centre.
      css +=
        `\n\n@supports (animation-timeline: view()) {\n` +
        `  .${ctx.scope}::before {\n` +
        `    animation: ${aMid} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover 0% cover 44%;\n` +
        `  }\n` +
        `  .${ctx.scope}::after {\n` +
        `    animation: ${aDeep} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover 0% cover 44%;\n` +
        `  }\n` +
        `}`;

      keyframes =
        `@keyframes ${aMid} {\n` +
        `  0%   { transform: translate(${midHx}em, ${midOpen}em); }\n` +
        `  100% { transform: translate(${midHx}em, ${midClose}em); }\n` +
        `}\n` +
        `@keyframes ${aDeep} {\n` +
        `  0%   { transform: translate(${deepHx}em, ${deepOpen}em); }\n` +
        `  100% { transform: translate(${deepHx}em, ${deepClose}em); }\n` +
        `}`;
    }

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
      keyframes,
      runtime: "none", // anonymous view() timeline is pure CSS — no listener shipped
    };
  },
};

export default scrollParallax;
