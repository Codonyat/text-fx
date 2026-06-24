import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

const highlighter: EffectDefinition = {
  id: "highlighter",
  name: "Highlighter",
  category: "decoration-underline",
  tags: ["underline", "decoration", "highlight", "marker", "animated"],
  caps: ["pure"],
  pngSupport: "good",
  supports: "background-size width animation (all modern browsers)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 56, min: 0, max: 360, step: 1, unit: "°" },
    { id: "band", label: "Band Height", type: "range", default: 55, min: 25, max: 100, step: 1, unit: "%" },
    { id: "speed", label: "Speed", type: "range", default: 1.6, min: 0.5, max: 4, step: 0.1, unit: "s" },
  ],
  rand: (R) => ({
    hue: R.pick([48, 56, 90, 170, 320]),
    band: R.ri(40, 70),
    speed: Number(R.rnd(1, 2.6).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const band = ctx.values.band as number;
    const speed = ctx.values.speed as number;
    // Marker ink reads on either theme; text stays high-contrast against it.
    const ink = hsl(h, 95, ctx.theme === "dark" ? 60 : 72, 0.85);
    const txt = ctx.theme === "dark" ? hsl(h, 30, 8) : hsl(h, 60, 14);
    const wipe = anim(ctx.scope, "wipe");
    const top = (100 - band).toFixed(0);
    const css =
      `.${ctx.scope} {\n` +
      `  display: inline;\n` +
      `  color: ${txt};\n` +
      `  padding: 0 0.12em;\n` +
      // The band is a vertical slice of the gradient anchored to the lower text.
      `  background-image: linear-gradient(${ink}, ${ink});\n` +
      `  background-repeat: no-repeat;\n` +
      `  background-position: 0 ${top}%;\n` +
      `  background-size: 0% ${band}%;\n` +
      `  box-decoration-break: clone;\n` +
      `  -webkit-box-decoration-break: clone;\n` +
      `  animation: ${wipe} ${speed.toFixed(1)}s ease-out infinite alternate;\n` +
      `}`;
    const keyframes =
      `@keyframes ${wipe} {\n` +
      `  0% { background-size: 0% ${band}%; }\n` +
      `  60%, 100% { background-size: 100% ${band}%; }\n` +
      `}`;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      // alternate: full visual cycle is wipe-in then wipe-out.
      loopMs: Math.round(speed * 2000),
    };
  },
};

export default highlighter;
