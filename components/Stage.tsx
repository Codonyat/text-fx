"use client";

import {
  createElement,
  useEffect,
  useRef,
  type ClipboardEvent as ReactClipboardEvent,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
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
    // pointerdown as well as pointermove so a touch tap (which never fires move)
    // still positions the effect at the finger.
    const setVars = (e: PointerEvent) => {
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
    el.addEventListener("pointermove", setVars);
    el.addEventListener("pointerdown", setVars);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", setVars);
      el.removeEventListener("pointerdown", setVars);
      el.removeEventListener("pointerleave", onLeave);
      // The single-element branch keeps a constant key across pointer→pointer
      // switches, so clear stale coords or the next effect inherits them.
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
  }, [pointer, perLetter]);

  const handleInput = () => {
    const el = editRef.current;
    if (!el) return;
    const t = el.textContent ?? "";
    if (dataText) el.dataset.text = t;
    onTextChange(t);
  };

  // The text model is a single line; contenteditable's Enter would insert a block
  // element, after which textContent silently merges the two lines (state/DOM desync).
  // Escape ends editing (mirrors clicking the stage background while focused).
  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
    if (e.key === "Escape") {
      e.preventDefault();
      editRef.current?.blur();
    }
  };

  // Strip formatting/markup on paste: take plain text only, collapse whitespace runs
  // to single spaces (the model is one line), and insert at the caret via execCommand
  // so undo and the onInput flow keep working.
  const handlePaste = (e: ReactClipboardEvent) => {
    e.preventDefault();
    const txt = e.clipboardData.getData("text/plain").replace(/\s+/g, " ");
    document.execCommand("insertText", false, txt);
  };

  // While the text is still the untouched starter, focusing the field selects all
  // of it so the first keystroke replaces it. Mouse focus is handled synchronously in
  // handleStageMouseDown; this covers programmatic/keyboard (Tab) focus.
  // Deferred a tick so focus's default caret placement doesn't collapse the selection.
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

  const handleStageMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return; // primary button only; leave right-click/context menu alone
    const el = editRef.current;
    if (!el) return;
    // Already editing + click on the stage background (not the glyphs) ends editing:
    // blur and clear the caret. Takes precedence over the pristine select-all branch so
    // a focused field + background click stops editing instead of re-selecting.
    if (document.activeElement === el && !el.contains(e.target as Node)) {
      e.preventDefault();
      el.blur();
      window.getSelection()?.removeAllRanges();
      return;
    }
    // Pristine starter text: any click (on the glyphs or the empty stage) selects it
    // all so the first keystroke replaces it. preventDefault stops native mouseup caret
    // placement from collapsing the selection.
    if (selectAllOnFocus) {
      e.preventDefault();
      el.focus();
      selectAllContents(el);
      return;
    }
    if (el.contains(e.target as Node)) return; // clicked on the text → let the browser place the caret
    // Clicking the empty stage (not the glyphs) still focuses the text and drops the caret
    // at the nearest edge — left half → before the first character, right half → after the last.
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
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
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
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
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

      <span className={styles.caption}>click or tap to edit</span>
    </div>
  );
}
