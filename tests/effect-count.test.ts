import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EFFECTS } from "@/lib/effects/registry";

/**
 * Guards the hand-maintained "N effects" SEO/marketing strings against drift.
 *
 * The sitemap, llms.txt, the JSON-LD CollectionPage and app/effects/opengraph-image.tsx
 * all derive their counts from EFFECTS.length automatically. The four files below hardcode
 * the number in prose (see CLAUDE.md "Adding effects"), so when the registry grows they must
 * be bumped by hand — and historically they drift (lib/site.ts once lagged at 61 while the
 * rest of the site was 97, silently advertising the wrong count in the home meta + JSON-LD).
 * This test fails CI when any of them falls out of sync.
 */
const COUNT = EFFECTS.length;

const FILES: { path: string; phrases: (n: number) => string[] }[] = [
  { path: "lib/site.ts", phrases: (n) => [`${n} pure-CSS text effects`] },
  { path: "app/effects/page.tsx", phrases: (n) => [`${n} pure-CSS text effects`] },
  { path: "app/opengraph-image.tsx", phrases: (n) => [`${n} effects`] },
  {
    path: "components/SeoFooter.tsx",
    phrases: (n) => [`${n} pure-CSS text effects`, `${n} effects across 13 categories`],
  },
];

describe("hardcoded effect-count strings stay in sync with the registry", () => {
  for (const { path, phrases } of FILES) {
    it(`${path} advertises ${COUNT} effects`, () => {
      const src = readFileSync(join(process.cwd(), path), "utf8");
      for (const phrase of phrases(COUNT)) {
        expect(
          src,
          `${path} should contain "${phrase}" — bump it (or the registry) so the hardcoded count matches EFFECTS.length=${COUNT}`,
        ).toContain(phrase);
      }
    });
  }
});
