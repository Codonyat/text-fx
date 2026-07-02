import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim } from "@/lib/engine/helpers";

/**
 * Neon selection: the payoff is dormant until the user drag-selects the text.
 * Resting state is a restrained two-tone heading (hue-tinted text, faint underline,
 * slow low-amplitude glow pulse) that hints at interactivity without shouting. The
 * moment glyphs are selected, `.${scope}::selection` inverts them — background flips
 * to the text's resting hue, foreground flips to a blazing bright tone, and a layered
 * neon text-shadow bloom ignites (renders in Chromium/Safari, where ::selection
 * supports text-shadow).
 */
const neonSelection: EffectDefinition = {
  id: "neon-selection",
  name: "Neon Selection",
  category: "interactive-advanced",
  tags: ["interactive", "neon", "selection", "glow", "animated"],
  caps: ["pure"],
  pngSupport: "good",
  supports: "::selection styling; glow in Chromium & Safari",
  controls: [
    { id: "hue", label: "Hue", type: "range", default: 195, min: 0, max: 360, step: 1, unit: "°" },
    { id: "glow", label: "Selection Glow", type: "range", default: 3, min: 1, max: 6, step: 0.5 },
    { id: "invert", label: "Invert", type: "toggle", default: false, onLabel: "Inverted", offLabel: "Normal" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    glow: Number(R.rnd(2, 5).toFixed(1)),
    invert: R.chance(0.35),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const glow = ctx.values.glow as number;
    const invert = Boolean(ctx.values.invert);
    const dark = ctx.theme === "dark";

    // Resting two-tone treatment: hue-tinted text + a faint underline + a slow,
    // low-amplitude glow pulse — attractive on its own, and a quiet hint to select it.
    const rest = dark ? hsl(h, 55, 76) : hsl(h, 60, 38);
    const restLine = dark ? hsl(h, 70, 62, 0.45) : hsl(h, 70, 42, 0.4);
    const pulseLo = dark ? hsl(h, 60, 60, 0.25) : hsl(h, 65, 45, 0.22);
    const pulseHi = dark ? hsl(h, 70, 65, 0.55) : hsl(h, 70, 48, 0.45);

    // Selection payoff: background flips to the text's resting hue, foreground flips
    // to a blazing bright tone (or vice-versa when inverted), plus a neon bloom.
    const restingHue = dark ? hsl(h, 60, 55) : hsl(h, 65, 42);
    const blazing = hsl(h, 35, 96);
    const g1 = hsl(h, 90, 62);
    const g2 = hsl((h + 24) % 360, 90, 58);
    const selBg = invert ? blazing : restingHue;
    const selFg = invert ? restingHue : blazing;

    const b = (n: number) => Math.round(n * glow * 10) / 10;
    const pulse = anim(ctx.scope, "pulse");

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${rest};\n` +
      `  text-decoration: underline;\n` +
      `  text-decoration-color: ${restLine};\n` +
      `  text-decoration-thickness: 2px;\n` +
      `  text-underline-offset: 0.16em;\n` +
      `  cursor: text;\n` +
      `  animation: ${pulse} 3.2s ease-in-out infinite;\n` +
      `}\n` +
      `.${ctx.scope}::selection,\n` +
      `.${ctx.scope} *::selection {\n` +
      `  background-color: ${selBg};\n` +
      `  color: ${selFg};\n` +
      `  text-shadow:\n` +
      `    0 0 ${b(1.5)}px ${g1},\n` +
      `    0 0 ${b(3)}px ${g1},\n` +
      `    0 0 ${b(5)}px ${g2},\n` +
      `    0 0 ${b(9)}px ${g2};\n` +
      `  text-decoration: none;\n` +
      `}`;

    const keyframes =
      `@keyframes ${pulse} {\n` +
      `  0%, 100% { text-shadow: 0 0 3px ${pulseLo}; }\n` +
      `  50% { text-shadow: 0 0 9px ${pulseHi}, 0 0 16px ${pulseLo}; }\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: 3200,
    };
  },
};

export default neonSelection;
