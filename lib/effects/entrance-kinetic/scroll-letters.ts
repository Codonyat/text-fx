import type { EffectDefinition } from "@/lib/engine/types";
import { el, letterSpans } from "@/lib/engine/markup";
import { anim, hsl, round } from "@/lib/engine/helpers";

/**
 * SCROLL ASSEMBLE — a per-letter, scroll-scrubbed reveal.
 *
 * The word assembles letter-by-letter under the reader's scroll. Every letter
 * span rides the SAME anonymous `view()` timeline, but each gets its own
 * STAGGERED `animation-range` window: letter 0 reveals first, letter n last.
 * Scroll down → letters rise + fade + untilt into place, left-to-right; scroll
 * up → they come apart, right-to-left. Fully reversible, no JS.
 *
 * Diverges from the nearest effect (`stagger-reveal`, a fixed on-load cascade):
 * this one is READER-SCRUBBED and reversible, driven entirely by scroll position.
 *
 * Lane rules (addendum A):
 *  1. The BASE `.fx-ch` rule = the FINAL, fully-revealed, legible state — the only
 *     frame thumbnails / posters / SSR / OG / PNG and non-supporting browsers see.
 *  2. The scrub is ADDED only inside `@supports (animation-timeline: view())` AND
 *     only when `ctx.mode !== "thumbnail"`.
 *  3. The `animation` shorthand RESETS `animation-timeline`/`animation-range`, so we
 *     set `animation-timeline` AFTER the shorthand, and the per-letter ranges live in
 *     higher-specificity `:nth-child()` rules that win the cascade.
 *  4. Per-letter windows are EMITTED as computed `nth-child` percentages (n is known
 *     at build time) rather than `var(--i)`-derived ranges — guaranteed to resolve
 *     across engines, no reliance on custom props inside `animation-range`.
 *  5. Everything generated is salted off `ctx.scope`; anonymous `view()` only.
 *
 * The studio scroll wrapper rests at ~45% of the cover range, so the stagger is
 * tuned to finish just past there (window = cover 5%..50%): at rest the word reads
 * fully, with only the last glyph or two still arriving — a live entrance in a still,
 * yet legible.
 */

// Cover-% window the whole stagger occupies. Ends a touch past the studio's ~45%
// resting frame so the word is legible at rest with a live tail still assembling.
const WIN_START = 5;
const WIN_END = 50;

/** Per-letter [start%, end%] cover windows. `stagger` (0..1) sets how many letters
 *  are in flight at once (low = a soft overlapping wave, high = a crisp cascade). */
function letterWindows(n: number, stagger: number): Array<[number, number]> {
  const span = WIN_END - WIN_START;
  if (n <= 0) return [];
  if (n === 1) return [[WIN_START, WIN_END]];
  const inFlight = 4 - stagger * (4 - 1.2); // letters mid-reveal at once: 0→4, 1→1.2
  const win = (inFlight * span) / (n - 1 + inFlight); // per-letter window width
  const step = (span - win) / (n - 1); // gap between consecutive window starts
  const out: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const s = WIN_START + i * step;
    out.push([round(s, 2), round(s + win, 2)]);
  }
  return out;
}

const scrollLetters: EffectDefinition = {
  id: "scroll-letters",
  name: "Scroll Assemble",
  category: "entrance-kinetic",
  tags: ["entrance", "stagger", "reveal", "scroll", "per-letter", "animated"],
  caps: ["perLetter", "scroll"],
  split: "grapheme",
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    {
      id: "stagger",
      label: "Stagger",
      type: "range",
      default: 0.55,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      id: "rise",
      label: "Rise",
      type: "range",
      default: 26,
      min: 4,
      max: 90,
      step: 1,
      unit: "px",
    },
    {
      id: "rotate",
      label: "Rotate",
      type: "range",
      default: 8,
      min: 0,
      max: 40,
      step: 1,
      unit: "°",
    },
  ],
  rand: (R) => ({
    stagger: Number(R.rnd(0.35, 0.8).toFixed(2)),
    rise: R.ri(18, 48),
    rotate: R.ri(0, 18),
  }),
  build: (ctx) => {
    const stagger = ctx.values.stagger as number;
    const rise = ctx.values.rise as number;
    const rot = ctx.values.rotate as number;
    const dark = ctx.theme === "dark";

    // Fixed violet accent — legible on BOTH themes (bright on dark, deep on light).
    const h = 265;
    const color = dark ? hsl(h, 85, 72) : hsl(h, 72, 46);
    // A gentle two-tone lift; rides each letter's own opacity so it fades in with it.
    const shadow = dark
      ? `0 0 1px ${hsl(h, 90, 82, 0.5)}, 0 4px 22px ${hsl((h + 20) % 360, 90, 62, 0.28)}`
      : `0 1px 1px ${hsl(h, 45, 28, 0.22)}, 0 6px 16px ${hsl((h + 20) % 360, 55, 45, 0.12)}`;

    const a = anim(ctx.scope, "assemble");

    // BASE = the finished word (the only frame static consumers ever see).
    let css =
      `.${ctx.scope} {\n` +
      `  color: ${color};\n` +
      `  white-space: pre;\n` +
      `}\n` +
      `.${ctx.scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  text-shadow: ${shadow};\n` +
      `}`;

    // Hidden → revealed: rise up, fade in, untilt, sharpen.
    const kf =
      `@keyframes ${a} {\n` +
      `  from { opacity: 0; transform: translateY(${rise}px) rotate(${rot}deg); filter: blur(2.5px); }\n` +
      `  to   { opacity: 1; transform: translateY(0) rotate(0deg); filter: blur(0); }\n` +
      `}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      const n = [...ctx.text].length;
      // Shorthand first (resets timeline + range), then the anonymous view() timeline.
      // `both` fill holds `from` (hidden) before each letter's window and `to`
      // (revealed) after it, so the scrub is fully reversible.
      let block =
        `@supports (animation-timeline: view()) {\n` +
        `  .${ctx.scope} .fx-ch {\n` +
        `    animation: ${a} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    will-change: opacity, transform, filter;\n` +
        `  }\n`;
      // Per-letter staggered windows (higher specificity → win the range cascade).
      for (const [i, [s, e]] of letterWindows(n, stagger).entries()) {
        block += `  .${ctx.scope} .fx-ch:nth-child(${i + 1}) { animation-range: cover ${s}% cover ${e}%; }\n`;
      }
      block += `}`;
      css += `\n\n` + block;
      keyframes = kf;
    }

    return {
      root: el("div", { children: letterSpans(ctx.text, "grapheme") }),
      css,
      keyframes,
      runtime: "none", // anonymous view() timeline is pure CSS — no listener shipped
    };
  },
};

export default scrollLetters;
