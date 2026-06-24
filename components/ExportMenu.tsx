"use client";

import { useEffect, useRef, useState } from "react";
import type { ControlValue, EffectDefinition, Theme } from "@/lib/engine/types";
import {
  exportCss,
  exportHtml,
  exportJsx,
  exportStandaloneHtml,
} from "@/lib/engine/serialize";
import { copyText, downloadDataUrl, downloadText, slugify } from "@/lib/export/download";
import { currentStageBg, nodeToPng } from "@/lib/export/png";
import styles from "./ExportMenu.module.css";

export function ExportMenu({
  effect,
  values,
  text,
  theme,
}: {
  effect: EffectDefinition;
  values: Record<string, ControlValue>;
  text: string;
  theme: Theme;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [note, setNote] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const flash = (m: string) => {
    setNote(m);
    window.setTimeout(() => setNote(""), 1400);
  };

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: Math.max(8, r.right - 210) });
    }
    setOpen((o) => !o);
  };

  const slug = slugify(effect.name);
  const run = (fn: () => void, msg?: string) => {
    fn();
    if (msg) flash(msg);
    setOpen(false);
  };

  const doPng = async (transparent: boolean) => {
    setOpen(false);
    const node = document.querySelector(".fx-live") as HTMLElement | null;
    if (!node) return;
    try {
      const url = await nodeToPng(node, { transparent, bg: currentStageBg() });
      downloadDataUrl(`${slug}.png`, url);
    } catch {
      flash("PNG failed");
    }
  };

  const png = effect.pngSupport;

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {note || "⤓ EXPORT"}
      </button>

      {open && pos ? (
        <>
          <div className={styles.scrim} onClick={() => setOpen(false)} aria-hidden="true" />
          <div className={styles.menu} role="menu" style={{ top: pos.top, left: pos.left }}>
            <button
              role="menuitem"
              onClick={() => run(() => copyText(exportHtml(effect, values, text, theme)), "HTML copied")}
            >
              Copy HTML
            </button>
            <button
              role="menuitem"
              onClick={() => run(() => copyText(exportJsx(effect, values, text, theme)), "JSX copied")}
            >
              Copy React / JSX
            </button>
            <div className={styles.sep} />
            <button
              role="menuitem"
              onClick={() =>
                run(() =>
                  downloadText(
                    `${slug}.html`,
                    exportStandaloneHtml(effect, values, text, theme, currentStageBg()),
                    "text/html",
                  ),
                )
              }
            >
              Download .html
            </button>
            <button
              role="menuitem"
              onClick={() =>
                run(() => downloadText(`${slug}.css`, exportCss(effect, values, text, theme, true), "text/css"))
              }
            >
              Download .css
            </button>
            <div className={styles.sep} />
            {png === "unsupported" ? (
              <div className={styles.disabled}>PNG n/a — use .html export</div>
            ) : (
              <>
                <button role="menuitem" onClick={() => doPng(false)}>
                  Export PNG{png === "partial" ? " — best-effort" : ""}
                </button>
                {png === "good" ? (
                  <button role="menuitem" onClick={() => doPng(true)}>
                    Export PNG (transparent)
                  </button>
                ) : null}
              </>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
