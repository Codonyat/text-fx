import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, clipText, dropGlow } from "@/lib/engine/helpers";

// Glossy text standing on a reflective surface. The real glyphs are filled with
// a vertical gradient; -webkit-box-reflect paints a faded, mirrored copy below,
// masked by a linear-gradient so it dissolves toward the bottom.
const mirrorReflection: EffectDefinition = {
  id: "mirror-reflection",
  name: "Mirror Reflection",
  category: "interactive-advanced",
  tags: ["reflection", "mirror", "gloss", "gradient", "showpiece"],
  caps: ["pure"],
  pngSupport: "partial",
  supports:
    "-webkit-box-reflect (Chrome/Safari/Edge; reflection silently omitted in Firefox) + background-clip:text.",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 205, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "gap",
      label: "Gap",
      type: "range",
      default: 6,
      min: 0,
      max: 24,
      step: 1,
      unit: "px",
    },
    {
      id: "strength",
      label: "Reflection",
      type: "range",
      default: 45,
      min: 10,
      max: 80,
      step: 1,
      unit: "%",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    gap: R.ri(2, 14),
    strength: R.ri(25, 65),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const gap = ctx.values.gap as number;
    const strength = ctx.values.strength as number;

    // Bright top -> deeper bottom for a polished, light-from-above look.
    const top = hsl(h, 90, ctx.theme === "dark" ? 78 : 58);
    const bottom = hsl(h, 95, ctx.theme === "dark" ? 52 : 40);
    const glow = hsl(h, 100, 60);

    // The reflection fades in starting partway down; `strength`/100 sets how
    // opaque the brightest part of the mirrored copy gets.
    const opaque = (strength / 100).toFixed(2);
    const reflectMask = `linear-gradient(transparent 30%, rgba(0,0,0,${opaque}))`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(`linear-gradient(180deg, ${top}, ${bottom})`)}\n` +
      `  ${dropGlow(glow, [10, 26])}\n` +
      `  -webkit-box-reflect: below ${gap}px ${reflectMask};\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default mirrorReflection;
