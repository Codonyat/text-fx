import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl } from "@/lib/engine/helpers";

const outline: EffectDefinition = {
  id: "outline",
  name: "Outline",
  category: "outline-stroke",
  tags: ["outline", "stroke", "hollow"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke (all modern, prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 220, min: 0, max: 360, step: 1, unit: "°" },
    { id: "width", label: "Stroke", type: "range", default: 2, min: 1, max: 6, step: 0.5, unit: "px" },
    { id: "echo", label: "Echo", type: "toggle", default: false },
  ],
  rand: (R) => ({ hue: R.ri(0, 360), width: R.pick([1.5, 2, 2.5, 3]), echo: R.chance(0.2) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const w = ctx.values.width as number;
    const c = ctx.theme === "dark" ? hsl(h, 55, 66) : hsl(h, 55, 46);
    let body = `  color: transparent;\n  -webkit-text-stroke: ${w}px ${c};`;
    if (ctx.values.echo) {
      const c2 = hsl((h + 45) % 360, 55, 56);
      body += `\n  text-shadow: 6px 6px 0 ${c2};`;
    }
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css: `.${ctx.scope} {\n${body}\n}`,
    };
  },
};

export default outline;
