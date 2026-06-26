"use client";

import {
  createElement,
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
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

function placeCaretAtEdge(el: HTMLElement, atEnd: boolean) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(!atEnd); // collapse(true) → start, collapse(false) → end
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
  ghostStyle,
  onTextChange,
}: {
  rootClass: string;
  text: string;
  caps: Capability[];
  root: MarkupNode;
  defs?: string;
  reduceMotion: boolean;
  selectAllOnFocus: boolean;
  ghostStyle?: CSSProperties;
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
    // perLetter is a dep so this re-runs when the editable node remounts on a
    // single-element <-> per-letter mode switch (the distinct branch keys force a
    // fresh node) — otherwise the new node stays empty when `text` is unchanged.
  }, [text, dataText, perLetter]);

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
  // Deferred a tick so a mouse click's caret placement doesn't collapse the selection.
  // Re-checked inside: bail if the field blurred or if anything was typed in the meantime
  // (the timer must never re-select mid-typing and eat the just-typed character).
  const handleFocus = () => {
    if (!selectAllOnFocus) return;
    const el = editRef.current;
    if (!el) return;
    const initial = el.textContent;
    window.setTimeout(() => {
      if (document.activeElement === el && el.textContent === initial) selectAllContents(el);
    }, 0);
  };

  // Clicking the empty stage (not the glyphs) still focuses the text and drops the caret
  // at the nearest edge — left half → before the first character, right half → after the
  // last — so you don't have to land exactly on a letter to start typing.
  const handleStageMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return; // primary button only; leave right-click/context menu alone
    const el = editRef.current;
    if (!el || el.contains(e.target as Node)) return; // clicked on the text → let the browser place the caret
    e.preventDefault(); // we manage focus + caret ourselves (keeps the selection)
    el.focus();
    const rect = el.getBoundingClientRect();
    placeCaretAtEdge(el, e.clientX >= rect.left + rect.width / 2);
  };

  return (
    <div
      className={`${styles.stage}${reduceMotion ? " fx-reduce-motion" : ""}`}
      onMouseDown={handleStageMouseDown}
    >
      {/* Distinct keys on the two branch roots: without them React reuses the same
          <div> across a mode switch (same tag + position) and orphans the
          imperatively-set text node inside the repurposed element. */}
      {perLetter ? (
        <div key="pl" className={styles.layers}>
          <div className={`${styles.text} ${styles.preview}`} aria-hidden="true">
            {toReact(root, createElement as unknown as CreateElementLike) as ReactNode}
          </div>
          <div
            ref={editRef}
            className={`${styles.text} ${styles.ghost}`}
            style={ghostStyle}
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
          key="se"
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
