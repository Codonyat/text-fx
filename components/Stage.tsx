"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { toReact, type CreateElementLike } from "@/lib/engine/markup";
import type { Capability, MarkupNode } from "@/lib/engine/types";
import styles from "./Stage.module.css";

export function Stage({
  rootClass,
  text,
  caps,
  root,
  defs,
  reduceMotion,
  onTextChange,
}: {
  rootClass: string;
  text: string;
  caps: Capability[];
  root: MarkupNode;
  defs?: string;
  reduceMotion: boolean;
  onTextChange: (t: string) => void;
}) {
  const perLetter = caps.includes("perLetter");
  const dataText = caps.includes("dataText");
  const editRef = useRef<HTMLDivElement>(null);

  // Push external text changes (shuffle/load) into the editable node without
  // clobbering the caret while the user is typing.
  useEffect(() => {
    const el = editRef.current;
    if (!el) return;
    if ((el.textContent ?? "") !== text) el.textContent = text;
    if (dataText) el.dataset.text = text;
  }, [text, dataText]);

  const handleInput = () => {
    const el = editRef.current;
    if (!el) return;
    const t = el.textContent ?? "";
    if (dataText) el.dataset.text = t;
    onTextChange(t);
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
