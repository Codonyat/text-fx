import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { anim, hsl, hoverReplay, cloneKeyframes, round } from "@/lib/engine/helpers";

/**
 * Shatter In: the word assembles out of flying glass. 6-8 absolutely-stacked copies of
 * the text are each clip-path'd to a different polygonal SHARD — the shards tile the whole
 * text box exactly once (a fan from a central impact point through jittered perimeter
 * splits, so their union is the full word with no gaps or overlaps). Each shard starts
 * scattered: translated outward along its own radial direction, pushed back in Z and
 * tumbled in 3D through a shared perspective. Staggered by index, they fly IN and snap into
 * perfect registration, a bright edge-flash selling the landing impact. Rest state is the
 * intact word. One-shot on mount; hover restarts every shard (composite markup). This is
 * hard rigid GEOMETRY in flight — not decode-reveal's per-letter blur resolve, and not a
 * soft particle dust dissolve.
 */
const shatterIn: EffectDefinition = {
  id: "shatter-in",
  name: "Shatter In",
  category: "entrance-kinetic",
  tags: ["entrance", "shatter", "glass", "shards", "3d", "kinetic", "animated"],
  caps: ["pure"],
  pngSupport: "partial",
  supports: "clip-path shards + 3D transforms with perspective (all modern browsers)",
  controls: [
    {
      id: "count",
      label: "Shards",
      type: "select",
      default: "6",
      options: [
        { label: "6", value: "6" },
        { label: "8", value: "8" },
      ],
    },
    { id: "distance", label: "Fly Distance", type: "range", default: 95, min: 60, max: 150, step: 5, unit: "px" },
    { id: "speed", label: "Speed", type: "range", default: 1.1, min: 0.6, max: 2, step: 0.1, unit: "s" },
    { id: "hue", label: "Glass Hue", type: "range", default: 205, min: 0, max: 360, step: 1, unit: "°" },
  ],
  rand: (R) => ({
    count: R.pick(["6", "8"]),
    distance: R.ri(80, 130),
    speed: Number(R.rnd(0.9, 1.4).toFixed(1)),
    hue: R.ri(0, 360),
  }),
  build: (ctx) => {
    const N = Math.round(Number(ctx.values.count as string)) || 6;
    const dist = ctx.values.distance as number;
    const speed = ctx.values.speed as number;
    const h = ctx.values.hue as number;
    const dark = ctx.theme === "dark";

    // Icy glass fill, theme-adapted to read on both stages; bright edge-flash on impact.
    const base = dark ? hsl(h, 22, 90) : hsl(h, 42, 26);
    const flash = dark ? hsl(h, 92, 80) : hsl(h, 96, 52);

    const a = anim(ctx.scope, "shatter");
    const a2 = anim(ctx.scope, "shatter-r"); // hover replays the whole assembly

    // Central impact point (slightly high of centre for a natural strike).
    const Cx = 50;
    const Cy = 46;

    // A point on the text-box perimeter, parametrised by t in [0,4): top→right→bottom→left.
    // Integer t values are the four corners (0=TL, 1=TR, 2=BR, 3=BL).
    const perim = (t: number): [number, number] => {
      const u = ((t % 4) + 4) % 4;
      if (u < 1) return [u * 100, 0];
      if (u < 2) return [100, (u - 1) * 100];
      if (u < 3) return [100 - (u - 2) * 100, 100];
      return [0, 100 - (u - 3) * 100];
    };

    // N split points around the perimeter: evenly spaced + a deterministic jitter so the
    // shards read as irregular glass, not a regular pie. Amplitude stays well under the
    // spacing so the splits remain strictly increasing (no zero-width slivers).
    const start = 0.37;
    const splits: number[] = [];
    for (let k = 0; k < N; k++) {
      splits.push(start + (k * 4) / N + 0.13 * Math.sin(k * 1.8 + 0.7));
    }

    // Each shard = center → perim(a) → any corners strictly between → perim(b). Because the
    // center sees the whole (convex) box, every such polygon is simple and the set tiles the
    // box exactly once.
    const shardPoly = (aParam: number, bParam: number): string => {
      const pts: [number, number][] = [[Cx, Cy], perim(aParam)];
      for (let c = Math.ceil(aParam + 1e-6); c < bParam - 1e-6; c++) pts.push(perim(c));
      pts.push(perim(bParam));
      return pts.map(([x, y]) => `${round(x, 2)}% ${round(y, 2)}%`).join(", ");
    };

    const stagger = 0.05;

    // Build the shard spans with per-shard inline vars: the static clip polygon plus the
    // scattered start transform (radial offset, Z push-back, 3D tumble). One shared keyframe
    // animation reads these vars, so a single duplicate name restarts every shard on hover.
    const shards = [];
    for (let k = 0; k < N; k++) {
      const aP = splits[k];
      const bP = k === N - 1 ? splits[0] + 4 : splits[k + 1];
      const clip = shardPoly(aP, bP);

      // Fly direction = center → shard's mid-perimeter point.
      const [mx, my] = perim((aP + bP) / 2);
      let dx = mx - Cx;
      let dy = my - Cy;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;

      shards.push(
        el("span", {
          attrs: { class: "fx-shard" },
          vars: {
            "--i": k,
            "--clip": `polygon(${clip})`,
            "--sx": `${round(dx * dist, 1)}px`,
            "--sy": `${round(dy * dist, 1)}px`,
            "--sz": `${round(-dist * 1.2, 0)}px`,
            "--srx": `${round(-dy * 55, 1)}deg`,
            "--sry": `${round(dx * 55, 1)}deg`,
          },
          children: [text(ctx.text)],
        }),
      );
    }

    const dur = speed.toFixed(2);
    const timing = "cubic-bezier(.2,.85,.25,1)";

    const css =
      `.${ctx.scope} {\n` +
      `  position: relative;\n` +
      `  display: inline-block;\n` +
      `  perspective: 720px;\n` +
      `  color: ${base};\n` +
      `}\n` +
      // Transparent copy in normal flow: sizes the box so the absolute shards have a box to
      // clip against and register into. Never visible.
      `.${ctx.scope} .fx-base {\n` +
      `  color: transparent;\n` +
      `}\n` +
      `.${ctx.scope} .fx-shard {\n` +
      `  position: absolute;\n` +
      `  inset: 0;\n` +
      `  color: ${base};\n` +
      `  pointer-events: none;\n` +
      `  clip-path: var(--clip);\n` +
      `  transform-origin: 50% 50%;\n` +
      `  will-change: transform, opacity, filter;\n` +
      `  animation: ${a} ${dur}s ${timing} both;\n` +
      `  animation-delay: calc(var(--i) * ${stagger}s);\n` +
      `}\n` +
      hoverReplay(ctx.scope, " .fx-shard", a2);

    const scattered =
      `translate3d(var(--sx), var(--sy), var(--sz)) rotateX(var(--srx)) rotateY(var(--sry)) scale(1.08)`;
    const home = `translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)`;

    const keyframes =
      `@keyframes ${a} {\n` +
      `  0% { opacity: 0; transform: ${scattered}; }\n` +
      `  15% { opacity: 1; }\n` +
      `  70% { filter: none; }\n` +
      `  76% { opacity: 1; transform: ${home}; }\n` +
      `  84% { filter: brightness(2) drop-shadow(0 0 7px ${flash}); }\n` +
      `  100% { opacity: 1; transform: ${home}; filter: none; }\n` +
      `}`;

    return {
      root: el("div", {
        children: [
          el("span", { attrs: { class: "fx-base", "aria-hidden": "true" }, children: [text(ctx.text)] }),
          ...shards,
        ],
      }),
      css,
      keyframes: `${keyframes}\n${cloneKeyframes(keyframes, a, a2)}`,
      loopMs: Math.round((speed + stagger * (N - 1)) * 1000),
    };
  },
};

export default shatterIn;
