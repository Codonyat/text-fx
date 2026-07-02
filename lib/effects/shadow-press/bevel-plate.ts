import type { EffectDefinition } from "@/lib/engine/types";
import { el, text } from "@/lib/engine/markup";
import { hsl, svgId, round } from "@/lib/engine/helpers";

/**
 * Specular bevel plate: a TRUE 3D metal relief, not a flat shadow illusion. The glyph
 * alpha is blurred into a height map (feGaussianBlur on SourceAlpha), then two real
 * lighting passes rake a distant light across that bevel — feDiffuseLighting paints the
 * metal body with form shading (light-facing edges bright, far edges self-shadowed) and
 * feSpecularLighting drops the sharp hotspot exactly ON the beveled rim. The result reads
 * like an engraved brass/steel plaque: rounded machined edges catching a consistent light,
 * with a thin dark contour so the plate separates from either theme. Static (no SMIL — the
 * light direction is a knob, kept static for cross-browser reliability).
 *
 * Diverges hard from Emboss (a flat two-offset text-shadow trick): here every pixel of the
 * bevel is lit by N·L, so edges genuinely curve and highlights sit on the metal, not beside it.
 */

type Metal = {
  /** body hue/sat + per-theme lightness */
  h: number;
  s: number;
  ld: number;
  ll: number;
  /** specular highlight tint */
  sh: number;
  ss: number;
  sl: number;
};

const METALS: Record<string, Metal> = {
  steel: { h: 214, s: 14, ld: 76, ll: 66, sh: 210, ss: 18, sl: 97 },
  brass: { h: 44, s: 58, ld: 62, ll: 54, sh: 48, ss: 45, sl: 95 },
  copper: { h: 20, s: 58, ld: 60, ll: 52, sh: 26, ss: 55, sl: 94 },
  gunmetal: { h: 220, s: 12, ld: 60, ll: 44, sh: 215, ss: 15, sl: 90 },
};

/** HSL(%) -> #rrggbb so SVG lighting-color/flood-color parse identically in every browser. */
function hslHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = ln - c / 2;
  const hx = (v: number): string =>
    Math.max(0, Math.min(255, Math.round((v + m) * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

const bevelPlate: EffectDefinition = {
  id: "bevel-plate",
  name: "Bevel Plate",
  category: "shadow-press",
  tags: ["bevel", "metal", "3d", "engraved", "plaque", "specular", "svg", "lighting"],
  caps: ["pure", "svgDefs"],
  pngSupport: "partial",
  supports: "SVG feDiffuse/feSpecularLighting bevel via filter:url(#…); best in Chromium, Firefox & Safari",
  controls: [
    { id: "metal", label: "Metal", type: "select", default: "steel", options: [
      { label: "Steel", value: "steel" },
      { label: "Brass", value: "brass" },
      { label: "Copper", value: "copper" },
      { label: "Gunmetal", value: "gunmetal" },
    ] },
    { id: "lightAngle", label: "Light", type: "angle", default: 235, min: 0, max: 360, step: 5, unit: "°" },
    { id: "elevation", label: "Elevation", type: "range", default: 52, min: 22, max: 78, step: 1, unit: "°" },
    { id: "bevel", label: "Bevel", type: "range", default: 2.6, min: 1, max: 6, step: 0.2, unit: "px" },
    { id: "polish", label: "Polish", type: "range", default: 40, min: 5, max: 100, step: 5 },
  ],
  rand: (R) => ({
    metal: R.pick(["steel", "brass", "copper", "gunmetal"]),
    lightAngle: R.pick([215, 225, 235, 250, 315, 320]),
    elevation: R.ri(40, 62),
    bevel: Number(R.rnd(2, 3.6).toFixed(1)),
    polish: R.pick([25, 35, 45, 55, 70]),
  }),
  build: (ctx) => {
    const key = (ctx.values.metal as string) in METALS ? (ctx.values.metal as string) : "steel";
    const m = METALS[key];
    const az = ctx.values.lightAngle as number;
    const el2 = ctx.values.elevation as number;
    const bevel = ctx.values.bevel as number;
    const polish = ctx.values.polish as number;
    const dark = ctx.theme === "dark";

    // Bevel geometry: blur width = how far the ramp reaches inside the edge;
    // surfaceScale = how tall the bump is (steeper = harder-lit edges).
    const blur = round(bevel, 2);
    const surface = round(2 + bevel * 1.3, 2);
    // Polish: soft satin sheen -> tight mirror hotspot.
    const specExp = Math.round(4 + polish * 0.9);
    const specConst = round(0.62 + polish / 300, 2);

    const bodyHex = hslHex(m.h, m.s, dark ? m.ld : m.ll);
    const specHex = hslHex(m.sh, m.ss, m.sl);
    // Dark machined contour so the plate reads on light AND dark stages.
    const rimHex = hslHex(m.h, 22, dark ? 15 : 13);
    const rimR = dark ? 1 : 1.4;
    const rimOp = dark ? 0.32 : 0.6;

    const fid = svgId(ctx.scope, "bevel");

    const defs =
      `<filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">\n` +
      // Height map: blur the glyph alpha into a smooth edge ramp (the bevel).
      `  <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="bump"/>\n` +
      // Metal body: real diffuse form shading, lit from the chosen direction.
      `  <feDiffuseLighting in="bump" surfaceScale="${surface}" diffuseConstant="1.1" lighting-color="${bodyHex}" result="diffuse">\n` +
      `    <feDistantLight azimuth="${az}" elevation="${el2}"/>\n` +
      `  </feDiffuseLighting>\n` +
      // Specular hotspot on the light-facing rim.
      `  <feSpecularLighting in="bump" surfaceScale="${surface}" specularConstant="${specConst}" specularExponent="${specExp}" lighting-color="${specHex}" result="spec">\n` +
      `    <feDistantLight azimuth="${az}" elevation="${el2}"/>\n` +
      `  </feSpecularLighting>\n` +
      // Clip the highlight to the crisp glyph so it sits ON the metal, then add over the body.
      `  <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip"/>\n` +
      `  <feComposite in="specClip" in2="diffuse" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit"/>\n` +
      // Trim the lit rectangle back to the exact glyph silhouette.
      `  <feComposite in="lit" in2="SourceAlpha" operator="in" result="plate"/>\n` +
      // Dark contour rim behind the plate for cross-theme separation.
      `  <feMorphology in="SourceAlpha" operator="dilate" radius="${rimR}" result="fat"/>\n` +
      `  <feFlood flood-color="${rimHex}" flood-opacity="${rimOp}" result="rimC"/>\n` +
      `  <feComposite in="rimC" in2="fat" operator="in" result="rim"/>\n` +
      `  <feMerge>\n    <feMergeNode in="rim"/>\n    <feMergeNode in="plate"/>\n  </feMerge>\n` +
      `</filter>`;

    // Fallback fill (opaque so SourceAlpha exists; also the graceful look if filters are off).
    const css =
      `.${ctx.scope} {\n` +
      `  color: ${hsl(m.h, m.s, dark ? m.ld : m.ll)};\n` +
      `  filter: url(#${fid});\n` +
      `}`;

    return { root: el("div", { children: [text(ctx.text)] }), css, defs };
  },
};

export default bevelPlate;
