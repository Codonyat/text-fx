import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, dropGlow } from "@/lib/engine/helpers";

/**
 * Pop-art halftone: a repeating radial-gradient dot grid layered over a two-tone
 * base, clipped to the glyphs. The dot layer scrolls one tile per cycle so the
 * halftone drifts seamlessly. Glow uses drop-shadow (clipped text — glow guard).
 */
const halftoneDots: EffectDefinition = {
  id: "halftone-dots",
  name: "Halftone Dots",
  category: "fill-texture",
  tags: ["halftone", "dots", "pop-art", "comic", "pattern", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + repeating radial-gradient dot grid",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 330, min: 0, max: 360, step: 1, unit: "°" },
    { id: "size", label: "Dot Grid", type: "range", default: 12, min: 6, max: 26, step: 1, unit: "px" },
    { id: "animate", label: "Animate", type: "toggle", default: true, onLabel: "On", offLabel: "Off" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 5,
      min: 2,
      max: 12,
      step: 0.1,
      unit: "s",
      when: (v) => Boolean(v.animate),
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    size: R.ri(9, 20),
    animate: R.chance(0.75),
    speed: Number(R.rnd(3.5, 9).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const size = ctx.values.size as number;
    const animate = Boolean(ctx.values.animate);
    const speed = ctx.values.speed as number;

    // Deep base on dark themes, soft tint on light, with a sister hue for depth.
    const base1 = ctx.theme === "dark" ? hsl(h, 80, 20) : hsl(h, 70, 82);
    const base2 = ctx.theme === "dark" ? hsl((h + 35) % 360, 85, 30) : hsl((h + 35) % 360, 75, 70);
    const dot = ctx.theme === "dark" ? hsl(h, 95, 66) : hsl(h, 88, 46);
    const glow = ctx.theme === "dark" ? hsl(h, 90, 55, 0.35) : hsl(h, 80, 50, 0.22);

    const a = anim(ctx.scope, "halftone");
    const dotLayer = `radial-gradient(circle, ${dot} 30%, transparent 32%)`;
    const baseLayer = `linear-gradient(135deg, ${base1}, ${base2})`;
    const animDecl = animate ? `\n  animation: ${a} ${speed.toFixed(1)}s linear infinite;` : "";

    const css =
      `.${ctx.scope} {\n` +
      `  background: ${dotLayer}, ${baseLayer};\n` +
      `  background-size: ${size}px ${size}px, 100% 100%;\n` +
      `  background-position: 0 0, 0 0;\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  ${dropGlow(glow, [10])}` +
      `${animDecl}\n` +
      `}`;

    const keyframes = animate
      ? `@keyframes ${a} {\n  to { background-position: ${size}px ${size}px, 0 0; }\n}`
      : undefined;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: animate ? speed * 1000 : undefined,
    };
  },
};

export default halftoneDots;
