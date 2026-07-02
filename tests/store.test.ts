import { afterEach, describe, expect, it, vi } from "vitest";
import { loadFavorites, persistFavorites, type Favorite } from "@/lib/store/favorites";

const KEY = "textfx_favs_v2";

const VALID: Favorite = {
  id: "y",
  effectId: "neon-glow",
  name: "Neon Glow",
  word: "hi",
  seed: 1,
  values: {},
  theme: "dark",
};

// Vitest runs in the "node" environment (see vitest.config.ts) — no DOM, so
// stub a minimal in-memory Storage the favorites module can read/write.
function makeStorage(initial: Record<string, string> = {}): Storage {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadFavorites", () => {
  it("drops malformed entries and keeps valid ones", () => {
    const raw = JSON.stringify([
      { id: "x" }, // missing required fields
      "junk", // not an object
      null, // null
      { ...VALID, seed: "1" }, // seed wrong type
      { ...VALID, theme: "blue" }, // theme not dark|light
      { ...VALID, values: null }, // values null
      VALID, // the only valid one
    ]);
    vi.stubGlobal("localStorage", makeStorage({ [KEY]: raw }));

    const favs = loadFavorites();
    expect(favs).toHaveLength(1);
    expect(favs[0]).toEqual(VALID);
  });

  it("returns [] for non-array JSON", () => {
    vi.stubGlobal("localStorage", makeStorage({ [KEY]: JSON.stringify({ not: "an array" }) }));
    expect(loadFavorites()).toEqual([]);
  });

  it("returns [] (does not throw) for corrupt JSON", () => {
    vi.stubGlobal("localStorage", makeStorage({ [KEY]: "{not valid json" }));
    expect(loadFavorites()).toEqual([]);
  });

  it("returns [] when nothing is stored", () => {
    vi.stubGlobal("localStorage", makeStorage());
    expect(loadFavorites()).toEqual([]);
  });
});

describe("persistFavorites", () => {
  it("writes and returns true on success", () => {
    const storage = makeStorage();
    vi.stubGlobal("localStorage", storage);

    expect(persistFavorites([VALID])).toBe(true);
    expect(JSON.parse(storage.getItem(KEY) as string)).toEqual([VALID]);
  });

  it("returns false when setItem throws (quota / private mode)", () => {
    const storage = makeStorage();
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    vi.stubGlobal("localStorage", storage);

    expect(persistFavorites([VALID])).toBe(false);
  });
});
