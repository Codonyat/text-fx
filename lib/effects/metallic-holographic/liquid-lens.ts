import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, svgId, hsl } from "@/lib/engine/helpers";

/**
 * Liquid Lens: the glyphs become clear liquid-glass lenses that REFRACT whatever is
 * behind them. An inline <clipPath><text> mirroring the word clips an overlay layer
 * carrying a backdrop-filter (blur + saturate + brightness), so the page/stage behind
 * shows through the letterforms — warped and glassy. A specular top-edge highlight, a
 * dark bottom-edge for lens thickness, a faint rim stroke and a gentle sheen sweep
 * sell the glass; a tint control guarantees visible body even on flat backdrops.
 *
 * The clip <text> lives inside a zero-size <svg> that is a DESCENDANT of the scope, so
 * it inherits the shared font/weight/tracking exactly — the lens shape always matches
 * the (transparent) sizing text that establishes the box. userSpaceOnUse means the clip
 * coordinates are the overlay's own px box; a single-line (nowrap) layout keeps the SVG
 * text and the HTML box in lockstep.
 */
const liquidLens: EffectDefinition = {
  id: "liquid-lens",
  name: "Liquid Lens",
  category: "metallic-holographic",
  tags: ["glass", "liquid", "lens", "refraction", "backdrop-filter", "glassmorphism", "animated"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "backdrop-filter (all modern) — the letters refract the backdrop behind them",
  controls: [
    { id: "blur", label: "Refraction", type: "range", default: 1.6, min: 0, max: 4, step: 0.1, unit: "px" },
    { id: "hue", label: "Tint Hue", type: "range", default: 205, min: 0, max: 360, step: 1, unit: "°" },
    { id: "tint", label: "Tint", type: "range", default: 38, min: 0, max: 60, step: 1, unit: "%" },
    { id: "rim", label: "Rim", type: "range", default: 72, min: 0, max: 100, step: 1, unit: "%" },
    { id: "shimmer", label: "Shimmer", type: "toggle", default: true, onLabel: "On", offLabel: "Off" },
  ],
  rand: (R) => ({
    blur: Number(R.rnd(1.1, 2.4).toFixed(1)),
    hue: R.ri(0, 360),
    tint: R.ri(30, 50),
    rim: R.ri(58, 88),
    shimmer: R.chance(0.8),
  }),
  build: (ctx) => {
    const blur = ctx.values.blur as number;
    const h = ctx.values.hue as number;
    const tint = ctx.values.tint as number;
    const rim = ctx.values.rim as number;
    const shimmer = ctx.values.shimmer as boolean;
    const dark = ctx.theme === "dark";

    const cid = svgId(ctx.scope, "lens");
    const aSheen = anim(ctx.scope, "sheen");

    const sA = tint / 100;
    const rN = rim / 100;

    // Glass body tint — translucent so the refracted backdrop still shows through, but
    // with enough body that FLAT backdrops (the SSR/OG posters use a plain stage color,
    // no grid) still read clearly as tinted glass letters. The refraction is the bonus
    // on textured backdrops; the body carries legibility everywhere else.
    const aTop = (dark ? 0.22 : 0.2) + sA * (dark ? 0.55 : 0.6);
    const aBot = (dark ? 0.16 : 0.17) + sA * (dark ? 0.45 : 0.55);
    const tintTop = dark ? hsl(h, 62, 88, Number(aTop.toFixed(3))) : hsl(h, 62, 52, Number(aTop.toFixed(3)));
    const tintBot = dark ? hsl(h, 55, 74, Number(aBot.toFixed(3))) : hsl(h, 64, 40, Number(aBot.toFixed(3)));

    const bf = `blur(${blur}px) saturate(1.4) brightness(${dark ? 1.35 : 1.02})`;

    // Rim + lift: a thin light top edge, a thin dark bottom edge (lens thickness), a
    // soft drop-shadow that lifts the glass off the backdrop, and a faint all-around
    // halo (light on dark, dark on light) so the letterforms stay defined on flat
    // stages. drop-shadow follows the clipped glyph alpha, so these hug every letter.
    const rimLight = `rgba(255,255,255,${(rN * 0.9).toFixed(3)})`;
    const rimDark = dark ? `rgba(4,8,16,${(rN * 0.5).toFixed(3)})` : `rgba(18,24,38,${(rN * 0.55).toFixed(3)})`;
    const lift = dark ? "rgba(0,0,0,0.42)" : "rgba(30,40,60,0.22)";
    const halo = dark
      ? ` drop-shadow(0 0 0.7px rgba(255,255,255,${(rN * 0.5).toFixed(3)}))`
      : ` drop-shadow(0 0 0.5px rgba(18,24,38,${(rN * 0.45).toFixed(3)}))`;
    const bodyFilter =
      `drop-shadow(0 1px 3px ${lift}) drop-shadow(0 -0.5px 0 ${rimLight}) drop-shadow(0 0.6px 0 ${rimDark})${halo}`;

    // Inner sheen gradient: bright specular top + dark thickness shade at the bottom.
    const specTop = dark ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.55)";
    const shadeBot = dark ? "rgba(6,10,18,0.45)" : "rgba(20,28,46,0.32)";
    const staticSheen = `linear-gradient(180deg, ${specTop} 0%, transparent 42%, transparent 72%, ${shadeBot} 100%)`;
    const sweepCol = dark ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.5)";
    const sweep = `linear-gradient(115deg, transparent 38%, ${sweepCol} 50%, transparent 62%)`;

    const sheenDecl = shimmer
      ? `  background: ${sweep}, ${staticSheen};\n` +
        `  background-size: 250% 100%, auto;\n` +
        `  background-position: 130% 0, 0 0;\n` +
        `  animation: ${aSheen} 4.6s linear infinite;\n`
      : `  background: ${staticSheen};\n`;

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  white-space: nowrap;\n` +
      `  line-height: 1.1;\n` +
      `  color: transparent;\n` +
      `}\n` +
      `.${ctx.scope} .lens-svg {\n` +
      `  position: absolute;\n` +
      `  width: 0;\n` +
      `  height: 0;\n` +
      `}\n` +
      `.${ctx.scope} .lens-body,\n.${ctx.scope} .lens-sheen {\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  pointer-events: none;\n` +
      `  -webkit-clip-path: url(#${cid});\n` +
      `  clip-path: url(#${cid});\n` +
      `}\n` +
      `.${ctx.scope} .lens-body {\n` +
      `  background: linear-gradient(180deg, ${tintTop}, ${tintBot});\n` +
      `  -webkit-backdrop-filter: ${bf};\n` +
      `  backdrop-filter: ${bf};\n` +
      `  filter: ${bodyFilter};\n` +
      `}\n` +
      `.${ctx.scope} .lens-sheen {\n` +
      sheenDecl +
      `}`;

    const keyframes = shimmer
      ? `@keyframes ${aSheen} {\n` +
        `  from { background-position: 130% 0, 0 0; }\n` +
        `  to { background-position: -30% 0, 0 0; }\n` +
        `}`
      : undefined;

    const root = el("div", {
      children: [
        // Transparent sizing text: establishes the box the overlays fill; the visible
        // glyphs come entirely from the clipped glass layers below.
        text(ctx.text),
        el("svg", {
          attrs: { class: "lens-svg", width: 0, height: 0, "aria-hidden": "true" },
          children: [
            el("clipPath", {
              attrs: { id: cid, clipPathUnits: "userSpaceOnUse" },
              children: [el("text", { attrs: { x: "0", y: "0.85em" }, children: [text(ctx.text)] })],
            }),
          ],
        }),
        el("span", { attrs: { class: "lens-body" } }),
        el("span", { attrs: { class: "lens-sheen" } }),
      ],
    });

    return { root, css, keyframes, loopMs: shimmer ? 4600 : undefined };
  },
};

export default liquidLens;
