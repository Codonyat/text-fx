import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { splitText } from "@/lib/engine/split";
import { hsl, anim, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * Split-Flap Board: an airport Solari departure board. Every letter sits on its own
 * dark rounded chip, split across the middle by a hinge seam; the top half is a blank
 * card that clacks DOWN (rotateX 0 → -90°) two-to-five times in a mechanical rhythm —
 * quick accelerating snaps then a decelerating settle — before folding away to reveal
 * the bright glyph. Staggered by index so the whole line resolves in a cascade. We sell
 * the mechanics (hinge shadow, motion, snap) rather than faking intermediate characters.
 *
 * Diverges from flip-in-3d (one swing, no board): this adds board chrome — cells, a
 * persistent hinge line, and a multi-flap clack. One-shot entrance (hover to replay).
 *
 * The flap's RESTING CSS state is the folded-away (resolved) frame, so JS-less SSR
 * previews under prefers-reduced-motion show the clean, fully-revealed board; the 0%
 * keyframe (card up, glyph hidden) only applies while the animation actually plays.
 */

type Board = { glyph: string; g1: string; g2: string };

const BOARDS: Record<string, Board> = {
  // Classic split-flap amber on near-black.
  amber: { glyph: hsl(38, 92, 60), g1: hsl(37, 100, 58, 0.5), g2: hsl(34, 100, 50, 0.28) },
  // Crisp white board (Frankfurt/Zurich style).
  white: { glyph: hsl(210, 16, 93), g1: hsl(205, 40, 82, 0.45), g2: hsl(205, 30, 72, 0.26) },
  // Phosphor green (old CRT / vintage boards).
  green: { glyph: hsl(145, 70, 55), g1: hsl(146, 90, 50, 0.5), g2: hsl(150, 90, 42, 0.28) },
};

/** Build the multi-flap keyframes: n falls (n-1 quick snaps + 1 settling fall). */
function flapKeyframes(name: string, n: number): string {
  const r = (x: number) => Number(x.toFixed(2));
  const w = 100 / n;
  const lines: string[] = [];
  for (let k = 0; k < n; k++) {
    const start = r(k * w);
    if (k === n - 1) {
      // Final card: decelerating settle, then held fully down (resolved) to 100%.
      const landed = r(k * w + 0.82 * w);
      lines.push(`  ${start}% { transform: rotateX(0deg); animation-timing-function: cubic-bezier(0.2, 0.62, 0.35, 1); }`);
      lines.push(`  ${landed}% { transform: rotateX(-90deg); }`);
      lines.push(`  100% { transform: rotateX(-90deg); }`);
    } else {
      // Quick gravity fall, then a steps(1) hold so the reset to the next card SNAPS.
      const fallen = r((k + 1) * w - 0.4);
      lines.push(`  ${start}% { transform: rotateX(0deg); animation-timing-function: cubic-bezier(0.55, 0.02, 0.9, 0.42); }`);
      lines.push(`  ${fallen}% { transform: rotateX(-90deg); animation-timing-function: steps(1, end); }`);
    }
  }
  return `@keyframes ${name} {\n${lines.join("\n")}\n}`;
}

const splitFlap: EffectDefinition = {
  id: "split-flap",
  name: "Split-Flap Board",
  category: "entrance-kinetic",
  tags: ["entrance", "split-flap", "solari", "departure-board", "flip", "mechanical", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "partial",
  controls: [
    { id: "flaps", label: "Flaps", type: "range", default: 3, min: 2, max: 5, step: 1 },
    { id: "dur", label: "Duration", type: "range", default: 1.2, min: 0.5, max: 2.5, step: 0.1, unit: "s" },
    { id: "stagger", label: "Stagger", type: "range", default: 90, min: 0, max: 220, step: 10, unit: "ms" },
    {
      id: "board",
      label: "Board",
      type: "select",
      default: "amber",
      options: [
        { label: "Amber", value: "amber" },
        { label: "White", value: "white" },
        { label: "Green", value: "green" },
      ],
    },
  ],
  rand: (R) => ({
    flaps: R.pick([2, 3, 3, 4, 4]),
    dur: Number(R.rnd(0.9, 1.6).toFixed(2)),
    stagger: R.ri(5, 14) * 10,
    board: R.pick(["amber", "amber", "white", "green"]),
  }),
  build: (ctx) => {
    const scope = ctx.scope;
    const n = Math.max(2, Math.min(5, Math.round(ctx.values.flaps as number)));
    const dur = ctx.values.dur as number;
    const stagger = ctx.values.stagger as number;
    const board = BOARDS[ctx.values.board as string] ?? BOARDS.amber;

    const dark = ctx.theme === "dark";
    const a = anim(scope, "flap");
    const a2 = anim(scope, "flap-r"); // hover replays the on-load entrance

    // Dark departure-board chip — self-contained so it reads on dark AND light stages
    // (a faint light ring separates it from a near-black page; the drop shadow reads on
    // a light page).
    const cellTop = hsl(220, 12, 16);
    const cellBot = hsl(223, 14, 8);
    const cellEdge = hsl(222, 14, 4);
    const ring = hsl(0, 0, 100, 0.06);
    const drop = hsl(0, 0, 0, dark ? 0.5 : 0.35);
    const flapTop = hsl(220, 12, 19);
    const flapBot = hsl(222, 13, 10);
    const flapSheen = hsl(0, 0, 100, 0.05);
    const hingeShadow = hsl(0, 0, 0, 0.6);
    const seamDark = hsl(0, 0, 0, 0.72);
    const seamLight = hsl(0, 0, 100, 0.05);

    const css =
      `.${scope} {\n` +
      `  white-space: pre;\n` +
      `  line-height: 1.5;\n` +
      `}\n` +
      `.${scope} .fx-ch {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  box-sizing: border-box;\n` +
      `  height: 1.5em;\n` +
      `  min-width: 0.62em;\n` +
      `  margin: 0 0.05em;\n` +
      `  vertical-align: middle;\n` +
      `  border-radius: 0.12em;\n` +
      `  border: 1px solid ${cellEdge};\n` +
      `  background: linear-gradient(180deg, ${cellTop}, ${cellBot});\n` +
      `  box-shadow: 0 0.05em 0.14em ${drop}, inset 0 0 0 1px ${ring};\n` +
      `  perspective: 6em;\n` +
      `}\n` +
      `.${scope} .fx-glyph {\n` +
      `  display: block;\n` +
      `  padding: 0 0.16em;\n` +
      `  line-height: 1.5em;\n` +
      `  text-align: center;\n` +
      `  color: ${board.glyph};\n` +
      `  text-shadow: 0 0 0.06em ${board.g1}, 0 0 0.42em ${board.g2};\n` +
      `}\n` +
      // Persistent hinge seam across the cell middle (stays visible on the resolved glyph).
      `.${scope} .fx-ch::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 0.06em;\n` +
      `  right: 0.06em;\n` +
      `  top: 50%;\n` +
      `  height: 0.05em;\n` +
      `  transform: translateY(-0.025em);\n` +
      `  background: linear-gradient(180deg, ${seamDark}, ${seamLight});\n` +
      `  z-index: 3;\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      // Blank top card, hinged at the cell middle. Resting = folded away (resolved).
      `.${scope} .fx-flap {\n` +
      `  position: absolute;\n` +
      `  top: 0;\n` +
      `  left: 0;\n` +
      `  right: 0;\n` +
      `  height: 50%;\n` +
      `  transform-origin: 50% 100%;\n` +
      `  transform: rotateX(-90deg);\n` +
      `  border-radius: 0.1em 0.1em 0 0;\n` +
      `  background: linear-gradient(180deg, ${flapTop}, ${flapBot});\n` +
      `  box-shadow: inset 0 1px 0 ${flapSheen}, inset 0 -0.06em 0.06em ${hingeShadow};\n` +
      `  backface-visibility: hidden;\n` +
      `  z-index: 2;\n` +
      `  animation: ${a} ${dur.toFixed(2)}s linear both;\n` +
      `  animation-delay: calc(var(--i) * ${stagger}ms);\n` +
      `}\n` +
      // Spaces: a blank dark board cell (no glyph, no flapping).
      `.${scope} .fx-ch.fx-sp {\n` +
      `  min-width: 0.85em;\n` +
      `}\n` +
      hoverReplay(scope, " .fx-ch .fx-flap", a2);

    const kf = flapKeyframes(a, n);

    const parts = splitText(ctx.text, "grapheme");
    const total = parts.length;
    const children = parts.map((seg, i) => {
      const isSpace = seg.trim().length === 0;
      if (isSpace) {
        return el("span", {
          attrs: { class: "fx-ch fx-sp" },
          vars: { "--i": i, "--n": total },
        });
      }
      return el("span", {
        attrs: { class: "fx-ch" },
        vars: { "--i": i, "--n": total },
        children: [
          el("span", { attrs: { class: "fx-glyph" }, children: [text(seg)] }),
          el("span", { attrs: { class: "fx-flap", "aria-hidden": "true" } }),
        ],
      });
    });

    return {
      root: el("div", { children }),
      css,
      keyframes: `${kf}\n${cloneKeyframes(kf, a, a2)}`,
      loopMs: Math.round(dur * 1000),
    };
  },
};

export default splitFlap;
