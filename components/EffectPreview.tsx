import { render, randomizeValues } from "@/lib/engine/build";
import { renderHtml } from "@/lib/engine/markup";
import { makeRng } from "@/lib/engine/rng";
import type { ControlValue, EffectDefinition } from "@/lib/engine/types";

/** Stable per-effect control values (deterministic from the id) for SSR posters. */
export function posterValues(effect: EffectDefinition): Record<string, ControlValue> {
  let h = 0;
  for (let i = 0; i < effect.id.length; i++) h = (h * 31 + effect.id.charCodeAt(i)) >>> 0;
  return randomizeValues(effect, makeRng(h || 1));
}

/**
 * Server-rendered static preview of an effect: a `.app` wrapper (provides theme
 * tokens), the scoped `<style>`, inline SVG defs, and the rendered markup.
 * CSS animations run in the browser without any JS.
 */
export function EffectPreview({
  effect,
  values,
  word,
  scope,
  fontSize = 64,
  minHeight = 200,
}: {
  effect: EffectDefinition;
  values: Record<string, ControlValue>;
  word: string;
  scope: string;
  fontSize?: number;
  minHeight?: number;
}) {
  const r = render(effect, values, word, { scope, theme: "dark", mode: "thumbnail" });
  return (
    <div
      className="app"
      data-theme="dark"
      style={{ minHeight: "unset", display: "block" }}
    >
      <style dangerouslySetInnerHTML={{ __html: r.styleText }} />
      {r.defs ? (
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          style={{ position: "absolute" }}
          dangerouslySetInnerHTML={{ __html: `<defs>${r.defs}</defs>` }}
        />
      ) : null}
      <div
        style={{
          background: "var(--stage)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 28,
          minHeight,
          overflow: "hidden",
        }}
      >
        <div
          style={{ fontSize, lineHeight: 1.1, textAlign: "center", maxWidth: "100%", wordBreak: "break-word" }}
          dangerouslySetInnerHTML={{ __html: renderHtml(r.root) }}
        />
      </div>
    </div>
  );
}
