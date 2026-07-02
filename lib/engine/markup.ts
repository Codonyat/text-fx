import type { ElementNode, MarkupChild, MarkupNode, TextSlot } from "./types";
import { splitText, type SplitMode } from "./split";

// ---- AST builders -----------------------------------------------------------
export function el(
  tag: string,
  opts: {
    attrs?: Record<string, string | number>;
    vars?: Record<string, string | number>;
    children?: MarkupChild[];
  } = {},
): ElementNode {
  return { kind: "el", tag, attrs: opts.attrs, vars: opts.vars, children: opts.children };
}

export function text(value: string): TextSlot {
  return { kind: "text", value };
}

/**
 * Split user text into per-segment <span>s, each carrying --i (index), --n
 * (total) and --rev (reverse index) custom props for staggered animations.
 */
export function letterSpans(
  content: string,
  mode: SplitMode = "grapheme",
  spanTag = "span",
): ElementNode[] {
  const parts = splitText(content, mode);
  const n = parts.length;
  return parts.map((seg, i) =>
    el(spanTag, {
      attrs: { class: "fx-ch" },
      vars: { "--i": i, "--n": n, "--rev": n - 1 - i, "--mid": (n - 1) / 2 },
      children: [text(seg === " " ? " " : seg)],
    }),
  );
}

const VOID_TAGS = new Set(["br", "img", "input", "hr", "meta", "link"]);

// ---- Escaping ---------------------------------------------------------------
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
export function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
// JSX treats bare { and } as expression delimiters — emit them as string literals.
function escapeJsxText(s: string): string {
  return escapeHtml(s).replace(/\{/g, '{"{"}').replace(/\}/g, '{"}"}');
}

function varsToInlineStyle(vars?: Record<string, string | number>): string {
  if (!vars) return "";
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

// ---- HTML serializer --------------------------------------------------------
export function renderHtml(node: MarkupChild, indent = 0): string {
  if (node.kind === "text") return escapeHtml(node.value);
  const pad = "  ".repeat(indent);
  const attrs: string[] = [];
  if (node.attrs) {
    for (const [k, v] of Object.entries(node.attrs)) {
      attrs.push(`${k}="${escapeAttr(String(v))}"`);
    }
  }
  const style = varsToInlineStyle(node.vars);
  if (style) attrs.push(`style="${escapeAttr(style)}"`);
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";
  if (VOID_TAGS.has(node.tag)) return `${pad}<${node.tag}${attrStr} />`;

  const children = node.children ?? [];
  // Inline rendering when children are only text slots (keeps words intact).
  const onlyText = children.every((c) => c.kind === "text");
  if (onlyText) {
    const inner = children.map((c) => renderHtml(c)).join("");
    return `${pad}<${node.tag}${attrStr}>${inner}</${node.tag}>`;
  }
  const inner = children.map((c) => renderHtml(c, indent + 1)).join("\n");
  return `${pad}<${node.tag}${attrStr}>\n${inner}\n${pad}</${node.tag}>`;
}

// ---- JSX serializer (from the same AST, not a regex transform) ---------------
function attrToJsx(k: string): string {
  if (k === "class") return "className";
  if (k === "for") return "htmlFor";
  return k; // data-*, aria-*, role, etc. are valid JSX attribute names as-is
}

export function renderJsx(node: MarkupChild, indent = 0): string {
  if (node.kind === "text") return escapeJsxText(node.value);
  const pad = "  ".repeat(indent);
  const attrs: string[] = [];
  if (node.attrs) {
    for (const [k, v] of Object.entries(node.attrs)) {
      attrs.push(`${attrToJsx(k)}="${escapeAttr(String(v))}"`);
    }
  }
  if (node.vars) {
    const styleObj = Object.entries(node.vars)
      .map(([k, v]) => `'${k}': ${typeof v === "number" ? v : `'${v}'`}`)
      .join(", ");
    attrs.push(`style={{ ${styleObj} }}`);
  }
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";
  if (VOID_TAGS.has(node.tag)) return `${pad}<${node.tag}${attrStr} />`;

  const children = node.children ?? [];
  const onlyText = children.every((c) => c.kind === "text");
  if (onlyText) {
    const inner = children.map((c) => renderJsx(c)).join("");
    return `${pad}<${node.tag}${attrStr}>${inner}</${node.tag}>`;
  }
  const inner = children.map((c) => renderJsx(c, indent + 1)).join("\n");
  return `${pad}<${node.tag}${attrStr}>\n${inner}\n${pad}</${node.tag}>`;
}

/** Minimal shape of React.createElement (cast React's createElement to this at call sites). */
export type CreateElementLike = (
  tag: string,
  props: Record<string, unknown>,
  ...children: unknown[]
) => unknown;

/** Convert the AST into React elements for the live preview (no dangerouslySetInnerHTML). */
export function toReact(
  node: MarkupChild,
  createElement: CreateElementLike,
  key?: string | number,
): unknown {
  if (node.kind === "text") return node.value;
  const props: Record<string, unknown> = { key };
  if (node.attrs) {
    for (const [k, v] of Object.entries(node.attrs)) {
      props[attrToJsx(k)] = v;
    }
  }
  if (node.vars) {
    props.style = { ...(node.vars as Record<string, string | number>) };
  }
  const children = (node.children ?? []).map((c, i) => toReact(c, createElement, i));
  return createElement(node.tag, props, ...children);
}

export type { MarkupNode };
