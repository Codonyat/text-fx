"use client";

import type { Theme } from "@/lib/engine/types";
import { EFFECTS } from "@/lib/effects/registry";
import styles from "./Header.module.css";

export function Header({
  theme,
  view,
  motionOn,
  onToggleTheme,
  onToggleMotion,
  onToggleView,
}: {
  theme: Theme;
  view: "studio" | "gallery";
  motionOn: boolean;
  onToggleTheme: () => void;
  onToggleMotion: () => void;
  onToggleView: () => void;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.mark} />
        <div className={styles.word}>
          TEXT-FX <span className={styles.sub}>/ generator</span>
        </div>
        <div className={styles.tagline}>
          {EFFECTS.length} pure-CSS text effects · free · no signup
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btn}
          onClick={onToggleView}
          aria-label={view === "studio" ? "Browse all effects" : "Back to studio"}
        >
          {view === "studio" ? "▦ BROWSE" : "← STUDIO"}
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? "◐ DARK" : "◑ LIGHT"}
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={onToggleMotion}
          aria-pressed={motionOn}
          aria-label={motionOn ? "Turn motion off" : "Turn motion on"}
        >
          {motionOn ? "≋ MOTION ON" : "≋ MOTION OFF"}
        </button>
      </div>
    </header>
  );
}
