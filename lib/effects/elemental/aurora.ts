import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, clipText } from "@/lib/engine/helpers";

/**
 * Aurora borealis: a green/teal/violet gradient piped through the glyphs
 * (background-clip:text). A registered @property `--hue` animates so the whole
 * palette drifts, while the gradient also slides via background-position — two
 * gentle layers of motion give the curtain-of-light shimmer. Speed-driven,
 * well under 3Hz.
 */
const aurora: EffectDefinition = {
  id: "aurora",
  name: "Aurora",
  category: "elemental",
  tags: ["aurora", "borealis", "gradient", "northern-lights", "animated", "elemental"],
  caps: ["property"],
  pngSupport: "partial",
  supports: "@property + background-clip:text (Chrome/Edge/Safari 16.4+)",
  controls: [
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 8,
      min: 3,
      max: 16,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({ speed: Number(R.rnd(5, 12).toFixed(1)) }),
  build: (ctx) => {
    const speed = ctx.values.speed as number;
    const hueProp = prop(ctx.scope, "hue");
    const aHue = anim(ctx.scope, "hue-drift");
    const aSlide = anim(ctx.scope, "slide");

    // Lightness lifts a touch on light backgrounds so the curtain stays legible.
    const l = ctx.theme === "dark" ? 60 : 50;

    // Aurora palette anchored on the animated --hue: emerald -> teal -> violet,
    // expressed relative to --hue so the whole band drifts together.
    const grad =
      `linear-gradient(115deg,` +
      ` hsl(var(${hueProp}) 90% ${l}%) 0%,` +
      ` hsl(calc(var(${hueProp}) + 35) 95% ${l + 4}%) 28%,` +
      ` hsl(calc(var(${hueProp}) + 90) 85% ${l + 2}%) 55%,` +
      ` hsl(calc(var(${hueProp}) + 150) 90% ${l}%) 80%,` +
      ` hsl(var(${hueProp}) 90% ${l}%) 100%)`;

    // Cool glow keeps gradient/clipped text lit (filter, not text-shadow).
    const glow = hsl(150, 80, 65, 0.45);
    const coolGlow =
      `filter: drop-shadow(0 0 6px ${glow}) drop-shadow(0 0 22px ${glow});`;

    // @property must be salted; start hue in the emerald range (~150).
    const propertyRules =
      `@property ${hueProp} {\n` +
      `  syntax: "<number>";\n` +
      `  inherits: false;\n` +
      `  initial-value: 150;\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${hueProp}: 150;\n` +
      `  ${clipText(grad)}\n` +
      `  background-size: 220% 220%;\n` +
      `  ${coolGlow}\n` +
      `  animation:\n` +
      `    ${aHue} ${speed.toFixed(1)}s ease-in-out infinite alternate,\n` +
      `    ${aSlide} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    const keyframes =
      `@keyframes ${aHue} {\n` +
      `  0% { ${hueProp}: 150; }\n` +
      `  100% { ${hueProp}: 210; }\n` +
      `}\n` +
      `@keyframes ${aSlide} {\n` +
      `  0% { background-position: 0% 50%; }\n` +
      `  50% { background-position: 100% 50%; }\n` +
      `  100% { background-position: 0% 50%; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      // Slide loops every `speed`s; hue alternates (full out-and-back = 2x speed).
      // Both align at one 2x-speed period.
      loopMs: Math.round(speed * 2 * 1000),
    };
  },
};

export default aurora;
