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
  // Variable font (wght + slnt) for the variable-font / morph effect family.
  { name: "Recursive", family: "'Recursive', sans-serif", google: "Recursive:slnt,wght@-15..0,300..1000", license: "OFL" },
];

/** Fonts offered in the per-effect Font control (display set). */
export const DISPLAY_FONTS = FONTS;

/** UI chrome fonts. */
export const UI_FONT_BRUTALIST = "'Space Mono', monospace";
export const UI_FONT_LAB = "'Space Grotesk', sans-serif";
export const CODE_FONT = "'Space Mono', monospace";

/** Single stylesheet href covering every typeface. */
export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  FONTS.map((f) => "family=" + f.google).join("&") +
  "&display=swap";

/** Map a CSS family value back to its FontDef (for export font-link metadata). */
export function fontByFamily(family: string): FontDef | undefined {
  return FONTS.find((f) => f.family === family);
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
