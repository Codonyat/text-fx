"use client";

import type { ReactNode } from "react";
import styles from "./CssPanel.module.css";

export function CssPanel({
  css,
  copied,
  edited,
  onCopy,
  onEdit,
  onRevert,
  exportSlot,
}: {
  css: string;
  copied: "" | "ok" | "fail";
  edited: boolean;
  onCopy: () => void;
  onEdit: (value: string) => void;
  onRevert: () => void;
  exportSlot?: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          editable css
          {edited ? <span className={styles.edited}>EDITED</span> : null}
        </span>
        <div className={styles.tools}>
          {edited ? (
            <button type="button" className={styles.revert} onClick={onRevert}>
              REVERT
            </button>
          ) : null}
          {exportSlot}
          <button type="button" className={styles.copy} onClick={onCopy}>
            <span aria-live="polite">
              {copied === "ok" ? "COPIED" : copied === "fail" ? "COPY FAILED" : "COPY"}
            </span>
          </button>
        </div>
      </div>
      <textarea
        className={styles.code}
        spellCheck={false}
        value={css}
        onChange={(e) => onEdit(e.target.value)}
        aria-label="Editable CSS"
      />
    </section>
  );
}
