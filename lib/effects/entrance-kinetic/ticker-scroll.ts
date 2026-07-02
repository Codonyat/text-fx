import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, hsl } from "@/lib/engine/helpers";

/**
 * Marquee ticker: a seamless infinite news-ticker. The root is an overflow-hidden
 * strip; inside, a width:max-content track holds TWO identical copies of the text
 * (separated by a " · " divider glyph) and scrolls forever via a 0 -> -50%
 * translateX loop — because both halves are byte-identical, the wrap is invisible.
 * A mask-image edge fade dissolves glyphs in/out at the strip ends, and hovering
 * pauses the scroll (the classic ticker-tape convention). Continuous/looping, not
 * a one-shot entrance.
 */
const tickerScroll: EffectDefinition = {
  id: "ticker-scroll",
  name: "Ticker Scroll",
  category: "entrance-kinetic",
  tags: ["ticker", "marquee", "scroll", "news", "loop", "conveyor", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Seamless duplicated-copy marquee via translateX + mask-image edge fade",
  controls: [
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 13,
      min: 5,
      max: 30,
      step: 1,
      unit: "s/loop",
    },
    {
      id: "direction",
      label: "Direction",
      type: "select",
      default: "left",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    {
      id: "fade",
      label: "Edge Fade",
      type: "range",
      default: 16,
      min: 0,
      max: 30,
      step: 1,
      unit: "%",
    },
  ],
  rand: (R) => ({
    speed: R.ri(7, 20),
    direction: R.pick(["left", "left", "left", "right"]),
    fade: R.ri(8, 24),
  }),
  build: (ctx) => {
    const speed = ctx.values.speed as number;
    const direction = ctx.values.direction === "right" ? "right" : "left";
    const fade = ctx.values.fade as number;
    const dark = ctx.theme === "dark";

    const trackBg = dark ? hsl(0, 0, 9) : hsl(42, 32, 92);
    const rule = dark ? hsl(38, 55, 32) : hsl(10, 30, 60);
    const ink = dark ? hsl(38, 95, 60) : hsl(10, 70, 30);
    const dividerInk = dark ? hsl(38, 35, 42) : hsl(10, 20, 55);

    const aScroll = anim(ctx.scope, "scroll");
    const mask =
      `linear-gradient(to right, transparent 0%, black ${fade}%, black ${100 - fade}%, transparent 100%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  display: block;\n` +
      `  width: min(620px, 88vw);\n` +
      `  max-width: 100%;\n` +
      `  overflow: hidden;\n` +
      `  position: relative;\n` +
      `  background: ${trackBg};\n` +
      `  border-block: 3px solid ${rule};\n` +
      `  padding-block: 0.4em;\n` +
      `  -webkit-mask-image: ${mask};\n` +
      `  mask-image: ${mask};\n` +
      `}\n` +
      `.${ctx.scope} .fx-track {\n` +
      `  display: inline-flex;\n` +
      `  align-items: baseline;\n` +
      `  width: max-content;\n` +
      `  white-space: nowrap;\n` +
      `  will-change: transform;\n` +
      `  animation: ${aScroll} ${speed}s linear infinite;\n` +
      `  animation-direction: ${direction === "right" ? "reverse" : "normal"};\n` +
      `}\n` +
      `.${ctx.scope}:hover .fx-track {\n` +
      `  animation-play-state: paused;\n` +
      `}\n` +
      `.${ctx.scope} .fx-copy {\n` +
      `  color: ${ink};\n` +
      `  white-space: nowrap;\n` +
      `}\n` +
      `.${ctx.scope} .fx-divider {\n` +
      `  display: inline-block;\n` +
      `  color: ${dividerInk};\n` +
      `  padding-inline: 0.55em;\n` +
      `  white-space: nowrap;\n` +
      `}`;

    // 0 -> -50% shifts the track by exactly one copy's width (both halves are
    // identical), so the moment it snaps back the two copies line up pixel-for-pixel.
    const keyframes =
      `@keyframes ${aScroll} {\n` +
      `  from { transform: translateX(0); }\n` +
      `  to { transform: translateX(-50%); }\n` +
      `}`;

    const copy = (hidden: boolean) => [
      el("span", {
        attrs: hidden ? { class: "fx-copy", "aria-hidden": "true" } : { class: "fx-copy" },
        children: [text(ctx.text)],
      }),
      el("span", {
        attrs: hidden ? { class: "fx-divider", "aria-hidden": "true" } : { class: "fx-divider" },
        children: [text("·")],
      }),
    ];

    return {
      root: el("div", {
        children: [
          el("div", {
            attrs: { class: "fx-track" },
            children: [...copy(false), ...copy(true)],
          }),
        ],
      }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default tickerScroll;
