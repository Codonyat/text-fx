import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, prop, dropGlow } from "@/lib/engine/helpers";

const flowingStroke: EffectDefinition = {
  id: "flowing-stroke",
  name: "Flowing Stroke",
  category: "outline-stroke",
  tags: ["outline", "stroke", "gradient", "hollow", "flow", "neon", "animated"],
  caps: ["property"],
  pngSupport: "partial",
  supports: "-webkit-text-stroke + background-clip:text + animated @property <angle> (Chromium/WebKit)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 190, min: 0, max: 360, step: 1, unit: "°" },
    { id: "span", label: "Hue Span", type: "range", default: 150, min: 40, max: 300, step: 5, unit: "°" },
    { id: "speed", label: "Flow", type: "range", default: 7, min: 3, max: 14, step: 0.1, unit: "s" },
    { id: "width", label: "Stroke", type: "range", default: 3, min: 1.5, max: 5, step: 0.5, unit: "px" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    span: R.pick([90, 120, 150, 180, 220]),
    speed: Number(R.rnd(5, 9).toFixed(1)),
    width: R.pick([2.5, 3, 3.5, 4]),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const span = ctx.values.span as number;
    const speed = ctx.values.speed as number;
    const w = ctx.values.width as number;
    const dark = ctx.theme === "dark";

    // The stroke colour cannot itself be a gradient, so the letterform is stroked with a
    // TRANSPARENT stroke and an animated conic gradient is clipped to the text — the clip
    // region includes the stroke band, so the moving gradient shows *inside the outline*.
    // A solid page-matching fill plugs the glyph body, leaving the letters hollow while a
    // neon current circulates around their edges.
    const bg = dark ? "#0a0a0a" : "#fafaf7";
    const sat = 90;
    const lit = dark ? 62 : 50;
    // Palindrome wheel (c0 == last stop) so the rotating conic loops with no visible seam.
    const c0 = hsl(h, sat, lit);
    const c1 = hsl((h + span * 0.5) % 360, sat, lit);
    const c2 = hsl((h + span) % 360, sat, lit);

    const angleVar = prop(ctx.scope, "flow");
    const a = anim(ctx.scope, "current");
    const gradient =
      `conic-gradient(from var(${angleVar}) at 50% 50%, ` +
      `${c0}, ${c1}, ${c2}, ${c1}, ${c0})`;

    const glowHue = (h + span * 0.5) % 360;
    const glow = dark ? hsl(glowHue, 90, 60, 0.35) : hsl(glowHue, 85, 48, 0.22);
    // Stroke is centred on the glyph path, so only the outer half clears the fill plug —
    // double the requested width so the visible ring reads at roughly the chosen size.
    const stroke = (w * 2).toFixed(1);

    const propertyRules =
      `@property ${angleVar} {\n` +
      `  syntax: "<angle>";\n` +
      `  inherits: false;\n` +
      `  initial-value: 0deg;\n` +
      `}`;

    const css =
      `.${ctx.scope} {\n` +
      `  ${angleVar}: 0deg;\n` +
      `  background: ${gradient};\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  color: ${bg};\n` +
      `  -webkit-text-fill-color: ${bg};\n` +
      `  -webkit-text-stroke: ${stroke}px transparent;\n` +
      `  ${dropGlow(glow, [3, 8])}\n` +
      `  animation: ${a} ${speed.toFixed(1)}s linear infinite;\n` +
      `}`;

    const keyframes = `@keyframes ${a} {\n  to { ${angleVar}: 360deg; }\n}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      propertyRules,
      loopMs: speed * 1000,
    };
  },
};

export default flowingStroke;
