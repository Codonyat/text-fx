import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const hardOffset: EffectDefinition = {
  id: "hard-offset",
  name: "Hard Offset",
  category: "shadow-press",
  tags: ["shadow", "hard", "retro", "flat", "offset"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Shadow Hue", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "offset", label: "Offset", type: "range", default: 6, min: 2, max: 20, step: 1, unit: "px" },
    {
      id: "dir",
      label: "Direction",
      type: "toggle",
      default: false,
      onLabel: "RIGHT",
      offLabel: "LEFT",
    },
  ],
  rand: (R) => ({
    hue: R.ri(200, 260),
    offset: R.ri(4, 12),
    dir: R.chance(0.5),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const o = ctx.values.offset as number;
    const dx = ctx.values.dir ? o : -o;
    // Crisp solid text with a flat, fully-opaque hard-edged shadow (blur 0).
    const txt = ctx.theme === "dark" ? hsl(h, 12, 96) : hsl(h, 16, 12);
    const shadow = hsl(h, 50, ctx.theme === "dark" ? 30 : 22);
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${txt};\n` +
      `  text-shadow: ${dx}px ${o}px 0 ${shadow};\n` +
      `}`;
    return { root: el("div", { children: [text(ctx.text)] }), css };
  },
};

export default hardOffset;
