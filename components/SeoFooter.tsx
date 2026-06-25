import Link from "next/link";
import { CATEGORIES } from "@/lib/effects/taxonomy";
import { SITE_NAME } from "@/lib/site";
import styles from "./SeoFooter.module.css";

/** Single source for the visible FAQ and the FAQPage JSON-LD on the homepage. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is TEXT-FX?",
    a: "TEXT-FX is a free generator for pure-CSS text effects. Type your text, shuffle through 97 effects across 13 categories, tune them live, then copy the CSS or export HTML, React/JSX, a PNG or a share link.",
  },
  {
    q: "Is it free?",
    a: "Yes — completely free, no signup, and it runs entirely in your browser.",
  },
  {
    q: "How do I use the generated CSS?",
    a: "Copy the CSS and apply the .text-effect class to any element. Effects that need extra markup (per-letter spans, SVG filters, a data-text attribute) include that HTML in the HTML and JSX exports.",
  },
  {
    q: "Do the effects work in all browsers?",
    a: "They target modern browsers. Some use -webkit- prefixes (text-stroke, background-clip:text) or newer features like @property; each effect's page notes its requirements.",
  },
  {
    q: "Can I edit the effects?",
    a: "Yes — every effect has live controls, and you can hand-edit the CSS in the editor and see it update instantly.",
  },
];

export function SeoFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <section className={styles.col}>
          <h1 className={styles.h1}>TEXT-FX — Random CSS Text Effects Generator</h1>
          <p className={styles.p}>
            Generate, tune and export 97 pure-CSS text effects — neon, gradient, chrome, glitch, 3D,
            fire and more. Free, no signup, runs in your browser.{" "}
            <Link className={styles.link} href="/effects">
              Browse all effects →
            </Link>
          </p>
        </section>

        <nav className={styles.col} aria-label="Effect categories">
          <h2 className={styles.h2}>Categories</h2>
          <ul className={styles.links}>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link className={styles.link} href={`/effects#${c.id}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className={styles.col}>
          <h2 className={styles.h2}>FAQ</h2>
          <dl className={styles.faq}>
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className={styles.q}>{f.q}</dt>
                <dd className={styles.a}>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <div className={styles.credit}>
        {SITE_NAME} · pure-CSS text effects · built with Next.js
      </div>
    </footer>
  );
}
