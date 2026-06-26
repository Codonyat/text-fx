import { test, expect } from "@playwright/test";

test("studio renders, shuffles and browses without runtime/hydration errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/");
  await page.waitForSelector(".fx-live");
  await page.waitForTimeout(1500); // fonts + first shuffle

  await page.screenshot({ path: "tests/e2e/__screens__/01-studio.png", fullPage: true });

  // type into the stage — target the editable textbox directly. The random first-visit
  // effect may be per-letter (where .fx-live is the pointer-events:none preview with the
  // ghost on top) or a transform-animating single-element effect (never "stable" for a
  // plain click), so click the role=textbox with force to stay mode-agnostic.
  const editor = page.getByRole("textbox", { name: /effect text/i });
  await editor.click({ force: true });
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Vibe");
  await page.waitForTimeout(200);

  // shuffle a few times
  const shuffle = page.getByRole("button", { name: /shuffle/i });
  for (let i = 0; i < 4; i++) {
    await shuffle.click();
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path: "tests/e2e/__screens__/02-shuffled.png", fullPage: true });

  // save a favorite
  await page.getByRole("button", { name: /save/i }).click();
  await page.waitForTimeout(300);

  // open gallery
  await page.getByRole("button", { name: /browse/i }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "tests/e2e/__screens__/03-gallery.png", fullPage: true });

  expect(errors, "console/runtime errors:\n" + errors.join("\n")).toEqual([]);
});

test("per-letter effect is editable via the ghost layer", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".fx-live");
  await page.getByRole("button", { name: /browse/i }).click();
  await page.getByRole("button", { name: "Stagger Reveal" }).click();
  await page.waitForTimeout(500);

  const box = page.getByRole("textbox", { name: /effect text/i });
  await box.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Hiya");
  await page.waitForTimeout(400);
  await page.screenshot({ path: "tests/e2e/__screens__/04-perletter.png", fullPage: true });

  // preview should be rebuilt as per-letter spans reflecting the typed text
  const spans = await page.locator(".fx-live .fx-ch").count();
  expect(spans).toBeGreaterThanOrEqual(4);
});

test("switching single-element -> per-letter leaves no stray plain-text row", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".fx-live");

  // Start on a single-element effect and type custom text (set imperatively into the
  // in-place editable node).
  await page.getByRole("button", { name: /browse/i }).click();
  await page.getByRole("button", { name: "Neon Glow" }).click();
  await page.waitForTimeout(400);

  const box = page.getByRole("textbox", { name: /effect text/i });
  await box.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Boundary");
  await page.waitForTimeout(200);

  // Switch to a per-letter effect (the editable becomes a separate ghost layer).
  await page.getByRole("button", { name: /browse/i }).click();
  await page.getByRole("button", { name: "Slant Wave" }).click();
  await page.waitForTimeout(500);

  // The ghost must hold the carried-over text (not be left empty by the remount)...
  const ghost = page.getByRole("textbox", { name: /effect text/i });
  expect((await ghost.textContent())?.trim()).toBe("Boundary");

  // ...and its parent `.layers` must have NO direct text-node child — the regression
  // was an orphaned plain-text node (the old in-place text) leaking under the effect.
  const strayText = await ghost.evaluate((el) => {
    const parent = el.parentElement;
    if (!parent) return "NO_PARENT";
    return Array.from(parent.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0)
      .map((n) => n.textContent)
      .join("|");
  });
  expect(strayText, "stray plain-text node leaked into .layers").toBe("");

  await page.screenshot({ path: "tests/e2e/__screens__/06-mode-switch.png", fullPage: true });
});

test("per-effect SEO page renders content, canonical and JSON-LD", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/effects/neon-glow");
  await expect(page.locator("h1")).toContainText("Neon Glow");
  await expect(page.locator("pre code").first()).toContainText(".text-effect");

  const ldCount = await page.locator('script[type="application/ld+json"]').count();
  expect(ldCount).toBeGreaterThan(0);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toContain("/effects/neon-glow");

  await page.screenshot({ path: "tests/e2e/__screens__/05-effect-page.png", fullPage: true });
  expect(errors, "console/runtime errors:\n" + errors.join("\n")).toEqual([]);
});

test("SEO/GEO endpoints serve correct content", async ({ page }) => {
  const robots = await (await page.request.get("/robots.txt")).text();
  expect(robots.toLowerCase()).toContain("user-agent");
  expect(robots).toContain("GPTBot");
  expect(robots).toContain("PerplexityBot");
  expect(robots).toContain("Sitemap:");

  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<urlset");
  expect(sitemap).toContain("/effects/neon-glow");

  const llms = await (await page.request.get("/llms.txt")).text();
  expect(llms).toContain("TEXT-FX");
  expect(llms).toContain("/effects/neon-glow");

  const manifest = await (await page.request.get("/manifest.webmanifest")).json();
  expect(String(manifest.name)).toContain("TEXT-FX");

  const og = await page.request.get("/opengraph-image");
  expect(og.headers()["content-type"]).toContain("image/png");
  const effOg = await page.request.get("/effects/neon-glow/opengraph-image");
  expect(effOg.headers()["content-type"]).toContain("image/png");
});
