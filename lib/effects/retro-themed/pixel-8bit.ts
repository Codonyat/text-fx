import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const pixel8bit: EffectDefinition = {
  id: "pixel-8bit",
  name: "Pixel 8-Bit",
  category: "retro-themed",
  tags: ["pixel", "8bit", "retro", "arcade", "game", "blocky"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 145, min: 0, max: 360, step: 1, unit: "°" },
    { id: "blockSize", label: "Block Size", type: "range", default: 3, min: 1, max: 6, step: 1, unit: "px" },
  ],
  rand: (R) => ({ hue: R.ri(0, 360), blockSize: R.ri(2, 5) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    // Step size for the staircase of hard shadow layers (no blur => crisp blocks).
    const b = ctx.values.blockSize as number;

    const face = hsl(h, 85, 60);
    // Darker shade for the lower-right "pixel staircase" body.
    const shade = hsl(h, 80, 38);
    // Hard outline that frames the glyphs like a sprite.
    const outline = ctx.theme === "dark" ? "#0a0a12" : "#161622";

    // Build a stepped, blur-free text-shadow stack: a 4-direction 1px outline
    // (faked at the chosen block step) plus a diagonal extrude of solid blocks.
    const steps: string[] = [];
    const depth = 4;
    for (let i = 1; i <= depth; i++) {
      steps.push(`${i * b}px ${i * b}px 0 ${shade}`);
    }
    // Chunky outline around the face in cardinal + diagonal directions.
    const o = b;
    const outlineLayers = [
      `${-o}px 0 0 ${outline}`,
      `${o}px 0 0 ${outline}`,
      `0 ${-o}px 0 ${outline}`,
      `0 ${o}px 0 ${outline}`,
      `${-o}px ${-o}px 0 ${outline}`,
      `${o}px ${-o}px 0 ${outline}`,
      `${-o}px ${o}px 0 ${outline}`,
      `${(depth + 1) * b}px ${(depth + 1) * b}px 0 ${outline}`,
    ];
    const shadow = [...steps, ...outlineLayers].join(",\n    ");

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  font-weight: 800;\n` +
      `  letter-spacing: 0.06em;\n` +
      `  image-rendering: pixelated;\n` +
      `  -webkit-font-smoothing: none;\n` +
      `  text-shadow:\n    ${shadow};\n}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default pixel8bit;
