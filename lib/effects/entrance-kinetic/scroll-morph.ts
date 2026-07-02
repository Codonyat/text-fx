import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, fvs, round } from "@/lib/engine/helpers";

/**
 * Scroll Morph — the letterforms physically transform under the reader's thumb.
 *
 * A scroll-scrubbed variable-font morph on Recursive: as the element travels the
 * scrollport (`animation-timeline: view()`, ranged over `cover`) the type morphs
 * from feather-light casual (low `wght`, `CASL` 1, a hint of `slnt`) up through a
 * massive linear black (`wght` 950, `CASL` 0). A subtle colour-temperature ramp is
 * synced to the weight — warm & soft when thin, cool & dense when heavy — so the
 * shift in mass reads as a shift in temperature too. No JS: the scroll IS the clock.
 *
 * Divergence from the neighbours:
 *  - `weight-pulse` throbs the wght axis autonomously on a timer; here NOTHING moves
 *    on its own — every frame is deterministically scrubbed by scroll position.
 *  - `casual-morph` loops linear↔casual on a timer; this couples wght AND CASL onto
 *    one monotonic scroll axis (thin-casual → heavy-linear) plus the temperature ramp.
 *
 * Lane rules (worker contract addendum A):
 *  1. The BASE `.scope` rule = the final, legible resting frame — a strong MID weight
 *     at the neutral mid temperature. That is what thumbnails / posters / SSR / OG /
 *     PNG and non-supporting browsers (Firefox) show: never a mid-scrub glitch.
 *  2. The scrub is ADDED only inside `@supports (animation-timeline: view())` AND only
 *     when `ctx.mode !== "thumbnail"`, so static consumers stay on the resting frame.
 *  3. The `animation` shorthand RESETS `animation-timeline`, so declare the shorthand
 *     first (no duration → auto timeline-span) then set timeline + range after it.
 *  4. Everything generated is salted off `ctx.scope`; anonymous `view()` only.
 */
const scrollMorph: EffectDefinition = {
  id: "scroll-morph",
  name: "Scroll Morph",
  category: "entrance-kinetic",
  tags: ["variable-font", "weight", "morph", "scroll", "animated"],
  caps: ["pure", "scroll"],
  font: "'Recursive', sans-serif",
  supports: "Scroll-scrubbed in Chromium & Safari; static elsewhere",
  pngSupport: "partial",
  controls: [
    { id: "light", label: "Light", type: "range", default: 320, min: 300, max: 520, step: 10 },
    { id: "heavy", label: "Heavy", type: "range", default: 950, min: 640, max: 1000, step: 10 },
    {
      id: "casual",
      label: "Blend",
      type: "toggle",
      default: true,
      onLabel: "Casual",
      offLabel: "Linear",
    },
    {
      id: "temp",
      label: "Colour",
      type: "toggle",
      default: true,
      onLabel: "Temp",
      offLabel: "Solid",
    },
  ],
  rand: (R) => ({
    light: R.ri(300, 400),
    heavy: R.ri(820, 1000),
    casual: R.chance(0.7),
    temp: R.chance(0.75),
  }),
  build: (ctx) => {
    const light = ctx.values.light as number;
    const heavy = ctx.values.heavy as number;
    const casual = Boolean(ctx.values.casual);
    const temp = Boolean(ctx.values.temp);
    const dark = ctx.theme === "dark";

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Variable-font axes at scrub level t (0 = thin casual, 1 = heavy linear).
    // wght is the star; CASL (+a little slnt) engage only when the Blend toggle is on,
    // so "Linear" mode is a pure weight morph on rigid grotesque letterforms.
    const fvsAt = (t: number) => {
      const axes: Record<string, number> = { wght: round(lerp(light, heavy, t), 0) };
      axes.CASL = casual ? round(lerp(1, 0, t), 2) : 0;
      axes.slnt = casual ? round(lerp(-8, 0, t), 1) : 0;
      return fvs(axes);
    };

    // Colour-temperature ramp synced to weight: warm amber when thin, cool azure when
    // heavy. Saturation DIPS through the middle so the hue sweep passes through a muted
    // near-neutral (a true warm→neutral→cool temperature read, not a vivid green mid).
    const colorAt = (t: number) => {
      const h = round(lerp(34, 212, t), 0);
      const edge = dark ? 82 : 78; // saturation at the thin/heavy extremes
      const mid = dark ? 42 : 46; // muted neutral through the centre
      const k = 1 - Math.abs(2 * t - 1); // 0 at the ends, 1 at dead centre
      const s = round(edge - (edge - mid) * k, 1);
      const l = round(dark ? lerp(72, 60, t) : lerp(48, 42, t), 1);
      return hsl(h, s, l);
    };

    // Solid mode: a crisp near-ink foreground so the eye reads the letterform morph
    // alone, uncoloured. High-contrast on both stages.
    const solid = dark ? hsl(40, 12, 92) : hsl(222, 18, 15);
    const restColor = temp ? colorAt(0.5) : solid;

    // One scrub step: colour only rides along when the Temp toggle is on.
    const step = (t: number) => `${temp ? `color: ${colorAt(t)}; ` : ""}${fvsAt(t)}`;

    const a = anim(ctx.scope, "morph");

    // BASE = the resting mid-weight, mid-temperature frame (all static consumers see this).
    let css =
      `.${ctx.scope} {\n` +
      `  color: ${restColor};\n` +
      `  ${fvsAt(0.5)}\n` +
      `  will-change: font-variation-settings;\n` +
      `}`;

    const kf =
      `@keyframes ${a} {\n` +
      `  0% { ${step(0)} }\n` +
      `  50% { ${step(0.5)} }\n` +
      `  100% { ${step(1)} }\n` +
      `}`;

    let keyframes: string | undefined;
    if (ctx.mode !== "thumbnail") {
      // Shorthand first (resets animation-timeline), then timeline + range. `both` fill
      // holds the thin-warm 0% frame before the element enters and the heavy-cold 100%
      // frame after it exits; `cover` scrubs the whole visible pass, so viewport centre
      // (~50%) lands on the same mid frame as the static base.
      css +=
        `\n\n@supports (animation-timeline: view()) {\n` +
        `  .${ctx.scope} {\n` +
        `    animation: ${a} linear both;\n` +
        `    animation-timeline: view();\n` +
        `    animation-range: cover;\n` +
        `  }\n` +
        `}`;
      keyframes = kf;
    }

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      runtime: "none", // anonymous view() timeline is pure CSS — no listener shipped
    };
  },
};

export default scrollMorph;
