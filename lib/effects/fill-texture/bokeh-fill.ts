import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, dropGlow } from "@/lib/engine/helpers";

/**
 * Bokeh light fill: large, SOFT radial-gradient discs — the defocused-circle-of-
 * confusion look of city lights shot through a wide-open lens — clipped into the
 * glyphs over a dark backdrop. Every disc is feathered (no sharp pinpoints, unlike
 * Starfield's crisp stars); each layer drifts at its own lazy speed via a single
 * shared keyframes (per-layer background-size gives each disc its own apparent
 * drift distance), and a couple of discs also breathe in size for a twinkle.
 */

type DiscMode = "warm" | "white" | number; // number = hue offset from the control hue

interface DiscTemplate {
  x: number; // center position, %
  y: number;
  size: number; // background-size, % (large + oversized so drift never reveals a seam)
  mode: DiscMode;
  twinkle: boolean;
  dx: number; // drift offset at the keyframe midpoint, % of slide range
  dy: number;
}

// Nine hand-placed discs; density slices the first N. Index 0/2 are big warm
// "hero" glows, 1 and 3 are flagged to twinkle (kept inside the min density so a
// twinkle is always present), the rest add scattered color + white highlights.
const DISC_TEMPLATES: DiscTemplate[] = [
  { x: 24, y: 30, size: 170, mode: "warm", twinkle: false, dx: 9, dy: -6 },
  { x: 70, y: 20, size: 150, mode: 0, twinkle: true, dx: -12, dy: 8 },
  { x: 82, y: 64, size: 190, mode: "white", twinkle: false, dx: 7, dy: 9 },
  { x: 40, y: 74, size: 140, mode: 40, twinkle: true, dx: -9, dy: -11 },
  { x: 14, y: 58, size: 130, mode: "warm", twinkle: false, dx: 11, dy: 6 },
  { x: 58, y: 44, size: 160, mode: -55, twinkle: false, dx: -8, dy: -7 },
  { x: 90, y: 32, size: 120, mode: "warm", twinkle: false, dx: 6, dy: -9 },
  { x: 30, y: 10, size: 135, mode: "white", twinkle: false, dx: -6, dy: 8 },
  { x: 76, y: 86, size: 145, mode: 90, twinkle: false, dx: 9, dy: -6 },
];

function discHsl(mode: DiscMode, hue: number, theme: "dark" | "light"): [number, number, number] {
  if (theme === "light") {
    // Light theme: warm amber/white orbs ONLY — the multi-hue accents collapse
    // to warm so the fill stays photographic instead of colliding with the page.
    return mode === "white" ? [44, 30, 90] : [35, 82, 60];
  }
  if (mode === "warm") return [34, 88, 63];
  if (mode === "white") return [46, 20, 92];
  return [(hue + mode + 360) % 360, 62, 58];
}

const bokehFill: EffectDefinition = {
  id: "bokeh-fill",
  name: "Bokeh Fill",
  category: "fill-texture",
  tags: ["fill", "texture", "bokeh", "light", "photographic", "city", "glow", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 265, min: 0, max: 360, step: 1, unit: "°" },
    { id: "density", label: "Density", type: "range", default: 6, min: 4, max: 9, step: 1 },
    { id: "speed", label: "Drift Speed", type: "range", default: 14, min: 6, max: 26, step: 1, unit: "s" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    density: R.ri(5, 8),
    speed: R.ri(9, 20),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const density = ctx.values.density as number;
    const speed = ctx.values.speed as number;
    const theme = ctx.theme;

    const discs = DISC_TEMPLATES.slice(0, density);

    // Dark backdrop that stays dark on BOTH themes so the bokeh orbs read against
    // it — desaturated a touch on light theme so the warm discs stay the focal point.
    const baseSat = theme === "light" ? 20 : 42;
    const baseLit = theme === "light" ? [15, 11, 7] : [18, 12, 8];
    const baseTop = hsl(h, baseSat, baseLit[0]);
    const baseMid = hsl((h + 25) % 360, baseSat - 4, baseLit[1]);
    const baseBot = hsl((h + 50) % 360, baseSat - 8, baseLit[2]);
    const baseLayer = `linear-gradient(160deg, ${baseTop} 0%, ${baseMid} 55%, ${baseBot} 100%)`;

    // Each disc is a large, feathered radial-gradient: a soft core fading over a
    // wide band to fully transparent — the defocused circle-of-confusion look.
    // No stop lands at a hard edge, so nothing in the stack reads as a sharp dot.
    const discLayers = discs.map((d) => {
      const [dh, ds, dl] = discHsl(d.mode, h, theme);
      const core = hsl(dh, ds, dl, 0.55);
      const mid = hsl(dh, ds, dl, 0.28);
      return `radial-gradient(circle at ${d.x}% ${d.y}%, ${core} 0%, ${mid} 40%, transparent 76%)`;
    });

    const images = [...discLayers, baseLayer].join(",\n    ");

    const sizeRest = [...discs.map((d) => `${d.size}% ${d.size}%`), "100% 100%"].join(", ");
    const sizeMid = [
      ...discs.map((d) => (d.twinkle ? `${Math.round(d.size * 1.22)}% ${Math.round(d.size * 1.22)}%` : `${d.size}% ${d.size}%`)),
      "100% 100%",
    ].join(", ");

    const posRest = [...discs.map(() => "50% 50%"), "0% 0%"].join(", ");
    const posMid = [...discs.map((d) => `${50 + d.dx}% ${50 + d.dy}%`), "0% 0%"].join(", ");

    const a = anim(ctx.scope, "bokeh");
    const glow = hsl(38, 80, 60, theme === "light" ? 0.3 : 0.42);

    const css =
      `.${ctx.scope} {\n` +
      `  background:\n    ${images};\n` +
      `  background-repeat: no-repeat;\n` +
      `  background-size: ${sizeRest};\n` +
      `  background-position: ${posRest};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  ${dropGlow(glow, [10, 26])}\n` +
      `  animation: ${a} ${speed}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%, 100% { background-position: ${posRest}; background-size: ${sizeRest}; }\n` +
      `  50% { background-position: ${posMid}; background-size: ${sizeMid}; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 1000,
    };
  },
};

export default bokehFill;
