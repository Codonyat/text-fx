"use client";

import { memo } from "react";

export interface StyleEntry {
  id: string;
  css: string;
}

/** Owns every generated <style> tag (keyed by scope) — one place, no head mutation. */
function StyleHostImpl({ styles }: { styles: StyleEntry[] }) {
  return (
    <>
      {styles.map((s) => (
        <style key={s.id} data-fx={s.id} dangerouslySetInnerHTML={{ __html: s.css }} />
      ))}
    </>
  );
}

export const StyleHost = memo(StyleHostImpl);
