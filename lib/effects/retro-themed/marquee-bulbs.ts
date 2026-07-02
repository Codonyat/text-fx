import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText } from "@/lib/engine/helpers";

/**
 * Cinema marquee bulb-chase: warm gold gradient lettering sits between two
 * incandescent-bulb strips (::before top, ::after bottom). Each strip is a
 * stack of three tiled radial-gradient layers — a small always-on "socket"
 * dot, plus a brighter bulb (with its own soft glow ring) that only occupies
 * every OTHER socket. Animating the bright/glow layers' background-position
 * with `steps(2, end)` snaps between the even- and odd-socket subsets, so
 * alternating bulbs pop on/off in discrete jumps — the classic Broadway
 * chase — never a smooth slide. Unlike neon-sign-frame's single continuous
 * glowing tube outline, nothing here is a tube: it's discrete incandescent
 * dots on a repeating grid. `frame` toggles a boxed marquee cabinet
 * (background + border behind the strips) vs. bare floating bulb rows.
 */
const marqueeBulbs: EffectDefinition = {
  id: "marquee-bulbs",
  name: "Marquee Bulbs",
  category: "retro-themed",
  tags: ["marquee", "bulbs", "chase", "broadway", "cinema", "retro", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "background-clip:text + repeating radial-gradient bulb strips (steps() chase)",
  controls: [
    { id: "hue", label: "Bulb Hue", type: "range", default: 42, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "speed",
      label: "Chase",
      type: "range",
      default: 0.16,
      min: 0.06,
      max: 0.4,
      step: 0.01,
      unit: "s",
    },
    { id: "frame", label: "Cabinet", type: "toggle", default: true, onLabel: "Boxed", offLabel: "Strips" },
  ],
  rand: (R) => ({
    hue: R.ri(18, 55),
    speed: Number(R.rnd(0.1, 0.28).toFixed(2)),
    frame: R.chance(0.65),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const framed = Boolean(ctx.values.frame);

    // Bulb-socket grid: P = spacing between every socket; lit bulbs occupy
    // only every other socket (background-size 2P), so the chase toggles
    // between the even- and odd-indexed sockets.
    const P = 26;
    const bandH = 22;
    const half = P / 2;

    const bulbCore = "#fff8e2";
    const bulbRim = hsl(h, 92, 66);
    const bulbEdge = hsl(h, 88, 46);
    const glowColor = hsl(h, 100, 60, 0.55);
    const dimSocket = ctx.theme === "dark" ? hsl(h, 30, 22) : hsl(h, 28, 60);

    const frameBg = ctx.theme === "dark" ? hsl(h - 15, 42, 9) : hsl(h - 15, 35, 88);
    const frameLine = ctx.theme === "dark" ? hsl(h, 30, 26) : hsl(h, 24, 52);
    const frameInset = ctx.theme === "dark" ? hsl(h, 20, 3, 0.8) : hsl(h, 20, 98, 0.8);
    const frameShadow = ctx.theme === "dark" ? hsl(h - 20, 40, 3, 0.5) : hsl(h - 20, 30, 40, 0.28);

    // Warm gold gradient fill for the lettering, plus a directional
    // drop-shadow "bevel" (highlight above, dark below) — text-shadow is
    // invisible on clipped/transparent-fill text, so the bevel comes from
    // the filter stack instead (glow guard).
    const goldGradient =
      `linear-gradient(180deg, ${hsl(h + 8, 82, 88)} 0%, ${hsl(h, 78, 62)} 32%, ` +
      `${hsl(h - 8, 70, 38)} 58%, ${hsl(h, 76, 56)} 100%)`;
    const bevelHi = hsl(h + 10, 65, 92, 0.6);
    const bevelLo = hsl(h - 14, 55, 10, 0.55);

    const a = anim(ctx.scope, "chase");

    const bulbLayers =
      `radial-gradient(circle, ${bulbCore} 0, ${bulbRim} 3px, ${bulbEdge} 6px, transparent 9px),\n` +
      `    radial-gradient(circle, ${glowColor} 0, transparent 13px),\n` +
      `    radial-gradient(circle, ${dimSocket} 0, ${dimSocket} 2px, transparent 4px)`;
    const bulbSizes = `${2 * P}px ${bandH}px, ${2 * P}px ${bandH}px, ${P}px ${bandH}px`;
    const posStart = `-${half}px 0, -${half}px 0, 0 0`;
    const posEnd = `${half}px 0, ${half}px 0, 0 0`;

    const stripBase =
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 0;\n` +
      `  right: 0;\n` +
      `  height: ${bandH}px;\n` +
      `  pointer-events: none;\n` +
      `  background-image: ${bulbLayers};\n` +
      `  background-size: ${bulbSizes};\n` +
      `  background-repeat: repeat-x;\n` +
      `  background-position: ${posStart};\n` +
      `  animation: ${a} ${(speed * 2).toFixed(2)}s steps(2, end) infinite;\n`;

    const cabinet = framed
      ? `  background: ${frameBg};\n` +
        `  border: 3px solid ${frameLine};\n` +
        `  border-radius: 8px;\n` +
        `  box-shadow: inset 0 0 0 1px ${frameInset}, 0 6px 20px ${frameShadow};\n`
      : "";

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  padding: ${bandH + 8}px ${Math.round(P * 1.15)}px;\n` +
      `${cabinet}` +
      `  ${clipText(goldGradient)}\n` +
      `  filter: drop-shadow(0 1px 0 ${bevelHi}) drop-shadow(0 2px 1px ${bevelLo});\n` +
      `}\n` +
      `.${ctx.scope}::before {\n` +
      `${stripBase}` +
      `  top: 0;\n` +
      `  border-radius: 6px 6px 0 0;\n` +
      `}\n` +
      `.${ctx.scope}::after {\n` +
      `${stripBase}` +
      `  bottom: 0;\n` +
      `  border-radius: 0 0 6px 6px;\n` +
      `}`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { background-position: ${posStart}; }\n` +
      `  100% { background-position: ${posEnd}; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: speed * 2 * 1000,
    };
  },
};

export default marqueeBulbs;
