"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { toReact, type CreateElementLike } from "@/lib/engine/markup";
import type { Capability, MarkupNode } from "@/lib/engine/types";
import styles from "./Stage.module.css";

function selectAllContents(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export function Stage({
  rootClass,
  text,
  caps,
  root,
  defs,
  reduceMotion,
  selectAllOnFocus,
  onTextChange,
}: {
  rootClass: string;
  text: string;
  caps: Capability[];
  root: MarkupNode;
  defs?: string;
  reduceMotion: boolean;
  selectAllOnFocus: boolean;
  onTextChange: (t: string) => void;
}) {
  const perLetter = caps.includes("perLetter");
  const dataText = caps.includes("dataText");
  const pointer = caps.includes("pointer");
  const editRef = useRef<HTMLDivElement>(null);

  // Push external text changes (shuffle/load) into the editable node without
  // clobbering the caret while the user is typing.
  useEffect(() => {
    const el = editRef.current;
    if (!el) return;
    if ((el.textContent ?? "") !== text) el.textContent = text;
    if (dataText) el.dataset.text = text;
  }, [text, dataText]);

  // Pointer-reactive effects: feed the cursor position into --mx/--my (percent
  // within the scoped element) so CSS can position masks/gradients at the cursor.
  // Mirrors lib/engine/helpers.pointerSnippet so the live preview matches exports.
  // Pointer effects are single-element, so the scope class lives on editRef.
  useEffect(() => {
    if (!pointer || perLetter) return;
    const el = editRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    // On leave, drop the inline vars so the effect rests at its CSS default — which
    // several effects set off-centre so the resting/poster frame still shows it.
    const onLeave = () => {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [pointer, perLetter]);

  const handleInput = () => {
    const el = editRef.current;
    if (!el) return;
    const t = el.textContent ?? "";
    if (dataText) el.dataset.text = t;
    onTextChange(t);
  };

  // While the text is still the untouched starter, focusing the field selects all
  // of it so the first keystroke replaces it (instead of leaving the default behind).
  // Deferred a tick so a mouse click's caret placement doesn't collapse the selection;
  // re-checked inside so a stale timer can't select after the field has blurred.
  const handleFocus = () => {
    if (!selectAllOnFocus) return;
    const el = editRef.current;
    if (!el) return;
    window.setTimeout(() => {
      if (selectAllOnFocus && document.activeElement === el) selectAllContents(el);
    }, 0);
  };

  return (
    <div className={`${styles.stage}${reduceMotion ? " fx-reduce-motion" : ""}`}>
      {perLetter ? (
        <div className={styles.layers}>
          <div className={`${styles.text} ${styles.preview}`} aria-hidden="true">
            {toReact(root, createElement as unknown as CreateElementLike) as ReactNode}
          </div>
          <div
            ref={editRef}
            className={`${styles.text} ${styles.ghost}`}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleInput}
            onFocus={handleFocus}
            role="textbox"
            aria-label="Effect text"
          />
        </div>
      ) : (
        <div
          ref={editRef}
          className={`${styles.text} ${rootClass}`}
          {...(dataText ? { "data-text": text } : {})}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onInput={handleInput}
          onFocus={handleFocus}
          role="textbox"
          aria-label="Effect text"
        />
      )}

      {defs ? (
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          style={{ position: "absolute" }}
          dangerouslySetInnerHTML={{ __html: `<defs>${defs}</defs>` }}
        />
      ) : null}

      <span className={styles.caption}>click to edit</span>
    </div>
  );
}
