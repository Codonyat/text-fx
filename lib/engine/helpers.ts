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

/** Pointer-tracking runtime snippet (sets --mx/--my on the scoped element). */
export function pointerSnippet(scopeClass: string): string {
  return [
    `const fx = document.querySelector('.${scopeClass}');`,
    `fx && fx.addEventListener('pointermove', (e) => {`,
    `  const r = fx.getBoundingClientRect();`,
    `  fx.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');`,
    `  fx.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');`,
    `});`,
  ].join("\n");
}
