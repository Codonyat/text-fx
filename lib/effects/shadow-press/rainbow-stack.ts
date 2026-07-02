import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, round } from "@/lib/engine/helpers";

const STEP_PX = 8;

const rainbowStack: EffectDefinition = {
  id: "rainbow-stack",
  name: "Rainbow Stack",
  category: "shadow-press",
  tags: ["shadow", "rainbow", "retro", "offset", "stacked", "poster"],
  caps: ["pure"],
  pngSupport: "good",
  controls: [
    { id: "steps", label: "Steps", type: "range", default: 5, min: 3, max: 7, step: 1 },
    { id: "angle", label: "Angle", type: "angle", default: 45, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "hueSpan",
      label: "Hue Span",
      type: "select",
      default: "full",
      options: [
        { label: "Full Rainbow", value: "full" },
        { label: "Analogous", value: "analogous" },
      ],
    },
    { id: "startHue", label: "Start Hue", type: "range", default: 0, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    steps: R.ri(3, 7),
    angle: R.ri(0, 360),
    hueSpan: R.pick(["full", "analogous"]),
    startHue: R.ri(0, 360),
  }),
  build: (ctx) => {
    const steps = Math.round(ctx.values.steps as number);
    const angle = ctx.values.angle as number;
    const hueSpan = ctx.values.hueSpan as string;
    const startHue = ctx.values.startHue as number;

    // Direction vector for the shadow stack's march.
    const rad = (angle * Math.PI) / 180;
    const sx = Math.cos(rad);
    const sy = Math.sin(rad);

    // "Full" walks the whole wheel across the steps; "Analogous" keeps a tight
    // neighboring-hue walk from the chosen start hue.
    const spanDeg = hueSpan === "analogous" ? 100 : 360;
    const hueStep = spanDeg / steps;

    const sat = 85;
    const light = ctx.theme === "dark" ? 58 : 50;

    // Face stays a neutral, theme-adapted color so the rainbow bands behind it
    // carry all the color — no fade, every step is a distinct flat hue.
    const face = ctx.theme === "dark" ? hsl(0, 4, 96) : hsl(0, 6, 10);

    const layers: string[] = [];
    for (let i = 1; i <= steps; i++) {
      const dist = i * STEP_PX;
      const x = round(dist * sx, 2);
      const y = round(dist * sy, 2);
      const hue = Math.round((startHue + (i - 1) * hueStep + 360) % 360);
      layers.push(`${x}px ${y}px 0 ${hsl(hue, sat, light)}`);
    }

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${face};\n` +
      `  text-shadow:\n    ${layers.join(",\n    ")};\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
    };
  },
};

export default rainbowStack;
