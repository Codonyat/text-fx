import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cached: ArrayBuffer | null | undefined;

/** Load Space Mono Bold for ImageResponse (returns null if unavailable; caller omits fonts). */
export async function spaceMono(): Promise<ArrayBuffer | null> {
  if (cached !== undefined) return cached;
  try {
    const buf = await readFile(join(process.cwd(), "lib", "og", "space-mono-700.ttf"));
    cached = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    cached = null;
  }
  return cached;
}
