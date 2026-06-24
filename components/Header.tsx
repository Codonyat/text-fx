"use client";

import type { Theme } from "@/lib/engine/types";
import styles from "./Header.module.css";

export function Header({
  theme,
  view,
  onToggleTheme,
  onToggleView,
}: {
  theme: Theme;
  view: "studio" | "gallery";
  onToggleTheme: () => void;
  onToggleView: () => void;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.mark} />
        <div className={styles.word}>
          TEXT-FX <span className={styles.sub}>/ generator</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onToggleView}>
          {view === "studio" ? "▦ BROWSE" : "← STUDIO"}
        </button>
        <button type="button" className={styles.btn} onClick={onToggleTheme}>
          {theme === "dark" ? "◐ DARK" : "◑ LIGHT"}
        </button>
      </div>
    </header>
  );
}
