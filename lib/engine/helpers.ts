// CSS-building helpers for effect authors. All identifier helpers take the
// per-instance `scope` so every generated name is salted (no global collisions).

/** Salted keyframe/animation name. */
export const anim = (scope: string, name: string): string => `${scope}-${name}`;
/** Salted SVG element id. */
export const svgId = (scope: string, name: string): string => `${scope}-${name}`;
/** Salted CSS custom-property / @property name (without leading --). */
export const prop = (scope: string, name: string): string => `--${scope}-${name}`;

export const hsl = (h: number, s: number, l: number, a = 1): string =>
  a >= 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${a})`;

export const round = (n: number, d = 2): number => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

/** Indent a multi-line declaration body for tidy nested CSS output. */
export const indent = (body: string, pad = "  "): string =>
  body
    .split("\n")
    .map((l) => (l.trim() ? pad + l : l))
    .join("\n");

/**
 * Build a `text-shadow` glow from concentric blurred layers.
 * Use ONLY on solid-fill text. For gradient/clipped text use {@link dropGlow}.
 */
export function glowShadow(color: string, blurs: number[], coreColor?: string): string {
  const layers = blurs.map((b, i) =>
    i === 0 && coreColor ? `0 0 ${b}px ${coreColor}` : `0 0 ${b}px ${color}`,
  );
  return `text-shadow: ${layers.join(", ")};`;
}

/**
 * Glow guard: `filter: drop-shadow()` glow that survives `background-clip:text`
 * / transparent-fill text (where `text-shadow` is invisible).
 */
export function dropGlow(color: string, blurs: number[]): string {
  const layers = blurs.map((b) => `drop-shadow(0 0 ${b}px ${color})`);
  return `filter: ${layers.join(" ")};`;
}

/** Stacked offset shadow layers (3D extrude / long shadow). */
export function offsetStack(
  layerColor: string,
  depth: number,
  dx = -1,
  dy = 1,
): string {
  const layers: string[] = [];
  for (let i = 1; i <= depth; i++) layers.push(`${i * dx}px ${i * dy}px 0 ${layerColor}`);
  return `text-shadow: ${layers.join(", ")};`;
}

/** CSS block to fill glyphs with a gradient via background-clip:text. */
export function clipText(background: string): string {
  return [
    `background: ${background};`,
    `-webkit-background-clip: text;`,
    `background-clip: text;`,
    `-webkit-text-fill-color: transparent;`,
    `color: transparent;`,
  ].join("\n  ");
}

/** Inline SVG <defs> content for an feTurbulence + feDisplacementMap warp filter. */
export function turbulenceFilter(
  id: string,
  opts: { freq?: number; octaves?: number; scale?: number; seed?: number } = {},
): string {
  const { freq = 0.02, octaves = 2, scale = 8, seed = 2 } = opts;
  return [
    `<filter id="${id}">`,
    `  <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" result="n"/>`,
    `  <feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>`,
    `</filter>`,
  ].join("\n");
}

/** `font-variation-settings` from axis→value pairs, e.g. fvs({ wght: 700, slnt: -8 }). */
export function fvs(axes: Record<string, number>): string {
  const parts = Object.entries(axes).map(([tag, v]) => `'${tag}' ${round(v, 2)}`);
  return `font-variation-settings: ${parts.join(", ")};`;
}

/**
 * Hover-replay rule for a one-shot ("entrance") animation. Emits a `:hover` rule that
 * swaps ONLY `animation-name` to a duplicate keyframe — the classic pure-CSS restart
 * trick: a different name makes the browser start a fresh animation from 0%, while every
 * other animation longhand (duration, timing, staggered per-letter delays) is inherited
 * from the base shorthand. Pair with {@link cloneKeyframes} to emit the salted duplicate
 * `@keyframes` this name refers to. `inner` is the selector suffix after `:hover`
 * (`""` for the scope root, `" .fx-ch"` for per-letter spans, `"::after"` for a
 * pseudo-element). `name` is the `animation-name` value — a single dup name, or a comma
 * list when the base rule runs several animations (swap only the one-shot names).
 */
export function hoverReplay(scope: string, inner: string, name: string): string {
  return `.${scope}:hover${inner} {\n  animation-name: ${name};\n}`;
}

/**
 * Clone one `@keyframes fromName { … }` block out of a keyframes string, renamed to
 * `toName` (both already salted by the caller). Returns just the renamed duplicate block
 * to append after the original, so a hover name-swap has an identical animation to
 * restart. Matches a single level of nested braces (the keyframe steps); returns "" if
 * the block isn't found.
 */
export function cloneKeyframes(keyframes: string, fromName: string, toName: string): string {
  const esc = fromName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`@keyframes\\s+${esc}\\s*\\{(?:[^{}]|\\{[^{}]*\\})*\\}`);
  const m = keyframes.match(re);
  if (!m) return "";
  return m[0].replace(new RegExp(`@keyframes\\s+${esc}`), `@keyframes ${toName}`);
}

/** Pointer-tracking runtime snippet (sets --mx/--my on the scoped element). */
export function pointerSnippet(scopeClass: string): string {
  return [
    `const fx = document.querySelector('.${scopeClass}');`,
    `if (fx) {`,
    `  fx.addEventListener('pointermove', (e) => {`,
    `    const r = fx.getBoundingClientRect();`,
    `    if (!r.width || !r.height) return;`,
    `    fx.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');`,
    `    fx.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');`,
    `  });`,
    `  fx.addEventListener('pointerleave', () => {`,
    `    fx.style.removeProperty('--mx');`,
    `    fx.style.removeProperty('--my');`,
    `  });`,
    `}`,
  ].join("\n");
}
