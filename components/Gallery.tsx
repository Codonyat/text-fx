"use client";

import { createElement, useMemo, useState, type ReactNode } from "react";
import { MANIFEST, getEffect } from "@/lib/effects/registry";
import { CATEGORIES, CATEGORY_BY_ID } from "@/lib/effects/taxonomy";
import { randomizeValues, render } from "@/lib/engine/build";
import { makeRng } from "@/lib/engine/rng";
import { toReact, type CreateElementLike } from "@/lib/engine/markup";
import type { Theme } from "@/lib/engine/types";
import { StyleHost, type StyleEntry } from "./StyleHost";
import styles from "./Gallery.module.css";

const SAMPLE = "Text";
type Motion = "all" | "animated" | "static";

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h || 1;
}

export function Gallery({ theme, onPick }: { theme: Theme; onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [motion, setMotion] = useState<Motion>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MANIFEST.filter((m) => {
      if (cat && m.category !== cat) return false;
      if (motion === "animated" && !m.animated) return false;
      if (motion === "static" && m.animated) return false;
      if (query) {
        const catName = CATEGORY_BY_ID[m.category]?.name.toLowerCase() ?? "";
        const hit =
          m.name.toLowerCase().includes(query) ||
          m.tags.some((t) => t.includes(query)) ||
          catName.includes(query);
        if (!hit) return false;
      }
      return true;
    });
  }, [q, cat, motion]);

  const posters = useMemo(
    () =>
      filtered.map((m) => {
        const eff = getEffect(m.id)!;
        const values = randomizeValues(eff, makeRng(hashSeed(m.id)));
        const rendered = render(eff, values, SAMPLE, {
          scope: `fx-gal-${m.id}`,
          theme,
          mode: "thumbnail",
        });
        return { m, rendered };
      }),
    [filtered, theme],
  );

  const styleEntries: StyleEntry[] = posters.map((p) => ({
    id: p.rendered.scope,
    css: p.rendered.styleText,
  }));

  return (
    <div className={styles.wrap}>
      <StyleHost styles={styleEntries} />
      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="Search effects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search effects"
        />
        <select
          className={styles.sel}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className={styles.sel}
          value={motion}
          onChange={(e) => setMotion(e.target.value as Motion)}
          aria-label="Filter by motion"
        >
          <option value="all">Any motion</option>
          <option value="animated">Animated</option>
          <option value="static">Static</option>
        </select>
        <span className={styles.count}>{filtered.length} effects</span>
      </div>

      <div className={styles.grid}>
        {posters.map(({ m, rendered }) => (
          <button
            key={m.id}
            type="button"
            className={styles.card}
            onClick={() => onPick(m.id)}
            title={m.name}
          >
            <div className={styles.poster}>
              <div className={styles.posterInner}>
                {toReact(rendered.root, createElement as unknown as CreateElementLike) as ReactNode}
              </div>
              {rendered.defs ? (
                <svg
                  width="0"
                  height="0"
                  aria-hidden="true"
                  style={{ position: "absolute" }}
                  dangerouslySetInnerHTML={{ __html: `<defs>${rendered.defs}</defs>` }}
                />
              ) : null}
            </div>
            <div className={styles.meta}>
              <span className={styles.name}>{m.name}</span>
              <span className={styles.tag}>{CATEGORY_BY_ID[m.category]?.name ?? m.category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
