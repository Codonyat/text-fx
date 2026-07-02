import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText, dropGlow, round } from "@/lib/engine/helpers";

/**
 * Matrix digital rain fill: the glyphs are filled with columns of glowing green
 * code-rain falling downward. An HONEST gradient approximation — CSS can't emit
 * random glyphs, so each column is a narrow repeating streak of bright/dim green
 * cells (repeating-linear-gradient) scrolling vertically. Many columns fall at
 * DIFFERENT speeds (each travels a whole number of tiles per shared loop, so it
 * loops seamlessly) over a dark green-black in-glyph base, with a few brighter,
 * faster "head" streaks leading the pack and a phosphor-green dropGlow. The
 * multi-speed columnar fall + bright heads sell the Matrix look; distinct from the
 * static green glow of Terminal Phosphor and the diagonal weave of Scrolling Weave.
 */
const matrixRain: EffectDefinition = {
  id: "matrix-rain",
  name: "Matrix Rain",
  category: "fill-texture",
  tags: ["fill", "texture", "matrix", "code", "rain", "terminal", "green", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + vertically-scrolling repeating-linear-gradient columns",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 135, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Rain", type: "range", default: 3.5, min: 1.5, max: 8, step: 0.1, unit: "s" },
    { id: "density", label: "Density", type: "range", default: 6, min: 1, max: 10, step: 1 },
  ],
  rand: (R) => ({
    // Bias to matrix green; occasional amber / ice / cyan code-rain.
    hue: R.pick([135, 135, 135, 148, 45, 180]),
    speed: Number(R.rnd(2.5, 5).toFixed(1)),
    density: R.ri(4, 8),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const density = ctx.values.density as number;
    const dark = ctx.theme === "dark";

    // Higher density → shorter tiles → more streaks packed in.
    const densityScale = 1.5 - density * 0.1;

    // Phosphor palette, adapted so the glyphs read on BOTH themes (on light the
    // rain is a touch deeper / the base darker so it doesn't wash out on white).
    const headGlow = dark ? hsl(h, 82, 92) : hsl(h, 74, 76);
    const bright = dark ? hsl(h, 95, 66) : hsl(h, 88, 50);
    const mid = dark ? hsl(h, 90, 50) : hsl(h, 84, 40);
    const dim = dark ? hsl(h, 85, 34) : hsl(h, 80, 30);
    const baseTop = dark ? hsl(h, 65, 10) : hsl(h, 72, 16);
    const baseBottom = dark ? hsl(h, 70, 16) : hsl(h, 76, 23);

    const bodyStreak =
      `linear-gradient(to bottom, transparent 0%, ${dim} 30%, ${mid} 62%, ` +
      `${bright} 84%, ${headGlow} 95%, transparent 100%)`;
    const headStreak =
      `linear-gradient(to bottom, transparent 0%, transparent 55%, ${bright} 80%, ` +
      `${headGlow} 94%, transparent 100%)`;
    const baseFill = `linear-gradient(180deg, ${baseTop}, ${baseBottom})`;

    // Deterministic, index-derived column set (no randomness in build → export-stable).
    type Layer = { image: string; size: string; repeat: string; x: string; travel: number };
    const layers: Layer[] = [];

    // Bright, fast heads sit ON TOP, aligned over three of the body columns.
    for (const bi of [2, 6, 10]) {
      const x = `${round(2 + (bi / 12) * 96, 1)}%`;
      const tile = round(26 * densityScale, 1);
      layers.push({ image: headStreak, size: `4px ${tile}px`, repeat: "repeat-y", x, travel: 5 * tile });
    }

    // 13 body columns spread across the width, varied width / tile / fall multiplier.
    const COUNT = 13;
    for (let i = 0; i < COUNT; i++) {
      const x = `${round(2 + (i / (COUNT - 1)) * 96, 1)}%`;
      const w = 3 + (i % 3); // 3 | 4 | 5 px
      const tile = round((40 + ((i * 2) % 5) * 8) * densityScale, 1); // 40..72 px scaled
      const k = 2 + ((i * 2) % 3); // 2 | 3 | 4 tiles per loop → speed variety
      layers.push({ image: bodyStreak, size: `${w}px ${tile}px`, repeat: "repeat-y", x, travel: k * tile });
    }

    // Opaque dark base LAST so the glyph body never disappears between streaks.
    layers.push({ image: baseFill, size: "100% 100%", repeat: "no-repeat", x: "50%", travel: 0 });

    const images = layers.map((l) => l.image).join(",\n    ");
    const sizes = layers.map((l) => l.size).join(", ");
    const repeats = layers.map((l) => l.repeat).join(", ");
    const startPos = layers.map((l) => `${l.x} 0`).join(", ");
    const endPos = layers.map((l) => `${l.x} ${l.travel}px`).join(", ");

    const a = anim(ctx.scope, "rain");

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(images)}\n` +
      `  background-size: ${sizes};\n` +
      `  background-repeat: ${repeats};\n` +
      `  background-position: ${startPos};\n` +
      `  ${dropGlow(hsl(h, 90, 55, dark ? 0.55 : 0.4), [4, 9])}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  to { background-position: ${endPos}; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default matrixRain;
