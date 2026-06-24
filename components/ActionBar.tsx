"use client";

import { CATEGORIES } from "@/lib/effects/taxonomy";
import styles from "./ActionBar.module.css";

export function ActionBar({
  effectName,
  lockCategory,
  saved,
  shared,
  onShuffle,
  onSetLock,
  onSave,
  onShare,
}: {
  effectName: string;
  lockCategory: string;
  saved: boolean;
  shared: boolean;
  onShuffle: () => void;
  onSetLock: (id: string) => void;
  onSave: () => void;
  onShare: () => void;
}) {
  return (
    <div className={styles.bar}>
      <button type="button" className={styles.shuffle} onClick={onShuffle}>
        <span className={styles.glyph} aria-hidden="true">
          ⟳
        </span>
        SHUFFLE
      </button>

      <select
        className={styles.lock}
        value={lockCategory}
        onChange={(e) => onSetLock(e.target.value)}
        aria-label="Lock shuffle to category"
        title="Lock shuffle to a category"
      >
        <option value="">ALL</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button type="button" className={styles.secondary} onClick={onSave}>
        {saved ? "✓ SAVED" : "+ SAVE"}
      </button>

      <button type="button" className={styles.secondary} onClick={onShare}>
        {shared ? "✓ LINK" : "↗ SHARE"}
      </button>

      <div className={styles.badge}>
        <div className={styles.badgeLabel}>effect</div>
        <div className={styles.badgeName}>{effectName}</div>
      </div>
    </div>
  );
}
