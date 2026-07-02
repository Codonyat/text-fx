"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ControlValue, EffectDefinition, Theme } from "@/lib/engine/types";
import {
  exportCss,
  exportHtml,
  exportJsx,
  exportStandaloneHtml,
} from "@/lib/engine/serialize";
import { copyText, downloadDataUrl, downloadText, slugify } from "@/lib/export/download";
import { currentStageBg, nodeToPng } from "@/lib/export/png";
import { track } from "@/lib/analytics";
import styles from "./ExportMenu.module.css";

const MENU_W = 210;

export function ExportMenu({
  effect,
  values,
  text,
  theme,
  cssOverride,
}: {
  effect: EffectDefinition;
  values: Record<string, ControlValue>;
  text: string;
  theme: Theme;
  cssOverride?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [note, setNote] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const wasOpen = useRef(false);

  // Deferred scroll/resize dismissal: attaching synchronously lets inertial
  // scroll fired right after the opening click close the menu immediately.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    let raf = 0;
    raf = requestAnimationFrame(() => {
      window.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // On open: clamp to the viewport (flip above / pin to bottom) and focus the
  // first item. On every close path: return focus to the trigger.
  useLayoutEffect(() => {
    if (open) {
      const menu = menuRef.current;
      const r = rectRef.current;
      if (menu && r) {
        const menuH = menu.offsetHeight;
        const margin = 8;
        let top = r.bottom + 6;
        if (top + menuH > window.innerHeight - margin) {
          const above = r.top - menuH - 6;
          top = above >= margin ? above : Math.max(margin, window.innerHeight - margin - menuH);
        }
        setPos({ top, left: Math.max(margin, r.right - MENU_W) });
        menu.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
      }
    } else if (wasOpen.current) {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  const flash = (m: string) => {
    setNote(m);
    window.setTimeout(() => setNote(""), 1400);
  };

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      rectRef.current = r;
      setPos({ top: r.bottom + 6, left: Math.max(8, r.right - MENU_W) });
    }
    setOpen((o) => !o);
  };

  const slug = slugify(effect.name);
  const run = async (fn: () => void | Promise<boolean>, msg?: string) => {
    setOpen(false);
    const res = await fn();
    if (res === false) flash("copy failed");
    else if (msg) flash(msg);
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    );
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      idx === -1
        ? 0
        : e.key === "ArrowDown"
          ? (idx + 1) % items.length
          : (idx - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const doPng = async (transparent: boolean) => {
    setOpen(false);
    const node = document.querySelector(".fx-live") as HTMLElement | null;
    if (!node) return;
    try {
      const url = await nodeToPng(node, { transparent, bg: currentStageBg() });
      downloadDataUrl(`${slug}.png`, url);
      track("export", { type: "png" });
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
          <div
            className={styles.menu}
            role="menu"
            ref={menuRef}
            style={{ top: pos.top, left: pos.left }}
            onKeyDown={onMenuKeyDown}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
            }}
          >
            <button
              role="menuitem"
              onClick={() => {
                track("export", { type: "html_copy" });
                run(() => copyText(exportHtml(effect, values, text, theme, cssOverride)), "HTML copied");
              }}
            >
              Copy HTML
            </button>
            <button
              role="menuitem"
              onClick={() => {
                track("export", { type: "jsx_copy" });
                run(() => copyText(exportJsx(effect, values, text, theme, cssOverride)), "JSX copied");
              }}
            >
              Copy React / JSX
            </button>
            <div className={styles.sep} />
            <button
              role="menuitem"
              onClick={() => {
                track("export", { type: "html_download" });
                run(() =>
                  downloadText(
                    `${slug}.html`,
                    exportStandaloneHtml(effect, values, text, theme, currentStageBg(), cssOverride),
                    "text/html",
                  ),
                );
              }}
            >
              Download .html
            </button>
            <button
              role="menuitem"
              onClick={() => {
                track("export", { type: "css_download" });
                run(() =>
                  downloadText(`${slug}.css`, exportCss(effect, values, text, theme, cssOverride), "text/css"),
                );
              }}
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
