import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round, pointerSnippet } from "@/lib/engine/helpers";

/**
 * Pointer tilt: the word is a rigid, glossy slab that tilts in real 3D toward the
 * cursor. rotateX/rotateY are derived live from the pointer vars under a perspective,
 * a diagonal specular sheen slides across the letters tracking --mx, and a floating
 * counter-shadow swings opposite the tilt so the card reads as hovering off the page.
 *
 * Percentage→angle/length conversion: the studio feeds --mx/--my as percentages
 * (e.g. "37%"), which cannot be multiplied into a <angle> directly. We divide the
 * offset by `1%` (CSS Values 4 type cancellation → unitless number, supported in
 * modern Chromium/Safari/Firefox) then scale by a per-degree / per-pixel factor.
 */
const pointerTilt: EffectDefinition = {
  id: "pointer-tilt",
  name: "Pointer Tilt",
  category: "threed-depth",
  tags: ["3d", "tilt", "pointer", "interactive", "depth", "card"],
  caps: ["pure", "pointer"],
  pngSupport: "partial",
  supports:
    "Tilts in real 3D toward the cursor via pointer-driven rotateX/rotateY; the static preview shows a resting lean.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 258, min: 0, max: 360, step: 1, unit: "°" },
    { id: "maxTilt", label: "Max Tilt", type: "range", default: 14, min: 4, max: 24, step: 1, unit: "°" },
    { id: "sheen", label: "Sheen", type: "range", default: 65, min: 0, max: 100, step: 1, unit: "%" },
    { id: "shadowDepth", label: "Shadow Depth", type: "range", default: 20, min: 6, max: 40, step: 1, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    maxTilt: R.ri(10, 18),
    sheen: R.ri(45, 80),
    shadowDepth: R.ri(14, 26),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const maxTilt = ctx.values.maxTilt as number;
    const sheen = ctx.values.sheen as number;
    const dep = ctx.values.shadowDepth as number;
    const dark = ctx.theme === "dark";

    // Cursor deviation (-50..50 once divided by 1%) → degrees. ±maxTilt at the edges.
    const k = round(maxTilt / 50, 3);
    const negK = round(-k, 3);

    // Shadow: base downward drop for float + a swing opposite the tilt (px per %-point).
    const sx = round(dep / 120, 4);
    const sy = round(dep / 160, 4);
    const baseY = Math.round(dep * 0.3);
    const blur = Math.round(dep * 0.9);

    const sheenA = round((sheen / 100) * 0.72, 3);

    // Solid slab face: a vertical shade reads as a bevelled card catching overhead light.
    const topFace = dark ? hsl(h, 45, 84) : hsl(h, 62, 56);
    const botFace = dark ? hsl(h, 58, 52) : hsl(h, 66, 34);
    // Colored ambient on dark (a black cast shadow would vanish); soft dark cast on light.
    const shadow = dark ? hsl(h, 70, 56, 0.4) : hsl(h, 40, 22, 0.34);

    const sheenLayer = `linear-gradient(115deg, transparent 35%, hsl(0 0% 100% / ${sheenA}) 50%, transparent 65%)`;
    const faceLayer = `linear-gradient(180deg, ${topFace}, ${botFace})`;

    const tilt =
      `perspective(700px) ` +
      `rotateX(clamp(-${maxTilt}deg, calc((var(--my) - 50%) / 1% * ${k}deg), ${maxTilt}deg)) ` +
      `rotateY(clamp(-${maxTilt}deg, calc((var(--mx) - 50%) / 1% * ${negK}deg), ${maxTilt}deg))`;

    const cast =
      `drop-shadow(` +
      `calc((50% - var(--mx)) / 1% * ${sx}px) ` +
      `calc(${baseY}px + (50% - var(--my)) / 1% * ${sy}px) ` +
      `${blur}px ${shadow})`;

    const css =
      `.${ctx.scope} {\n` +
      // Resting frame: slightly off-centre so posters/SSR already show 3D dimension.
      `  --mx: 42%;\n` +
      `  --my: 38%;\n` +
      `  display: inline-block;\n` +
      `  transform-style: preserve-3d;\n` +
      `  transform: ${tilt};\n` +
      `  background: ${sheenLayer}, ${faceLayer};\n` +
      `  background-size: 250% 100%, 100% 100%;\n` +
      `  background-position: var(--mx) 0, 0 0;\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  filter: ${cast};\n` +
      `  transition: transform 0.12s ease-out, filter 0.12s ease-out, background-position 0.12s ease-out;\n` +
      `  will-change: transform, filter, background-position;\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default pointerTilt;
