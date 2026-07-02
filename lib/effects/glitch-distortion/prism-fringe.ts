import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Prism fringe: light through a prism, not a glitch. A stack of 8 hue-stepped
 * text-shadow layers (red → orange → yellow → green → cyan → blue → violet) each
 * sit a little further out along one axis — violet bends the most, red the least,
 * same as real dispersion — so the glyph edges bleed into a continuous spectral
 * smear while the fill stays a crisp neutral face. A slow ease-in-out breathe
 * slides the whole spectrum out and back in. No jitter, no random per-frame noise.
 */
const LAYER_COUNT = 8;
const HUE_START = 0; // red
const HUE_END = 270; // violet

const LAYERS = Array.from({ length: LAYER_COUNT }, (_, i) => {
  const t = i / (LAYER_COUNT - 1);
  const hue = Math.round(HUE_START + t * (HUE_END - HUE_START));
  // Outer (violet) layers travel furthest — mirrors how shorter wavelengths
  // refract more sharply than longer ones through a real prism.
  const factor = (i + 1) / LAYER_COUNT;
  const blur = Number((0.4 + factor * 0.6).toFixed(2));
  return { hue, factor, blur };
});

const REST = 0.45; // resting (0%/100%) offset multiplier — spectrum tucked in
const PEAK = 1; // fully slid-out (50%) offset multiplier

const prismFringe: EffectDefinition = {
  id: "prism-fringe",
  name: "Prism Fringe",
  category: "glitch-distortion",
  tags: ["animated", "prism", "dispersion", "spectral", "chromatic", "optics"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "spread", label: "Spread", type: "range", default: 3, min: 1, max: 6, step: 0.5, unit: "px" },
    { id: "angle", label: "Angle", type: "angle", default: 0, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Shimmer", type: "range", default: 4.5, min: 3, max: 7, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({
    spread: Number(R.rnd(2, 4.5).toFixed(1)),
    angle: R.ri(0, 360),
    speed: Number(R.rnd(3.5, 6).toFixed(1)),
  }),
  build: (ctx) => {
    const spread = ctx.values.spread as number;
    const angle = ctx.values.angle as number;
    const speed = ctx.values.speed as number;

    const rad = (angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const sat = 85;
    const light = ctx.theme === "dark" ? 62 : 45;
    // Neutral, theme-adapted face — the rainbow lives entirely in the fringe.
    const face = ctx.theme === "dark" ? hsl(0, 0, 93) : hsl(0, 0, 14);

    const shadowAt = (mult: number): string =>
      LAYERS.map(({ hue, factor, blur }) => {
        const dist = spread * factor * mult;
        const dx = Number((dist * cosA).toFixed(2));
        const dy = Number((dist * sinA).toFixed(2));
        return `${dx}px ${dy}px ${blur}px ${hsl(hue, sat, light)}`;
      }).join(",\n    ");

    const a = anim(ctx.scope, "fringe");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow:\n    ${shadowAt(REST)};\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% {\n    text-shadow:\n      ${shadowAt(REST)};\n  }\n` +
      `  50% {\n    text-shadow:\n      ${shadowAt(PEAK)};\n  }\n}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default prismFringe;
