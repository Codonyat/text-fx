import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText, dropGlow } from "@/lib/engine/helpers";

const vaporwave: EffectDefinition = {
  id: "vaporwave",
  name: "Vaporwave",
  category: "retro-themed",
  tags: ["vaporwave", "retro", "80s", "gradient", "glow", "synthwave", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text (all modern, -webkit- prefixed)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 320, min: 0, max: 360, step: 1, unit: "°" },
    { id: "glow", label: "Glow", type: "range", default: 5, min: 0, max: 36, step: 1, unit: "px" },
    { id: "animate", label: "Animate", type: "toggle", default: false },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 16,
      min: 3,
      max: 24,
      step: 0.1,
      unit: "s",
      when: (v) => Boolean(v.animate),
    },
  ],
  rand: (R) => ({
    hue: R.ri(280, 340),
    glow: R.ri(2, 8),
    animate: R.chance(0.25),
    speed: Number(R.rnd(14, 20).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const glow = ctx.values.glow as number;
    const animate = Boolean(ctx.values.animate);
    const speed = ctx.values.speed as number;

    // Pink -> cyan gradient, anchored around the chosen hue.
    const pink = hsl(h, 58, 68);
    const magenta = hsl((h + 18) % 360, 56, 62);
    const cyan = hsl((h + 160) % 360, 55, 66);

    // Glow color picks the warm (pink) end so the halo reads on either theme.
    const glowColor = ctx.theme === "dark" ? hsl(h, 60, 62, 0.45) : hsl(h, 55, 52, 0.35);

    const a = anim(ctx.scope, "drift");
    const animDecl = animate ? `\n  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;` : "";

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(`linear-gradient(115deg, ${pink} 0%, ${magenta} 40%, ${cyan} 100%)`)}\n` +
      `  background-size: 200% 100%;\n` +
      `  ${dropGlow(glowColor, glow > 0 ? [glow] : [0])}` +
      `${animDecl}\n}`;

    const keyframes = animate
      ? `@keyframes ${a} {\n` +
        `  0% { background-position: 0% 50%; }\n` +
        `  50% { background-position: 100% 50%; }\n` +
        `  100% { background-position: 0% 50%; }\n}`
      : undefined;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: animate ? speed * 1000 : undefined,
    };
  },
};

export default vaporwave;
