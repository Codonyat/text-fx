import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, glowShadow, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * CRT power collapse: an old tube TV switching ON as an entrance. The word starts
 * pinched to a blinding horizontal line (scaleY near 0), flickers, then snaps open
 * with a fast vertical overshoot (plus a brief wide scaleX punch) before settling
 * into crisp, phosphor-tinted resting text. A thin bright bar flashes at the
 * collapse line during the first frames, pure geometry — no persistent scanlines
 * or flicker once it lands (see terminal-phosphor / scanline-glitch for those).
 */
const crtCollapse: EffectDefinition = {
  id: "crt-collapse",
  name: "CRT Collapse",
  category: "glitch-distortion",
  tags: ["crt", "glitch", "entrance", "power-on", "flash", "retro", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "filter brightness + transform scale entrance (all modern browsers)",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 150, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Speed",
      type: "range",
      default: 1,
      min: 0.5,
      max: 2,
      step: 0.1,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.pick([150, 130, 45, 195, 265, 5, 320]),
    speed: Number(R.rnd(0.7, 1.6).toFixed(1)),
  }),
  build: (ctx) => {
    const hue = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const dur = speed.toFixed(1);

    // Phosphor-tinted resting text: bright on dark, deep-saturated on light.
    const textColor = ctx.theme === "dark" ? hsl(hue, 35, 90) : hsl(hue, 60, 24);
    const glowColor = hsl(hue, 70, 60);
    // The power-on flash bar reads as a hot near-white line on either theme.
    const barColor = hsl(hue, 55, 92);

    const a = anim(ctx.scope, "power");
    const a2 = anim(ctx.scope, "power-r"); // hover replays the power-on entrance
    const aBar = anim(ctx.scope, "bar");
    const aBar2 = anim(ctx.scope, "bar-r");

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  color: ${textColor};\n` +
      `  ${glowShadow(glowColor, [2, 6])}\n` +
      `  transform-origin: center;\n` +
      `  will-change: transform, filter;\n` +
      `  animation: ${a} ${dur}s cubic-bezier(.16,.84,.32,1) both;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  top: 50%;\n` +
      `  width: 100%;\n` +
      `  height: .14em;\n` +
      `  background: ${barColor};\n` +
      `  box-shadow: 0 0 .5em ${barColor}, 0 0 1.2em ${glowColor};\n` +
      `  transform: translateY(-50%) scaleX(.2);\n` +
      `  transform-origin: center;\n` +
      `  pointer-events: none;\n` +
      `  animation: ${aBar} ${dur}s steps(1, jump-end) both;\n` +
      `}\n` +
      hoverReplay(ctx.scope, "", a2) +
      "\n" +
      hoverReplay(ctx.scope, "::after", aBar2);

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0%   { opacity: 1; transform: scaleY(.02) scaleX(1); filter: brightness(7) saturate(1.6); }\n` +
      `  4%   { opacity: .5; transform: scaleY(.02) scaleX(1); filter: brightness(1.2) saturate(1); }\n` +
      `  8%   { opacity: 1; transform: scaleY(.02) scaleX(1.02); filter: brightness(8) saturate(1.7); }\n` +
      `  14%  { opacity: 1; transform: scaleY(.02) scaleX(1.02); filter: brightness(4.5) saturate(1.3); }\n` +
      `  30%  { opacity: 1; transform: scaleY(1.24) scaleX(1.16); filter: brightness(2.4) saturate(1.1); }\n` +
      `  44%  { opacity: 1; transform: scaleY(.9) scaleX(.96); filter: brightness(1.7); }\n` +
      `  58%  { opacity: 1; transform: scaleY(1.05) scaleX(1.02); filter: brightness(1.3); }\n` +
      `  72%  { opacity: 1; transform: scaleY(.99) scaleX(.995); filter: brightness(1.55); }\n` +
      `  100% { opacity: 1; transform: scaleY(1) scaleX(1); filter: brightness(1); }\n` +
      `}\n` +
      `@keyframes ${aBar} {\n` +
      `  0%   { opacity: 0; transform: translateY(-50%) scaleX(.2); }\n` +
      `  3%   { opacity: 1; transform: translateY(-50%) scaleX(.45); }\n` +
      `  6%   { opacity: .25; transform: translateY(-50%) scaleX(.6); }\n` +
      `  8%   { opacity: 1; transform: translateY(-50%) scaleX(.9); }\n` +
      `  14%  { opacity: 1; transform: translateY(-50%) scaleX(1); }\n` +
      `  22%  { opacity: 0; transform: translateY(-50%) scaleX(1); }\n` +
      `  100% { opacity: 0; transform: translateY(-50%) scaleX(1); }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes:
        `${keyframes}\n` +
        `${cloneKeyframes(keyframes, a, a2)}\n` +
        `${cloneKeyframes(keyframes, aBar, aBar2)}`,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default crtCollapse;
