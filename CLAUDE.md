@AGENTS.md

# TEXT-FX — CSS Text-Effects Generator

A client-side Next.js (App Router) tool: type text, **SHUFFLE** a randomized pure-CSS text
effect, tune it with live knobs, hand-edit the CSS, save favorites, and export (CSS / HTML /
JSX / standalone `.html` / PNG / share-link). 49 effects across 13 categories; no backend.

## Commands
- `pnpm dev` — dev server (do NOT background it; stop any you start).
- `pnpm build` — one-shot production build (use this to verify, not a watcher).
- `pnpm typecheck` · `pnpm lint`
- `pnpm test` — Vitest (engine: determinism, scope-lint, export parity, share codec, over every effect).
- `pnpm e2e` — Playwright: studio smoke, per-letter editing, per-effect SEO page, and SEO/GEO endpoints (manages its own server; screenshots → `tests/e2e/__screens__/`).
- `node scripts/gen-favicon.mjs` — regenerate `app/favicon.ico` / `app/apple-icon.png` / `public/icon-{192,512}.png` from `app/icon.svg`.
- Canonical/OG/sitemap/JSON-LD URLs use the hardcoded `SITE_URL` (`https://text-fx.app`) in `lib/site.ts`.

## Architecture (single source of truth)
One declarative **`EffectDefinition`** per effect; one pure **`build(ctx)`** returns
`{ root, css, keyframes?, propertyRules?, defs?, runtime?, loopMs? }`. The live preview, gallery
posters, saved thumbnails, AND every exporter all call the same `build()` — exports are just
serializations of that artifact ("what you see is what you copy"). Enforced by the normalized
parity + scope-lint tests in `tests/engine.test.ts`.

### Key files
- `lib/engine/types.ts` — `EffectDefinition`, `Control`, `BuildCtx`, `BuildResult`, `MarkupNode`, `Capability`, `Rng`, `Theme`.
- `lib/engine/build.ts` — `SHARED_CONTROLS` (font/weight/tracking/case), `render()` (assembles common CSS + scopes), `randomizeValues()`, `sanitizeValues()`, `visibleControls()`.
- `lib/engine/markup.ts` — AST builders (`el`/`text`/`letterSpans`) + serializers `renderHtml`/`renderJsx`/`toReact` (one AST → identical preview/HTML/JSX; JSX is from the AST, not regex).
- `lib/engine/helpers.ts` — CSS helpers. **Salt every generated id** via `anim()`/`svgId()`/`prop()` (keyframes, @property, SVG ids). Glow guard: use `dropGlow()` (filter), NEVER `text-shadow`, on `background-clip:text`/transparent-fill text.
- `lib/engine/split.ts` — grapheme/word/line splitting (Intl.Segmenter).
- `lib/engine/serialize.ts` — exporters (export scope = `text-effect`). `lib/engine/share.ts` — lz-string spec codec with safety limits. `lib/export/{png,download}.ts`.
- `lib/effects/<category>/<id>.ts` — one effect each (default export). `registry.ts` is **generated** (imports all + `MANIFEST`); regenerate after adding/removing effect files. `taxonomy.ts` = the 13 categories. `catalog.json` = the 280-effect research catalog (implementation backlog, not bundled).
- `components/` — `Studio.tsx` (orchestrator/state) · two-layer `Stage.tsx` (single-element effects edit in place; per-letter effects use an editable ghost layer over a preview layer — never mutate the editable node into spans) · `StyleHost.tsx` (owns all `<style>` tags) · `EffectPreview.tsx` (server-side SSR preview for SEO pages) · Header/ActionBar/AdjustPanel/CssPanel/ExportMenu/SavedStrip/Gallery/SeoFooter + `controls/Control.tsx`.

### SEO / GEO
- `lib/site.ts` (constants + `SITE_URL`), `lib/jsonld.ts` (`serializeJsonLd` + schema builders), `lib/effects/descriptions.ts` (per-effect SEO prose).
- Icons/OG: `app/icon.svg` (geometric neon "Fx") + generated `favicon.ico`/`apple-icon.png`/`icon-{192,512}.png`; `app/{opengraph,twitter}-image.tsx` + per-effect `app/effects/[id]/opengraph-image.tsx` (ImageResponse, Satori-safe, Space Mono from `lib/og/`).
- Metadata in `app/layout.tsx` (+ `metadataBase`, viewport); `app/robots.ts` (allows AI retrieval+training bots), `app/sitemap.ts`, `app/manifest.ts`, `app/llms.txt/route.ts`.
- JSON-LD (server-only): home = WebApplication/WebSite/FAQPage; `/effects` = CollectionPage; `/effects/[id]` = SoftwareSourceCode + BreadcrumbList. Crawlable SSR pages: `/effects` (static, grouped) + `/effects/[id]` (49 SSG, full CSS + live preview) are the GEO payload. `next.config.ts` `outputFileTracingIncludes` bundles the OG font.

### Conventions / gotchas
- **Scoping is mandatory**: every selector starts with `.${scope}`; every keyframe/@property/SVG id is salted. Two instances (preview + many thumbnails) share a page — unsalted globals collide.
- Effects read values with casts (`ctx.values.hue as number`) and adapt colors to `ctx.theme`.
- Knob/theme changes rebuild CSS with literal values (export-correct); animations restart on tune (accepted v1 tradeoff; `cssVar` field reserved for future live-var tuning).
- Theme tokens (brutalist | lab × dark | light) live in `app/globals.css`, keyed by `data-skin`/`data-theme` on `.app`. Fonts load via one Google Fonts `<link>` (real family names so preview, hand-edited CSS, and exports all match).
- Persistence: favorites in `localStorage` (`textfx_favs_v2`), theme/skin in `localStorage`; share state in the URL hash (`#s=`). Client-only init runs in a mount effect; initial render is deterministic (seed 1) to avoid hydration mismatch.
- Adding effects: drop a file in `lib/effects/<category>/<id>.ts`, regenerate `registry.ts`, run `pnpm test` (auto-validates scope-lint/parity for the new effect).
