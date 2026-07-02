// Screenshot new effects for visual QA. Usage:
//   node scripts/shoot-effects.mjs --ids=neon-glow,fire [--port=3100] [--out=shots]
// Expects a production server already running (pnpm build && pnpm start -p 3100).
// For each id: /effects/<id> preview at +400ms and +1200ms (catches one-shot end
// states and motion). Effects whose page declares scroll-scrubbing additionally get
// studio-stage captures at 0% / 50% / 100% scroll via the [data-fx-scroller] hook.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), "true"];
  }),
);
const ids = (args.ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const port = args.port ?? "3100";
const outDir = path.resolve(args.out ?? "shots");
if (!ids.length) {
  console.error("no ids — pass --ids=a,b,c");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

for (const id of ids) {
  const url = `http://localhost:${port}/effects/${id}`;
  const res = await page.goto(url, { waitUntil: "networkidle" });
  if (!res || !res.ok()) {
    console.error(`FAIL ${id}: ${url} -> ${res ? res.status() : "no response"}`);
    continue;
  }
  await page.evaluate(() => document.fonts.ready);
  const wrap = page.locator('[class*="previewWrap"]').first();
  await page.waitForTimeout(400);
  await wrap.screenshot({ path: path.join(outDir, `${id}-a.png`) });
  await page.waitForTimeout(800);
  await wrap.screenshot({ path: path.join(outDir, `${id}-b.png`) });

  // Scroll-scrubbed effects: capture the studio stage at three scrub positions.
  const isScroll = await page
    .locator("text=/scroll-scrubbed/i")
    .first()
    .isVisible()
    .catch(() => false);
  if (isScroll) {
    // The studio loads effects via the #s= share hash; the page's CTA already
    // carries a correctly-encoded spec for this effect, so ride it.
    await page.getByRole("link", { name: /open in the generator/i }).click();
    // Client-side navigation + hash-driven studio state need a beat to render.
    const found = await page
      .waitForSelector("[data-fx-scroller]", { timeout: 8000 })
      .catch(() => null);
    const scroller = page.locator("[data-fx-scroller]");
    if (found) {
      for (const frac of [0, 0.5, 1]) {
        await scroller.evaluate((el, f) => {
          el.scrollTop = (el.scrollHeight - el.clientHeight) * f;
        }, frac);
        await page.waitForTimeout(250);
        await scroller.screenshot({
          path: path.join(outDir, `${id}-scroll-${Math.round(frac * 100)}.png`),
        });
      }
    } else {
      console.error(`WARN ${id}: declared scroll but no [data-fx-scroller] in studio`);
    }
  }
  console.log(`shot ${id}`);
}

await browser.close();
console.log(`done -> ${outDir}`);
