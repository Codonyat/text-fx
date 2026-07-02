"use client";

import {
  createElement,
  useEffect,
  useRef,
  type ClipboardEvent as ReactClipboardEvent,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
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

export function Stage({
  rootClass,
  text,
  caps,
  root,
  defs,
  pristine,
  ghostStyle,
  onTextChange,
  onEditingEnd,
}: {
  rootClass: string;
  text: string;
  caps: Capability[];
  root: MarkupNode;
  defs?: string;
  pristine: boolean;
  ghostStyle?: CSSProperties;
  onTextChange: (t: string) => void;
  onEditingEnd: () => void;
}) {
  const perLetter = caps.includes("perLetter");
  const dataText = caps.includes("dataText");
  const pointer = caps.includes("pointer");
  const scroll = caps.includes("scroll");
  const editRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  // True once the pristine starter has been replaced by an insertion, so a second
  // same-tick insertText (before React re-renders pristine→false) can't re-select and
  // clobber the just-typed first character. Reset whenever the field is pristine again.
  const pristineConsumedRef = useRef(false);

  // Push external text changes (shuffle/load) into the editable node without
  // clobbering the caret while the user is typing.
  useEffect(() => {
    const el = editRef.current;
    if (!el) return;
    if ((el.textContent ?? "") !== text) el.textContent = text;
    if (dataText) el.dataset.text = text;
    // perLetter/scroll are deps so this re-runs when the editable node remounts on a
    // single-element <-> per-letter mode switch OR a scroll <-> non-scroll switch (the
    // scroller wrapper changes the branch's parent, which also forces a fresh node) —
    // otherwise the new node stays empty when `text` is unchanged.
  }, [text, dataText, perLetter, scroll]);

  // Pointer-reactive effects: feed the cursor position into --mx/--my (percent
  // within the scoped element) so CSS can position masks/gradients at the cursor.
  // Mirrors lib/engine/helpers.pointerSnippet so the live preview matches exports.
  // Single-element pointer effects carry the scope class on editRef; per-letter ones
  // get the vars on the layers wrapper (same box as the scoped preview root, and
  // custom properties inherit into it).
  useEffect(() => {
    if (!pointer) return;
    const el = perLetter ? layersRef.current : editRef.current;
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

  // Scroll-driven effects render inside a scrollable wrapper so their
  // animation-timeline: view()/scroll() timelines have real travel to scrub against.
  // Start mid-range so the initial frame shows the effect in motion, not an endpoint.
  useEffect(() => {
    if (!scroll) return;
    const sc = scrollerRef.current;
    if (!sc) return;
    const range = sc.scrollHeight - sc.clientHeight;
    if (range > 0) sc.scrollTop = range * 0.45;
  }, [scroll, rootClass]);

  // Pristine starter replacement, deferred to INPUT time (no select-all on click, so
  // clicking the text just drops a normal caret). While the field still holds the
  // untouched starter, the FIRST inserted text must replace the whole starter — so we
  // select-all just before the insertion applies. We listen for the *native* beforeinput
  // rather than React's onBeforeInput: React 19's synthetic onBeforeInput is a polyfill
  // whose nativeEvent is a legacy `textInput` event (no `inputType`) and never fires for
  // drops, so the real InputEvent is the only source of a reliable inputType. Only
  // insertText/insertFromDrop trigger the replacement; insertCompositionText is skipped
  // (IME is handled on compositionstart) and deletions edit normally. Re-attaches when
  // `pristine` flips (once) or when the editable node remounts on a mode switch.
  useEffect(() => {
    const el = editRef.current;
    if (!el) return;
    if (pristine) pristineConsumedRef.current = false;
    const onBeforeInput = (e: InputEvent) => {
      if (!pristine || pristineConsumedRef.current) return;
      if (e.inputType === "insertText" || e.inputType === "insertFromDrop") {
        selectAllContents(el);
        pristineConsumedRef.current = true;
      }
    };
    el.addEventListener("beforeinput", onBeforeInput);
    return () => el.removeEventListener("beforeinput", onBeforeInput);
  }, [pristine, perLetter]);

  const handleInput = () => {
    const el = editRef.current;
    if (!el) return;
    const t = el.textContent ?? "";
    if (dataText) el.dataset.text = t;
    onTextChange(t);
  };

  // The text model is a single line; contenteditable's Enter would insert a block
  // element, after which textContent silently merges the two lines (state/DOM desync).
  // Escape ends editing (blurs the field, matching a click on the non-editable grid).
  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
    if (e.key === "Escape") {
      e.preventDefault();
      editRef.current?.blur();
    }
  };

  // Strip formatting/markup on paste: take plain text only, collapse whitespace runs
  // to single spaces (the model is one line), and insert at the caret via execCommand
  // so undo and the onInput flow keep working. On pristine starter text, select all
  // first so the paste replaces the starter instead of merging into it.
  const handlePaste = (e: ReactClipboardEvent) => {
    e.preventDefault();
    const el = editRef.current;
    if (pristine && el) selectAllContents(el);
    const txt = e.clipboardData.getData("text/plain").replace(/\s+/g, " ");
    document.execCommand("insertText", false, txt);
  };

  // IME: beforeinput's insertCompositionText fires repeatedly mid-composition, so
  // pristine replacement for composed input is anchored here — select all once at the
  // start so the whole composition replaces the starter text.
  const handleCompositionStart = () => {
    const el = editRef.current;
    if (pristine && el) selectAllContents(el);
  };

  // Scope focus strictly to the text element. Chromium's selection hit-testing would
  // otherwise drop the caret into the nearest editable text when the grid background is
  // clicked (focusing the field), and it does NOT blur a focused contenteditable when a
  // non-focusable background is clicked. So: any primary mousedown outside the text is
  // suppressed — and if the field was being edited, it ends editing.
  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Scrollbar drags on the scroll-scrub wrapper hit the scroller element itself
    // (never its children) — suppressing them would break scrollbar dragging.
    if (e.target === scrollerRef.current) return;
    const el = editRef.current;
    if (!el || el.contains(e.target as Node)) return;
    e.preventDefault();
    if (document.activeElement === el) {
      el.blur();
      window.getSelection()?.removeAllRanges();
    } else if ((el.textContent ?? "") === "") {
      // Empty + unfocused: the editable has collapsed to a near-zero box and the glyphs
      // the "click the text" rule targets don't exist, so a click anywhere recovers
      // focus (dropping the caret) instead of being suppressed — otherwise an emptied
      // field would be unrecoverable.
      el.focus();
      selectAllContents(el);
    }
  };

  // Ending an edit with an empty/whitespace-only field would leave nothing to click back
  // into; let Studio restore the pristine starter. Fires for both the native blur (click
  // the grid / tab away) and the imperative blur() in handleStageMouseDown.
  const handleBlur = () => {
    onEditingEnd();
  };

  // Distinct keys on the two branch roots: without them React reuses the same
  // <div> across a mode switch (same tag + position) and orphans the
  // imperatively-set text node inside the repurposed element.
  const content = perLetter ? (
    <div key="pl" ref={layersRef} className={styles.layers}>
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
        onCompositionStart={handleCompositionStart}
        onBlur={handleBlur}
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
      onCompositionStart={handleCompositionStart}
      onBlur={handleBlur}
      role="textbox"
      aria-label="Effect text"
    />
  );

  return (
    <div
      className={styles.stage}
      onMouseDown={handleStageMouseDown}
    >
      {scroll ? (
        <div ref={scrollerRef} className={styles.scroller} data-fx-scroller>
          <div className={styles.scrollSpacer} aria-hidden="true" />
          {content}
          <div className={styles.scrollSpacer} aria-hidden="true" />
        </div>
      ) : (
        content
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

      <span className={styles.caption}>
        {scroll ? "scroll to scrub · click the text to edit" : "click the text to edit"}
      </span>
    </div>
  );
}
