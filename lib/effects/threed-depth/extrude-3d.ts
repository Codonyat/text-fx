import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

const extrude3d: EffectDefinition = {
  id: "extrude-3d",
  name: "3D Extrude",
  category: "threed-depth",
  tags: ["3d", "extrude", "depth", "shadow"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 210, min: 0, max: 360, step: 1, unit: "°" },
    { id: "depth", label: "Depth", type: "range", default: 10, min: 3, max: 22, step: 1 },
    { id: "dir", label: "Direction", type: "toggle", default: false, onLabel: "RIGHT", offLabel: "LEFT" },
    { id: "float", label: "Float", type: "toggle", default: false },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 3,
      min: 1,
      max: 6,
      step: 0.1,
      unit: "s",
      when: (v) => Boolean(v.float),
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    depth: R.ri(6, 13),
    dir: R.chance(0.5),
    float: R.chance(0.4),
    speed: Number(R.rnd(2, 4).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const n = Math.round(ctx.values.depth as number);
    const dx = ctx.values.dir ? 1 : -1;
    const face = ctx.theme === "dark" ? hsl(h, 82, 72) : hsl(h, 75, 55);
    const dk = ctx.theme === "dark" ? hsl(h, 55, 26) : hsl(h, 48, 38);
    const layers: string[] = [];
    for (let i = 1; i <= n; i++) layers.push(`${i * dx}px ${i}px 0 ${dk}`);
    layers.push(`${(n + 2) * dx}px ${n + 4}px 14px rgba(0,0,0,.4)`);
    const float = Boolean(ctx.values.float);
    const speed = ctx.values.speed as number;
    const a = anim(ctx.scope, "float");
    const animDecl = float ? `\n  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;` : "";
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow:\n    ${layers.join(",\n    ")};` +
      `${animDecl}\n}`;
    const keyframes = float
      ? `@keyframes ${a} {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-10px); }\n}`
      : undefined;
    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: float ? speed * 1000 : undefined,
    };
  },
};

export default extrude3d;
