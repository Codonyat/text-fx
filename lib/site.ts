// Site-wide constants. Single source of truth for SEO/GEO URLs and copy.

const PLACEHOLDER = "https://text-fx.app";

function clean(url: string): string {
  return url.replace(/\/+$/, "");
}

export const SITE_URL = clean(process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER);
export const SITE_NAME = "TEXT-FX";
export const TAGLINE = "Random CSS Text Effects Generator";
export const DESCRIPTION =
  "Shuffle, tune and export 49 pure-CSS text effects — neon, gradient, chrome, glitch, 3D, fire and more. Copy the CSS, HTML, React/JSX, a standalone file, a PNG or a share link. Free, no signup.";
export const TWITTER = ""; // e.g. "@textfx" — left blank until a handle exists

if (process.env.NODE_ENV === "production" && SITE_URL === PLACEHOLDER) {
  console.warn(
    "[TEXT-FX] NEXT_PUBLIC_SITE_URL is still the placeholder (https://text-fx.app). " +
      "Set it to the real domain so canonical/OG/sitemap URLs are correct.",
  );
}

/** Absolute URL for a site-relative path. */
export function abs(path: string): string {
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}
