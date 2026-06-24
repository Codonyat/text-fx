"use client";

import type { ReactNode } from "react";
import styles from "./CssPanel.module.css";

export function CssPanel({
  css,
  copied,
  onCopy,
  onEdit,
  exportSlot,
}: {
  css: string;
  copied: boolean;
  onCopy: () => void;
  onEdit: (value: string) => void;
  exportSlot?: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>editable css</span>
        <div className={styles.tools}>
          {exportSlot}
          <button type="button" className={styles.copy} onClick={onCopy}>
            {copied ? "COPIED" : "COPY"}
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
