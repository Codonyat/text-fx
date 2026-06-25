// Site-wide constants. Single source of truth for SEO/GEO URLs and copy.

export const SITE_URL = "https://text-fx.app";
export const SITE_NAME = "TEXT-FX";
export const TAGLINE = "Random CSS Text Effects Generator";
export const DESCRIPTION =
  "Shuffle, tune and export 97 pure-CSS text effects — neon, gradient, chrome, glitch, 3D, fire and more. Copy the CSS, HTML, React/JSX, a standalone file, a PNG or a share link. Free, no signup.";
export const TWITTER = ""; // e.g. "@textfx" — left blank until a handle exists

/** Absolute URL for a site-relative path. */
export function abs(path: string): string {
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}
