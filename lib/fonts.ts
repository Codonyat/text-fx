// Typeface registry. Loaded via a single Google Fonts stylesheet so the *literal*
// family names work identically in the live preview, the hand-edited CSS panel, and
// the exported CSS/HTML (real names + a Google Fonts link = portable output).

export interface FontDef {
  /** Display label shown in the Font control. */
  name: string;
  /** CSS font-family value (real names, export-safe). */
  family: string;
  /** css2 `family=` segment used to build the Google Fonts URL. */
  google: string;
  license: string;
}

export const FONTS: FontDef[] = [
  { name: "Anton", family: "'Anton', sans-serif", google: "Anton", license: "OFL" },
  { name: "Archivo Black", family: "'Archivo Black', sans-serif", google: "Archivo+Black", license: "OFL" },
  { name: "Bungee", family: "'Bungee', cursive", google: "Bungee", license: "OFL" },
  { name: "Syne", family: "'Syne', sans-serif", google: "Syne:wght@600;700;800", license: "OFL" },
  { name: "Unbounded", family: "'Unbounded', sans-serif", google: "Unbounded:wght@400;700;900", license: "OFL" },
  { name: "Major Mono", family: "'Major Mono Display', monospace", google: "Major+Mono+Display", license: "OFL" },
  { name: "Bricolage", family: "'Bricolage Grotesque', sans-serif", google: "Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800", license: "OFL" },
  { name: "Space Mono", family: "'Space Mono', monospace", google: "Space+Mono:wght@400;700", license: "OFL" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif", google: "Space+Grotesk:wght@400;500;600;700", license: "OFL" },
  // Variable font for the variable-font / morph effect family. Loads four axes:
  // slnt (0..-15), wght (300..1000), CASL (0 linear .. 1 casual), MONO (0 sans .. 1 mono).
  { name: "Recursive", family: "'Recursive', sans-serif", google: "Recursive:slnt,wght,CASL,MONO@-15..0,300..1000,0..1,0..1", license: "OFL" },
];

// Effect-forced families that never appear in the Font picker: color fonts, layer
// fonts, and single-purpose faces used via EffectDefinition.font. An effect's forced
// `font` string must EXACTLY match a `family` below or exports ship no font link.
// Font binaries are fetched lazily by the browser only when a family is used, so
// these cost only stylesheet bytes app-wide.
export const EXTRA_FONTS: FontDef[] = [
  // COLRv1 color fonts (glyphs carry their own vector paint layers).
  { name: "Nabla", family: "'Nabla', system-ui", google: "Nabla", license: "OFL" },
  { name: "Foldit", family: "'Foldit', sans-serif", google: "Foldit:wght@100..900", license: "OFL" },
  // Honk variable axes: MORF (ornament morph 0..45), SHLN (shine line 0..100).
  { name: "Honk", family: "'Honk', system-ui", google: "Honk:MORF,SHLN@0..45,0..100", license: "OFL" },
  // Bungee chromatic layer fonts (stacked with base Bungee for multi-color signage).
  { name: "Bungee Inline", family: "'Bungee Inline', cursive", google: "Bungee+Inline", license: "OFL" },
  { name: "Bungee Shade", family: "'Bungee Shade', cursive", google: "Bungee+Shade", license: "OFL" },
  // Pixel face for the 8-bit effect (CSS cannot pixelate arbitrary vector fonts).
  { name: "Silkscreen", family: "'Silkscreen', cursive", google: "Silkscreen:wght@400;700", license: "OFL" },
  // Swash-capable serif for the OpenType flourish effect (italic carries the swashes).
  { name: "Sorts Mill Goudy", family: "'Sorts Mill Goudy', serif", google: "Sorts+Mill+Goudy:ital@0;1", license: "OFL" },
];

/** Every loadable typeface (picker set + effect-forced extras). */
export const ALL_FONTS: FontDef[] = [...FONTS, ...EXTRA_FONTS];

/** Fonts offered in the per-effect Font control (display set). */
export const DISPLAY_FONTS = FONTS;

/** Single stylesheet href covering every typeface. */
export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  ALL_FONTS.map((f) => "family=" + f.google).join("&") +
  "&display=swap";

/** Map a CSS family value back to its FontDef (for export font-link metadata). */
export function fontByFamily(family: string): FontDef | undefined {
  return ALL_FONTS.find((f) => f.family === family);
}

/** Build a minimal Google Fonts link for just the families used in an export. */
export function googleHrefForFamilies(families: string[]): string {
  const defs = families.map(fontByFamily).filter(Boolean) as FontDef[];
  if (defs.length === 0) return "";
  return (
    "https://fonts.googleapis.com/css2?" +
    defs.map((f) => "family=" + f.google).join("&") +
    "&display=swap"
  );
}
