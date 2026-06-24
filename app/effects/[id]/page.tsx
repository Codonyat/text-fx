import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EFFECTS, getEffect } from "@/lib/effects/registry";
import { CATEGORY_BY_ID } from "@/lib/effects/taxonomy";
import { exportCss, exportHtml } from "@/lib/engine/serialize";
import { encodeSpec } from "@/lib/engine/share";
import type { Capability } from "@/lib/engine/types";
import { describe, metaDescription } from "@/lib/effects/descriptions";
import { serializeJsonLd, graph, softwareSourceCodeLd, breadcrumbLd } from "@/lib/jsonld";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { EffectPreview, posterValues } from "@/components/EffectPreview";
import styles from "./effect.module.css";

export const dynamicParams = false;

const HTML_CAPS: Capability[] = ["perLetter", "dataText", "svgDefs", "pointer"];
const SAMPLE = "Your text";

export function generateStaticParams() {
  return EFFECTS.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const effect = getEffect(id);
  if (!effect) return {};
  const title = `${effect.name} — CSS Text Effect`;
  const description = metaDescription(effect);
  const canonical = `/effects/${id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "article", url: canonical, siteName: SITE_NAME, title, description, locale: "en_US" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EffectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const effect = getEffect(id);
  if (!effect) notFound();

  const cat = CATEGORY_BY_ID[effect.category];
  const values = posterValues(effect);
  const description = describe(effect);
  const animated = effect.tags.includes("animated");
  const css = exportCss(effect, values, SAMPLE, "dark");
  const needsMarkup = effect.caps.some((c) => HTML_CAPS.includes(c));
  const html = needsMarkup ? exportHtml(effect, values, SAMPLE, "dark") : null;
  const url = `${SITE_URL}/effects/${id}`;
  const related = EFFECTS.filter((e) => e.category === effect.category && e.id !== id).slice(0, 5);
  const shareHref = `/#s=${encodeSpec({ v: 1, effectId: effect.id, seed: 1, values, text: SAMPLE })}`;

  const ld = graph(
    softwareSourceCodeLd({ name: `${effect.name} CSS text effect`, description, css, url }),
    breadcrumbLd([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Effects", url: `${SITE_URL}/effects` },
      { name: effect.name },
    ]),
  );

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(ld) }} />

      <nav className={styles.breadcrumb}>
        <Link href="/">{SITE_NAME}</Link> <span>/</span> <Link href="/effects">Effects</Link>{" "}
        <span>/</span> <span className={styles.current}>{effect.name}</span>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.h1}>{effect.name}</h1>
        <p className={styles.kicker}>
          {cat?.name} · {animated ? "Animated" : "Static"} · pure CSS
        </p>
        <p className={styles.desc}>{description}</p>
        <div className={styles.actions}>
          <Link className={styles.cta} href={shareHref}>
            Open in the generator →
          </Link>
          <Link className={styles.secondary} href="/effects">
            All effects
          </Link>
        </div>
      </header>

      <div className={styles.previewWrap}>
        <EffectPreview
          effect={effect}
          values={values}
          word={effect.name}
          scope={`fx-effect-${id}`}
          fontSize={76}
          minHeight={260}
        />
      </div>

      <section className={styles.section}>
        <h2 className={styles.h2}>CSS</h2>
        <pre className={styles.code}>
          <code>{css}</code>
        </pre>
      </section>

      {html ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>HTML</h2>
          <p className={styles.note}>
            This effect needs the markup below (per-letter spans, SVG defs, or a data-text attribute).
          </p>
          <pre className={styles.code}>
            <code>{html}</code>
          </pre>
        </section>
      ) : (
        <p className={styles.note}>
          Pure CSS — just add the <code>.text-effect</code> class to any element.
        </p>
      )}

      <section className={styles.facts}>
        <dl className={styles.factGrid}>
          <div>
            <dt>Category</dt>
            <dd>
              <Link href={`/effects#${effect.category}`}>{cat?.name}</Link>
            </dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{animated ? "Animated" : "Static"}</dd>
          </div>
          <div>
            <dt>Browser support</dt>
            <dd>{effect.supports ?? "All modern browsers"}</dd>
          </div>
          <div>
            <dt>Capabilities</dt>
            <dd>{effect.caps.join(", ")}</dd>
          </div>
        </dl>
      </section>

      {related.length ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Related {cat?.name} effects</h2>
          <ul className={styles.related}>
            {related.map((e) => (
              <li key={e.id}>
                <Link href={`/effects/${e.id}`}>{e.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
