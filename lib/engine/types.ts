// Core engine types. One declarative EffectDefinition per effect; one pure build()
// produces an artifact consumed by the live preview, thumbnails, and every exporter.

export type Capability =
  | "pure" // single-element CSS only
  | "perLetter" // needs <span> per grapheme/word
  | "svgDefs" // needs inline <svg><defs> (filters/gradients/clipPath)
  | "dataText" // needs data-text attr for ::before/::after copies
  | "property" // emits @property registrations
  | "pointer" // needs --mx/--my pointer vars + a tiny listener
  | "scroll"; // uses animation-timeline: scroll()/view()

export type ControlType =
  | "color"
  | "range"
  | "select"
  | "toggle"
  | "angle"
  | "number";

export type ControlValue = number | string | boolean;

export interface SelectOption {
  label: string;
  value: string;
}

export interface Control {
  id: string;
  label: string;
  type: ControlType;
  default: ControlValue;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: SelectOption[];
  /** Toggle labels (default ON/OFF). */
  onLabel?: string;
  offLabel?: string;
  /** Hide unless this predicate over current values is true. */
  when?: (values: Record<string, ControlValue>) => boolean;
  /** Reserved for future live --var tuning. */
  cssVar?: string;
}

export type RenderMode = "preview" | "export" | "thumbnail";
export type Theme = "dark" | "light";

export interface BuildCtx {
  text: string;
  values: Record<string, ControlValue>;
  scope: string;
  caps: Capability[];
  mode: RenderMode;
  /** Background theme so effect colors can adapt (re-run on theme toggle). */
  theme: Theme;
}

// ---- Markup AST -------------------------------------------------------------
export interface TextSlot {
  kind: "text";
  value: string;
}
export interface ElementNode {
  kind: "el";
  tag: string;
  attrs?: Record<string, string | number>;
  /** CSS custom properties -> inline style, e.g. { "--i": 3 }. */
  vars?: Record<string, string | number>;
  children?: MarkupChild[];
}
export type MarkupChild = ElementNode | TextSlot;
export type MarkupNode = ElementNode;

export type Runtime = "none" | "pointerVars" | "scrollTimeline";

export interface BuildResult {
  /** Top styled element (engine assigns class = scope). */
  root: MarkupNode;
  /** CSS for this effect, selectors scoped under .${scope}. */
  css: string;
  keyframes?: string;
  propertyRules?: string;
  /** Inline SVG defs markup (the inner content of <defs>…</defs>). */
  defs?: string;
  runtime?: Runtime;
  runtimeSnippet?: string;
  /** Animation loop length (ms) for clean poster/WebM timing. */
  loopMs?: number;
}

export type PngSupport = "good" | "partial" | "unsupported";

export interface Rng {
  (): number;
  ri(a: number, b: number): number;
  rnd(a: number, b: number): number;
  pick<T>(arr: readonly T[]): T;
  chance(p: number): boolean;
}

export interface EffectDefinition {
  id: string;
  name: string;
  category: string; // taxonomy id
  tags: string[];
  caps: Capability[];
  split?: "grapheme" | "word" | "line";
  supports?: string;
  fallbackCss?: string;
  /** Force a specific CSS font-family (e.g. a variable font) instead of the shared
   *  Font control. The engine applies it in commonCss, exports load it, and the UI
   *  hides the now-moot Font control. */
  font?: string;
  pngSupport: PngSupport;
  controls: Control[];
  rand: (R: Rng) => Record<string, ControlValue>;
  build: (ctx: BuildCtx) => BuildResult;
}

/** The portable, persisted/shared description of a configured effect. */
export interface EffectSpec {
  v: 1;
  effectId: string;
  seed: number;
  values: Record<string, ControlValue>;
  text: string;
}

/** A fully rendered artifact ready to inject or serialize. */
export interface Rendered {
  scope: string;
  rootClass: string;
  root: MarkupNode;
  /** Full CSS for one <style> tag: propertyRules + common + css + keyframes. */
  styleText: string;
  defs?: string;
  runtime: Runtime;
  runtimeSnippet?: string;
  loopMs?: number;
  caps: Capability[];
}
