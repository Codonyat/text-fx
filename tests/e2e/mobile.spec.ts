import { test, expect, type Page } from "@playwright/test";

// Mobile-project-only coverage (390×844, hasTouch). Splitting is enforced in
// playwright.config.ts: this file matches only the "mobile" project.

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

test("studio loads on mobile without console/runtime errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await page.waitForSelector(".fx-live");
  await page.waitForTimeout(1200); // shuffle + fonts settle
  await expect(page.getByRole("button", { name: /shuffle/i })).toBeVisible();
  expect(errors, "console/runtime errors:\n" + errors.join("\n")).toEqual([]);
});

test("typing works on mobile", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".fx-live");
  await page.waitForTimeout(1000);

  const editor = page.getByRole("textbox", { name: /effect text/i });
  await editor.click({ force: true });
  await page.keyboard.type("Yo");
  await expect.poll(async () => (await editor.textContent())?.trim()).toBe("Yo");
});

test("export menu fits fully inside the mobile viewport", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".fx-live");

  const trigger = page.getByRole("button", { name: /export/i });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(box.y + box.height).toBeLessThanOrEqual(844);
});

test("no horizontal page overflow on mobile", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".fx-live");
  await page.waitForTimeout(800);

  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement;
    return el ? el.scrollWidth - window.innerWidth : 0;
  });
  expect(overflow).toBeLessThanOrEqual(1);
});
