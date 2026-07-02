import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, svgId, round } from "@/lib/engine/helpers";

/**
 * Mercury metaball: the word rendered as chrome liquid metal. A gooey SVG filter
 * (feGaussianBlur + feColorMatrix alpha-contrast, feComposite atop to keep the
 * glyph cores crisp) fuses the letters with a handful of absolutely-positioned
 * satellite DROPLETS that slowly drift in from the perimeter, get pinched into the
 * letterforms and absorbed, then re-appear at a second spot — the visible metaball
 * merge is the payoff. Everything is filled with a silvery vertical chrome gradient
 * (dark horizon band + bright edges) swept by a moving specular highlight, plus a
 * cool reflective drop-shadow. Diverges from `gooey` (flat single-colour goo, no
 * droplets, no metal): this is reflective mercury with explicit absorption events.
 */
const mercuryMetaball: EffectDefinition = {
  id: "mercury-metaball",
  name: "Mercury Metaball",
  category: "elemental",
  tags: ["mercury", "metaball", "chrome", "liquid", "metal", "goo", "svg", "filter", "elemental", "animated"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "SVG goo filter (feGaussianBlur + feColorMatrix) + background-clip:text metal fill",
  controls: [
    {
      id: "count",
      label: "Droplets",
      type: "range",
      default: 4,
      min: 3,
      max: 5,
      step: 1,
    },
    {
      id: "speed",
      label: "Drift",
      type: "range",
      default: 7,
      min: 4,
      max: 12,
      step: 0.5,
      unit: "s",
    },
    {
      id: "tint",
      label: "Tint",
      type: "range",
      default: 34,
      min: 0,
      max: 100,
      step: 1,
    },
  ],
  rand: (R) => ({
    count: R.ri(3, 5),
    speed: Number(R.rnd(6, 10).toFixed(1)),
    tint: R.ri(12, 70),
  }),
  build: (ctx) => {
    const count = ctx.values.count as number;
    const speed = ctx.values.speed as number;
    const tint = ctx.values.tint as number;
    const dark = ctx.theme === "dark";

    const fid = svgId(ctx.scope, "goo");
    const aSheen = anim(ctx.scope, "sheen");
    const aDrift = anim(ctx.scope, "drift");

    // --- Mercury palette. h=steel/blue hue; saturation ramps silver -> chrome-blue. ---
    const h = 210;
    const t = tint / 100;
    const s = Math.round(4 + t * 30); // 4 (neutral silver) .. 34 (cool chrome-blue)

    // Vertical chrome gradient: bright edge -> light -> dark horizon band -> light -> bright.
    const cHi = hsl(h, Math.round(s * 0.4), dark ? 96 : 88);
    const cLight = hsl(h, s, dark ? 82 : 78);
    const cHorizon = hsl(h, Math.min(s + 10, 46), dark ? 40 : 33);
    const cLight2 = hsl(h, s, dark ? 76 : 70);
    const cHi2 = hsl(h, Math.round(s * 0.5), dark ? 94 : 86);
    const cBot = hsl(h, s, dark ? 56 : 48);
    const chrome =
      `linear-gradient(180deg, ${cHi} 0%, ${cLight} 26%, ${cHorizon} 50%, ` +
      `${cLight2} 63%, ${cHi2} 80%, ${cBot} 100%)`;

    // Moving specular band (top background layer, mostly transparent).
    const sheenEdge = hsl(h, 25, 92, 0);
    const sheenMid = hsl(h, 18, 97, 0.85);
    const sheenPeak = hsl(h, 8, 100, 0.95);
    const sheen =
      `linear-gradient(100deg, ${sheenEdge} 40%, ${sheenMid} 47%, ${sheenPeak} 50%, ` +
      `${sheenMid} 53%, ${sheenEdge} 60%)`;

    // Droplet bead: off-centre radial highlight so each dot reads as a mercury bead.
    const beadHi = hsl(h, Math.round(s * 0.4), 98);
    const beadMid = hsl(h, s, dark ? 80 : 76);
    const beadLow = hsl(h, s, dark ? 54 : 50);
    const beadEdge = hsl(h, Math.min(s + 8, 44), dark ? 40 : 34);
    const bead =
      `radial-gradient(circle at 34% 30%, ${beadHi} 0%, ${beadMid} 34%, ` +
      `${beadLow} 78%, ${beadEdge} 100%)`;

    const glow = hsl(h, Math.min(s + 20, 60), dark ? 62 : 52, dark ? 0.5 : 0.42);
    const grnd = dark ? hsl(h, 30, 4, 0.5) : hsl(h, 25, 30, 0.35);

    // --- Deterministic droplet layout (build is pure — no Math.random). ---
    const rx = 3.4; // em, horizontal spread of resting spots
    const ry = 1.5; // em, vertical spread
    const GOLD = 137.508; // golden angle scatters spots organically
    const drops = Array.from({ length: count }, (_, i) => {
      const aA = (i * GOLD) * (Math.PI / 180);
      const aB = (i * GOLD + 180 + i * 27) * (Math.PI / 180);
      const rfA = 0.74 + ((i * 0.41) % 1) * 0.46;
      const rfB = 0.74 + ((i * 0.29 + 0.35) % 1) * 0.46;
      return {
        fx: round(Math.cos(aA) * rx * rfA, 2),
        fy: round(Math.sin(aA) * ry * rfA, 2),
        gx: round(Math.cos(aB) * rx * rfB, 2),
        gy: round(Math.sin(aB) * ry * rfB, 2),
        size: round(0.34 + ((i * 0.37) % 1) * 0.16, 2),
        delay: round(-(i / count) * speed, 2),
      };
    });

    // Goo merge filter: blur, alpha-contrast to hard blobby edges, then composite
    // the crisp SourceGraphic back on top so letters stay legible (atop).
    const blur = 7;
    const defs =
      `<filter id="${fid}" x="-110%" y="-180%" width="320%" height="460%">\n` +
      `  <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur"/>\n` +
      `  <feColorMatrix in="blur" mode="matrix" ` +
      `values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo"/>\n` +
      `  <feComposite in="SourceGraphic" in2="goo" operator="atop"/>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  padding: 0.7em 1.5em;\n` +
      `  background: ${sheen}, ${chrome};\n` +
      `  background-size: 260% 100%, 100% 100%;\n` +
      `  background-position: 200% 0, 0 0;\n` +
      `  background-repeat: no-repeat;\n` +
      `  -webkit-background-clip: text;\n` +
      `  background-clip: text;\n` +
      `  -webkit-text-fill-color: transparent;\n` +
      `  color: transparent;\n` +
      `  filter: url(#${fid}) drop-shadow(0 1px 1px ${grnd}) drop-shadow(0 0 12px ${glow});\n` +
      `  animation: ${aSheen} 3.6s linear infinite;\n` +
      `}\n` +
      `.${ctx.scope} .fx-drop {\n` +
      `  position: absolute;\n` +
      `  left: 50%;\n` +
      `  top: 50%;\n` +
      `  width: var(--s);\n` +
      `  height: var(--s);\n` +
      `  border-radius: 50%;\n` +
      `  background: ${bead};\n` +
      `  pointer-events: none;\n` +
      `  transform: translate(-50%, -50%) translate(var(--fx), var(--fy)) scale(0.55);\n` +
      `  animation: ${aDrift} ${speed.toFixed(1)}s ease-in-out infinite;\n` +
      `  animation-delay: var(--delay);\n` +
      `}`;

    const keyframes =
      `@keyframes ${aSheen} {\n` +
      `  from { background-position: 200% 0, 0 0; }\n` +
      `  to { background-position: -120% 0, 0 0; }\n` +
      `}\n` +
      `@keyframes ${aDrift} {\n` +
      `  0% { transform: translate(-50%,-50%) translate(var(--fx), var(--fy)) scale(0.55); opacity: 0; }\n` +
      `  6% { opacity: 1; }\n` +
      `  20% { transform: translate(-50%,-50%) translate(calc(var(--fx) * 0.5), calc(var(--fy) * 0.5)) scale(1); opacity: 1; }\n` +
      `  40% { transform: translate(-50%,-50%) translate(calc(var(--fx) * 0.12), calc(var(--fy) * 0.12)) scale(0.82); opacity: 1; }\n` +
      `  48% { transform: translate(-50%,-50%) translate(0, 0) scale(0.26); opacity: 0; }\n` +
      `  50% { transform: translate(-50%,-50%) translate(var(--gx), var(--gy)) scale(0.55); opacity: 0; }\n` +
      `  56% { opacity: 1; }\n` +
      `  70% { transform: translate(-50%,-50%) translate(calc(var(--gx) * 0.5), calc(var(--gy) * 0.5)) scale(1); opacity: 1; }\n` +
      `  90% { transform: translate(-50%,-50%) translate(calc(var(--gx) * 0.12), calc(var(--gy) * 0.12)) scale(0.82); opacity: 1; }\n` +
      `  98% { transform: translate(-50%,-50%) translate(0, 0) scale(0.26); opacity: 0; }\n` +
      `  100% { transform: translate(-50%,-50%) translate(var(--fx), var(--fy)) scale(0.55); opacity: 0; }\n` +
      `}`;

    const droplets = drops.map((d) =>
      el("i", {
        attrs: { class: "fx-drop" },
        vars: {
          "--fx": `${d.fx}em`,
          "--fy": `${d.fy}em`,
          "--gx": `${d.gx}em`,
          "--gy": `${d.gy}em`,
          "--s": `${d.size}em`,
          "--delay": `${d.delay}s`,
        },
      }),
    );

    return {
      root: el("div", { children: [text(ctx.text), ...droplets] }),
      css,
      keyframes,
      defs,
      loopMs: speed * 1000,
    };
  },
};

export default mercuryMetaball;
