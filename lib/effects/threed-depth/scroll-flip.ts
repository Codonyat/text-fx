import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * SCROLL LANE — a scroll-scrubbed 3D flip.
 *
 * The word is a slab on a horizontal (or vertical) hinge through its centre. As the
 * reader scrolls it through the viewport the slab flips: it enters tipped TOWARD the
 * reader (`rotate(-A)`), stands dead upright and legible at viewport centre
 * (`rotate(0)`), then tips AWAY as it exits the top (`rotate(+A)`). Driven purely by
 * the element's travel through the scrollport (anonymous `animation-timeline: view()`),
 * no JS.
 *
 * Divergence from the neighbours: `perspective-tilt` is a FIXED lean and `pointer-tilt`
 * follows the CURSOR — this one is SCROLL-driven and BIDIRECTIONAL (up through upright,
 * then away), with two depth cues baked into the scrub: brightness dims as the slab
 * turns edge-on, and a soft ground shadow swells / offsets / blurs with the tilt.
 *
 * Lane rules (addendum A):
 *  1. The BASE `.scope` rule = the FINAL, legible UPRIGHT state — the only frame
 *     thumbnails / posters / SSR / OG / PNG and non-supporting browsers (Firefox) show.
 *  2. The scrub is ADDED only inside `@supports (animation-timeline: view())` AND only
 *     when `ctx.mode !== "thumbnail"`.
 *  3. The `animation` shorthand RESETS `animation-timeline`, so the shorthand comes
 *     first (no duration → view-timeline span), then `animation-timeline` / `-range`.
 *  4. Everything generated is salted off `ctx.scope`; anonymous `view()` only.
 */
const scrollFlip: EffectDefinition = {
  id: "scroll-flip",
  name: "Scroll Flip",
  category: "threed-depth",
  tags: ["3d", "flip", "depth", "rotate", "perspective", "scroll", "animated"],
  caps: ["pure", "scroll"],
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 205, min: 0, max: 360, step: 1, unit: "°" },
    { id: "maxAngle", label: "Max Angle", type: "range", default: 72, min: 40, max: 85, step: 1, unit: "°" },
    { id: "axis", label: "Axis", type: "select", default: "X", options: [
      { label: "Tilt X", value: "X" },
      { label: "Turn Y", value: "Y" },
    ] },
    { id: "depth", label: "Perspective", type: "range", default: 620, min: 320, max: 1400, step: 20, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    maxAngle: R.ri(60, 82),
    axis: R.pick(["X", "X", "Y"]),
    depth: R.ri(440, 820),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const A = ctx.values.maxAngle as number;
    const axis = ctx.values.axis as string; // "X" | "Y"
    const D = ctx.values.depth as number;
    const dark = ctx.theme === "dark";

    // Solid slab face — bright on dark stages, deep + saturated on light ones.
    const face = dark ? hsl(h, 68, 70) : hsl(h, 72, 44);

    // Depth cues as a function of tilt magnitude m (0 upright → 1 extreme):
    //  · brightness dims toward the extremes (the slab turns edge-on / away);
    //  · a soft ground shadow deepens, offsets further and blurs wider.
    // A black shadow vanishes on a dark stage, so there the "shadow" is a colored
    // soft cast; on light stages it is a genuine dark shadow. Either way it grows /
    // shrinks with the tilt as a floor-contact cue.
    const bright = (m: number) => round(1 - 0.42 * m, 3);
    const sy = (m: number) => round(4 + 20 * m, 1);
    const blur = (m: number) => round(6 + 18 * m, 1);
    const shadow = (m: number) =>
      dark
        ? hsl(h, 72, 48, round(0.16 + 0.24 * m, 3))
        : hsl(h, 34, 22, round(0.2 + 0.24 * m, 3));
    const filterAt = (m: number) =>
      `brightness(${bright(m)}) drop-shadow(0 ${sy(m)}px ${blur(m)}px ${shadow(m)})`;
    const xform = (deg: number) => `perspective(${D}px) rotate${axis}(${deg}deg)`;

    const a = anim(ctx.scope, "flip");

    // BASE = upright, legible slab (the only frame static consumers ever see).
    let css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  transform-origin: center center;\n` +
      `  transform: ${xform(0)};\n` +
      `  color: ${face};\n` +
      `  filter: ${filterAt(0)};\n` +
      `}`;

    // The flip: tipped toward the reader entering, upright at 50%, tipped away exiting.
    const kf =
      `@keyframes ${a} {\n` +
      `  0%   { transform: ${xform(-A)}; filter: ${filterAt(1)}; }\n` +
      `  50%  { transform: ${xform(0)}; filter: ${filterAt(0)}; }\n` +
      `  100% { transform: ${xform(A)}; filter: ${filterAt(1)}; }\n` +
      `}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      // Shorthand first (it resets animation-timeline), then timeline + range.
      // `both` fill holds the tipped-toward frame before the element enters and the
      // tipped-away frame after it exits; `cover 0% cover 100%` lands upright (the
      // 50% keyframe) exactly at viewport centre.
      css +=
        `\n\n@supports (animation-timeline: view()) {\n` +
        `  .${ctx.scope} {\n` +
        `    animation: ${a} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover 0% cover 100%;\n` +
        `    will-change: transform, filter;\n` +
        `  }\n` +
        `}`;
      keyframes = kf;
    }

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      runtime: "none", // anonymous view() timeline is pure CSS — no listener shipped
    };
  },
};

export default scrollFlip;
