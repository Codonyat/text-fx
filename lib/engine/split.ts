export type SplitMode = "grapheme" | "word" | "line";

interface Segmenter {
  segment(input: string): Iterable<{ segment: string; isWordLike?: boolean }>;
}
interface SegmenterCtor {
  new (locale?: string, opts?: { granularity: string }): Segmenter;
}

function getSegmenter(granularity: "grapheme" | "word"): Segmenter | null {
  const I = Intl as unknown as { Segmenter?: SegmenterCtor };
  if (typeof Intl !== "undefined" && I.Segmenter) {
    try {
      return new I.Segmenter(undefined, { granularity });
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Split text for per-letter/word effects. Uses Intl.Segmenter (grapheme-correct
 * for emoji/accents/ligatures) with a code-point fallback. Whitespace-only
 * segments are normalised to a non-breaking space so spans keep width.
 */
export function splitText(text: string, mode: SplitMode): string[] {
  if (mode === "line") {
    return text.split("\n");
  }
  const granularity = mode === "word" ? "word" : "grapheme";
  const seg = getSegmenter(granularity);
  let parts: string[];
  if (seg) {
    parts = Array.from(seg.segment(text), (s) => s.segment);
  } else if (granularity === "grapheme") {
    parts = Array.from(text);
  } else {
    parts = text.split(/(\s+)/);
  }
  return parts
    .filter((p) => p.length > 0)
    .map((p) => (/^\s+$/.test(p) ? " " : p));
}
