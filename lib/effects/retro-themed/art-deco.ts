import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

/**
 * Art Deco gold-line lettering: a flat, graphic gold gradient (NOT a shiny liquid-metal
 * ramp — see metallic-holographic/gold-foil.ts for that genre) clipped to the glyphs, a
 * thin dark text-stroke for period-poster edge definition, and a pair of flanking rules
 * above/below the word — each rule a single clip-path polygon that tapers into small
 * diamond terminals at both ends, drawn on ::before/::after so the shape needs no extra
 * markup. A faint conic-gradient sunburst rides as a SECOND background layer clipped to
 * border-box (while the gold gradient layer stays clipped to text) so it reads as a
 * medallion behind the whole word, not just inside the letterforms. Single scoped
 * element only — Studio's live Stage edits this exact node in place, so every visual
 * piece must live on the root's own background/pseudo-elements, never on child markup.
 * Static: 1920s Gatsby-poster restraint, no motion.
 */
const artDeco: EffectDefinition = {
  id: "art-deco",
  name: "Art Deco",
  category: "retro-themed",
  tags: ["retro", "art-deco", "1920s", "gatsby", "gold", "poster", "ornament"],
  caps: ["pure"],
  pngSupport: "partial",
  supports:
    "background-clip:text with a second border-box-clipped layer + clip-path polygon rules (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Gold Hue", type: "range", default: 42, min: 0, max: 200, step: 1, unit: "°" },
    { id: "ruleWeight", label: "Rule Weight", type: "range", default: 2, min: 1, max: 5, step: 0.5, unit: "px" },
    { id: "sunburst", label: "Sunburst", type: "toggle", default: true, onLabel: "On", offLabel: "Off" },
  ],
  rand: (R) => {
    const roll = R();
    const hue = roll < 0.6 ? R.ri(28, 58) : roll < 0.8 ? R.ri(0, 16) : R.ri(150, 195);
    return {
      hue,
      ruleWeight: Number(R.rnd(1.5, 3.5).toFixed(1)),
      sunburst: R.chance(0.75),
    };
  },
  build: (ctx) => {
    const hue = ctx.values.hue as number; // 0 (rose) .. 42 (gold) .. 200 (silver)
    const ruleWeight = ctx.values.ruleWeight as number;
    const sunburstOn = Boolean(ctx.values.sunburst);
    const dark = ctx.theme === "dark";

    // One slider sweeps the metal identity: saturation peaks at the gold center (42)
    // and falls off toward either end, so the far ends read as rose (warm, low hue)
    // and silver (cool, near-grey) without a separate palette control.
    const dist = Math.abs(hue - 42);
    const sat = Math.max(6, Math.round(62 - dist * 0.34));

    const Lh = dark ? 74 : 62; // highlight stop
    const Lm = dark ? 55 : 44; // mid stop
    const Ls = dark ? 40 : 30; // deep stop
    // A flat, graphic 3-stop ramp — deliberately less banded than gold-foil's liquid
    // specular sheen, so the two effects read as different genres side by side.
    const goldGrad =
      `linear-gradient(96deg, ${hsl((hue + 5) % 360, sat, Lh)} 0%, ` +
      `${hsl(hue, sat, Lm)} 48%, ` +
      `${hsl((hue - 4 + 360) % 360, Math.max(sat - 8, 4), Ls)} 100%)`;
    const stroke = hsl((hue - 8 + 360) % 360, Math.min(sat + 18, 78), dark ? 16 : 11);

    const rayAlpha = dark ? 0.16 : 0.11;
    const ray = hsl(hue, Math.min(sat + 6, 60), dark ? 68 : 46, rayAlpha);
    // Repeating conic wedges = evenly spaced sunburst rays (24 of them: 360/15).
    const sunburstGrad = `repeating-conic-gradient(from 0deg, ${ray} 0deg 2.4deg, transparent 2.4deg 15deg)`;

    const railColor = hsl(hue, Math.min(sat + 4, 64), dark ? 58 : 36);

    // Each rule is ONE clip-path polygon: a thin bar whose ends taper into small
    // rotated-square diamonds — a single connected outline, no extra shapes needed.
    const boxH = round(10 + ruleWeight * 2, 1); // diamond terminal size
    const half = round(boxH / 2, 2);
    const bh = round(ruleWeight / 2, 2);
    const far = round(boxH - bh, 2);
    const topY = round(half - bh, 2);
    const botY = round(half + bh, 2);
    const clip =
      `polygon(0px ${half}px, ${half}px 0px, ${far}px ${topY}px, ` +
      `calc(100% - ${far}px) ${topY}px, calc(100% - ${half}px) 0px, 100% ${half}px, ` +
      `calc(100% - ${half}px) ${boxH}px, calc(100% - ${far}px) ${botY}px, ` +
      `${far}px ${botY}px, ${half}px ${boxH}px)`;

    const padV = round(boxH + 10, 0);

    const bgImage = sunburstOn ? `${sunburstGrad}, ${goldGrad}` : goldGrad;
    const bgClip = sunburstOn ? "border-box, text" : "text";

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  position: relative;\n` +
      `  padding: ${padV}px 0.62em;\n` +
      `  background-image: ${bgImage};\n` +
      `  background-clip: ${bgClip};\n` +
      `  -webkit-background-clip: ${bgClip};\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  -webkit-text-stroke: 0.75px ${stroke};\n` +
      `}\n` +
      `.${ctx.scope}::before,\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  right: 0;\n` +
      `  height: ${boxH}px;\n` +
      `  background: ${railColor};\n` +
      `  clip-path: ${clip};\n` +
      `  pointer-events: none;\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `  top: 4px;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  bottom: 4px;\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default artDeco;
