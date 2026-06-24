"use client";

import type { Control as ControlDef, ControlValue } from "@/lib/engine/types";
import styles from "./Control.module.css";

function valueLabel(c: ControlDef, v: ControlValue): string {
  if (c.type === "toggle") {
    const on = c.onLabel ?? "ON";
    const off = c.offLabel ?? "OFF";
    return v ? on : off;
  }
  if (c.type === "select") {
    return c.options?.find((o) => o.value === v)?.label ?? String(v);
  }
  return `${v}${c.unit ?? ""}`;
}

export function Control({
  control: c,
  value,
  onChange,
}: {
  control: ControlDef;
  value: ControlValue;
  onChange: (v: ControlValue) => void;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.head}>
        <span className={styles.label}>{c.label}</span>
        <span className={styles.value}>{valueLabel(c, value)}</span>
      </div>

      {(c.type === "range" || c.type === "angle" || c.type === "number") && (
        <input
          type="range"
          className={styles.range}
          min={c.min}
          max={c.max}
          step={c.step ?? 1}
          value={Number(value)}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={c.label}
        />
      )}

      {c.type === "toggle" && (
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={Boolean(value)}
          onClick={() => onChange(!value)}
        >
          {valueLabel(c, value)}
        </button>
      )}

      {c.type === "select" && (
        <select
          className={styles.select}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={c.label}
        >
          {c.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {c.type === "color" && (
        <input
          type="color"
          className={styles.color}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={c.label}
        />
      )}
    </div>
  );
}
