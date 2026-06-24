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

export function loadFavorites(): Favorite[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as Favorite[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function persistFavorites(favs: Favorite[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(favs));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function newFavId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
