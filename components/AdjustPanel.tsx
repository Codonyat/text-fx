"use client";

import type { ControlValue, EffectDefinition } from "@/lib/engine/types";
import { visibleControls } from "@/lib/engine/build";
import { Control } from "./controls/Control";
import styles from "./Panel.module.css";

export function AdjustPanel({
  effect,
  values,
  onChange,
}: {
  effect: EffectDefinition;
  values: Record<string, ControlValue>;
  onChange: (id: string, value: ControlValue) => void;
}) {
  const controls = visibleControls(effect, values);
  return (
    <section className={styles.panel}>
      <div className={styles.header}>Adjust</div>
      <div className={styles.body}>
        {controls.map((c) => (
          <Control key={c.id} control={c} value={values[c.id]} onChange={(v) => onChange(c.id, v)} />
        ))}
      </div>
    </section>
  );
}
