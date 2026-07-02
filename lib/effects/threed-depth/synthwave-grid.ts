import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText, dropGlow } from "@/lib/engine/helpers";

/**
 * Synthwave Grid: the full 80s album-cover scene, not just a palette. Three layers
 * stacked in one self-contained dark poster:
 *   1. A chrome→sunset headline (cool chrome top, a bright horizon SPLIT line through
 *      the letters, then an orange→pink→violet sunset ramp) leaning back on its own
 *      perspective — the classic Outrun logo. Clipped to the glyphs, so the glow is a
 *      drop-shadow (glow guard), and lives on an inner .fx-txt span so its filter/tilt
 *      stay off the scenery.
 *   2. A neon PERSPECTIVE GRID FLOOR (::after) — cyan verticals + magenta horizontals
 *      as two repeating-linear-gradients under perspective(rotateX), whose horizontal
 *      lines SCROLL toward the viewer forever (driving into the sunset) and fade into a
 *      glowing horizon via a mask.
 *   3. A deep-sky backdrop (::before) with an optional glowing sun disc and a soft
 *      horizon band behind the text.
 * The poster paints its own dark sky on BOTH themes, so the neon reads everywhere.
 * Diverges hard from `vaporwave` (flat pink-cyan gradient, no scene) — this is a world.
 */
const synthwaveGrid: EffectDefinition = {
  id: "synthwave-grid",
  name: "Synthwave Grid",
  category: "threed-depth",
  tags: ["synthwave", "retro", "80s", "grid", "sunset", "neon", "3d", "outrun", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "3D perspective transforms + background-clip:text + CSS mask (all modern browsers)",
  controls: [
    { id: "hue", label: "Palette", type: "range", default: 0, min: 0, max: 360, step: 1, unit: "°" },
    { id: "speed", label: "Grid Speed", type: "range", default: 6, min: 2, max: 16, step: 0.5, unit: "s" },
    { id: "tilt", label: "Tilt", type: "range", default: 12, min: 0, max: 24, step: 1, unit: "°" },
    { id: "sun", label: "Sun", type: "toggle", default: true, onLabel: "Sun", offLabel: "No sun" },
  ],
  rand: (R) => ({
    // Mostly the canonical sunset, occasionally a rotated "alien sunset".
    hue: R.pick([0, 0, 0, 0, 30, 300, 330, 210]),
    speed: Number(R.rnd(4, 8).toFixed(1)),
    tilt: R.ri(8, 16),
    sun: R.chance(0.8),
  }),
  build: (ctx) => {
    const shift = ctx.values.hue as number;
    const speed = ctx.values.speed as number;
    const tilt = ctx.values.tilt as number;
    const sun = Boolean(ctx.values.sun);
    const dark = ctx.theme === "dark";

    // Rotate the whole palette by the hue shift while preserving the sunset relations.
    const H = (h: number) => (((h + shift) % 360) + 360) % 360;

    // Chrome → sunset headline (top → bottom), with a bright horizon split at ~47%.
    const chromeHi = hsl(H(196), 55, 87);
    const chromeLo = hsl(H(214), 40, 96);
    const splitBright = hsl(H(48), 100, 94);
    const sunOrange = hsl(H(30), 100, 62);
    const sunPink = hsl(H(330), 96, 64);
    const sunViolet = hsl(H(278), 82, 60);
    const textGrad =
      `linear-gradient(180deg, ${chromeHi} 0%, ${chromeLo} 33%, ${splitBright} 45%, ` +
      `${splitBright} 50%, ${sunOrange} 56%, ${sunPink} 74%, ${sunViolet} 100%)`;
    const textGlow = hsl(H(325), 100, 66, dark ? 0.55 : 0.5);

    // Deep-sky backdrop: rich indigo up top fading to near-black at the horizon so the
    // grid and sun pop. Kept dark on BOTH themes (the poster carries its own sky).
    const skyTop = hsl(H(256), 66, dark ? 13 : 15);
    const skyMid = hsl(H(286), 58, 9);
    const skyDeep = hsl(H(280), 45, 4);
    const ground = hsl(H(283), 40, 3);
    const skyGrad =
      `linear-gradient(to bottom, ${skyTop} 0%, ${skyMid} 34%, ${skyDeep} 45%, ` +
      `${ground} 47%, ${ground} 100%)`;

    // Glowing retro sun disc + soft horizon band, both centred on the horizon line.
    const sunCore = hsl(H(46), 100, 72);
    const sunMid = hsl(H(28), 100, 60);
    const sunEdge = hsl(H(336), 96, 58);
    const sunDisc =
      `radial-gradient(circle 2.15em at 50% 47%, ${sunCore} 0 0.55em, ` +
      `${sunMid} 0.55em 1.35em, ${sunEdge} 1.35em 1.95em, transparent 2.15em)`;
    const horizonGlow = hsl(H(328), 100, 66);
    const horizonBand =
      `radial-gradient(62% 7% at 50% 46%, ${horizonGlow} 0%, ` +
      `${hsl(H(328), 100, 66, 0.35)} 42%, transparent 74%)`;
    const skyLayers = sun
      ? `${sunDisc},\n    ${horizonBand},\n    ${skyGrad}`
      : `${horizonBand},\n    ${skyGrad}`;

    // Neon floor: cyan verticals + magenta horizontals. 40px cell so the scroll loops
    // seamlessly (period == cell); only the horizontal layer's Y is animated.
    const cell = 40;
    const gridV = hsl(H(190), 100, 62);
    const gridH = hsl(H(322), 100, 66);
    const gridGlow = hsl(H(320), 100, 60);

    const a = anim(ctx.scope, "drive");

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  position: relative;\n` +
      `  isolation: isolate;\n` +
      `  overflow: hidden;\n` +
      `  padding: 0.5em 1.05em 1.2em;\n` +
      `  border-radius: 0.14em;\n` +
      `  box-shadow: 0 14px 40px rgba(0,0,0,${dark ? 0.55 : 0.4}),\n` +
      `    inset 0 0 0 1px ${hsl(H(300), 70, 60, 0.22)},\n` +
      `    inset 0 0 44px ${hsl(H(280), 80, 18, 0.55)};\n` +
      `}\n` +
      // The chrome-sunset headline, leaning back on its own gentle perspective.
      `.${ctx.scope} .fx-txt {\n` +
      `  display: inline-block;\n` +
      `  position: relative;\n` +
      `  z-index: 1;\n` +
      `  transform: perspective(700px) rotateX(${tilt}deg);\n` +
      `  transform-origin: center 82%;\n` +
      `  ${clipText(textGrad)}\n` +
      `  background-size: 100% 100%;\n` +
      `  ${dropGlow(textGlow, [5, 12])}\n` +
      `}\n` +
      // Sky + sun + horizon glow, furthest back.
      `.${ctx.scope}::before {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  z-index: -2;\n` +
      `  background:\n    ${skyLayers};\n` +
      `}\n` +
      // Neon perspective grid floor, scrolling toward the viewer, fading to the horizon.
      `.${ctx.scope}::after {\n` +
      `  content: "";\n` +
      `  position: absolute;\n` +
      `  left: -45%;\n` +
      `  right: -45%;\n` +
      `  bottom: -3%;\n` +
      `  height: 60%;\n` +
      `  z-index: -1;\n` +
      `  transform-origin: bottom center;\n` +
      `  transform: perspective(160px) rotateX(62deg);\n` +
      `  background-image:\n` +
      `    repeating-linear-gradient(to right, ${gridV} 0 1.5px, transparent 1.5px ${cell}px),\n` +
      `    repeating-linear-gradient(to bottom, ${gridH} 0 1.5px, transparent 1.5px ${cell}px);\n` +
      `  -webkit-mask-image: linear-gradient(to top, #000 4%, rgba(0,0,0,0.9) 34%, transparent 94%);\n` +
      `  mask-image: linear-gradient(to top, #000 4%, rgba(0,0,0,0.9) 34%, transparent 94%);\n` +
      `  filter: drop-shadow(0 0 3px ${gridGlow});\n` +
      `  animation: ${a} ${speed}s linear infinite;\n` +
      `  pointer-events: none;\n` +
      `}`;

    // Scroll only the horizontal-line layer's Y by one cell — lines flow from the
    // horizon toward the viewer, looping seamlessly on the repeat period.
    const keyframes =
      `@keyframes ${a} {\n` +
      `  from { background-position: 0 0, 0 0; }\n` +
      `  to { background-position: 0 0, 0 ${cell}px; }\n` +
      `}`;

    return {
      root: el("div", {
        children: [el("span", { attrs: { class: "fx-txt" }, children: [text(ctx.text)] })],
      }),
      css,
      keyframes,
      loopMs: Math.round(speed * 1000),
    };
  },
};

export default synthwaveGrid;
