import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * SCROLL LANE PILOT — read this before authoring any other scroll-scrubbed effect.
 *
 * A "Scroll neon charge-up": layered `text-shadow` glow whose blur radii, core
 * brightness and colored halo ramp from a near-dead unlit tube up to a fully-lit
 * sign, driven by the element's travel through the scrollport
 * (`animation-timeline: view()`). Scroll down → the sign powers on (with a real
 * neon ignition stutter); scroll back up → it dims out. No JS — pure CSS.
 *
 * Lane rules baked in here (addendum A of the worker contract):
 *  1. The BASE `.scope` rule = the FINAL, fully-lit, legible state. That is what
 *     thumbnails / posters / SSR / OG / PNG and non-supporting browsers (Firefox)
 *     show — they get a finished sign, never a mid-scrub frame.
 *  2. The scrub is ADDED only inside `@supports (animation-timeline: view())` AND
 *     only when `ctx.mode !== "thumbnail"`, so static consumers stay on the final
 *     frame while the live studio + exports get the scroll animation.
 *  3. The `animation` shorthand RESETS `animation-timeline`, so we declare the
 *     shorthand first (no duration → `auto` timeline-span semantics) and set
 *     `animation-timeline` / `animation-range` AFTER it.
 *  4. Everything generated is salted off `ctx.scope` (keyframe name via `anim`);
 *     no named scroll/view timelines — anonymous `view()` only.
 */
const scrollCharge: EffectDefinition = {
  id: "scroll-charge",
  name: "Scroll Charge-Up",
  category: "neon-glow",
  tags: ["neon", "glow", "charge", "scroll", "animated"],
  caps: ["pure", "scroll"],
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 320, min: 0, max: 360, step: 1, unit: "°" },
    { id: "glow", label: "Glow", type: "range", default: 1, min: 0.6, max: 1.7, step: 0.05 },
    { id: "core", label: "Core", type: "range", default: 88, min: 60, max: 100, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    glow: Number(R.rnd(0.85, 1.4).toFixed(2)),
    core: R.ri(80, 96),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const g = ctx.values.glow as number;
    const core = ctx.values.core as number;
    const dark = ctx.theme === "dark";

    // The letter fill lerps from a muted, unlit tube (`off*`) to the bright lit
    // state (`lit*`). On dark stages the tube brightens toward white; on light
    // stages it deepens + saturates instead (white-on-white would vanish), so the
    // unlit AND lit states both read on either theme.
    const litS = dark ? 50 : 92;
    const litL = dark ? 97 : 44;
    const offS = dark ? 28 : 42;
    const offL = dark ? 52 : 54;

    // Glow layers (salted only via the scope-derived animation name below; colors
    // depend on values/theme only, so re-scoping is a pure token swap).
    // Each layer lerps blur radius `bo→bl` and alpha `ao→al` with charge level t.
    const coreL = dark ? core : Math.max(40, core - 34); // keep the core visible on light
    const cc = { h, s: dark ? 82 : 95, l: coreL }; // tight hot core
    const g1 = { h, s: 95, l: dark ? 62 : 52 }; // inner halo
    const g2 = { h: (h + 16) % 360, s: 95, l: dark ? 56 : 50 }; // outer halo
    const layers = [
      { c: cc, bo: 1, bl: 2, ao: 0, al: 1 },
      { c: g1, bo: 2, bl: 6 * g, ao: 0.15, al: 1 }, // faint even when off → glass hint
      { c: g1, bo: 3, bl: 14 * g, ao: 0, al: 1 },
      { c: g2, bo: 4, bl: 28 * g, ao: 0, al: 0.9 },
      { c: g2, bo: 5, bl: 50 * g, ao: 0, al: 0.85 },
    ];

    const lp = (a: number, b: number, t: number) => a + (b - a) * t;
    // Full `text-shadow: …;` declaration at charge level t (0 = dead, 1 = lit).
    const shadowAt = (t: number) =>
      `text-shadow: ${layers
        .map(
          (L) =>
            `0 0 ${round(lp(L.bo, L.bl, t), 1)}px ` +
            hsl(L.c.h, L.c.s, L.c.l, round(lp(L.ao, L.al, t), 3)),
        )
        .join(", ")};`;
    // Letter fill color at charge level t.
    const colorAt = (t: number) => hsl(h, round(lp(offS, litS, t), 1), round(lp(offL, litL, t), 1));

    const a = anim(ctx.scope, "charge");

    // BASE = final lit sign (the only frame static consumers ever see).
    let css =
      `.${ctx.scope} {\n` + //
      `  color: ${colorAt(1)};\n` +
      `  ${shadowAt(1)}\n` +
      `}`;

    // Ignition ramp. Non-linear on purpose: a long dead approach, a brief strike
    // DIP, then it "catches" and snaps bright — a neon power-on, not a breath.
    // Because it is scroll-scrubbed, this reads as the tube striking as you scroll.
    // The resting studio frame (~83% progress) lands on the fully-lit hold.
    const kf =
      `@keyframes ${a} {\n` +
      `  0%   { color: ${colorAt(0)}; ${shadowAt(0)} }\n` +
      `  22%  { color: ${colorAt(0.06)}; ${shadowAt(0.06)} }\n` +
      `  38%  { color: ${colorAt(0.18)}; ${shadowAt(0.18)} }\n` +
      `  43%  { color: ${colorAt(0.09)}; ${shadowAt(0.09)} }\n` +
      `  50%  { color: ${colorAt(0.72)}; ${shadowAt(0.72)} }\n` +
      `  60%  { color: ${colorAt(0.9)}; ${shadowAt(0.9)} }\n` +
      `  72%  { color: ${colorAt(1)}; ${shadowAt(1)} }\n` +
      `  100% { color: ${colorAt(1)}; ${shadowAt(1)} }\n` +
      `}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      // Shorthand first (resets animation-timeline), then the timeline + range.
      // `both` fill holds the 0% dead frame before the range and the 100% lit
      // frame after it. `cover 0% cover 54%` lights the sign fully a touch before
      // it reaches viewport center, so the natural reading position is lit.
      css +=
        `\n\n@supports (animation-timeline: view()) {\n` +
        `  .${ctx.scope} {\n` +
        `    animation: ${a} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover 0% cover 54%;\n` +
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

export default scrollCharge;
