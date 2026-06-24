import type { Capability, ControlValue, EffectDefinition, Theme } from "./types";
import { render } from "./build";
import { renderHtml, renderJsx, escapeHtml } from "./markup";
import { indent } from "./helpers";
import { googleHrefForFamilies } from "@/lib/fonts";

const EXPORT_SCOPE = "text-effect";

function fontFamiliesUsed(values: Record<string, ControlValue>): string[] {
  return values.font ? [String(values.font)] : [];
}

function markupNote(caps: Capability[]): string {
  const notes: string[] = [];
  if (caps.includes("perLetter")) notes.push("each character is wrapped in a <span> — see the HTML export");
  if (caps.includes("dataText")) notes.push("the element needs a data-text attribute equal to its text");
  if (caps.includes("svgDefs")) notes.push("requires the inline <svg> filter defs — see the HTML export");
  if (caps.includes("pointer")) notes.push("needs the small pointer-move JS snippet");
  if (caps.includes("scroll")) notes.push("uses scroll-driven animation");
  return notes.length ? notes.join("; ") : "just put the class on any element";
}

function renderExport(
  effect: EffectDefinition,
  values: Record<string, ControlValue>,
  text: string,
  theme: Theme,
) {
  return render(effect, values, text, { scope: EXPORT_SCOPE, mode: "export", theme });
}

export function exportCss(
  effect: EffectDefinition,
  values: Record<string, ControlValue>,
  text: string,
  theme: Theme = "dark",
  asFile = false,
): string {
  const r = renderExport(effect, values, text, theme);
  const fonts = fontFamiliesUsed(values).join(", ");
  const header = [
    `/* ${effect.name} — generated with TEXT-FX`,
    ` * HTML: ${markupNote(effect.caps)}.`,
    fonts ? ` * Font: ${fonts} (load from Google Fonts).` : null,
    asFile ? ` * https://text-fx.app` : null,
    ` */`,
  ]
    .filter(Boolean)
    .join("\n");
  return `${header}\n\n${r.styleText}\n`;
}

export function exportHtml(
  effect: EffectDefinition,
  values: Record<string, ControlValue>,
  text: string,
  theme: Theme = "dark",
): string {
  const r = renderExport(effect, values, text, theme);
  const parts: string[] = [`<style>\n${r.styleText}\n</style>`];
  if (r.defs) {
    parts.push(
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>\n${r.defs}\n</defs></svg>`,
    );
  }
  parts.push(renderHtml(r.root));
  if (r.runtimeSnippet) parts.push(`<script>\n${r.runtimeSnippet}\n</script>`);
  return parts.join("\n\n") + "\n";
}

export function exportJsx(
  effect: EffectDefinition,
  values: Record<string, ControlValue>,
  text: string,
  theme: Theme = "dark",
): string {
  const r = renderExport(effect, values, text, theme);
  const css = r.styleText.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  const markup = renderJsx(r.root, 3);
  const defs = r.defs
    ? `\n      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden dangerouslySetInnerHTML={{ __html: \`<defs>${r.defs.replace(/`/g, "\\`")}</defs>\` }} />`
    : "";
  const note = r.runtimeSnippet
    ? `\n// Pointer/scroll effect: add this once after mount —\n// useEffect(() => {\n${r.runtimeSnippet
        .split("\n")
        .map((l) => "//   " + l)
        .join("\n")}\n// }, []);`
    : "";
  return `export function TextEffect() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: \`
${css}
\` }} />${defs}
${markup}
    </>
  );
}${note}
`;
}

export function exportStandaloneHtml(
  effect: EffectDefinition,
  values: Record<string, ControlValue>,
  text: string,
  theme: Theme = "dark",
  bg = "#0a0a0a",
): string {
  const r = renderExport(effect, values, text, theme);
  const href = googleHrefForFamilies(fontFamiliesUsed(values));
  const fontLinks = href
    ? `  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="${href}" rel="stylesheet">\n`
    : "";
  const defs = r.defs
    ? `  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>\n${indent(r.defs, "    ")}\n  </defs></svg>\n`
    : "";
  const script = r.runtimeSnippet
    ? `  <script>\n${indent(r.runtimeSnippet, "    ")}\n  </script>\n`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(effect.name)} — TEXT-FX</title>
${fontLinks}  <style>
    html, body { height: 100%; margin: 0; }
    body { display: grid; place-items: center; background: ${bg}; }
    .stage { font-size: clamp(40px, 16vw, 200px); line-height: 1.1; text-align: center; padding: 8vmin; max-width: 92vw; word-break: break-word; }
${indent(r.styleText, "    ")}
  </style>
</head>
<body>
${defs}  <div class="stage">
${renderHtml(r.root, 2)}
  </div>
${script}</body>
</html>
`;
}
