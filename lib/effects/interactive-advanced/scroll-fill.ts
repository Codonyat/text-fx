import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText, dropGlow } from "@/lib/engine/helpers";

/**
 * Scroll Progress Fill: the headline is a READING-PROGRESS meter. Hollow stroked
 * glyphs (transparent fill + -webkit-text-stroke) sit over a colored copy that is
 * clipped to the text and masked so only the bottom portion shows — the fill LEVEL
 * rises 0%→100% in lock-step with how far the page has been scrolled
 * (`animation-timeline: scroll(nearest)` — SCROLLER progress, not element
 * visibility). Top of the page = empty outline; bottom = fully flooded. A soft glow
 * blooms off the moving waterline (parent-wrapper `drop-shadow`, so it is NOT clipped
 * by the child's mask — the classic frost/water trick).
 *
 * Lane rules (addendum A) baked in:
 *  1. BASE `.scope` CSS = the FINAL, fully-flooded, legible frame. That is what
 *     thumbnails / posters / SSR / OG / PNG and non-supporting browsers (Firefox)
 *     render — a finished meter, never a mid-scrub frame.
 *  2. The scrub is ADDED only inside `@supports (animation-timeline: scroll())` AND
 *     only when `ctx.mode !== "thumbnail"`. A neat property of scroll timelines:
 *     when the nearest scroller has no scrollable overflow the timeline is INACTIVE,
 *     so the animation contributes nothing and the element falls back to the base
 *     (fully-flooded) rule — a non-scrolling preview shows the finished meter, a real
 *     scrollable page scrubs it from empty→full as the reader descends.
 *  3. The `animation` shorthand RESETS `animation-timeline`, so the shorthand is
 *     declared first (no duration → auto scroll-span semantics) and the timeline set
 *     after it. `scroll(nearest)` with no `animation-range` spans the whole scroller
 *     (0%→100%) — pure page progress.
 *  4. Everything generated is salted off `ctx.scope` (keyframe name via `anim`); no
 *     named scroll/view timelines — anonymous `scroll(nearest)` only.
 *
 * Divergence from Water Fill (elemental): that is an autonomous tide sloshing up and
 * down on a timer; this is a DETERMINISTIC meter scrubbed by the reader's scroll — no
 * clock, straight edge, and it settles precisely at 100% when the page bottoms out.
 */
const scrollFill: EffectDefinition = {
  id: "scroll-fill",
  name: "Scroll Progress Fill",
  category: "interactive-advanced",
  tags: ["scroll", "progress", "fill", "meter", "reveal", "interactive", "animated"],
  caps: ["pure", "scroll"],
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Fill Hue", type: "range", default: 158, min: 0, max: 360, step: 1, unit: "°" },
    { id: "stroke", label: "Stroke", type: "range", default: 1.5, min: 0.5, max: 3, step: 0.1, unit: "px" },
    {
      id: "direction",
      label: "Direction",
      type: "select",
      default: "up",
      options: [
        { label: "Up", value: "up" },
        { label: "Left", value: "left" },
      ],
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    stroke: Number(R.rnd(1, 2.2).toFixed(1)),
    direction: R.pick(["up", "up", "up", "left"]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const w = ctx.values.stroke as number;
    const up = ctx.values.direction !== "left";
    const dark = ctx.theme === "dark";

    // Colored flood: deep at the origin edge, bright toward the leading edge, so the
    // filled body reads with depth. Deepened on the light stage so it stays legible.
    const bright = dark ? hsl(h, 92, 66) : hsl(h, 88, 50);
    const deep = dark ? hsl(h, 88, 48) : hsl(h, 92, 38);
    // Hollow outline — a light rim on dark, a dark rim on light (legible on both).
    const outline = dark ? hsl(h, 45, 72) : hsl(h, 58, 36);
    // Waterline glow (glow guard — drop-shadow on the wrapper, never text-shadow).
    const glow = dark ? hsl(h, 95, 68, 0.85) : hsl(h, 90, 52, 0.7);

    // Fill gradient runs along the fill axis (0deg = up/bottom→top, 90deg = left→right).
    const gradient = `linear-gradient(${up ? "0deg" : "90deg"}, ${deep}, ${bright})`;

    // Reveal mask: an oversized (2x) gradient, opaque on the flooded side with a soft
    // edge at the middle. Sliding mask-position from the empty end to the full end
    // floods the glyphs; a soft 48%→52% band is the feathered waterline the glow rides.
    const maskGrad = up
      ? "linear-gradient(to bottom, transparent 0%, transparent 48%, #000 52%, #000 100%)"
      : "linear-gradient(to right, transparent 0%, transparent 48%, #000 52%, #000 100%)";
    const maskSize = up ? "100% 200%" : "200% 100%";
    const full = up ? "50% 100%" : "100% 50%"; // fully flooded (base / rest)
    const empty = up ? "50% 0%" : "0% 50%"; // 0% progress (top of page)

    const a = anim(ctx.scope, "fill");

    // BASE = fully flooded meter (the only frame static consumers ever see).
    let css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  -webkit-text-stroke: ${w}px ${outline};\n` +
      `}\n` +
      // Wrapper carries the glow so drop-shadow blooms OUTWARD from the masked child's
      // waterline instead of being clipped away by that same mask.
      `.${ctx.scope} .fx-fill-wrap {\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  pointer-events: none;\n` +
      `  ${dropGlow(glow, [3, 8])}\n` +
      `}\n` +
      `.${ctx.scope} .fx-fill {\n` +
      `  display: block;\n` +
      `  ${clipText(gradient)}\n` +
      `  -webkit-mask-image: ${maskGrad};\n` +
      `  mask-image: ${maskGrad};\n` +
      `  -webkit-mask-size: ${maskSize};\n` +
      `  mask-size: ${maskSize};\n` +
      `  -webkit-mask-repeat: no-repeat;\n` +
      `  mask-repeat: no-repeat;\n` +
      `  -webkit-mask-position: ${full};\n` +
      `  mask-position: ${full};\n` +
      `}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      // Shorthand first (resets animation-timeline), then the anonymous scroll timeline.
      // `both` holds the empty frame before the scroller starts and the full frame after
      // it bottoms out. No animation-range → the whole scroller drives 0%→100%.
      css +=
        `\n\n@supports (animation-timeline: scroll()) {\n` +
        `  .${ctx.scope} .fx-fill {\n` +
        `    animation: ${a} linear both;\n` +
        `    animation-timeline: scroll(nearest);\n` +
        `  }\n` +
        `}`;
      keyframes =
        `@keyframes ${a} {\n` +
        `  from { -webkit-mask-position: ${empty}; mask-position: ${empty}; }\n` +
        `  to { -webkit-mask-position: ${full}; mask-position: ${full}; }\n` +
        `}`;
    }

    return {
      // Root text = the hollow outline (in-flow → sizes the box, stays selectable).
      // The flooded copy is a masked overlay stacked on top.
      root: el("div", {
        children: [
          text(ctx.text),
          el("span", {
            attrs: { class: "fx-fill-wrap", "aria-hidden": "true" },
            children: [
              el("span", { attrs: { class: "fx-fill" }, children: [text(ctx.text)] }),
            ],
          }),
        ],
      }),
      css,
      keyframes,
      runtime: "none", // anonymous scroll(nearest) timeline is pure CSS — no listener shipped
    };
  },
};

export default scrollFill;
