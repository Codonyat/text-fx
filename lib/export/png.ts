import { toPng } from "html-to-image";

/**
 * Rasterize a DOM node to a PNG data URL. Best-effort: awaits fonts, captures a
 * paused poster frame for animated effects (caller may freeze animations first).
 */
export async function nodeToPng(
  node: HTMLElement,
  opts: { transparent: boolean; bg: string; pixelRatio?: number },
): Promise<string> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }
  try {
    return await toPng(node, {
      pixelRatio: opts.pixelRatio ?? 2,
      backgroundColor: opts.transparent ? undefined : opts.bg,
      cacheBust: true,
      // Give the capture some breathing room around the glyph shadows/glows.
      style: { padding: "12px" },
    });
  } catch (err) {
    console.warn("nodeToPng failed", err);
    throw err;
  }
}

/** Read the current stage background color from the live app shell. */
export function currentStageBg(): string {
  if (typeof document === "undefined") return "#0a0a0a";
  const appEl = document.querySelector(".app");
  if (!appEl) return "#0a0a0a";
  const bg = getComputedStyle(appEl).getPropertyValue("--stage").trim();
  return bg || "#0a0a0a";
}
