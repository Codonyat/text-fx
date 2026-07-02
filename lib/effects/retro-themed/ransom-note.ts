import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { splitText } from "@/lib/engine/split";
import { hsl, prop, round } from "@/lib/engine/helpers";

/**
 * Ransom Note: every letter is a paper scrap cut from a different magazine. Deterministic
 * :nth-child buckets — desynced periods (font mod 5, paper mod 4, tilt mod 6) so combos
 * only repeat every 60 glyphs — give each chip its own typeface, background paper, ink,
 * tilt and vertical jitter, glued down with a hard rim + drop shadow. Static, pure CSS.
 *
 * SANCTIONED per-letter font override: this effect sets font-family on individual .fx-ch
 * chips (cycling picker families from lib/fonts.ts FONTS). The shared Font control still
 * fills one of the five buckets (the base), so the user's pick joins the collage.
 */

type Chip = { bg: string; ink: string; rim: string };

// Three paper palettes: each is four scraps (cream/white/black + one accent per the
// spec). Chips are opaque with their own ink, so they read on dark AND light stages;
// a theme-aware separation ring (below) keeps even a black scrap detached from the page.
const PALETTES: Record<string, Chip[]> = {
  // Classic newsprint: cream + bright white + black scrap + faded vermillion.
  classic: [
    { bg: hsl(45, 30, 90), ink: hsl(0, 0, 12), rim: hsl(45, 20, 72) },
    { bg: hsl(0, 0, 98), ink: hsl(0, 0, 10), rim: hsl(0, 0, 78) },
    { bg: hsl(0, 0, 11), ink: hsl(0, 0, 96), rim: hsl(0, 0, 34) },
    { bg: hsl(4, 66, 51), ink: hsl(45, 45, 96), rim: hsl(4, 55, 36) },
  ],
  // Neon zine: risograph hot-pink / cyan / black-with-yellow-ink / acid yellow.
  neon: [
    { bg: hsl(330, 88, 62), ink: hsl(0, 0, 8), rim: hsl(330, 68, 42) },
    { bg: hsl(186, 82, 60), ink: hsl(200, 60, 10), rim: hsl(186, 62, 38) },
    { bg: hsl(262, 22, 11), ink: hsl(56, 92, 62), rim: hsl(262, 30, 30) },
    { bg: hsl(52, 92, 60), ink: hsl(330, 78, 24), rim: hsl(52, 68, 40) },
  ],
  // Kidnapper chic: aged manila, kraft tan, charcoal, blood-red accent.
  kidnapper: [
    { bg: hsl(38, 40, 78), ink: hsl(20, 42, 16), rim: hsl(38, 30, 58) },
    { bg: hsl(28, 36, 62), ink: hsl(24, 46, 14), rim: hsl(28, 30, 44) },
    { bg: hsl(210, 12, 14), ink: hsl(40, 30, 88), rim: hsl(210, 15, 32) },
    { bg: hsl(356, 54, 40), ink: hsl(38, 40, 90), rim: hsl(356, 50, 27) },
  ],
};

// Four contrasting magazine faces from FONTS (blocky display, typewriter mono, quirky
// grotesque, heavy sans). The 5th bucket is left unset so it inherits the shared Font.
const FONT_CYCLE = [
  "'Bungee', cursive",
  "'Space Mono', monospace",
  "'Syne', sans-serif",
  "'Archivo Black', sans-serif",
];

// Six tilt/offset/padding-jitter buckets (mod 6). r = signed fraction of the rotation
// control; dy = vertical scatter in em; pj = padding jitter in em (chip-size variation).
const TILT = [
  { r: -1, dy: -0.05, pj: 0.01 },
  { r: 0.6, dy: 0.04, pj: -0.02 },
  { r: -0.35, dy: 0.06, pj: 0.03 },
  { r: 0.9, dy: -0.04, pj: -0.01 },
  { r: -0.7, dy: 0.02, pj: 0.02 },
  { r: 0.4, dy: -0.06, pj: 0 },
];

const ransomNote: EffectDefinition = {
  id: "ransom-note",
  name: "Ransom Note",
  category: "retro-themed",
  tags: ["ransom", "collage", "cutout", "mixed-fonts", "paper", "per-letter", "retro"],
  caps: ["perLetter"],
  split: "grapheme",
  pngSupport: "partial",
  controls: [
    {
      id: "palette",
      label: "Palette",
      type: "select",
      default: "classic",
      options: [
        { label: "Classic newsprint", value: "classic" },
        { label: "Neon zine", value: "neon" },
        { label: "Kidnapper chic", value: "kidnapper" },
      ],
    },
    { id: "tilt", label: "Tilt", type: "range", default: 5, min: 0, max: 12, step: 1, unit: "°" },
    { id: "pad", label: "Chip Padding", type: "range", default: 0.16, min: 0.06, max: 0.34, step: 0.02, unit: "em" },
  ],
  rand: (R) => ({
    palette: R.pick(["classic", "neon", "kidnapper"]),
    tilt: R.ri(3, 8),
    pad: R.pick([0.12, 0.16, 0.2, 0.24]),
  }),
  build: (ctx) => {
    const scope = ctx.scope;
    const palette = ctx.values.palette as string;
    const rot = ctx.values.tilt as number;
    const pad = ctx.values.pad as number;

    const chips = PALETTES[palette] ?? PALETTES.classic;
    const padY = round(pad, 3);
    const padX = round(pad + 0.06, 3);

    // Glued-cutout depth + a theme-aware ring so any scrap detaches from the stage, plus
    // a faint top sheen for paper tactility.
    const dark = ctx.theme === "dark";
    const shadow = `0.06em 0.09em 0 ${hsl(0, 0, 0, dark ? 0.5 : 0.28)}`;
    const sep = hsl(0, 0, dark ? 100 : 0, dark ? 0.16 : 0.18);
    const sheen = hsl(0, 0, 100, 0.14);

    // Salted per-chip custom props (rotation fraction, vertical offset, padding jitter).
    const vR = prop(scope, "r");
    const vDy = prop(scope, "dy");
    const vPj = prop(scope, "pj");

    const nth = (period: number, i: number) =>
      i + 1 === period ? `${period}n` : `${period}n+${i + 1}`;

    const fontRules = FONT_CYCLE.map(
      (f, i) => `.${scope} .fx-ch:nth-child(${nth(5, i + 1)}) { font-family: ${f}; }`,
    ).join("\n");

    const paletteRules = chips
      .map(
        (c, i) =>
          `.${scope} .fx-ch:nth-child(${nth(4, i)}) {\n` +
          `  background: ${c.bg};\n` +
          `  color: ${c.ink};\n` +
          `  border-color: ${c.rim};\n` +
          `}`,
      )
      .join("\n");

    const tiltRules = TILT.map(
      (t, i) =>
        `.${scope} .fx-ch:nth-child(${nth(6, i)}) { ${vR}: ${t.r}; ${vDy}: ${t.dy}; ${vPj}: ${t.pj}em; }`,
    ).join("\n");

    const css =
      `.${scope} {\n` +
      `  white-space: pre;\n` +
      `  line-height: 1.75;\n` +
      `}\n` +
      `.${scope} .fx-ch {\n` +
      `  display: inline-block;\n` +
      `  vertical-align: middle;\n` +
      `  margin: 0.08em 0.045em;\n` +
      `  padding: calc(${padY}em + var(${vPj}, 0em)) calc(${padX}em + var(${vPj}, 0em));\n` +
      `  border: 1px solid ${chips[0].rim};\n` +
      `  border-radius: 2px;\n` +
      `  background: ${chips[0].bg};\n` +
      `  color: ${chips[0].ink};\n` +
      `  box-shadow: ${shadow}, 0 0 0 1px ${sep}, inset 0 0.05em 0.04em ${sheen};\n` +
      `  transform: translateY(calc(var(${vDy}, 0) * 1em)) rotate(calc(var(${vR}, 0) * ${rot}deg));\n` +
      `}\n` +
      fontRules +
      `\n` +
      paletteRules +
      `\n` +
      tiltRules +
      `\n` +
      // Spaces are word gaps, not scraps: strip the chip styling but keep the glyph width.
      `.${scope} .fx-ch.fx-sp {\n` +
      `  background: transparent;\n` +
      `  border-color: transparent;\n` +
      `  box-shadow: none;\n` +
      `  transform: none;\n` +
      `  padding: 0;\n` +
      `  margin: 0;\n` +
      `}`;

    const parts = splitText(ctx.text, "grapheme");
    const children = parts.map((seg) => {
      const isSpace = seg.trim().length === 0;
      return el("span", {
        attrs: { class: isSpace ? "fx-ch fx-sp" : "fx-ch" },
        children: [text(seg === " " ? " " : seg)],
      });
    });

    return { root: el("div", { children }), css };
  },
};

export default ransomNote;
