import { SITE_URL, SITE_NAME, TAGLINE, DESCRIPTION } from "./site";

/**
 * Escape a JSON-LD payload for safe inline <script> injection.
 * (Our data is plain text/URLs, so the <>& escapes are sufficient.)
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/** Wrap nodes in a single @graph document. */
export function graph(...nodes: object[]): object {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function webApplicationLd(): object {
  return {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#app`,
    name: SITE_NAME,
    alternateName: `${SITE_NAME} — ${TAGLINE}`,
    url: `${SITE_URL}/`,
    description: DESCRIPTION,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern browser with CSS support",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Randomize CSS text effects",
      "Live tuning controls",
      "Copy CSS, HTML and React/JSX",
      "Export standalone HTML, a CSS file and PNG",
      "Shareable links",
      "Save favorites",
    ],
  };
}

export function webSiteLd(): object {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: DESCRIPTION,
  };
}

export function faqLd(items: { q: string; a: string }[]): object {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; url?: string }[]): object {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.url ? { item: it.url } : {}),
    })),
  };
}

export function softwareSourceCodeLd(opts: {
  name: string;
  description: string;
  css: string;
  url: string;
}): object {
  return {
    "@type": "SoftwareSourceCode",
    "@id": `${opts.url}#code`,
    name: opts.name,
    description: opts.description,
    programmingLanguage: "CSS",
    encodingFormat: "text/css",
    text: opts.css,
    url: opts.url,
    isPartOf: { "@id": `${SITE_URL}/#app` },
  };
}

export function collectionLd(opts: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string }[];
}): object {
  return {
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: it.url,
      })),
    },
  };
}
