import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

/**
 * Bungee Chromatic Layers — the Bungee family's purpose-built overprint system.
 *
 * Three copies of the word at IDENTICAL size/position, stacked in a grid cell so they
 * align pixel-for-pixel, each set in a different Bungee layer font:
 *   1. Bungee Shade  (back)  — the drafted cast-shadow/3D-block glyph, in a deep tone.
 *   2. Bungee        (face)  — the solid letterform, in a bright hue.
 *   3. Bungee Inline (top)   — the highlight-groove glyph, in a light accent.
 * The three faces share advance widths and baselines by design (that's what the layer
 * fonts are FOR), so overprinting them yields authentic multi-color dimensional signage:
 * crisp inline grooves over a solid face over a real drafted shade — geometry no CSS
 * text-shadow can fake (cf. the sibling `outline-3d-extrude`, which stacks a fake shadow).
 *
 * Per-layer `font-family` overrides on the stacked spans are the entire point here; the
 * base family is forced to Bungee via `font:` so the engine loads it and hides the Font
 * control. Purely static — no animation.
 */
const bungeeLayers: EffectDefinition = {
  id: "bungee-layers",
  name: "Bungee Layers",
  category: "threed-depth",
  tags: ["3d", "layers", "signage", "chromatic", "color-font", "bungee"],
  caps: ["pure"],
  font: "'Bungee', cursive",
  pngSupport: "good",
  supports: "Bungee chromatic layer fonts; all modern browsers.",
  controls: [
    { id: "faceHue", label: "Face Hue", type: "range", default: 350, min: 0, max: 360, step: 1, unit: "°" },
    { id: "shadeHue", label: "Shade Tone", type: "range", default: 262, min: 0, max: 360, step: 1, unit: "°" },
    { id: "inlineHue", label: "Inline Accent", type: "range", default: 45, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => {
    const faceHue = R.ri(0, 360);
    return {
      faceHue,
      // Deep block ~complementary to the face so the 3D shade reads as a distinct color;
      // inline stays analogous to the face for a harmonious highlight.
      shadeHue: (faceHue + R.ri(150, 210)) % 360,
      inlineHue: (faceHue + R.ri(30, 60)) % 360,
    };
  },
  build: (ctx) => {
    const faceHue = ctx.values.faceHue as number;
    const shadeHue = ctx.values.shadeHue as number;
    const inlineHue = ctx.values.inlineHue as number;
    const dark = ctx.theme === "dark";

    // A clear light→mid→deep value hierarchy so the stack always reads as dimensional on
    // BOTH themes: shade darkest (the block/shadow), face mid-bright, inline lightest.
    const face = dark ? hsl(faceHue, 88, 60) : hsl(faceHue, 82, 48);
    const shade = dark ? hsl(shadeHue, 65, 32) : hsl(shadeHue, 60, 38);
    const inline = dark ? hsl(inlineHue, 90, 85) : hsl(inlineHue, 88, 80);

    // Grid stack: every copy occupies the same 1/1 cell, so identical metrics overprint;
    // DOM order (shade → face → inline) is the paint order, no z-index needed.
    const css =
      `.${ctx.scope} {\n` +
      `  display: grid;\n` +
      `  line-height: 1;\n` +
      `}\n` +
      `.${ctx.scope} > span {\n` +
      `  grid-area: 1 / 1;\n` +
      `}\n` +
      `.${ctx.scope} .fx-shade {\n` +
      `  font-family: 'Bungee Shade', cursive;\n` +
      `  color: ${shade};\n` +
      `}\n` +
      `.${ctx.scope} .fx-face {\n` +
      `  font-family: 'Bungee', cursive;\n` +
      `  color: ${face};\n` +
      `}\n` +
      `.${ctx.scope} .fx-inline {\n` +
      `  font-family: 'Bungee Inline', cursive;\n` +
      `  color: ${inline};\n` +
      `}`;

    const root = el("div", {
      children: [
        el("span", { attrs: { class: "fx-shade" }, children: [text(ctx.text)] }),
        el("span", { attrs: { class: "fx-face" }, children: [text(ctx.text)] }),
        el("span", { attrs: { class: "fx-inline" }, children: [text(ctx.text)] }),
      ],
    });

    return { root, css };
  },
};

export default bungeeLayers;
