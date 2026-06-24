import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId } from "@/lib/engine/helpers";

/**
 * Gooey / blob look: the classic feGaussianBlur -> feColorMatrix alpha-threshold
 * "goo" filter. Blurring the glyphs then snapping the alpha to a hard edge fuses
 * nearby letters into liquid blobs. Applied via filter:url(#...). The fill is a
 * solid warm-to-deep gradient-feel via two stacked text colors; static.
 */
const gooey: EffectDefinition = {
  id: "gooey",
  name: "Gooey",
  category: "elemental",
  tags: ["goo", "blob", "liquid", "svg", "filter", "elemental"],
  caps: ["svgDefs"],
  pngSupport: "partial",
  supports: "SVG filter (feGaussianBlur + feColorMatrix) via filter:url(#…)",
  controls: [
    {
      id: "hue",
      label: "Hue",
      type: "range",
      default: 150,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
    },
    {
      id: "goo",
      label: "Gooeyness",
      type: "range",
      default: 7,
      min: 3,
      max: 14,
      step: 1,
      unit: "px",
    },
  ],
  rand: (R) => ({ hue: R.ri(0, 360), goo: R.ri(5, 11) }),
  build: (ctx) => {
    const h = ctx.values.hue as number;
    const goo = ctx.values.goo as number;
    const fid = svgId(ctx.scope, "goo");

    // Solid, saturated blob color that reads on either theme.
    const fill = ctx.theme === "dark" ? hsl(h, 85, 60) : hsl(h, 80, 48);
    const sheen = hsl(h, 90, 80, 0.85);

    // Blur amount drives how aggressively neighbours merge. The color matrix
    // keeps RGB, then sharpens alpha: multiply (18) and subtract (-7) so the
    // blurred halo collapses into a crisp blobby silhouette.
    const defs =
      `<filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%">\n` +
      `  <feGaussianBlur in="SourceGraphic" stdDeviation="${goo}" result="blur"/>\n` +
      `  <feColorMatrix in="blur" mode="matrix" ` +
      `values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"/>\n` +
      `  <feComposite in="SourceGraphic" in2="goo" operator="atop"/>\n` +
      `</filter>`;

    const css =
      `.${ctx.scope} {\n` +
      `  color: ${fill};\n` +
      `  filter: url(#${fid});\n` +
      `  text-shadow: 0 1px 0 ${sheen};\n` +
      `}`;

    return {
      root: el("div", { children: [text(ctx.text)] }),
      css,
      defs,
    };
  },
};

export default gooey;
