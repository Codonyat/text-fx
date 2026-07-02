import type { Capability, ControlValue, EffectDefinition, Theme } from "./types";
import { render } from "./build";
import { renderHtml, renderJsx, escapeHtml } from "./markup";
import { indent } from "./helpers";
import { googleHrefForFamilies } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";

const EXPORT_SCOPE = "text-effect";

function fontFamiliesUsed(effect: EffectDefinition, values: Record<string, ControlValue>): string[] {
  // A forced font (variable-font effects) overrides the shared Font control, so the
  // export must load that family, not the (ignored) control value.
  const fam = effect.font ?? (values.font ? String(values.font) : "");
  return fam ? [fam] : [];
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
  cssOverride?: string | null,
): string {
  const css = cssOverride ?? renderExport(effect, values, text, theme).styleText;
  const fonts = fontFamiliesUsed(effect, values).join(", ");
  const header = [
    `/* ${effect.name} — made with TEXT-FX · ${SITE_URL}`,
    ` * HTML: ${markupNote(effect.caps)}.`,
    fonts ? ` * Font: ${fonts} (load from Google Fonts).` : null,
    ` */`,
  ]
    .filter(Boolean)
    .join("\n");
  return `${header}\n\n${css}\n`;
}

export function exportHtml(
  effect: EffectDefinition,
  values: Record<string, ControlValue>,
  text: string,
  theme: Theme = "dark",
  cssOverride?: string | null,
): string {
  const r = renderExport(effect, values, text, theme);
  const css = cssOverride ?? r.styleText;
  const parts: string[] = [
    `<!-- Made with TEXT-FX · ${SITE_URL} -->`,
    `<style>\n${css}\n</style>`,
  ];
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
  cssOverride?: string | null,
): string {
  const r = renderExport(effect, values, text, theme);
  const css = (cssOverride ?? r.styleText)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
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
      {/* Made with TEXT-FX · ${SITE_URL} */}
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
  cssOverride?: string | null,
): string {
  const r = renderExport(effect, values, text, theme);
  const css = cssOverride ?? r.styleText;
  const href = googleHrefForFamilies(fontFamiliesUsed(effect, values));
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
<!-- Made with TEXT-FX · ${SITE_URL} -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(effect.name)} — TEXT-FX</title>
${fontLinks}  <style>
    html, body { height: 100%; margin: 0; }
    body { display: grid; place-items: center; background: ${bg}; }
    .stage { font-size: clamp(40px, 16vw, 200px); line-height: 1.1; text-align: center; padding: 8vmin; max-width: 92vw; word-break: break-word; }
    .textfx-credit { position: fixed; right: 10px; bottom: 8px; z-index: 9; font: 11px/1 system-ui, -apple-system, sans-serif; color: rgba(128, 128, 128, 0.85); text-decoration: none; }
    .textfx-credit:hover { text-decoration: underline; }
${indent(css, "    ")}
  </style>
</head>
<body>
${defs}  <div class="stage">
${renderHtml(r.root, 2)}
  </div>
  <a class="textfx-credit" href="${SITE_URL}">made with TEXT-FX</a>
${script}</body>
</html>
`;
}
