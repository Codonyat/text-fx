import type { Metadata } from "next";
import Link from "next/link";
import { EFFECTS } from "@/lib/effects/registry";
import { CATEGORIES, CATEGORY_BY_ID } from "@/lib/effects/taxonomy";
import { serializeJsonLd, graph, collectionLd, breadcrumbLd } from "@/lib/jsonld";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { EffectPreview, posterValues } from "@/components/EffectPreview";
import styles from "./effects.module.css";

const SAMPLE = "Text";
const DESC =
  "Browse 196 pure-CSS text effects across 13 categories — neon, gradient, chrome, glitch, 3D, fire, glass and more. Open any in the generator to tune and export.";

export const metadata: Metadata = {
  title: "All CSS Text Effects",
  description: DESC,
  alternates: { canonical: "/effects" },
  openGraph: { type: "website", url: "/effects", siteName: SITE_NAME, title: "All CSS Text Effects", description: DESC, locale: "en_US" },
  twitter: { card: "summary_large_image", title: "All CSS Text Effects", description: DESC },
};

export default function EffectsIndex() {
  const ld = graph(
    collectionLd({
      name: "All CSS Text Effects",
      description: DESC,
      url: `${SITE_URL}/effects`,
      items: EFFECTS.map((e) => ({ name: e.name, url: `${SITE_URL}/effects/${e.id}` })),
    }),
    breadcrumbLd([{ name: "Home", url: `${SITE_URL}/` }, { name: "Effects" }]),
  );

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(ld) }} />

      <header className={styles.header}>
        <nav className={styles.breadcrumb}>
          <Link href="/">{SITE_NAME}</Link> <span>/</span> <span className={styles.current}>Effects</span>
        </nav>
        <h1 className={styles.h1}>CSS Text Effects</h1>
        <p className={styles.lede}>{DESC}</p>
        <nav className={styles.cats} aria-label="Jump to category">
          {CATEGORIES.map((c) => (
            <a key={c.id} href={`#${c.id}`} className={styles.chip}>
              {c.name}
            </a>
          ))}
        </nav>
        <p className={styles.count}>{EFFECTS.length} effects · 13 categories</p>
      </header>

      {CATEGORIES.map((cat) => {
        const effs = EFFECTS.filter((e) => e.category === cat.id);
        if (!effs.length) return null;
        return (
          <section key={cat.id} id={cat.id} className={styles.catSection}>
            <h2 className={styles.h2}>{cat.name}</h2>
            <p className={styles.catDesc}>{cat.description}</p>
            <div className={styles.grid}>
              {effs.map((eff) => (
                <Link key={eff.id} href={`/effects/${eff.id}`} className={styles.card}>
                  <EffectPreview
                    effect={eff}
                    values={posterValues(eff)}
                    word={SAMPLE}
                    scope={`fx-card-${eff.id}`}
                    fontSize={34}
                    minHeight={120}
                  />
                  <div className={styles.meta}>
                    <span className={styles.name}>{eff.name}</span>
                    <span className={styles.tag}>{CATEGORY_BY_ID[eff.category]?.name ?? eff.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
