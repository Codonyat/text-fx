import type { ControlValue, Theme } from "@/lib/engine/types";

export interface Favorite {
  id: string;
  effectId: string;
  name: string;
  word: string;
  seed: number;
  values: Record<string, ControlValue>;
  theme: Theme;
}

const KEY = "textfx_favs_v2";

function isValidFavorite(x: unknown): x is Favorite {
  if (!x || typeof x !== "object") return false;
  const f = x as Record<string, unknown>;
  return (
    typeof f.id === "string" &&
    typeof f.effectId === "string" &&
    typeof f.name === "string" &&
    typeof f.word === "string" &&
    typeof f.seed === "number" &&
    typeof f.values === "object" &&
    f.values !== null &&
    (f.theme === "dark" || f.theme === "light")
  );
}

export function loadFavorites(): Favorite[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(isValidFavorite) : [];
  } catch {
    return [];
  }
}

export function persistFavorites(favs: Favorite[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(favs));
    return true;
  } catch {
    // quota / privacy-mode errors
    return false;
  }
}

export function newFavId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
