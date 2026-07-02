import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, anim, clipText, dropGlow, round } from "@/lib/engine/helpers";

/**
 * Woven knockout mesh: fill the glyphs via background-clip:text, then stack TWO
 * -webkit-mask layers — a repeating-linear-gradient of hard opaque/transparent
 * bands on the base angle, and a second copy rotated 90° — combined with
 * mask-composite: intersect (both prefixed `source-in` and standard `intersect`
 * syntax emitted). Only where BOTH bands are opaque survives, so the crossing
 * grid punches a perforated mesh of transparent slots straight through the
 * letterforms and the page shows through, like a woven metal grille. Opposite
 * of stripe-fill (which paints opaque stripes ONTO solid glyphs) — here the
 * bands cut holes OUT of the fill.
 */
const wovenMesh: EffectDefinition = {
  id: "woven-mesh",
  name: "Woven Mesh",
  category: "fill-texture",
  tags: ["fill", "texture", "mesh", "grille", "perforated", "mask", "woven"],
  caps: ["pure"],
  pngSupport: "partial",
  supports:
    "background-clip:text + dual repeating-linear-gradient masks via mask-composite (all modern; standard mask-composite needs a recent Firefox)",
  controls: [
    { id: "hue", label: "Fill Hue", type: "range", default: 205, min: 0, max: 360, step: 1, unit: "°" },
    { id: "gap", label: "Mesh Gap", type: "range", default: 5, min: 2, max: 12, step: 1, unit: "px" },
    {
      id: "angle",
      label: "Weave Angle",
      type: "select",
      default: "0",
      options: [
        { label: "Grid", value: "0" },
        { label: "Diamond", value: "45" },
      ],
    },
    { id: "crawl", label: "Crawl", type: "toggle", default: false, onLabel: "On", offLabel: "Off" },
  ],
  rand: (R) => ({
    hue: R.ri(0, 360),
    gap: R.ri(3, 9),
    angle: R.pick(["0", "45"]),
    crawl: R.chance(0.35),
  }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const gap = ctx.values.gap as number;
    const baseAngle = ctx.values.angle === "45" ? 45 : 0;
    const crawl = Boolean(ctx.values.crawl);
    const dark = ctx.theme === "dark";

    // Fixed thread width; the Mesh Gap control tunes only the hole width, so the
    // weave stays a legible grille across its whole range instead of dissolving.
    const solid = 11;
    const pitch = solid + gap;

    // Subtle brushed-metal two-tone fill, adapted per theme.
    const c1 = hsl(h, dark ? 38 : 46, dark ? 74 : 40);
    const c2 = hsl((h + 6) % 360, dark ? 30 : 38, dark ? 44 : 22);
    const fill = `linear-gradient(155deg, ${c1}, ${c2})`;

    const band = (deg: number): string =>
      `repeating-linear-gradient(${deg}deg, #000 0px, #000 ${solid}px, transparent ${solid}px, transparent ${pitch}px)`;

    const angle2 = baseAngle + 90;
    const layer1 = band(baseAngle);
    const layer2 = band(angle2);

    // One full pitch shift along each band's own gradient axis loops seamlessly,
    // regardless of the grid/diamond orientation (dir() picks each axis' unit vector).
    const dir = (deg: number): [number, number] => {
      const rad = (deg * Math.PI) / 180;
      return [round(Math.sin(rad) * pitch, 3), round(-Math.cos(rad) * pitch, 3)];
    };
    const [x1, y1] = dir(baseAngle);
    const [x2, y2] = dir(angle2);

    const a = anim(ctx.scope, "weave");
    const animDecl = crawl ? `\n  animation: ${a} 16s linear infinite;` : "";

    const css =
      `.${ctx.scope} {\n` +
      `  ${clipText(fill)}\n` +
      `  -webkit-mask-image: ${layer1}, ${layer2};\n` +
      `  mask-image: ${layer1}, ${layer2};\n` +
      `  -webkit-mask-position: 0px 0px, 0px 0px;\n` +
      `  mask-position: 0px 0px, 0px 0px;\n` +
      `  -webkit-mask-composite: source-in;\n` +
      `  mask-composite: intersect;\n` +
      `  ${dropGlow(hsl(h, 55, dark ? 65 : 45, 0.3), [4])}` +
      `${animDecl}\n` +
      `}`;

    const keyframes = crawl
      ? `@keyframes ${a} {\n` +
        `  to {\n` +
        `    -webkit-mask-position: ${x1}px ${y1}px, ${x2}px ${y2}px;\n` +
        `    mask-position: ${x1}px ${y1}px, ${x2}px ${y2}px;\n` +
        `  }\n` +
        `}`
      : undefined;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      keyframes,
      loopMs: crawl ? 16000 : undefined,
    };
  },
};

export default wovenMesh;
