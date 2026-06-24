import type {
  Control,
  ControlValue,
  EffectDefinition,
  ElementNode,
  RenderMode,
  Rendered,
  Rng,
  Theme,
} from "./types";
import { DISPLAY_FONTS } from "@/lib/fonts";

// ---- Shared controls (present on every effect, before effect-specific ones) ----
export const SHARED_CONTROLS: Control[] = [
  {
    id: "font",
    label: "Font",
    type: "select",
    default: "'Anton', sans-serif",
    options: DISPLAY_FONTS.map((f) => ({ label: f.name, value: f.family })),
  },
  {
    id: "weight",
    label: "Weight",
    type: "range",
    default: 700,
    min: 100,
    max: 900,
    step: 100,
  },
  {
    id: "tracking",
    label: "Tracking",
    type: "range",
    default: 0,
    min: -8,
    max: 28,
    step: 1,
    unit: "px",
  },
  {
    id: "case",
    label: "Case",
    type: "select",
    default: "none",
    options: [
      { label: "Normal", value: "none" },
      { label: "UPPER", value: "uppercase" },
      { label: "lower", value: "lowercase" },
      { label: "Title", value: "capitalize" },
    ],
  },
];

export function allControls(effect: EffectDefinition): Control[] {
  return [...SHARED_CONTROLS, ...effect.controls];
}

export function visibleControls(
  effect: EffectDefinition,
  values: Record<string, ControlValue>,
): Control[] {
  return allControls(effect).filter((c) => !c.when || c.when(values));
}

export function defaultValues(effect: EffectDefinition): Record<string, ControlValue> {
  const out: Record<string, ControlValue> = {};
  for (const c of allControls(effect)) out[c.id] = c.default;
  return out;
}

function randomizeShared(R: Rng): Record<string, ControlValue> {
  return {
    font: R.pick(DISPLAY_FONTS).family,
    weight: R.pick([700, 700, 700, 900, 400]),
    tracking: R.pick([0, 0, 0, 2, 4, 8, -1, -2]),
    case: R.pick(["none", "none", "none", "uppercase"]),
  };
}

export function randomizeValues(
  effect: EffectDefinition,
  R: Rng,
): Record<string, ControlValue> {
  return { ...defaultValues(effect), ...randomizeShared(R), ...effect.rand(R) };
}

/** Clamp/validate decoded values against the effect's controls (share-URL safety). */
export function sanitizeValues(
  effect: EffectDefinition,
  raw: Record<string, ControlValue> | undefined,
): Record<string, ControlValue> {
  const out = defaultValues(effect);
  if (!raw || typeof raw !== "object") return out;
  for (const c of allControls(effect)) {
    const v = raw[c.id];
    if (v === undefined || v === null) continue;
    if (c.type === "range" || c.type === "number" || c.type === "angle") {
      let n = Number(v);
      if (!Number.isFinite(n)) continue;
      if (c.min !== undefined) n = Math.max(c.min, n);
      if (c.max !== undefined) n = Math.min(c.max, n);
      out[c.id] = n;
    } else if (c.type === "toggle") {
      out[c.id] = Boolean(v);
    } else if (c.type === "select") {
      if (c.options?.some((o) => o.value === v)) out[c.id] = String(v);
    } else {
      out[c.id] = String(v);
    }
  }
  return out;
}

function commonCss(scope: string, values: Record<string, ControlValue>): string {
  const font = (values.font as string) ?? "'Anton', sans-serif";
  const weight = (values.weight as number) ?? 700;
  const tracking = (values.tracking as number) ?? 0;
  const tt = (values.case as string) ?? "none";
  return [
    `.${scope} {`,
    `  font-family: ${font};`,
    `  font-weight: ${weight};`,
    `  letter-spacing: ${tracking}px;`,
    `  text-transform: ${tt};`,
    `}`,
  ].join("\n");
}

function withRootClass(root: ElementNode, scope: string): ElementNode {
  const existing = root.attrs?.class ? String(root.attrs.class) : "";
  const cls = existing ? `${scope} ${existing}` : scope;
  return { ...root, attrs: { ...(root.attrs ?? {}), class: cls } };
}

export interface RenderOpts {
  scope?: string;
  mode?: RenderMode;
  theme?: Theme;
}

/** Render an effect to a full artifact for a given scope (default live preview). */
export function render(
  effect: EffectDefinition,
  values: Record<string, ControlValue>,
  textInput: string,
  opts: RenderOpts = {},
): Rendered {
  const scope = opts.scope ?? "fx-live";
  const mode = opts.mode ?? "preview";
  const theme = opts.theme ?? "dark";
  const text = textInput.length ? textInput : " ";
  const result = effect.build({ text, values, scope, caps: effect.caps, mode, theme });
  const common = commonCss(scope, values);
  const styleText = [result.propertyRules, common, result.css, result.keyframes]
    .filter((s): s is string => Boolean(s && s.trim()))
    .join("\n\n");
  return {
    scope,
    rootClass: scope,
    root: withRootClass(result.root, scope),
    styleText,
    defs: result.defs,
    runtime: result.runtime ?? "none",
    runtimeSnippet: result.runtimeSnippet,
    loopMs: result.loopMs,
    caps: effect.caps,
  };
}
