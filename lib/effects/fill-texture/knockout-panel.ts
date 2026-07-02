import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, round } from "@/lib/engine/helpers";

/**
 * Knockout Panel: a vivid gradient chip with the text cut clean through it, as
 * if it were punched out of a sticker and the page behind it shows through the
 * letterforms.
 *
 * How the "hole" is real, not a fake: CSS has no erase/destination-out blend
 * mode, and cutting a true alpha hole shaped like arbitrary user text needs an
 * SVG <mask><text>, which is out of reach for a `pure`-only effect (no svgDefs
 * cap here). The one honest substitute is to paint the glyphs the exact flat
 * color of whatever is actually behind them — and that color is knowable: every
 * place this effect renders (studio stage, gallery/saved thumbnails, standalone
 * HTML export, PNG export background) paints the app's literal theme bg/stage
 * color behind it (see app/globals.css: --bg/--stage = #0a0a0a dark, #fafaf7
 * light; lib/export/png.ts currentStageBg() reads that same live value for
 * export). So this isn't an approximation of a cutout, it's a pixel-perfect
 * match on every real render target, derived from ctx.theme rather than guessed.
 *
 * Structure: the chip (.scope) carries no background of its own — the vivid
 * gradient lives on an absolutely-positioned ::before pinned at z-index:-1
 * inside an isolated stacking context, so it always paints *below* the in-flow
 * text but above the page. The text is plain in-flow content colored the hole
 * value, so it naturally paints on top of the ::before layer without any extra
 * markup or wrapper. The "spin" preset rotates a viewport-oversized (vmax)
 * square so the rounded chip is always fully covered regardless of how wide the
 * text makes it — a percentage-of-own-box size would gap out at some rotation
 * angles for a short, wide chip.
 */
const knockoutPanel: EffectDefinition = {
  id: "knockout-panel",
  name: "Knockout Panel",
  category: "fill-texture",
  tags: ["fill", "texture", "panel", "cutout", "knockout", "sticker", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  controls: [
    { id: "hue", label: "Panel Hue", type: "range", default: 320, min: 0, max: 360, step: 1, unit: "°" },
    {
      id: "preset",
      label: "Gradient",
      type: "select",
      default: "sweep",
      options: [
        { label: "Sweep", value: "sweep" },
        { label: "Burst", value: "burst" },
        { label: "Spin", value: "spin" },
      ],
    },
    { id: "rounding", label: "Rounding", type: "range", default: 0.3, min: 0, max: 0.9, step: 0.05, unit: "em" },
    { id: "drift", label: "Drift", type: "toggle", default: true, onLabel: "Drift", offLabel: "Static" },
    {
      id: "speed",
      label: "Drift Speed",
      type: "range",
      default: 9,
      min: 4,
      max: 16,
      step: 0.5,
      unit: "s",
      when: (v) => Boolean(v.drift),
    },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    preset: R.pick(["sweep", "burst", "spin"]),
    rounding: Number(R.rnd(0.12, 0.6).toFixed(2)),
    drift: R.chance(0.7),
    speed: Number(R.rnd(6, 13).toFixed(1)),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const presetRaw = ctx.values.preset as string;
    const preset = presetRaw === "burst" || presetRaw === "spin" ? presetRaw : "sweep";
    const rounding = round(ctx.values.rounding as number, 2);
    const drift = Boolean(ctx.values.drift);
    const speed = round(ctx.values.speed as number, 1);
    const dark = ctx.theme === "dark";

    // The literal flat color of the real page/stage background behind this
    // effect in every render target (see file comment above).
    const hole = dark ? "#0a0a0a" : "#fafaf7";

    // A vivid, roughly-triadic 3-stop palette (h, h+42, h-72) — rich on both
    // themes; only lightness is nudged a touch for light-mode legibility.
    const c1 = hsl(h, 92, dark ? 56 : 53);
    const c2 = hsl((h + 42) % 360, 90, dark ? 50 : 46);
    const c3 = hsl((h + 288) % 360, 88, dark ? 62 : 57);

    const a = anim(ctx.scope, "panel");

    let beforeRule: string;
    let keyframes: string | undefined;

    if (preset === "spin") {
      const panelBg = `conic-gradient(from 0deg at 50% 50%, ${c1}, ${c2}, ${c3}, ${c1})`;
      beforeRule =
        `.${ctx.scope}::before {\n` +
        `  content: "";\n` +
        `  position: absolute;\n` +
        `  top: 50%;\n` +
        `  left: 50%;\n` +
        // Oversized relative to the viewport (not the chip's own box) so a very
        // wide, short chip stays fully covered at every rotation angle.
        `  width: 300vmax;\n` +
        `  height: 300vmax;\n` +
        `  z-index: -1;\n` +
        `  background: ${panelBg};\n` +
        `  transform: translate(-50%, -50%) rotate(0deg);\n` +
        (drift ? `  animation: ${a} ${speed}s linear infinite;\n` : "") +
        `}`;
      keyframes = drift
        ? `@keyframes ${a} {\n  to { transform: translate(-50%, -50%) rotate(360deg); }\n}`
        : undefined;
    } else if (preset === "burst") {
      const panelBg = `radial-gradient(135% 135% at 28% 24%, ${c1} 0%, ${c2} 48%, ${c3} 100%)`;
      beforeRule =
        `.${ctx.scope}::before {\n` +
        `  content: "";\n` +
        `  position: absolute;\n` +
        `  inset: 0;\n` +
        `  z-index: -1;\n` +
        `  background: ${panelBg};\n` +
        `  background-size: 175% 175%;\n` +
        `  background-position: 30% 30%;\n` +
        (drift ? `  animation: ${a} ${speed}s ease-in-out infinite;\n` : "") +
        `}`;
      keyframes = drift
        ? `@keyframes ${a} {\n  0%, 100% { background-position: 30% 30%; }\n  50% { background-position: 70% 65%; }\n}`
        : undefined;
    } else {
      const panelBg = `linear-gradient(125deg, ${c1} 0%, ${c2} 52%, ${c3} 100%)`;
      beforeRule =
        `.${ctx.scope}::before {\n` +
        `  content: "";\n` +
        `  position: absolute;\n` +
        `  inset: 0;\n` +
        `  z-index: -1;\n` +
        `  background: ${panelBg};\n` +
        `  background-size: 210% 210%;\n` +
        `  background-position: 20% 30%;\n` +
        (drift ? `  animation: ${a} ${speed}s ease-in-out infinite;\n` : "") +
        `}`;
      keyframes = drift
        ? `@keyframes ${a} {\n  0%, 100% { background-position: 20% 30%; }\n  50% { background-position: 80% 70%; }\n}`
        : undefined;
    }

    const css =
      `.${ctx.scope} {\n` +
      `  display: inline-block;\n` +
      `  position: relative;\n` +
      `  isolation: isolate;\n` +
      `  overflow: hidden;\n` +
      `  padding: 0.5em 1.05em;\n` +
      `  border-radius: ${rounding}em;\n` +
      `  color: ${hole};\n` +
      // A soft dark rim right at the glyph edges reads as the cut edge's own
      // thin shadow — solid-color text (not clipped/transparent), so plain
      // text-shadow is safe here (no glow guard needed).
      `  text-shadow: 0 1px 1.5px rgba(0, 0, 0, 0.4), 0 0 3px rgba(0, 0, 0, 0.25);\n` +
      `  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.22);\n` +
      `}\n` +
      beforeRule;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: drift ? Math.round(speed * 1000) : undefined,
    };
  },
};

export default knockoutPanel;
