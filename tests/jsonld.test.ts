import { describe, it, expect } from "vitest";
import {
  serializeJsonLd,
  graph,
  webApplicationLd,
  webSiteLd,
  softwareSourceCodeLd,
  breadcrumbLd,
  collectionLd,
  faqLd,
} from "@/lib/jsonld";

describe("jsonld", () => {
  it("serializeJsonLd escapes html-sensitive chars and round-trips", () => {
    const out = serializeJsonLd({ a: "<b> & </b>", n: 1 });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).toContain("\\u003c");
    expect(JSON.parse(out)).toEqual({ a: "<b> & </b>", n: 1 });
  });

  it("graph wraps nodes with @context", () => {
    const g = graph(webApplicationLd(), webSiteLd()) as {
      "@context": string;
      "@graph": unknown[];
    };
    expect(g["@context"]).toBe("https://schema.org");
    expect(g["@graph"]).toHaveLength(2);
  });

  it("softwareSourceCodeLd carries the CSS as text", () => {
    const ld = softwareSourceCodeLd({
      name: "X",
      description: "d",
      css: ".text-effect{color:red}",
      url: "https://x.app/effects/x",
    }) as Record<string, unknown>;
    expect(ld["@type"]).toBe("SoftwareSourceCode");
    expect(ld.programmingLanguage).toBe("CSS");
    expect(String(ld.text)).toContain(".text-effect");
  });

  it("breadcrumb / collection / faq all serialize to valid JSON", () => {
    const blocks = [
      breadcrumbLd([{ name: "Home", url: "https://x.app/" }, { name: "Effects" }]),
      collectionLd({
        name: "a",
        description: "b",
        url: "https://x.app/effects",
        items: [{ name: "n", url: "https://x.app/effects/n" }],
      }),
      faqLd([{ q: "Q", a: "A" }]),
    ];
    for (const b of blocks) {
      expect(() => JSON.parse(serializeJsonLd(b))).not.toThrow();
    }
  });

  it("faq page is graph-wrapped so it carries @context (home-page regression guard)", () => {
    const g = graph(faqLd([{ q: "Q", a: "A" }])) as {
      "@context": string;
      "@graph": { "@type": string; mainEntity: unknown[] }[];
    };
    expect(g["@context"]).toBe("https://schema.org");
    expect(g["@graph"][0]["@type"]).toBe("FAQPage");
    expect(g["@graph"][0].mainEntity).toHaveLength(1);
  });
});
