import type { Rng } from "./types";

/** Deterministic 32-bit PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A callable RNG with convenience methods, seeded deterministically. */
export function makeRng(seed: number): Rng {
  const next = mulberry32(seed);
  const r = (() => next()) as Rng;
  r.ri = (a, b) => Math.floor(next() * (b - a + 1)) + a;
  r.rnd = (a, b) => next() * (b - a) + a;
  r.pick = <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)];
  r.chance = (p) => next() < p;
  return r;
}

/** A fresh non-deterministic seed (only used at shuffle time, never inside build). */
export function randomSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
}
