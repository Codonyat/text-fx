import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, svgId, clipText } from "@/lib/engine/helpers";

/**
 * Frost creep: a warm base word slowly FREEZES over on a long atmospheric loop. A pale
 * blue-white crystalline duplicate — roughened by an SVG turbulence displacement +
 * frost-grain filter — is revealed by a soft, multi-stop gradient mask that sweeps across
 * the glyphs; the displacement filter on the WRAPPER warps that mask edge into an
 * irregular, feathered frost FRONT (mask lives on the inner span, filter on the outer, so
 * the parent filter re-rasterizes and warps the child's masked alpha edge). It holds fully
 * frozen with a pulsing cold glow, then recedes as the word thaws back to warm. Distinct
 * from static Ice (a frozen END STATE) and the clean straight-band Mask Wipe — this is a
 * textured thermal event with a frozen dwell.
 */
const frostCreep: EffectDefinition = {
  id: "frost-creep",
  name: "Frost Creep",
  category: "elemental",
  tags: ["frost", "ice", "freeze", "cold", "mask", "svg", "elemental", "animated"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "Animated mask sweep + SVG feDisplacementMap warp + background-clip:text (all modern)",
  controls: [
    { id: "hue", label: "Frost Hue", type: "range", default: 202, min: 180, max: 230, step: 1, unit: "°" },
    { id: "speed", label: "Freeze Speed", type: "range", default: 10, min: 6, max: 16, step: 0.5, unit: "s" },
    { id: "hold", label: "Hold", type: "range", default: 0.45, min: 0.1, max: 0.9, step: 0.05 },
  ],
  rand: (R) => ({
    hue: R.ri(190, 216),
    speed: Number(R.rnd(8, 13).toFixed(1)),
    hold: Number(R.rnd(0.3, 0.6).toFixed(2)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const hold = ctx.values.hold as number;
    const dark = ctx.theme === "dark";

    // Freeze-in reaches full frost at 30%; the frozen dwell scales with the Hold bias,
    // then the front recedes (thaw) back to bare over the rest of the cycle.
    const advanceEnd = 30;
    const holdEnd = Math.min(advanceEnd + Math.round(14 + hold * 46), 84);

    // Warm "unfrozen" base — a fixed amber that reads on both themes and contrasts the ice.
    const warm = dark ? hsl(32, 88, 66) : hsl(28, 92, 44);

    // Pale blue-white crystalline fill; deeper + saturated on light so it stays legible.
    const top = dark ? hsl(h, 55, 97) : hsl(h, 66, 82);
    const mid = dark ? hsl(h, 72, 88) : hsl(h, 80, 70);
    const low = dark ? hsl(h, 82, 80) : hsl(h, 86, 58);
    const stroke = dark ? hsl(h, 40, 100, 0.5) : hsl(h, 60, 55, 0.85);

    // Cold glow that pulses in with the freeze (same colour, alpha 0 -> on -> 0 for a
    // perfectly smooth single-drop-shadow interpolation).
    const glowS = dark ? 95 : 85;
    const glowL = dark ? 80 : 62;
    const glowA = dark ? 0.6 : 0.5;
    const glowOn = hsl(h, glowS, glowL, glowA);
    const glowOff = hsl(h, glowS, glowL, 0);

    const a = anim(ctx.scope, "freeze");
    const fid = svgId(ctx.scope, "frost");

    // Soft, multi-stop feathered front. The wrapper's displacement filter breaks this
    // otherwise-straight boundary into an irregular crystalline edge.
    const mask =
      "linear-gradient(105deg, #000 30%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 55%, transparent 66%)";

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  color: ${warm};\n` +
      `}\n` +
      `.${ctx.scope} .fx-frost-wrap {\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  pointer-events: none;\n` +
      `  filter: url(#${fid});\n` +
      `}\n` +
      `.${ctx.scope} .fx-frost {\n` +
      `  display: block;\n` +
      `  ${clipText(`linear-gradient(165deg, ${top} 0%, ${mid} 48%, ${low} 100%)`)}\n` +
      `  -webkit-text-stroke: 0.6px ${stroke};\n` +
      `  -webkit-mask-image: ${mask};\n` +
      `  mask-image: ${mask};\n` +
      `  -webkit-mask-size: 320% 100%;\n` +
      `  mask-size: 320% 100%;\n` +
      `  -webkit-mask-repeat: no-repeat;\n` +
      `  mask-repeat: no-repeat;\n` +
      `  animation: ${a} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `}`;

    // One animation drives both the creeping mask front and the cold glow.
    const step = (label: string, pos: string, blur: string, glow: string) =>
      `  ${label} { -webkit-mask-position: ${pos}; mask-position: ${pos}; filter: drop-shadow(0 0 ${blur} ${glow}); }`;

    const keyframes =
      `@keyframes ${a} {\n` +
      step("0%", "130% 0", "0", glowOff) + "\n" +
      step(`${advanceEnd}%`, "-30% 0", "9px", glowOn) + "\n" +
      step(`${holdEnd}%`, "-30% 0", "9px", glowOn) + "\n" +
      step("100%", "130% 0", "0", glowOff) + "\n" +
      `}`;

    // Low-freq turbulence displaces the masked frost into an organic front; a high-freq
    // fractal grain, confined to the frost pixels, dusts on crystalline texture. Seeds
    // fixed (parity-safe); id salted.
    const defs =
      `<filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.015 0.02" numOctaves="2" seed="4" result="warp"/>\n` +
      `  <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="disp"/>\n` +
      `  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" stitchTiles="stitch" result="grain"/>\n` +
      `  <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0" result="frostGrain"/>\n` +
      `  <feComposite in="frostGrain" in2="disp" operator="in" result="grained"/>\n` +
      `  <feMerge>\n    <feMergeNode in="disp"/>\n    <feMergeNode in="grained"/>\n  </feMerge>\n` +
      `</filter>`;

    return {
      root: el("div", {
        children: [
          text(ctx.text),
          el("span", {
            attrs: { class: "fx-frost-wrap", "aria-hidden": "true" },
            children: [
              el("span", { attrs: { class: "fx-frost" }, children: [text(ctx.text)] }),
            ],
          }),
        ],
      }),
      css,
      keyframes,
      defs,
      loopMs: speed * 1000,
    };
  },
};

export default frostCreep;
