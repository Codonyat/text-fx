import { describe, it, expect } from "vitest";
import { EFFECTS } from "@/lib/effects/registry";
import { defaultValues, randomizeValues, render, sanitizeValues } from "@/lib/engine/build";
import { exportCss, exportHtml, exportJsx, exportStandaloneHtml } from "@/lib/engine/serialize";
import { encodeSpec, decodeSpec } from "@/lib/engine/share";
import { makeRng } from "@/lib/engine/rng";
import type { EffectSpec } from "@/lib/engine/types";

const SAMPLE = "Glow & <Café> 42";

/** Remove balanced @keyframes/@property blocks so we can lint top-level selectors. */
function stripAtBlocks(css: string, keyword: string): string {
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

describe("rng determinism", () => {
  it("same seed -> same sequence", () => {
    const a = makeRng(123);
    const b = makeRng(123);
    expect([a(), a.ri(0, 100), a.rnd(0, 1)]).toEqual([b(), b.ri(0, 100), b.rnd(0, 1)]);
  });
  it("randomizeValues is deterministic per seed", () => {
    for (const e of EFFECTS) {
      expect(randomizeValues(e, makeRng(7))).toEqual(randomizeValues(e, makeRng(7)));
    }
  });
});

describe.each(EFFECTS.map((e) => [e.id, e] as const))("effect %s", (_id, effect) => {
  const values = defaultValues(effect);

  it("builds valid scoped CSS", () => {
    const r = render(effect, values, SAMPLE, { scope: "fxlive", theme: "dark" });
    expect(r.styleText).toBeTruthy();
    expect(r.styleText).toContain(".fxlive");
  });

  it("scope-lint: every generated identifier is salted (no global leaks)", () => {
    const scope = "fxlive";
    const r = render(effect, values, SAMPLE, { scope, theme: "dark" });
    const css = r.styleText;

    for (const m of css.matchAll(/@keyframes\s+([\w-]+)/g)) {
      expect(m[1].startsWith(scope), `keyframes ${m[1]}`).toBe(true);
    }
    for (const m of css.matchAll(/@property\s+(--[\w-]+)/g)) {
      expect(m[1].startsWith(`--${scope}`), `@property ${m[1]}`).toBe(true);
    }
    for (const m of css.matchAll(/url\(#([\w-]+)\)/g)) {
      expect(m[1].startsWith(scope), `url(#${m[1]})`).toBe(true);
    }
    // Top-level selectors must all be scoped.
    const noAt = stripAtBlocks(stripAtBlocks(css, "@keyframes"), "@property");
    for (const m of noAt.matchAll(/([^{}]+)\{/g)) {
      const sel = m[1].trim();
      if (!sel || sel.startsWith("@")) continue;
      expect(sel.includes(`.${scope}`), `selector "${sel}"`).toBe(true);
    }
  });

  it("rescoping is total (parity across scopes)", () => {
    const a = render(effect, values, SAMPLE, { scope: "fxaaa", theme: "dark" });
    const b = render(effect, values, SAMPLE, { scope: "fxbbb", theme: "dark" });
    expect(a.styleText.split("fxaaa").join("§")).toBe(b.styleText.split("fxbbb").join("§"));
  });

  it("dataText effects carry a data-text attribute", () => {
    if (!effect.caps.includes("dataText")) return;
    const r = render(effect, values, SAMPLE, { scope: "fxlive", theme: "dark" });
    expect(r.root.attrs?.["data-text"]).toBe(SAMPLE);
  });

  it("exporters produce non-empty, escaped output", () => {
    expect(exportCss(effect, values, SAMPLE, "dark")).toContain(".text-effect");
    const html = exportHtml(effect, values, SAMPLE, "dark");
    expect(html).toContain("<style>");
    // user text is HTML-escaped (contiguous for single-element, per-span for perLetter)
    if (effect.caps.includes("perLetter")) {
      expect(html).toContain("&lt;");
      expect(html).toContain("&gt;");
      expect(html).toContain("&amp;");
    } else {
      expect(html).toContain("&lt;Café&gt;");
    }
    expect(exportJsx(effect, values, SAMPLE, "dark")).toContain("className=");
    const doc = exportStandaloneHtml(effect, values, SAMPLE, "dark");
    expect(doc.startsWith("<!doctype html>")).toBe(true);
  });
});

describe("share codec", () => {
  it("round-trips a spec", () => {
    const spec: EffectSpec = {
      v: 1,
      effectId: "neon-glow",
      seed: 42,
      values: { hue: 120, flicker: true, speed: 3 },
      text: "Hello",
    };
    const decoded = decodeSpec(encodeSpec(spec));
    expect(decoded).toEqual(spec);
  });
  it("rejects junk", () => {
    expect(decodeSpec("not-valid-lz")).toBeNull();
    expect(decodeSpec("")).toBeNull();
  });
  it("sanitizes out-of-range values", () => {
    const eff = EFFECTS.find((e) => e.id === "neon-glow")!;
    const clean = sanitizeValues(eff, { hue: 9999, speed: -50, bogus: "x" });
    expect(clean.hue).toBe(360);
    expect(clean.speed).toBe(1);
    expect("bogus" in clean).toBe(false);
  });
});
