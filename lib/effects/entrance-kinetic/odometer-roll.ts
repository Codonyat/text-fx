import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { splitText } from "@/lib/engine/split";
import { anim, hsl, round, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

// Height of one reel cell / window (em). Whole-cell translations keep the geometry
// exact; the drum-shading gradient masks the tight top/bottom clip.
const CELL = 1.25;

/**
 * Build the vertical reel for one grapheme: `len` real characters ending at the
 * target. Alphanumerics roll through their neighbours (wrapping within 0-9 / A-Z /
 * a-z, exactly like a mechanical counter wheel); everything else (symbols, accents,
 * multi-codepoint clusters) simply slides into place. Pure charCode arithmetic — no
 * randomness — so build() stays deterministic.
 */
function reel(g: string, len: number): string[] {
  const cp = g.codePointAt(0) ?? 0;
  const single = Array.from(g).length === 1;
  let base = -1;
  let size = 0;
  if (single && cp >= 48 && cp <= 57) {
    base = 48;
    size = 10; // digits 0-9
  } else if (single && cp >= 65 && cp <= 90) {
    base = 65;
    size = 26; // A-Z
  } else if (single && cp >= 97 && cp <= 122) {
    base = 97;
    size = 26; // a-z
  }
  const out: string[] = [];
  if (base >= 0) {
    const t = cp - base;
    for (let k = len - 1; k >= 0; k--) {
      out.push(String.fromCodePoint(base + (((t - k) % size) + size) % size));
    }
  } else {
    for (let k = 0; k < len; k++) out.push(g);
  }
  return out; // length `len`, last element === g
}

/**
 * Odometer Roll: each letter spins in like a mechanical slot-machine counter — a
 * vertical reel of neighbouring glyphs rolls upward inside a fixed, overflow-clipped
 * window and lands on the target with a small settling bounce, staggered left→right.
 * Distinct from Falling Letters (glyphs drop THROUGH open space) — here the type rolls
 * INSIDE fixed hardware windows (per-letter markup).
 */
const odometerRoll: EffectDefinition = {
  id: "odometer-roll",
  name: "Odometer Roll",
  category: "entrance-kinetic",
  tags: ["entrance", "odometer", "counter", "roll", "mechanical", "per-letter", "animated"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "good",
  controls: [
    { id: "dist", label: "Reel Length", type: "range", default: 4, min: 3, max: 6, step: 1 },
    {
      id: "speed",
      label: "Roll Time",
      type: "range",
      default: 0.9,
      min: 0.4,
      max: 1.8,
      step: 0.05,
      unit: "s",
    },
    {
      id: "chrome",
      label: "Cell Chrome",
      type: "toggle",
      default: true,
      onLabel: "On",
      offLabel: "Off",
    },
  ],
  rand: (R) => ({
    dist: R.ri(3, 6),
    speed: Number(R.rnd(0.7, 1.2).toFixed(2)),
    chrome: R.chance(0.7),
  }),
  build: (ctx) => {
    const len = ctx.values.dist as number;
    const dur = ctx.values.speed as number;
    const chrome = Boolean(ctx.values.chrome);
    const stagger = 70; // ms per letter, left→right

    const dark = ctx.theme === "dark";
    const base = dark ? hsl(40, 24, 90) : hsl(220, 12, 16);
    const drum = dark ? hsl(0, 0, 0, 0.62) : hsl(0, 0, 0, 0.3);
    const frame = dark ? hsl(40, 20, 100, 0.14) : hsl(0, 0, 0, 0.14);
    const cellBg = dark ? hsl(0, 0, 100, 0.04) : hsl(0, 0, 0, 0.035);

    const a = anim(ctx.scope, "odo");
    const a2 = anim(ctx.scope, "odo-r"); // hover replays the on-load entrance

    const R = round((len - 1) * CELL, 3);
    const settleA = round(R - 0.2, 3);
    const settleB = round(R - 0.07, 3);

    const parts = splitText(ctx.text, "grapheme");
    const nodes = parts.map((g, i) => {
      if (g === " ") {
        return el("span", { attrs: { class: "fx-sp" }, vars: { "--i": i }, children: [text(" ")] });
      }
      const cells = reel(g, len);
      return el("span", {
        attrs: { class: "fx-win" },
        vars: { "--i": i },
        children: [
          // Invisible sizer fixes the window to the TARGET glyph's advance so spacing
          // stays even regardless of the (possibly wider) neighbours rolling through.
          el("span", { attrs: { class: "fx-sizer" }, children: [text(g)] }),
          el("span", {
            attrs: { class: "fx-strip" },
            children: cells.map((c) => el("span", { attrs: { class: "fx-cell" }, children: [text(c)] })),
          }),
        ],
      });
    });

    const chromeCss = chrome
      ? `.${ctx.scope} .fx-win {\n` +
        `  padding: 0 0.1em;\n` +
        `  border-radius: 3px;\n` +
        `  background: ${cellBg};\n` +
        `}\n` +
        `.${ctx.scope} .fx-win::after {\n` +
        `  content: "";\n` +
        `  position: absolute;\n` +
        `  inset: 0;\n` +
        `  pointer-events: none;\n` +
        `  border-radius: 3px;\n` +
        `  background: linear-gradient(to bottom, ${drum} 0%, transparent 34%, transparent 66%, ${drum} 100%);\n` +
        `  box-shadow: inset 0 0 0 1px ${frame};\n` +
        `}\n`
      : "";

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${base};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-win {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  overflow: hidden;\n` +
      `  height: ${CELL}em;\n` +
      `  line-height: ${CELL}em;\n` +
      `  vertical-align: baseline;\n` +
      `}\n` +
      `.${ctx.scope} .fx-sp {\n` +
      `  display: inline-block;\n` +
      `  height: ${CELL}em;\n` +
      `}\n` +
      `.${ctx.scope} .fx-sizer {\n` +
      `  visibility: hidden;\n` +
      `}\n` +
      `.${ctx.scope} .fx-strip {\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  right: 0;\n` +
      `  top: 0;\n` +
      `  text-align: center;\n` +
      `  will-change: transform;\n` +
      `  animation: ${a} ${dur.toFixed(2)}s linear both;\n` +
      `  animation-delay: calc(var(--i) * ${stagger}ms);\n` +
      `}\n` +
      `.${ctx.scope} .fx-cell {\n` +
      `  display: block;\n` +
      `  height: ${CELL}em;\n` +
      `  line-height: ${CELL}em;\n` +
      `}\n` +
      chromeCss +
      hoverReplay(ctx.scope, " .fx-strip", a2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.35, 0, 0.15, 1); }\n` +
      `  62% { transform: translateY(-${R}em); animation-timing-function: cubic-bezier(0.3, 0, 0.2, 1); }\n` +
      `  76% { transform: translateY(-${settleA}em); animation-timing-function: ease-in-out; }\n` +
      `  88% { transform: translateY(-${settleB}em); animation-timing-function: ease-in-out; }\n` +
      `  100% { transform: translateY(-${R}em); }\n` +
      `}`;

    return {
      root: el("div", { children: nodes }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: Math.round(dur * 1000 + stagger * (parts.length - 1)),
    };
  },
};

export default odometerRoll;
