import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, glowShadow } from "@/lib/engine/helpers";

/**
 * Cyberpunk HUD targeting readout: four L-shaped corner brackets frame the word like a
 * fighter-jet lock-on reticle, a bright scan-line sweeps down through the glyphs on a
 * loop, and a small dashed tick strip sits under the baseline like a data readout. The
 * text itself carries a steady cyan/green glow — this is HUD chrome composed AROUND
 * steady text, not a flicker/phosphor treatment on the glyphs themselves.
 */
const tickBandEm = 0.4; // reserved bottom strip (below the bracket frame) for the tick readout
const scanBandEm = 0.85; // thickness of the sweeping scan bar
const scanClearEm = scanBandEm + 0.35; // how far off-box the bar parks at each loop end

/** Eight background-image layers (2 bars x 4 corners) drawing L-shaped corner brackets. */
function cornerBrackets(color: string, arm: number, thick = "2px") {
  const layer = `linear-gradient(${color}, ${color})`;
  const images = Array(8).fill(layer).join(", ");
  const positions = [
    "top left",
    "top left",
    "top right",
    "top right",
    "bottom left",
    "bottom left",
    "bottom right",
    "bottom right",
  ].join(", ");
  const sizes = [
    `${arm}em ${thick}`,
    `${thick} ${arm}em`,
    `${arm}em ${thick}`,
    `${thick} ${arm}em`,
    `${arm}em ${thick}`,
    `${thick} ${arm}em`,
    `${arm}em ${thick}`,
    `${thick} ${arm}em`,
  ].join(", ");
  return { images, positions, sizes };
}

const hudTargeting: EffectDefinition = {
  id: "hud-targeting",
  name: "HUD Targeting",
  category: "retro-themed",
  tags: ["hud", "cyberpunk", "sci-fi", "reticle", "targeting", "scanline", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports:
    "Multi-layer background corner brackets + scanning gradient bar (mix-blend-mode: screen); all modern browsers",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 188, min: 0, max: 360, step: 1, unit: "°" },
    { id: "size", label: "Bracket Size", type: "range", default: 0.5, min: 0.25, max: 0.9, step: 0.01, unit: "em" },
    { id: "inset", label: "Inset", type: "range", default: 0.26, min: 0.1, max: 0.55, step: 0.01, unit: "em" },
    { id: "speed", label: "Scan Speed", type: "range", default: 2.6, min: 1.2, max: 6, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({
    hue: R.ri(140, 205),
    size: Number(R.rnd(0.4, 0.68).toFixed(2)),
    inset: Number(R.rnd(0.18, 0.38).toFixed(2)),
    speed: Number(R.rnd(1.8, 4.2).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const arm = ctx.values.size as number;
    const insetEm = ctx.values.inset as number;
    const speed = ctx.values.speed as number;

    const textColor = ctx.theme === "dark" ? hsl(h, 60, 74) : hsl(h, 68, 30);
    const glowColor = ctx.theme === "dark" ? hsl(h, 85, 60, 0.55) : hsl(h, 70, 45, 0.35);
    const bracketColor = ctx.theme === "dark" ? hsl(h, 85, 64) : hsl(h, 75, 40);
    const tickColor = ctx.theme === "dark" ? hsl(h, 70, 58, 0.75) : hsl(h, 65, 40, 0.65);
    const scanColor = ctx.theme === "dark" ? hsl(h, 45, 92, 0.55) : hsl(h, 60, 55, 0.45);

    const scan = anim(ctx.scope, "scan");
    const frame = `0 0 ${tickBandEm}em 0`; // leaves the bottom strip clear for the tick readout
    const bracketLayers = cornerBrackets(bracketColor, arm);

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  padding: ${insetEm.toFixed(2)}em ${(insetEm + 0.1).toFixed(2)}em ${(insetEm + tickBandEm).toFixed(2)}em;\n` +
      `  color: ${textColor};\n` +
      `  ${glowShadow(glowColor, [2, 7], textColor)}\n` +
      `  background-image: repeating-linear-gradient(90deg, ${tickColor} 0 2px, transparent 2px 7px);\n` +
      `  background-repeat: no-repeat;\n` +
      `  background-size: 100% 2px;\n` +
      `  background-position: left bottom;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  inset: ${frame};\n` +
      `  pointer-events: none;\n` +
      `  background-image: ${bracketLayers.images};\n` +
      `  background-position: ${bracketLayers.positions};\n` +
      `  background-size: ${bracketLayers.sizes};\n` +
      `  background-repeat: no-repeat;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  inset: ${frame};\n` +
      `  pointer-events: none;\n` +
      `  mix-blend-mode: screen;\n` +
      `  background-image: linear-gradient(to bottom, transparent 0%, ${scanColor} 45%, ${scanColor} 55%, transparent 100%);\n` +
      `  background-size: 100% ${scanBandEm}em;\n` +
      `  background-repeat: no-repeat;\n` +
      `  background-position: 0 -${scanClearEm}em;\n` +
      `  animation: ${scan} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${scan} {\n` +
      `  0% { background-position: 0 -${scanClearEm}em; }\n` +
      `  100% { background-position: 0 calc(100% + ${scanClearEm}em); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default hudTargeting;
