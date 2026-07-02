import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round, clipText, hoverReplay, cloneKeyframes } from "@/lib/engine/helpers";

/**
 * Confetti Burst: a celebration entrance. The word pops in with a scale-overshoot while
 * dozens of tiny colored rectangles and dots explode radially from behind it, spinning and
 * falling under fake gravity as they fade, plus a quick expanding shockwave ring for pop.
 * Two pseudo-element layers each carry a dozen particles as multi-layer background gradients
 * and scale/rotate/drift in opposite directions, so a single transform per layer fakes
 * per-particle chaos convincingly. Distinct from Sparkle Glints (a few flares twinkling in
 * place forever) and Falling Letters (glyphs dropping in) — here the text pops and the
 * PARTICLES fly, once, then settle to clean multi-hue lettering.
 */

/** Party palette derived from a base hue: itself plus warm/cool complements. */
function party(hue: number, theme: "dark" | "light"): string[] {
  const l = theme === "dark" ? 62 : 52;
  const s = theme === "dark" ? 88 : 82;
  return [0, 40, 150, 200, 280, 95].map((o) => hsl((hue + o) % 360, s, l));
}

/** One pseudo-layer's worth of particles: parallel image / position / size lists. A single
 *  whole-layer transform then scales them out from centre and spins them. */
function confetti(
  count: number,
  palette: string[],
  colorOffset: number,
  angleOffset: number,
): { image: string; position: string; size: string } {
  const images: string[] = [];
  const positions: string[] = [];
  const sizes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Golden-angle scatter gives even angular coverage → an even radial explosion.
    const ang = ((i * 137.508 + angleOffset) * Math.PI) / 180;
    const rad = 16 + (i % 5) * 5; // 16–36% from centre (start cluster tightness)
    const x = round(50 + Math.cos(ang) * rad, 1);
    const y = round(50 + Math.sin(ang) * rad, 1);
    const c = palette[(i * 2 + colorOffset) % palette.length];
    if (i % 3 === 0) {
      // Round dot.
      const d = 5 + (i % 4); // 5–8px
      images.push(`radial-gradient(circle at 50% 50%, ${c} 0 54%, transparent 58%)`);
      sizes.push(`${d}px ${d}px`);
    } else {
      // Tiny rectangle (classic confetti flake).
      const w = 5 + (i % 4) * 2; // 5–11px
      const h = 3 + (i % 3); // 3–5px
      images.push(`linear-gradient(${c}, ${c})`);
      sizes.push(`${w}px ${h}px`);
    }
    positions.push(`${x}% ${y}%`);
  }
  return {
    image: images.join(",\n    "),
    position: positions.join(", "),
    size: sizes.join(", "),
  };
}

const confettiBurst: EffectDefinition = {
  id: "confetti-burst",
  name: "Confetti Burst",
  category: "entrance-kinetic",
  tags: ["entrance", "confetti", "burst", "celebration", "party", "pop", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "Layered gradient particles + background-clip:text (all modern browsers)",
  controls: [
    { id: "hue", label: "Palette Hue", type: "range", default: 330, min: 0, max: 360, step: 1, unit: "°" },
    { id: "size", label: "Burst Size", type: "range", default: 7, min: 4, max: 11, step: 0.5 },
    { id: "density", label: "Pieces", type: "range", default: 11, min: 7, max: 14, step: 1 },
    {
      id: "speed",
      label: "Duration",
      type: "range",
      default: 1.1,
      min: 0.7,
      max: 2,
      step: 0.05,
      unit: "s",
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    size: Number(R.rnd(5.5, 8.5).toFixed(1)),
    density: R.ri(9, 14),
    speed: Number(R.rnd(0.9, 1.5).toFixed(2)),
  }),
  build: (ctx) => {
    const hue = ctx.values.hue as number;
    const size = ctx.values.size as number;
    const density = Math.round(ctx.values.density as number);
    const speed = ctx.values.speed as number;
    const scope = ctx.scope;

    const palette = party(hue, ctx.theme);
    const textGrad = `linear-gradient(92deg, ${palette[0]}, ${palette[2]}, ${palette[4]}, ${palette[1]})`;
    const ringColor = hsl(hue, 90, ctx.theme === "dark" ? 72 : 48);

    // Two counter-rotating particle layers of slightly different reach and timing.
    const burstA = size;
    const burstB = round(size * 0.82, 2);
    const ringMax = round(3 + size * 0.32, 1);
    const A = confetti(density, palette, 0, 0);
    const B = confetti(density, palette, 3, 60);

    const popDur = round(Math.min(speed * 0.62, 0.9), 2);
    const durA = round(speed, 2);
    const durB = round(speed * 1.08, 2);
    const ringDur = round(speed * 0.72, 2);

    const popA = anim(scope, "pop");
    const popA2 = anim(scope, "pop-r");
    const confA = anim(scope, "confa");
    const confA2 = anim(scope, "confa-r");
    const confB = anim(scope, "confb");
    const confB2 = anim(scope, "confb-r");
    const ring = anim(scope, "ring");
    const ring2 = anim(scope, "ring-r");

    const css =
      `.${scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  z-index: 0;\n` +
      `}\n` +
      `.${scope} .fx-word {\n` +
      `  display: inline-block;\n` +
      `  position: relative;\n` +
      `  transform-origin: 50% 55%;\n` +
      `  ${clipText(textGrad)}\n` +
      `  animation: ${popA} ${popDur}s cubic-bezier(0.2, 0.7, 0.3, 1) both;\n` +
      `}\n` +
      `.${scope} .fx-word::before {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: 50%;\n` +
      `  top: 50%;\n` +
      `  width: 1em;\n` +
      `  height: 1em;\n` +
      `  margin: -0.5em 0 0 -0.5em;\n` +
      `  border-radius: 50%;\n` +
      `  border: 0.1em solid ${ringColor};\n` +
      `  box-sizing: border-box;\n` +
      `  pointer-events: none;\n` +
      `  transform: scale(0);\n` +
      `  opacity: 0;\n` +
      `  animation: ${ring} ${ringDur}s cubic-bezier(0.1, 0.7, 0.3, 1) both;\n` +
      `}\n` +
      `.${scope}::before,\n.${scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  z-index: -1;\n` +
      `  pointer-events: none;\n` +
      `  background-repeat: no-repeat;\n` +
      `}\n` +
      `.${scope}::before {\n` +
      `  background-image:\n    ${A.image};\n` +
      `  background-position: ${A.position};\n` +
      `  background-size: ${A.size};\n` +
      `  animation: ${confA} ${durA}s cubic-bezier(0.15, 0.6, 0.35, 1) both;\n` +
      `}\n` +
      `.${scope}::after {\n` +
      `  background-image:\n    ${B.image};\n` +
      `  background-position: ${B.position};\n` +
      `  background-size: ${B.size};\n` +
      `  animation: ${confB} ${durB}s cubic-bezier(0.15, 0.6, 0.35, 1) both;\n` +
      `}\n` +
      hoverReplay(scope, " .fx-word", popA2) +
      `\n` +
      hoverReplay(scope, " .fx-word::before", ring2) +
      `\n` +
      hoverReplay(scope, "::before", confA2) +
      `\n` +
      hoverReplay(scope, "::after", confB2);

    const kfPop =
      `@keyframes ${popA} {\n` +
      `  0% { transform: scale(0.5); opacity: 0; }\n` +
      `  55% { transform: scale(1.12); opacity: 1; }\n` +
      `  72% { transform: scale(0.95); opacity: 1; }\n` +
      `  86% { transform: scale(1.03); }\n` +
      `  100% { transform: scale(1); opacity: 1; }\n` +
      `}`;

    const kfConfA =
      `@keyframes ${confA} {\n` +
      `  0% { transform: translateY(0) scale(0.2) rotate(0deg); opacity: 0; }\n` +
      `  10% { opacity: 1; }\n` +
      `  40% { transform: translateY(-5%) scale(${round(burstA * 0.62, 2)}) rotate(120deg); opacity: 1; }\n` +
      `  100% { transform: translateY(26%) scale(${burstA}) rotate(230deg); opacity: 0; }\n` +
      `}`;

    const kfConfB =
      `@keyframes ${confB} {\n` +
      `  0% { transform: translateY(0) scale(0.2) rotate(0deg); opacity: 0; }\n` +
      `  16% { opacity: 1; }\n` +
      `  45% { transform: translateY(-3%) scale(${round(burstB * 0.6, 2)}) rotate(-90deg); opacity: 1; }\n` +
      `  100% { transform: translateY(36%) scale(${burstB}) rotate(-280deg); opacity: 0; }\n` +
      `}`;

    const kfRing =
      `@keyframes ${ring} {\n` +
      `  0% { transform: scale(0); opacity: 0; }\n` +
      `  9% { opacity: 0.9; }\n` +
      `  55% { opacity: 0.45; }\n` +
      `  100% { transform: scale(${ringMax}); opacity: 0; }\n` +
      `}`;

    const base = `${kfPop}\n\n${kfConfA}\n\n${kfConfB}\n\n${kfRing}`;
    const keyframes =
      base +
      `\n\n` +
      cloneKeyframes(base, popA, popA2) +
      `\n\n` +
      cloneKeyframes(base, confA, confA2) +
      `\n\n` +
      cloneKeyframes(base, confB, confB2) +
      `\n\n` +
      cloneKeyframes(base, ring, ring2);

    return {
      root: el("div", {
        children: [el("span", { attrs: { class: "fx-word" }, children: [text(ctx.text)] })],
      }),
      css,
      keyframes,
      loopMs: Math.round(durB * 1000),
    };
  },
};

export default confettiBurst;
