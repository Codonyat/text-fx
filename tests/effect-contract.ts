// Per-effect contract assertions, shared between the registry-wide suite
// (engine.test.ts) and the single-file worker harness (single-effect.test.ts).
// Not a *.test.ts file — vitest never collects it directly.
import { expect } from "vitest";
import { defaultValues, randomizeValues, render } from "@/lib/engine/build";
import { exportCss, exportHtml, exportJsx, exportStandaloneHtml } from "@/lib/engine/serialize";
import { makeRng } from "@/lib/engine/rng";
import { SITE_URL } from "@/lib/site";
import type { EffectDefinition } from "@/lib/engine/types";

export const SAMPLE = "Glow & <Café> 42";

/** Remove balanced @keyframes/@property blocks so we can lint top-level selectors. */
export function stripAtBlocks(css: string, keyword: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const idx = css.indexOf(keyword, i);
    if (idx === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, idx);
    const brace = css.indexOf("{", idx);
    if (brace === -1) {
      i = idx + keyword.length;
      continue;
    }
    let depth = 1;
    let j = brace + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    i = j;
  }
  return out;
}

export function assertBuildsScopedCss(effect: EffectDefinition): void {
  const r = render(effect, defaultValues(effect), SAMPLE, { scope: "fxlive", theme: "dark" });
  expect(r.styleText).toBeTruthy();
  expect(r.styleText).toContain(".fxlive");
}

export function assertScopeLint(effect: EffectDefinition): void {
  const scope = "fxlive";
  const r = render(effect, defaultValues(effect), SAMPLE, { scope, theme: "dark" });
  const css = r.styleText;

  for (const m of css.matchAll(/@keyframes\s+([\w-]+)/g)) {
    expect(m[1].startsWith(scope), `keyframes ${m[1]}`).toBe(true);
  }
  for (const m of css.matchAll(/@property\s+(--[\w-]+)/g)) {
    expect(m[1].startsWith(`--${scope}`), `@property ${m[1]}`).toBe(true);
  }
  for (const m of css.matchAll(/@font-palette-values\s+(--[\w-]+)/g)) {
    expect(m[1].startsWith(`--${scope}`), `@font-palette-values ${m[1]}`).toBe(true);
  }
  for (const m of css.matchAll(/url\(#([\w-]+)\)/g)) {
    expect(m[1].startsWith(scope), `url(#${m[1]})`).toBe(true);
  }
  // Named scroll/view timelines are unsalted globals — anonymous view()/scroll() only.
  expect(
    css.match(/\b(?:scroll|view)-timeline-name\s*:/),
    "named scroll/view timelines are banned; use anonymous view()/scroll()",
  ).toBeNull();
  // Top-level selectors must all be scoped.
  const noAt = stripAtBlocks(stripAtBlocks(css, "@keyframes"), "@property");
  for (const m of noAt.matchAll(/([^{}]+)\{/g)) {
    const sel = m[1].trim();
    if (!sel || sel.startsWith("@")) continue;
    expect(sel.includes(`.${scope}`), `selector "${sel}"`).toBe(true);
  }
}

export function assertRescopingTotal(effect: EffectDefinition): void {
  const values = defaultValues(effect);
  const a = render(effect, values, SAMPLE, { scope: "fxaaa", theme: "dark" });
  const b = render(effect, values, SAMPLE, { scope: "fxbbb", theme: "dark" });
  expect(a.styleText.split("fxaaa").join("§")).toBe(b.styleText.split("fxbbb").join("§"));
}

export function assertDataTextAttr(effect: EffectDefinition): void {
  if (!effect.caps.includes("dataText")) return;
  const r = render(effect, defaultValues(effect), SAMPLE, { scope: "fxlive", theme: "dark" });
  expect(r.root.attrs?.["data-text"]).toBe(SAMPLE);
}

export function assertExporters(effect: EffectDefinition): void {
  const values = defaultValues(effect);
  const css = exportCss(effect, values, SAMPLE, "dark");
  expect(css).toContain(".text-effect");
  // Attribution in every code export (growth requirement).
  expect(css).toContain(`made with TEXT-FX · ${SITE_URL}`);

  const html = exportHtml(effect, values, SAMPLE, "dark");
  expect(html).toContain("<style>");
  expect(html).toContain(`<!-- Made with TEXT-FX · ${SITE_URL} -->`);
  // user text is HTML-escaped (contiguous for single-element, per-span for perLetter)
  if (effect.caps.includes("perLetter")) {
    expect(html).toContain("&lt;");
    expect(html).toContain("&gt;");
    expect(html).toContain("&amp;");
  } else {
    expect(html).toContain("&lt;Café&gt;");
  }

  const jsx = exportJsx(effect, values, SAMPLE, "dark");
  expect(jsx).toContain("className=");
  expect(jsx).toContain(`{/* Made with TEXT-FX · ${SITE_URL} */}`);

  const doc = exportStandaloneHtml(effect, values, SAMPLE, "dark");
  expect(doc.startsWith("<!doctype html>")).toBe(true);
  expect(doc).toContain("made with TEXT-FX");
  expect(doc).toContain(SITE_URL);

  // Normalized parity: the exact generated CSS is embedded verbatim; only the
  // attribution header differs from render()'s styleText.
  const r = render(effect, values, SAMPLE, { scope: "text-effect", mode: "export", theme: "dark" });
  expect(css).toContain(r.styleText);
}

export function assertRandDeterminism(effect: EffectDefinition): void {
  expect(randomizeValues(effect, makeRng(7))).toEqual(randomizeValues(effect, makeRng(7)));
}

/**
 * One-shot ("entrance") effects that sit static after mount must restart on hover
 * via the pure-CSS trick: a `:hover` rule swaps `animation-name` to a salted
 * DUPLICATE keyframe (identical body, name ending in "-r").
 */
export function assertHoverReplay(effect: EffectDefinition): void {
  const scope = "fxlive";
  const css = render(effect, defaultValues(effect), SAMPLE, { scope, theme: "dark" }).styleText;

  // A :hover rule on the scope root swaps animation-name (root, per-letter or pseudo).
  const m = css.match(/\.fxlive:hover[^{]*\{\s*animation-name:\s*([^;]+);/);
  expect(m, `${effect.id} emits a ":hover { animation-name: … }" swap`).toBeTruthy();

  // Every swapped-in duplicate name is salted and has a matching @keyframes block.
  const dupes = m![1]
    .split(",")
    .map((s) => s.trim())
    .filter((n) => n.endsWith("-r"));
  expect(dupes.length, `${effect.id} swaps to a duplicate keyframe`).toBeGreaterThan(0);
  for (const name of dupes) {
    expect(name.startsWith(scope), `${effect.id} duplicate ${name} is salted`).toBe(true);
    expect(css.includes(`@keyframes ${name}`), `${effect.id} defines @keyframes ${name}`).toBe(true);
  }
}
