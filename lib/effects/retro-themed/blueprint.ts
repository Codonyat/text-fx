import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

// Fixed drawing-sheet geometry (px, not user-tunable — keeps the dimension line
// and tick marks mathematically aligned with the panel's own padding).
const PAD_TOP = 26;
const PAD_X = 40;
const PAD_BOTTOM = 34;
const DIM_Y = 14; // dashed dimension line's distance from the panel's bottom edge
const TICK_H = 10; // height of the extension ticks straddling the dimension line

/**
 * Blueprint: engineering-drawing lettering. Hollow hairline-stroked glyphs (transparent
 * fill + -webkit-text-stroke) sit as line-art on a deep cyanotype-blue drawing-sheet
 * panel — the panel (padding + background) is part of the effect, not just the text.
 * A faint graph-paper grid (two crossed repeating-linear-gradients) fills the sheet,
 * small corner registration marks (::before/::after border-segment brackets) sit at
 * the top-left/bottom-right corners, and an optional dashed dimension line with
 * extension ticks runs under the baseline. On a light stage the process inverts to
 * navy ink on pale drafting paper — the historical diazo "whiteprint" pairing. Static.
 */
const blueprint: EffectDefinition = {
  id: "blueprint",
  name: "Blueprint",
  category: "retro-themed",
  tags: ["blueprint", "technical", "schematic", "engineering", "grid", "stroke", "drafting"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke line-art over layered CSS gradients (all modern, prefixed)",
  controls: [
    { id: "hue", label: "Line Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "grid", label: "Grid Density", type: "range", default: 22, min: 12, max: 44, step: 2, unit: "px" },
    { id: "dimLine", label: "Dimension Line", type: "toggle", default: true, onLabel: "On", offLabel: "Off" },
  ],
  rand: (R) => ({
    // Mostly the classic cyanotype cyan-white tint; occasionally a different diazo ink.
    hue: R.chance(0.7) ? R.ri(172, 206) : R.ri(0, 360),
    grid: R.pick([16, 18, 22, 26, 32, 36]),
    dimLine: R.chance(0.85),
  }),
  build: (ctx) => {
    const hue = ctx.values.hue as number;
    const cell = ctx.values.grid as number;
    const dimLineOn = Boolean(ctx.values.dimLine);
    const dark = ctx.theme === "dark";

    // Dark stage: deep cyanotype-blue sheet, pale cyan-white ink line-art.
    // Light stage: inverted — pale drafting paper, navy ink (the diazo whiteprint pairing).
    const panelColor = dark ? hsl(212, 60, 20) : hsl(38, 32, 96);
    const lineColor = dark ? hsl(hue, 28, 92) : hsl(hue, 55, 24);
    const gridColor = dark ? hsl(hue, 30, 85, 0.16) : hsl(hue, 45, 35, 0.14);
    const borderColor = dark ? hsl(hue, 28, 80, 0.4) : hsl(hue, 40, 30, 0.3);

    const layers: string[] = [
      `repeating-linear-gradient(0deg, ${gridColor} 0, ${gridColor} 1px, transparent 1px, transparent ${cell}px)`,
      `repeating-linear-gradient(90deg, ${gridColor} 0, ${gridColor} 1px, transparent 1px, transparent ${cell}px)`,
    ];

    if (dimLineOn) {
      layers.push(
        `repeating-linear-gradient(90deg, ${lineColor} 0 5px, transparent 5px 10px) ${PAD_X}px calc(100% - ${DIM_Y}px) / calc(100% - ${PAD_X * 2}px) 1px no-repeat`,
        `linear-gradient(${lineColor}, ${lineColor}) ${PAD_X}px calc(100% - ${DIM_Y + TICK_H / 2}px) / 1px ${TICK_H}px no-repeat`,
        `linear-gradient(${lineColor}, ${lineColor}) calc(100% - ${PAD_X}px) calc(100% - ${DIM_Y + TICK_H / 2}px) / 1px ${TICK_H}px no-repeat`,
      );
    }

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  padding: ${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px;\n` +
      `  background: ${layers.join(",\n    ")};\n` +
      `  background-color: ${panelColor};\n` +
      `  box-shadow: inset 0 0 0 1px ${borderColor}, 0 10px 26px rgba(0, 0, 0, 0.32);\n` +
      `  color: transparent;\n` +
      `  -webkit-text-stroke: 1.25px ${lineColor};\n` +
      `  line-height: 1.15;\n` +
      `}\n` +
      `.${ctx.scope}::before,\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  width: 13px;\n` +
      `  height: 13px;\n` +
      `  border: 1px solid ${lineColor};\n` +
      `  opacity: 0.55;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  top: 8px;\n` +
      `  left: 8px;\n` +
      `  border-right: none;\n` +
      `  border-bottom: none;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  bottom: 8px;\n` +
      `  right: 8px;\n` +
      `  border-left: none;\n` +
      `  border-top: none;\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default blueprint;
