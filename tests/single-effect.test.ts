// Pre-registration harness for a single effect file. Lets an author validate a new
// lib/effects/<category>/<id>.ts against the full per-effect contract BEFORE it is
// wired into registry.ts (the registry-driven suite can't see unregistered files).
//
//   EFFECT_FILE=lib/effects/neon-glow/neon-glow.ts pnpm vitest run tests/single-effect.test.ts
//   EFFECT_FILE=... EXPECT_ONESHOT=1 pnpm vitest run tests/single-effect.test.ts
//
// EXPECT_ONESHOT=1 additionally runs the hover-replay assertions (mandatory for
// one-shot entrance effects). Skips silently when EFFECT_FILE is unset (CI / pnpm test).
import { describe, it, expect } from "vitest";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { EffectDefinition } from "@/lib/engine/types";
import { CATEGORIES } from "@/lib/effects/taxonomy";
import {
  assertBuildsScopedCss,
  assertDataTextAttr,
  assertExporters,
  assertHoverReplay,
  assertRandDeterminism,
  assertRescopingTotal,
  assertScopeLint,
} from "./effect-contract";

const file = process.env.EFFECT_FILE;

describe.skipIf(!file)(`single effect contract: ${file ?? "(EFFECT_FILE unset)"}`, () => {
  async function load(): Promise<EffectDefinition> {
    const mod = await import(pathToFileURL(path.resolve(file!)).href);
    const effect = mod.default as EffectDefinition | undefined;
    expect(effect?.id, "file default-exports an EffectDefinition with an id").toBeTruthy();
    return effect!;
  }

  it("declares a valid category and required fields", async () => {
    const effect = await load();
    expect(
      CATEGORIES.some((c) => c.id === effect.category),
      `category "${effect.category}" is a taxonomy id`,
    ).toBe(true);
    expect(effect.name, "has a display name").toBeTruthy();
    expect(["good", "partial", "unsupported"]).toContain(effect.pngSupport);
    expect(Array.isArray(effect.caps)).toBe(true);
  });

  it("passes the full per-effect contract", async () => {
    const effect = await load();
    assertBuildsScopedCss(effect);
    assertScopeLint(effect);
    assertRescopingTotal(effect);
    assertDataTextAttr(effect);
    assertExporters(effect);
    assertRandDeterminism(effect);
    if (process.env.EXPECT_ONESHOT === "1") assertHoverReplay(effect);
  });
});
