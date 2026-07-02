import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

// Ink presets: bold flat military-crate stencil colors. Lightness is nudged per
// theme (never a hue swap) so each still reads as "the same paint" on dark/light.
const INK: Record<string, (dark: boolean) => string> = {
  olive: (dark) => (dark ? hsl(74, 28, 42) : hsl(74, 42, 24)),
  black: (dark) => (dark ? hsl(40, 8, 90) : hsl(0, 0, 9)),
  yellow: (dark) => (dark ? hsl(48, 100, 58) : hsl(43, 90, 40)),
};

/**
 * A -webkit-mask-image linear-gradient with `n` evenly spaced thin transparent
 * bands (bridge gaps) cut across the text's own box, mimicking the little
 * uncut bridges a real letter stencil needs to hold "island" shapes (like the
 * counter of an "o" or "&") together. Deterministic — no randomness, just `n`.
 */
function bridgeMask(n: number): string {
  const seg = 100 / (n + 1);
  const half = 4; // band half-thickness in %
  const stops: string[] = [];
  let cursor = 0;
  for (let i = 1; i <= n; i++) {
    const c = seg * i;
    const start = round(c - half, 1);
    const end = round(c + half, 1);
    stops.push(`black ${cursor}%`, `black ${start}%`, `transparent ${start}%`, `transparent ${end}%`);
    cursor = end;
  }
  stops.push(`black ${cursor}%`, `black 100%`);
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/**
 * Military crate safety stencil: bold flat spray-ink fill with literal die-cut
 * bridge gaps punched straight through the glyphs (a mask-image on the text
 * layer only), framed by a repeating-linear-gradient hazard-stripe border on
 * the outer box. Deliberately crisp and geometric — no grunge, no texture.
 * Two nested elements: outer div carries the hazard frame (border-image),
 * inner span carries the ink fill + bridge-cut mask, so the frame border
 * itself is never chopped by the glyph mask.
 */
const safetyStencil: EffectDefinition = {
  id: "safety-stencil",
  name: "Safety Stencil",
  category: "retro-themed",
  tags: ["stencil", "military", "crate", "hazard", "industrial", "spray", "bridge-gaps"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "-webkit-mask-image bridge cuts + border-image hazard stripes (all modern browsers)",
  controls: [
    {
      id: "preset",
      label: "Ink",
      type: "select",
      default: "olive",
      options: [
        { label: "Olive Drab", value: "olive" },
        { label: "Stencil Black", value: "black" },
        { label: "Safety Yellow", value: "yellow" },
      ],
    },
    {
      id: "gaps",
      label: "Bridge Gaps",
      type: "select",
      default: "2",
      options: [
        { label: "2 bands", value: "2" },
        { label: "3 bands", value: "3" },
      ],
    },
    { id: "frame", label: "Hazard Frame", type: "toggle", default: true, onLabel: "ON", offLabel: "OFF" },
  ],
  rand: (R) => ({
    preset: R.pick(["olive", "black", "yellow"]),
    gaps: R.pick(["2", "3"]),
    frame: R.chance(0.8),
  }),
  build: (ctx) => {
    const presetKey = (ctx.values.preset as string) in INK ? (ctx.values.preset as string) : "olive";
    const gapCount = ctx.values.gaps === "3" ? 3 : 2;
    const frameOn = Boolean(ctx.values.frame);
    const dark = ctx.theme === "dark";

    const ink = INK[presetKey](dark);
    const mask = bridgeMask(gapCount);

    // Hazard tape stays yellow/black on either theme — that pairing IS the signal.
    const hazardYellow = hsl(48, 96, 50);
    const hazardBlack = hsl(0, 0, 8);
    const frameW = 8;
    const stripe = 10;

    const frameCss = frameOn
      ? `  border-style: solid;\n` +
        `  border-width: ${frameW}px;\n` +
        `  border-color: transparent;\n` +
        `  border-image-source: repeating-linear-gradient(45deg, ${hazardYellow} 0px ${stripe}px, ${hazardBlack} ${stripe}px ${stripe * 2}px);\n` +
        `  border-image-slice: ${frameW};\n` +
        `  border-image-repeat: round;\n`
      : `  border: none;\n`;

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  padding: 0.45em 0.65em;\n` +
      frameCss +
      `}\n` +
      `.${ctx.scope} > span {\n` +
      `  display: inline-block;\n` +
      `  color: ${ink};\n` +
      `  -webkit-mask-image: ${mask};\n` +
      `  mask-image: ${mask};\n` +
      `  -webkit-mask-size: 100% 100%;\n` +
      `  mask-size: 100% 100%;\n` +
      `  -webkit-mask-repeat: no-repeat;\n` +
      `  mask-repeat: no-repeat;\n` +
      `}`;

    return {
      root: el("div", { children: [el("span", { children: [text(ctx.text)] })] }),
      css,
    };
  },
};

export default safetyStencil;
