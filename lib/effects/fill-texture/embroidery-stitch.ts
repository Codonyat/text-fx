import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

/**
 * Embroidery satin-stitch: the word sewn in thread. The glyph fill is a tight ~50°
 * repeating-linear-gradient of fine dark/light thread ridges with a thin bright
 * highlight line each period — the alternating sheen that sells real satin floss.
 * A contrasting running-stitch outline is a data-text duplicate stroked in a second
 * thread colour and chopped into dashes by a fine diagonal mask, so it reads as a
 * hand-stitched border around every letter. An optional low-contrast linen backing
 * chip (a two-way woven checker on a padded patch) sits behind the thread. Fully
 * static, and legible on dark and light stages.
 */
const SATIN_ANGLE = 50;

const embroideryStitch: EffectDefinition = {
  id: "embroidery-stitch",
  name: "Embroidery Stitch",
  category: "fill-texture",
  tags: ["embroidery", "stitch", "satin", "thread", "textile", "fill", "texture"],
  caps: ["pure", "dataText"],
  pngSupport: "partial",
  supports:
    "background-clip:text satin ridges + masked -webkit-text-stroke running stitch (all modern browsers, prefixed)",
  controls: [
    { id: "hue", label: "Thread Hue", type: "range", default: 350, min: 0, max: 360, step: 1, unit: "°" },
    { id: "density", label: "Stitch Density", type: "range", default: 62, min: 40, max: 90, step: 1 },
    {
      id: "backing",
      label: "Backing",
      type: "toggle",
      default: true,
      onLabel: "LINEN",
      offLabel: "NONE",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    density: R.ri(48, 78),
    backing: R.chance(0.7),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const d = ctx.values.density as number;
    const backing = ctx.values.backing as boolean;
    const dark = ctx.theme === "dark";

    // --- Satin ridges: fine dark/light thread stripes + a thin sheen highlight. ---
    // Higher density -> tighter ridges.
    const sw = round(1.4 + ((100 - d) / 100) * 2.4, 2); // stripe unit, ~1.4..3.2px
    const hiW = round(Math.max(0.7, sw * 0.45), 2); // sheen line width
    const dk = hsl(h, 60, dark ? 32 : 28);
    const lt = hsl(h, 72, dark ? 60 : 50);
    const hi = hsl(h, 42, dark ? 86 : 80);
    const p1 = round(sw * 2, 2);
    const p2 = round(sw * 2 + hiW, 2);
    const satin =
      `repeating-linear-gradient(${SATIN_ANGLE}deg, ` +
      `${dk} 0 ${sw}px, ${lt} ${sw}px ${p1}px, ${hi} ${p1}px ${p2}px)`;

    // --- Running-stitch outline: a contrasting thread, dashed by a diagonal mask. ---
    const hc = (h + 180) % 360; // complementary floss reads as a distinct second thread
    const stitchCol = hsl(hc, 58, dark ? 70 : 44);
    const strokeW = round(3 + ((100 - d) / 100) * 1.2, 1); // ~3..4.2px (rim ≈ half shows)
    const period = round(6 + ((100 - d) / 100) * 6, 1); // ~6..12px between stitches
    const dashLen = round(period * 0.58, 1);
    const dashMask =
      `repeating-linear-gradient(${SATIN_ANGLE + 90}deg, ` +
      `#000 0 ${dashLen}px, transparent ${dashLen}px ${period}px)`;

    // --- Linen backing: a faint two-way woven checker on a coordinated fabric tint. ---
    const fab = hsl(h, 12, dark ? 18 : 90);
    const weaveLine = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.055)";
    const weave =
      `repeating-linear-gradient(0deg, ${weaveLine} 0 1px, transparent 1px 4px), ` +
      `repeating-linear-gradient(90deg, ${weaveLine} 0 1px, transparent 1px 4px)`;
    const edge = hsl(h, 12, dark ? 10 : 80);
    const lift = dark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.16)";

    let css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  isolation: isolate;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  background: ${satin};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: attr(data-text);\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  z-index: -1;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  -webkit-text-stroke: ${strokeW}px ${stitchCol};\n` +
      `  -webkit-mask: ${dashMask};\n` +
      `  mask: ${dashMask};\n` +
      `  pointer-events: none;\n` +
      `}`;

    if (backing) {
      css +=
        `\n.${ctx.scope}::before {\n` +
        `  content: "";\n` +
        `  position: absolute;\n` +
        `  inset: -0.26em -0.5em;\n` +
        `  z-index: -2;\n` +
        `  border-radius: 0.16em;\n` +
        `  background: ${weave}, ${fab};\n` +
        `  box-shadow: inset 0 0 0 1px ${edge}, 0 6px 16px ${lift};\n` +
        `}`;
    }

    return {
      root: el("div", { attrs: { "data-text": ctx.text }, children: [text(ctx.text)] }),
      css,
    };
  },
};

export default embroideryStitch;
