import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText, pointerSnippet } from "@/lib/engine/helpers";

/**
 * Glare sweep: a polished metal fill with a bright specular highlight that slides to
 * wherever the cursor is, like light catching a chrome plaque. The highlight is a
 * radial white hotspot positioned at --mx/--my over a metal ramp.
 */
const glareSweep: EffectDefinition = {
  id: "glare-sweep",
  name: "Glare Sweep",
  category: "metallic-holographic",
  tags: ["metallic", "pointer", "glare", "specular", "chrome", "interactive"],
  caps: ["pointer"],
  pngSupport: "partial",
  supports: "background-clip:text metal ramp + a pointer-tracked specular hotspot.",
  controls: [
    { id: "hue", label: "Tint", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    { id: "sat", label: "Tint Strength", type: "range", default: 14, min: 0, max: 45, step: 1, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    sat: R.ri(6, 30),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const s = ctx.values.sat as number;
    const dark = ctx.theme === "dark";

    const hi = hsl(h, s, dark ? 90 : 84);
    const mid = hsl(h, s, dark ? 52 : 46);
    const lo = hsl(h, s, dark ? 72 : 66);
    const cast = hsl(h, 30, dark ? 6 : 40, 0.4);

    // A crisp specular glint (not a wash) so it reads as light catching the metal
    // rather than bleaching the glyph centres.
    const glare = `radial-gradient(circle at var(--mx) var(--my), hsl(0 0% 100% / 0.82) 0%, hsl(0 0% 100% / 0) 20%)`;
    const ramp = `linear-gradient(180deg, ${hi} 0%, ${mid} 46%, ${lo} 60%, ${mid} 100%)`;

    // Resting glint sits off-centre so the static poster shows light catching an edge.
    const css =
      `.${ctx.scope} {\n` +
      `  --mx: 33%;\n` +
      `  --my: 30%;\n` +
      `  ${clipText(`${glare}, ${ramp}`)}\n` +
      `  filter: drop-shadow(0 2px 1px ${cast});\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default glareSweep;
