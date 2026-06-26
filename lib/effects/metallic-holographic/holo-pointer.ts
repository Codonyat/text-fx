import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, dropGlow, pointerSnippet } from "@/lib/engine/helpers";

/**
 * Pointer holographic: an iridescent foil whose oversized gradient is repositioned by
 * the cursor (--mx/--my drive background-position), so the hue bands tilt and shimmer
 * as if catching the light at different angles. The pointer-reactive holographic foil.
 */
const holoPointer: EffectDefinition = {
  id: "holo-pointer",
  name: "Pointer Holographic",
  category: "metallic-holographic",
  tags: ["holographic", "iridescent", "pointer", "foil", "interactive"],
  caps: ["pointer"],
  pngSupport: "partial",
  supports: "background-clip:text iridescent foil with pointer-driven background-position.",
  controls: [
    { id: "hue", label: "Base Hue", type: "range", default: 280, min: 0, max: 360, step: 1, unit: "°" },
    { id: "range", label: "Tilt Range", type: "range", default: 260, min: 140, max: 360, step: 10, unit: "%" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    range: R.ri(180, 340),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const range = ctx.values.range as number;
    const l = ctx.theme === "dark" ? 60 : 56;

    const c0 = hsl(h, 60, l);
    const c1 = hsl((h + 55) % 360, 60, l + 4);
    const c2 = hsl((h + 130) % 360, 60, l);
    const c3 = hsl((h + 210) % 360, 60, l + 2);
    const c4 = hsl((h + 300) % 360, 60, l);
    const glow = hsl((h + 130) % 360, 60, 62, 0.4);

    const foil = `linear-gradient(115deg, ${c0}, ${c1}, ${c2}, ${c3}, ${c4}, ${c0})`;
    // A pointer-tracked specular glint over the panning foil makes even the still
    // frame read as iridescent metal rather than a frozen linear gradient.
    const glint = `radial-gradient(circle at var(--mx) var(--my), hsl(0 0% 100% / 0.5) 0%, hsl(0 0% 100% / 0) 22%)`;

    const css =
      `.${ctx.scope} {\n` +
      `  --mx: 32%;\n` +
      `  --my: 36%;\n` +
      `  background: ${glint}, ${foil};\n` +
      `  background-size: 100% 100%, ${range}% ${range}%;\n` +
      `  background-position: 0% 0%, var(--mx) var(--my);\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  ${dropGlow(glow, [10])}\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      runtime: "pointerVars",
      runtimeSnippet: pointerSnippet(ctx.scope),
    };
  },
};

export default holoPointer;
