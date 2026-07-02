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
  onReplay,
}: {
  effectName: string;
  lockCategory: string;
  saved: "" | "ok" | "fail";
  shared: "" | "ok" | "fail";
  onShuffle: () => void;
  onSetLock: (id: string) => void;
  onSave: () => void;
  onShare: () => void;
  onReplay: () => void;
}) {
  return (
    <div className={styles.bar}>
      <button type="button" className={styles.shuffle} onClick={onShuffle}>
        <span className={styles.glyph} aria-hidden="true">
          ⟳
        </span>
        SHUFFLE
      </button>

      <label htmlFor="lock-category" className={styles.lockLabel}>
        Lock
      </label>
      <select
        id="lock-category"
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
        <span aria-live="polite">
          {saved === "ok" ? "✓ SAVED" : saved === "fail" ? "SAVE FAILED" : "+ SAVE"}
        </span>
      </button>

      <button type="button" className={styles.secondary} onClick={onShare}>
        <span aria-live="polite">
          {shared === "ok" ? "✓ LINK" : shared === "fail" ? "LINK FAILED" : "↗ SHARE"}
        </span>
      </button>

      <button
        type="button"
        className={styles.replay}
        onClick={onReplay}
        aria-label="Replay animation"
        title="Replay animation"
      >
        ↻
      </button>

      <div className={styles.badge}>
        <div className={styles.badgeLabel}>effect</div>
        <div className={styles.badgeName}>{effectName}</div>
      </div>
    </div>
  );
}
