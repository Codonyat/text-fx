import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

// Four arcade palette-swaps. `sh1`/`sh2` (the offset-shadow tones) barely need to
// shift between themes — they read fine dark-on-dark-bg and dark-on-light-bg alike,
// same trick used by retro-3d. Only the glyph face flips bright<->dark per theme.
const PALETTES: Record<string, { faceDark: string; faceLight: string; sh1: string; sh2: string }> = {
  nes: {
    faceDark: hsl(0, 0, 93),
    faceLight: hsl(0, 0, 12),
    sh1: hsl(355, 80, 44),
    sh2: hsl(355, 68, 24),
  },
  gameboy: {
    faceDark: hsl(84, 55, 72),
    faceLight: hsl(90, 60, 24),
    sh1: hsl(100, 45, 30),
    sh2: hsl(110, 55, 14),
  },
  arcade: {
    faceDark: hsl(186, 95, 64),
    faceLight: hsl(190, 85, 34),
    sh1: hsl(320, 85, 48),
    sh2: hsl(285, 65, 26),
  },
  gold: {
    faceDark: hsl(46, 95, 64),
    faceLight: hsl(38, 90, 36),
    sh1: hsl(18, 80, 40),
    sh2: hsl(8, 65, 20),
  },
};

/**
 * Pixel / 8-bit: authentic bitmap lettering (Silkscreen) with a hard, zero-blur
 * offset text-shadow stacked in two darker tones for a chunky NES-title-screen slab.
 * Palette-swap select picks an arcade preset; an optional stepped (steps()) blink
 * loops the whole word like an insert-coin prompt. No blur anywhere — stays crisp.
 */
const pixel8bit: EffectDefinition = {
  id: "pixel-8bit",
  name: "Pixel / 8-bit",
  category: "retro-themed",
  tags: ["pixel", "8bit", "retro", "arcade", "bitmap", "animated"],
  caps: ["pure"],
  font: "'Silkscreen', cursive",
  pngSupport: "good",
  controls: [
    {
      id: "palette",
      label: "Palette",
      type: "select",
      default: "nes",
      options: [
        { label: "NES Gray/Red", value: "nes" },
        { label: "Game Boy Green", value: "gameboy" },
        { label: "Arcade Cyan/Magenta", value: "arcade" },
        { label: "Insert Coin Gold", value: "gold" },
      ],
    },
    { id: "depth", label: "Depth", type: "range", default: 2, min: 1, max: 4, step: 1 },
    { id: "blink", label: "Blink", type: "toggle", default: false, onLabel: "On", offLabel: "Off" },
  ],
  rand: (R) => ({
    palette: R.pick(["nes", "gameboy", "arcade", "gold"]),
    depth: R.ri(1, 4),
    blink: R.chance(0.25),
  }),
  build: (ctx) => {
    const key = (ctx.values.palette as string) in PALETTES ? (ctx.values.palette as string) : "nes";
    const p = PALETTES[key];
    const face = ctx.theme === "dark" ? p.faceDark : p.faceLight;
    const n = Math.round(ctx.values.depth as number);
    const blink = Boolean(ctx.values.blink);

    // Chunky pixel-grid offsets: the first step in a bright shade, any further
    // steps in a darker tone — a hard, zero-blur two-tone slab (no smooth 1px ramp).
    const step = 3;
    const layers: string[] = [];
    for (let i = 1; i <= n; i++) {
      const off = i * step;
      layers.push(`${off}px ${off}px 0 ${i === 1 ? p.sh1 : p.sh2}`);
    }

    const a = anim(ctx.scope, "blink");
    const animDecl = blink ? `\n  animation: ${a} 1.1s steps(2, jump-none) infinite;` : "";

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow: ${layers.join(", ")};\n` +
      `  -webkit-font-smoothing: none;\n` +
      `  font-smooth: never;\n` +
      `  text-rendering: optimizeSpeed;${animDecl}\n` +
      `}`;

    // Hard 2-step opacity toggle (steps(2, jump-none) over the full duration): on for
    // the first half, an instant snap to off for the second half, no fade — an
    // insert-coin-style blink. Loops forever; not a one-shot entrance.
    const keyframes = blink
      ? `@keyframes ${a} {\n  from { opacity: 1; }\n  to { opacity: 0; }\n}`
      : undefined;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: blink ? 1100 : undefined,
    };
  },
};

export default pixel8bit;
