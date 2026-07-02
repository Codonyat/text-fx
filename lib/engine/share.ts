import LZString from "lz-string";
import type { EffectSpec } from "./types";

const MAX_HASH = 4000;
const MAX_TEXT = 240;
const MAX_DECOMPRESSED = 100_000;

/** Compress a spec to a URL-hash-safe string. Encodes the spec, never the CSS. */
export function encodeSpec(spec: EffectSpec): string {
  const safe: EffectSpec = { ...spec, text: spec.text.slice(0, MAX_TEXT) };
  return LZString.compressToEncodedURIComponent(JSON.stringify(safe));
}

/**
 * Structurally validate + decode a shared spec. Returns null on any problem.
 * Value clamping against the effect's controls happens after the caller resolves
 * the effectId via the registry (see sanitizeValues in build.ts).
 */
export function decodeSpec(s: string | null | undefined): EffectSpec | null {
  if (!s || s.length > MAX_HASH) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(s);
    if (!json || json.length > MAX_DECOMPRESSED) return null;
    const obj = JSON.parse(json) as Partial<EffectSpec>;
    if (!obj || obj.v !== 1 || typeof obj.effectId !== "string") return null;
    return {
      v: 1,
      effectId: obj.effectId,
      seed: typeof obj.seed === "number" ? obj.seed : 1,
      values: obj.values && typeof obj.values === "object" ? obj.values : {},
      text: typeof obj.text === "string" ? obj.text.slice(0, MAX_TEXT) : "",
    };
  } catch {
    return null;
  }
}
