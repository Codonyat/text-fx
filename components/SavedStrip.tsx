"use client";

import { createElement, type ReactNode } from "react";
import { toReact, type CreateElementLike } from "@/lib/engine/markup";
import type { Rendered } from "@/lib/engine/types";
import type { Favorite } from "@/lib/store/favorites";
import styles from "./SavedStrip.module.css";

export interface SavedItem {
  fav: Favorite;
  rendered: Rendered;
}

export function SavedStrip({
  items,
  onLoad,
  onRemove,
}: {
  items: SavedItem[];
  onLoad: (f: Favorite) => void;
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className={styles.strip}>
        <div className={styles.label}>Saved</div>
        <p className={styles.hint}>save effects you like — they’ll show up here</p>
      </div>
    );
  }
  return (
    <div className={styles.strip}>
      <div className={styles.label}>Saved — {items.length}</div>
      <div className={styles.row}>
        {items.map(({ fav, rendered }) => (
          <div key={fav.id} className={styles.cardWrap}>
            <button
              type="button"
              className={styles.card}
              title={fav.name}
              aria-label={`Load saved ${fav.name}`}
              onClick={() => onLoad(fav)}
            >
              <div className={styles.inner}>
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
            </button>
            <button
              type="button"
              className={styles.del}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(fav.id);
              }}
              aria-label={`Delete ${fav.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
