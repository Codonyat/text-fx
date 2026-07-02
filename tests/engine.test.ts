import { describe, it, expect } from "vitest";
import LZString from "lz-string";
import { EFFECTS } from "@/lib/effects/registry";
import { defaultValues, sanitizeValues } from "@/lib/engine/build";
import { exportCss, exportHtml, exportJsx, exportStandaloneHtml } from "@/lib/engine/serialize";
import { encodeSpec, decodeSpec } from "@/lib/engine/share";
import { makeRng } from "@/lib/engine/rng";
import { FONTS } from "@/lib/fonts";
import type { EffectSpec } from "@/lib/engine/types";
import {
  SAMPLE,
  assertBuildsScopedCss,
  assertDataTextAttr,
  assertExporters,
  assertHoverReplay,
  assertRandDeterminism,
  assertRescopingTotal,
  assertScopeLint,
} from "./effect-contract";

describe("rng determinism", () => {
  it("same seed -> same sequence", () => {
    const a = makeRng(123);
    const b = makeRng(123);
    expect([a(), a.ri(0, 100), a.rnd(0, 1)]).toEqual([b(), b.ri(0, 100), b.rnd(0, 1)]);
  });
  it("randomizeValues is deterministic per seed", () => {
    for (const e of EFFECTS) assertRandDeterminism(e);
  });
});

// Per-effect contract bodies live in tests/effect-contract.ts, shared with the
// pre-registration worker harness (tests/single-effect.test.ts).
describe.each(EFFECTS.map((e) => [e.id, e] as const))("effect %s", (_id, effect) => {
  it("builds valid scoped CSS", () => assertBuildsScopedCss(effect));
  it("scope-lint: every generated identifier is salted (no global leaks)", () =>
    assertScopeLint(effect));
  it("rescoping is total (parity across scopes)", () => assertRescopingTotal(effect));
  it("dataText effects carry a data-text attribute", () => assertDataTextAttr(effect));
  it("exporters produce non-empty, escaped, attributed output", () => assertExporters(effect));
});

describe("hover-replay entrance effects", () => {
  // One-shot ("entrance") effects that sit static after mount. Hovering the scope root
  // must restart them via the pure-CSS trick: a `:hover` rule swaps `animation-name` to
  // a salted DUPLICATE keyframe (identical body, name ending in "-r"), so the browser
  // starts a fresh animation. Ships identically everywhere (studio/gallery/SSR/export).
  // EVERY new one-shot entrance effect must be added here.
  const HOVER_REPLAY_IDS = [
    "fade-in",
    "blur-focus-in",
    "flip-in-3d",
    "bulge-text",
    "slope-text",
    "fan-text",
    "arc-text",
    "falling-letters",
    "decode-reveal",
    "zigzag-text",
    "wave-text",
    "stagger-reveal",
    "typewriter",
    "center-grow-underline",
    "strike-through",
    "slide-underline",
    "highlighter",
    "scribble-underline",
    "crt-collapse",
  ];

  it.each(HOVER_REPLAY_IDS)("%s replays its entrance on hover (default values)", (id) => {
    const effect = EFFECTS.find((e) => e.id === id);
    expect(effect, `effect ${id} is registered`).toBeTruthy();
    assertHoverReplay(effect!);
  });
});

describe("export attribution, overrides & escaping", () => {
  const effect = EFFECTS.find((e) => e.id === "neon-glow")!;
  const values = defaultValues(effect);

  it("cssOverride is used verbatim by all four exporters (replaces generated CSS)", () => {
    const override = ".text-effect { color: rgb(1, 2, 3); }";
    for (const out of [
      exportCss(effect, values, SAMPLE, "dark", override),
      exportHtml(effect, values, SAMPLE, "dark", override),
      exportStandaloneHtml(effect, values, SAMPLE, "dark", "#000", override),
    ]) {
      expect(out).toContain("rgb(1, 2, 3)");
      // generated CSS (which always sets font-family via commonCss) is gone
      expect(out).not.toContain("font-family");
    }
    const jsx = exportJsx(effect, values, SAMPLE, "dark", override);
    expect(jsx).toContain("rgb(1, 2, 3)");
    expect(jsx).not.toContain("font-family");
  });

  it("JSX escapes literal braces in user text", () => {
    const jsx = exportJsx(effect, values, "a{b}c", "dark");
    expect(jsx).toContain('{"{"}');
    expect(jsx).toContain('{"}"}');
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
  it("rejects an oversized-decompression payload", () => {
    const huge = JSON.stringify({
      v: 1,
      effectId: "neon-glow",
      seed: 1,
      values: {},
      text: "x".repeat(200_000),
    });
    const packed = LZString.compressToEncodedURIComponent(huge);
    // Compresses well under the compressed-length cap, so only the
    // decompressed-size guard can reject it.
    expect(packed.length).toBeLessThan(4000);
    expect(decodeSpec(packed)).toBeNull();
  });
  it("sanitizes out-of-range values", () => {
    const eff = EFFECTS.find((e) => e.id === "neon-glow")!;
    const clean = sanitizeValues(eff, { hue: 9999, speed: -50, bogus: "x" });
    expect(clean.hue).toBe(360);
    expect(clean.speed).toBe(1);
    expect("bogus" in clean).toBe(false);
  });
});

describe("variable fonts", () => {
  // Google css2 returns 200 even for a mis-ordered axis tuple (it binds ranges
  // positionally), so a reorder would silently mis-map axes with green tests.
  // Pin the canonical segment: lowercase axes (slnt,wght) then uppercase (CASL,MONO),
  // each alphabetical, with @-ranges in the same order.
  it("Recursive loads its four axes in canonical css2 order", () => {
    const rec = FONTS.find((f) => f.name === "Recursive");
    expect(rec?.google).toBe("Recursive:slnt,wght,CASL,MONO@-15..0,300..1000,0..1,0..1");
  });
});
