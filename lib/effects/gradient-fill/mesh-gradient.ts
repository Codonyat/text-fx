import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Mesh gradient: four soft radial colour blobs over a base, blended into a smooth
 * mesh and clipped to the glyphs. Distinct from the linear/conic fills — no single
 * direction. Optional slow drift moves the whole mesh under the text.
 */
const meshGradient: EffectDefinition = {
  id: "mesh-gradient",
  name: "Mesh Gradient",
  category: "gradient-fill",
  tags: ["gradient", "mesh", "blobs", "soft", "color", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + layered radial-gradient mesh",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 250, min: 0, max: 360, step: 1, unit: "°" },
    { id: "spread", label: "Spread", type: "range", default: 70, min: 20, max: 140, step: 1, unit: "°" },
    { id: "animate", label: "Drift", type: "toggle", default: true, onLabel: "On", offLabel: "Off" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 9,
      min: 4,
      max: 20,
      step: 0.1,
      unit: "s",
      when: (v) => Boolean(v.animate),
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    spread: R.ri(40, 120),
    animate: R.chance(0.7),
    speed: Number(R.rnd(6, 15).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const spread = ctx.values.spread as number;
    const animate = Boolean(ctx.values.animate);
    const speed = ctx.values.speed as number;
    const l = ctx.theme === "dark" ? 62 : 52;

    const c1 = hsl(h, 92, l);
    const c2 = hsl((h + spread) % 360, 92, l + 3);
    const c3 = hsl((h + spread * 2) % 360, 90, l + 1);
    const c4 = hsl((h + spread * 3) % 360, 92, l - 2);
    const base = hsl((h + spread * 1.5) % 360, 80, l);

    const a = anim(ctx.scope, "mesh");
    const animDecl = animate ? `\n  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;` : "";

    const css =
      `.${ctx.scope} {\n` +
      `  background:\n` +
      `    radial-gradient(55% 55% at 18% 22%, ${c1}, transparent 70%),\n` +
      `    radial-gradient(55% 55% at 82% 18%, ${c2}, transparent 70%),\n` +
      `    radial-gradient(60% 60% at 70% 82%, ${c3}, transparent 70%),\n` +
      `    radial-gradient(55% 55% at 25% 78%, ${c4}, transparent 70%),\n` +
      `    ${base};\n` +
      `  background-size: 180% 180%;\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `${animDecl}\n` +
      `}`;

    const keyframes = animate
      ? `@keyframes ${a} {\n` +
        `  0%, 100% { background-position: 0% 50%; }\n` +
        `  50% { background-position: 100% 50%; }\n` +
        `}`
      : undefined;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: animate ? speed * 1000 : undefined,
    };
  },
};

export default meshGradient;
