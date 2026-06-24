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

  // type into the stage
  const stage = page.locator(".fx-live").first();
  await stage.click();
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
