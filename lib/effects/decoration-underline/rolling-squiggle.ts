import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * Rolling squiggle: a wavy underline strip whose sine pattern scrolls sideways
 * forever, like a ribbon rolling beneath the word. An inline SVG wave tile (hue
 * baked directly into the data-URI stroke, since currentColor can't reach inside
 * a background-image) repeats along an ::after strip and its
 * background-position-x is animated linearly — text stays fully legible while
 * only the underline rolls. Diverges from Wavy Underline (a static native
 * text-decoration squiggle) and Marching Underline (marching DASHES, not a
 * continuous wave).
 */
const rollingSquiggle: EffectDefinition = {
  id: "rolling-squiggle",
  name: "Rolling Squiggle",
  category: "decoration-underline",
  tags: ["underline", "decoration", "wavy", "squiggle", "rolling", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Inline SVG wave tile animated via background-position-x",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 200, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Roll Speed", type: "range", default: 2.2, min: 0.8, max: 6, step: 0.1, unit: "s" },
    { id: "size", label: "Wave Size", type: "range", default: 30, min: 18, max: 48, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    speed: Number(R.rnd(1.4, 3.6).toFixed(1)),
    size: R.ri(20, 42),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const wavelength = ctx.values.size as number;

    // Amplitude and stroke weight both scale off the wavelength so bigger waves
    // read as bigger, not just wider.
    const amp = round(wavelength * 0.22, 1);
    const strokeW = round(2.2 + amp * 0.14, 1);
    const height = round(amp * 2 + strokeW, 1);
    const mid = round(height / 2, 1);
    const q = round(wavelength / 4, 2);
    const half = round(wavelength / 2, 2);

    const txt = ctx.theme === "dark" ? hsl(h, 20, 94) : hsl(h, 40, 18);
    const line = ctx.theme === "dark" ? hsl(h, 90, 64) : hsl(h, 85, 48);

    // One sine period as a quadratic-bezier tile (Q up to the crest, T mirrors the
    // control point back down through the trough) — a well-known pure-SVG sine
    // wave shorthand. The hue is baked straight into the stroke color since a
    // data-URI background-image can't resolve currentColor.
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${wavelength}" height="${height}" viewBox="0 0 ${wavelength} ${height}">` +
      `<path d="M0,${mid} Q${q},${round(mid - amp, 2)} ${half},${mid} T${wavelength},${mid}" ` +
      `fill="none" stroke="${line}" stroke-width="${strokeW}" stroke-linecap="round"/>` +
      `</svg>`;
    const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    const a = anim(ctx.scope, "roll");

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  position: relative;\n` +
      `  color: ${txt};\n` +
      `  padding-bottom: ${round(height + 3, 1)}px;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  right: 0;\n` +
      `  bottom: 0;\n` +
      `  height: ${height}px;\n` +
      `  background-image: url("${dataUri}");\n` +
      `  background-repeat: repeat-x;\n` +
      `  background-size: ${wavelength}px ${height}px;\n` +
      `  background-position: 0 0;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    // Scrolling exactly one tile width is seamless: the strip's right edge lines
    // up perfectly with the next tile's left edge, so the roll never jumps.
    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { background-position-x: 0; }\n` +
      `  to { background-position-x: -${wavelength}px; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default rollingSquiggle;
