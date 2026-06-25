import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Scrolling texture: a fine two-tone crosshatch weave clipped to the glyphs that
 * scrolls diagonally on a loop. A moving woven material fill — distinct from the
 * bold static stripe fill.
 */
const scrollingTexture: EffectDefinition = {
  id: "scrolling-texture",
  name: "Scrolling Weave",
  category: "fill-texture",
  tags: ["texture", "weave", "crosshatch", "pattern", "scrolling", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + scrolling repeating-linear-gradient crosshatch",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 160, min: 0, max: 360, step: 1, unit: "°" },
    { id: "scale", label: "Weave", type: "range", default: 9, min: 5, max: 18, step: 1, unit: "px" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 4,
      min: 1.5,
      max: 10,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    scale: R.ri(6, 14),
    speed: Number(R.rnd(2.5, 7).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const s = ctx.values.scale as number;
    const speed = ctx.values.speed as number;

    const c1 = ctx.theme === "dark" ? hsl(h, 80, 60) : hsl(h, 75, 45);
    const c2 = ctx.theme === "dark" ? hsl((h + 24) % 360, 75, 40) : hsl((h + 24) % 360, 70, 62);
    const c3 = hsl((h + 200) % 360, 85, ctx.theme === "dark" ? 70 : 50, 0.5);
    const a = anim(ctx.scope, "weave");

    const warp = `repeating-linear-gradient(45deg, ${c1} 0 ${s}px, ${c2} ${s}px ${s * 2}px)`;
    const weft = `repeating-linear-gradient(-45deg, transparent 0 ${s}px, ${c3} ${s}px ${s + 1}px)`;

    const css =
      `.${ctx.scope} {\n` +
      `  background: ${weft}, ${warp};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const shift = s * 2;
    const keyframes =
      `@keyframes ${a} {\n` +
      `  to { background-position: ${shift}px ${shift}px, ${shift}px -${shift}px; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default scrollingTexture;
