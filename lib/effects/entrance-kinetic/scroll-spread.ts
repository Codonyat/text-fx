import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * SCROLL LANE (worker contract addendum A) — "Scroll Tracking Spread".
 *
 * Typography that breathes with the page: as the headline travels the scrollport
 * its letter-spacing scrubs from tight-overlapped (entering, faintly blurred),
 * open to a comfortably wide, crisp center, then back to tight as it leaves — with
 * a subtle opacity/blur ease riding the extremes. Pure CSS, scroll-scrubbed via an
 * anonymous `view()` timeline; no JS.
 *
 * Divergence from `blur-focus-in` (the nearest existing effect): that one plays a
 * ONE-SHOT tracking-draw once on mount, then settles. This one is BIDIRECTIONAL
 * and scroll-linked — it opens AND recloses as the element passes through view,
 * and never "finishes".
 *
 * Lane rules baked in:
 *  1. BASE `.scope` = the final, fully-open, crisp frame. Its letter-spacing comes
 *     from the shared Tracking control (engine commonCss) — we never set tracking
 *     on the root; the scrub keyframes override it only while the timeline is
 *     active. Thumbnails / SSR / OG / PNG / Firefox all get this legible frame.
 *  2. The scrub is added ONLY inside `@supports (animation-timeline: view())` and
 *     ONLY when mode !== "thumbnail".
 *  3. `animation` shorthand first (it resets animation-timeline), then the timeline
 *     + range. Anonymous `view()` only; keyframe name salted off the scope.
 *  4. The open peak sits at center (50% progress). The studio rests near 45%
 *     progress (Stage seeds scrollTop to 45%), so at rest the text reads essentially
 *     fully open and sharp.
 */
const scrollSpread: EffectDefinition = {
  id: "scroll-spread",
  name: "Scroll Spread",
  category: "entrance-kinetic",
  tags: ["scroll", "tracking", "kinetic", "breathe", "animated"],
  caps: ["pure", "scroll"],
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    { id: "spread", label: "Spread", type: "range", default: 22, min: 8, max: 60, step: 1, unit: "px" },
    { id: "blur", label: "Blur", type: "range", default: 5, min: 0, max: 16, step: 0.5, unit: "px" },
    { id: "bias", label: "Easing Bias", type: "range", default: 1.1, min: 0.5, max: 2.4, step: 0.1 },
  ],
  rand: (R) => ({
    spread: R.ri(16, 40),
    blur: Number(R.rnd(3, 9).toFixed(1)),
    bias: Number(R.rnd(0.8, 1.8).toFixed(1)),
  }),
  build: (ctx) => {
    const spread = ctx.values.spread as number;
    const blurMax = ctx.values.blur as number;
    const bias = ctx.values.bias as number;
    // Center (open) tracking hands off to the shared Tracking control, so the
    // breathing always reopens to exactly the user's chosen resting width.
    const openTrack = (ctx.values.tracking as number) ?? 0;
    const dark = ctx.theme === "dark";

    // High-contrast, faintly cool neutral that reads on BOTH the dark and light stage.
    const base = dark ? hsl(220, 16, 95) : hsl(222, 22, 15);
    const fade = 0.45; // extremes dim to ~0.55 opacity — a subtle in/out breath

    const a = anim(ctx.scope, "spread");

    // openness(p): 0 at the extremes (tight / blurred / dim), 1 at center (open /
    // crisp). sin(πp) is a smooth raised-cosine breath; the `bias` exponent reshapes
    // it — <1 = a broad open plateau (opens fast, tight only at the very edges),
    // >1 = a sharper center snap (tight most of the travel, brief crisp peak).
    const openness = (p: number) => Math.pow(Math.sin(Math.PI * p), bias);
    const frame = (p: number) => {
      const off = 1 - openness(p); // 0 open → 1 tight
      const ls = round(openTrack - spread * off, 2);
      const bl = round(blurMax * off, 2);
      const op = round(1 - fade * off, 3);
      return `letter-spacing: ${ls}px; filter: blur(${bl}px); opacity: ${op};`;
    };

    const stops = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const kf =
      `@keyframes ${a} {\n` +
      stops.map((s) => `  ${s}% { ${frame(s / 100)} }`).join("\n") +
      `\n}`;

    // BASE = final wide-open crisp frame (letter-spacing supplied by commonCss/Tracking).
    let css = `.${ctx.scope} {\n  color: ${base};\n}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      // Shorthand first (resets animation-timeline), then timeline + range. `both`
      // fill holds the tight 0%/100% frames before/after the element's travel, so a
      // far-off-screen headline sits tight+blurred and breathes open through view.
      css +=
        `\n\n@supports (animation-timeline: view()) {\n` +
        `  .${ctx.scope} {\n` +
        `    animation: ${a} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover 0% cover 100%;\n` +
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

export default scrollSpread;
