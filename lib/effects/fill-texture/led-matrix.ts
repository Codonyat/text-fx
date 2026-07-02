import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText, dropGlow, round } from "@/lib/engine/helpers";

/**
 * LED Matrix: the word rendered as lit dots on a dot-matrix scoreboard. The glyph
 * fill is a repeating radial-gradient of EMISSIVE LEDs (hot near-white core →
 * saturated hue ring → transparent, so hard dark gaps sit between the dots),
 * clipped to the text via background-clip:text. The dark display board with its
 * dimmer unlit-socket dot grid lives on the ROOT element's background, and the
 * clipped LED fill lives on an inner child span — this split is load-bearing:
 * background-clip:text makes the "text" the element's own background, which
 * paints at the very bottom of its stacking context, BELOW even a z-index:-1
 * ::before, so a pseudo-element board would occlude the glyphs entirely. A
 * descendant's background, by contrast, always paints above the root's. The
 * emissive lit-vs-unlit hardware read (backlit panel bloom via box-shadow, a
 * drop-shadow glow on the lit dots, a slow vertical refresh-scan band) is what
 * separates this from halftone-dots' flat pop-art print ink: no board, no
 * emission there — these are glowing pixels on a socketed board.
 */
const ledMatrix: EffectDefinition = {
  id: "led-matrix",
  name: "LED Matrix",
  category: "fill-texture",
  tags: ["led", "dot-matrix", "scoreboard", "display", "pixel", "fill", "texture", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + repeating radial-gradient LED grid",
  controls: [
    { id: "hue", label: "LED Hue", type: "range", default: 40, min: 0, max: 360, step: 1, unit: "°" },
    { id: "pitch", label: "Dot Pitch", type: "range", default: 13, min: 8, max: 22, step: 1, unit: "px" },
    { id: "board", label: "Board", type: "toggle", default: true, onLabel: "Board", offLabel: "Bare" },
  ],
  rand: (R) => {
    // Classic LED families: red / amber / green (plus the odd blue), lightly jittered.
    const base = R.pick([6, 6, 40, 40, 128, 128, 200]);
    return {
      hue: (base + R.ri(-5, 7) + 360) % 360,
      pitch: R.ri(10, 18),
      board: R.chance(0.8),
    };
  },
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const P = ctx.values.pitch as number;
    const board = Boolean(ctx.values.board);
    const dark = ctx.theme === "dark";
    // White-hot LEDs whenever there's a dark backdrop (the board, or a dark stage);
    // on a bare light stage deepen/saturate them so the dots still read.
    const litOnDark = board || dark;

    const px = (m: number) => round(P * m, 1);

    // Emissive LED fill: a blazing core, a colored falloff ring, hard dark gap.
    const core = litOnDark ? hsl(h, 92, 92) : hsl(h, 95, 56);
    const mid = litOnDark ? hsl(h, 98, 60) : hsl(h, 98, 48);
    const edge = litOnDark ? hsl(h, 95, 42) : hsl(h, 95, 36);
    const bloom = litOnDark ? hsl(h, 100, 62, 0.3) : hsl(h, 100, 48, 0.32);
    const scan = litOnDark ? hsl(h, 100, 82, 0.22) : hsl(h, 100, 60, 0.3);
    const glow = litOnDark ? hsl(h, 100, 60, 0.55) : hsl(h, 92, 46, 0.5);

    const dotLayer =
      `radial-gradient(circle at center, ${core} 0, ${core} ${px(0.1)}px, ` +
      `${mid} ${px(0.22)}px, ${edge} ${px(0.3)}px, transparent ${px(0.4)}px)`;
    const bloomLayer = `radial-gradient(circle at center, ${bloom} 0, transparent ${px(0.52)}px)`;
    const scanLayer = `linear-gradient(to bottom, transparent 47%, ${scan} 50%, transparent 53%)`;

    const bg = `${scanLayer}, ${dotLayer}, ${bloomLayer}`;
    const sizes = `100% 320%, ${P}px ${P}px, ${P}px ${P}px`;
    const repeats = `no-repeat, repeat, repeat`;
    const posStart = `0 0, 0 0, 0 0`;
    const posEnd = `0 100%, 0 0, 0 0`;

    const a = anim(ctx.scope, "scan");
    const scanDur = 5.2;

    // Dark hardware chip + its dimmer, recessed socket grid (same pitch).
    const boardTop = dark ? hsl(h, 26, 9) : hsl(h, 22, 11);
    const boardBot = dark ? hsl(h, 30, 5) : hsl(h, 26, 6);
    const socket = dark ? hsl(h, 24, 17) : hsl(h, 20, 18);
    const socketEdge = dark ? hsl(h, 22, 11) : hsl(h, 18, 12);
    const bezel = hsl(h, 30, 24, 0.5);
    const panelGlow = hsl(h, 100, 55, 0.26);

    // The clipped LED fill lives on this inner child so it paints ABOVE the
    // root's board background (see file comment — a ::before board would
    // occlude background-clipped text).
    const ledRule =
      `.${ctx.scope} .fx-led {\n` +
      `  display: inline-block;\n` +
      `  ${clipText(bg)}\n` +
      `  background-size: ${sizes};\n` +
      `  background-repeat: ${repeats};\n` +
      `  background-position: ${posStart};\n` +
      `  ${board ? dropGlow(glow, [px(0.6)]) : dropGlow(glow, [px(0.5), P])}\n` +
      `  animation: ${a} ${scanDur}s linear infinite;\n` +
      `}`;

    let css: string;

    if (board) {
      const socketLayer =
        `radial-gradient(circle at center, ${socket} 0, ${socket} ${px(0.14)}px, ` +
        `${socketEdge} ${px(0.26)}px, transparent ${px(0.34)}px)`;
      const boardBase = `linear-gradient(180deg, ${boardTop}, ${boardBot})`;
      css =
        `.${ctx.scope} {\n` +
        `  display: inline-block;\n` +
        `  padding: 0.6em 0.85em;\n` +
        `  border-radius: 0.3em;\n` +
        `  background: ${socketLayer}, ${boardBase};\n` +
        `  background-size: ${P}px ${P}px, 100% 100%;\n` +
        `  box-shadow: 0 0 ${round(P * 1.7)}px ${panelGlow}, 0 6px 22px rgba(0, 0, 0, 0.45), ` +
        `inset 0 0 0 1px ${bezel}, inset 0 3px 10px rgba(0, 0, 0, 0.5);\n` +
        `}\n` +
        ledRule;
    } else {
      css =
        `.${ctx.scope} {\n` +
        `  display: inline-block;\n` +
        `}\n` +
        ledRule;
    }

    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { background-position: ${posStart}; }\n` +
      `  to { background-position: ${posEnd}; }\n` +
      `}`;

    return {
      root: el("div", {
        children: [el("span", { attrs: { class: "fx-led" }, children: [text(ctx.text)] })],
      }),
      css,
      keyframes,
      loopMs: scanDur * 1000,
    };
  },
};

export default ledMatrix;
