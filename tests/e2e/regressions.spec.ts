import { test, expect, type Page } from "@playwright/test";

// Regression coverage for the Phase 1-2 fixes: stage first-keystroke, export-menu
// open/clamp/attribution, gallery-pick determinism, share-hash lifecycle, and
// corrupted-favorites resilience. Desktop project only (mobile lives in mobile.spec.ts).

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

/** Load the studio and switch to a known, deterministic single-element effect
 *  (Neon Glow: caps ["pure"], pngSupport "good" → all 6 export items). */
async function pickNeonGlow(page: Page) {
  await page.goto("/");
  await page.waitForSelector(".fx-live");
  await page.getByRole("button", { name: /browse/i }).click();
  await page.getByRole("button", { name: "Neon Glow" }).click();
  await page.waitForSelector(".fx-live");
  await expect(page.getByText("Neon Glow", { exact: true })).toBeVisible();
}

test("first keystroke replaces the pristine starter text; Enter stays single-line", async ({
  page,
}) => {
  const errors = trackErrors(page);

  await page.goto("/");
  await page.waitForSelector(".fx-live");
  await page.waitForTimeout(1200); // first-visit shuffle + fonts settle

  const editor = page.getByRole("textbox", { name: /effect text/i });
  // Click the centre of the stage text while it is still "type here" — clicking now only
  // drops a caret (no select-all). The FIRST typed character replaces the whole starter
  // via the pristine beforeinput path (deferred replacement at input time).
  await editor.click({ force: true });
  await page.keyboard.type("Hi");
  await expect
    .poll(async () => (await editor.textContent())?.trim())
    .toBe("Hi");

  // Enter must be swallowed (single-line model): "Hi" + Enter + "There" = "HiThere".
  await page.keyboard.press("Enter");
  await page.keyboard.type("There");
  await expect
    .poll(async () => (await editor.textContent())?.trim())
    .toBe("HiThere");

  expect(errors, "console/runtime errors:\n" + errors.join("\n")).toEqual([]);
});

test("export menu opens on first click, closes on Escape and reopens", async ({ page }) => {
  await pickNeonGlow(page);

  const trigger = page.getByRole("button", { name: /export/i });
  await trigger.click(); // first click must open reliably
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(page.getByRole("menuitem")).toHaveCount(6);
  await expect(page.getByRole("menuitem", { name: "Copy HTML" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Download .css" })).toBeVisible();

  // Escape closes and returns focus to the trigger.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toBeFocused();

  // Opens again on a subsequent click.
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
});

test("export menu is clamped fully inside a short viewport", async ({ page }) => {
  await pickNeonGlow(page);
  await page.setViewportSize({ width: 900, height: 500 });

  const trigger = page.getByRole("button", { name: /export/i });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.evaluate((el) => el.scrollIntoView({ block: "end" })); // push near the bottom
  await trigger.click();

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(500);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(900);
});

test("hand-edited CSS flows into exports and REVERT clears it", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await pickNeonGlow(page);

  const cssBox = page.getByRole("textbox", { name: /editable css/i });
  const current = await cssBox.inputValue();
  await cssBox.fill(current + "\n/*EDITMARK*/");

  // EDITED badge appears.
  await expect(page.getByText("EDITED", { exact: true })).toBeVisible();

  // Copy HTML must carry the edited CSS + the attribution comment.
  await page.getByRole("button", { name: /export/i }).click();
  await page.getByRole("menuitem", { name: "Copy HTML" }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain("EDITMARK");
  expect(clip).toContain("Made with TEXT-FX");

  // REVERT drops the edit.
  await page.getByRole("button", { name: /revert/i }).click();
  await expect(page.getByText("EDITED", { exact: true })).toHaveCount(0);
  expect(await cssBox.inputValue()).not.toContain("EDITMARK");
});

test("gallery pick is deterministic: same card yields identical CSS", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".fx-live");

  await page.getByRole("button", { name: /browse/i }).click();
  const firstCard = page.locator("button[title]").first();
  const name = (await firstCard.getAttribute("title")) ?? "";
  expect(name).not.toBe("");
  await firstCard.click();

  await page.waitForSelector(".fx-live");
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  const cssBox = page.getByRole("textbox", { name: /editable css/i });
  const css1 = await cssBox.inputValue();
  expect(css1.length).toBeGreaterThan(0);

  // Pick the identical card again — the poster's deterministic seed must reproduce it.
  await page.getByRole("button", { name: /browse/i }).click();
  await page.locator("button[title]").first().click();
  await page.waitForSelector(".fx-live");
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  const css2 = await cssBox.inputValue();

  expect(css2).toBe(css1);
});

test("share-hash lifecycle: SHARE writes it, SHUFFLE strips it, share URL restores it", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await pickNeonGlow(page);

  // SHARE writes the #s= hash.
  await page.getByRole("button", { name: /share/i }).click();
  await expect.poll(() => page.url()).toContain("#s=");
  const shareUrl = page.url();

  // SHUFFLE strips the stale hash so a reload won't revert to the shared spec.
  await page.getByRole("button", { name: /shuffle/i }).click();
  await expect.poll(() => page.url()).not.toContain("#s=");

  // SHARE again on the new state writes a fresh, different hash.
  await page.getByRole("button", { name: /share/i }).click();
  await expect.poll(() => page.url()).toContain("#s=");
  expect(page.url()).not.toBe(shareUrl);

  // Opening the captured share URL fresh restores the exact effect. Navigate
  // away first: a goto that differs only by the #s= hash is a same-document
  // change (no reload → the decode-on-mount effect wouldn't run).
  await page.goto("about:blank");
  await page.goto(shareUrl);
  await page.waitForSelector(".fx-live");
  await expect(page.getByText("Neon Glow", { exact: true })).toBeVisible();
});

/** The stage container is the grid/background; focus/blur is scoped to the editable
 *  text itself, not this div. It is the only div whose direct child is the
 *  "click the text to edit" caption span. */
function stage(page: Page) {
  return page.locator('div:has(> span:text-is("click the text to edit"))');
}

test("clicking the stage background while editing ends editing (native blur)", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await pickNeonGlow(page);

  const editor = page.getByRole("textbox", { name: /effect text/i });
  await editor.click({ force: true });
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Hi");
  await expect(editor).toBeFocused();

  // Click the stage background well away from the (vertically-centred) glyphs: near the
  // top edge, inside the padding. The grid is not focusable, so clicking it blurs the
  // editable — the desired "stop editing" behaviour, entirely via native focus handling.
  const box = await stage(page).boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.click(box.x + box.width / 2, box.y + 10);

  await expect(editor).not.toBeFocused();
  expect((await editor.textContent())?.trim()).toBe("Hi");

  expect(errors, "console/runtime errors:\n" + errors.join("\n")).toEqual([]);
});

test("Escape while editing blurs the editable", async ({ page }) => {
  await pickNeonGlow(page);

  const editor = page.getByRole("textbox", { name: /effect text/i });
  await editor.click({ force: true });
  await expect(editor).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(editor).not.toBeFocused();
});

test("clicking the stage background does NOT start editing (focus is scoped to the text)", async ({
  page,
}) => {
  await pickNeonGlow(page);

  const editor = page.getByRole("textbox", { name: /effect text/i });
  await expect(editor).not.toBeFocused();

  // Click the grid/background near the top edge (away from the centred glyphs). The grid
  // is no longer an edit target, so this must not focus the editable.
  const box = await stage(page).boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.click(box.x + box.width / 2, box.y + 10);

  await expect(editor).not.toBeFocused();
});

test("clicking the text places a collapsed caret (no select-all highlight)", async ({ page }) => {
  await pickNeonGlow(page);

  const editor = page.getByRole("textbox", { name: /effect text/i });
  await editor.click({ force: true }); // click the glyphs themselves

  await expect(editor).toBeFocused();
  // The caret must be a collapsed selection inside the editable — no full-text highlight.
  const sel = await editor.evaluate((el) => {
    const s = window.getSelection();
    return {
      collapsed: s?.isCollapsed ?? null,
      selected: s?.toString() ?? "",
      inside: s?.anchorNode ? el.contains(s.anchorNode) : false,
    };
  });
  expect(sel.collapsed).toBe(true);
  expect(sel.selected).toBe("");
  expect(sel.inside).toBe(true);
});

test("a corrupted favorites store does not crash the app", async ({ page }) => {
  const errors = trackErrors(page);

  await page.addInitScript(() => {
    localStorage.setItem(
      "textfx_favs_v2",
      JSON.stringify([
        { id: "x" }, // malformed
        "junk", // malformed
        { id: "y", effectId: "neon-glow", name: "Neon Glow", word: "hi", seed: 1, values: {}, theme: "dark" },
      ]),
    );
  });

  await page.goto("/");
  await page.waitForSelector(".fx-live");

  // Studio renders normally (no error boundary).
  await expect(page.getByRole("button", { name: /shuffle/i })).toBeVisible();
  await expect(page.getByText(/something broke/i)).toHaveCount(0);

  // Only the one valid favorite survives.
  await expect(page.getByText(/Saved — 1/)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Load saved/i })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Load saved Neon Glow/i })).toBeVisible();

  expect(errors, "console/runtime errors:\n" + errors.join("\n")).toEqual([]);
});

test("Replay remounts the stage textbox, restarting its animation", async ({ page }) => {
  const errors = trackErrors(page);
  await pickNeonGlow(page);

  const editor = page.getByRole("textbox", { name: /effect text/i });
  await editor.evaluate((el) => {
    (el as HTMLElement).dataset.marker = "x";
  });
  expect(await editor.evaluate((el) => (el as HTMLElement).dataset.marker)).toBe("x");

  await page.getByRole("button", { name: /replay animation/i }).click();

  await expect(editor).toBeVisible();
  expect((await editor.textContent())?.trim()).toBe("type here");
  expect(await editor.evaluate((el) => (el as HTMLElement).dataset.marker)).toBeUndefined();

  expect(errors, "console/runtime errors:\n" + errors.join("\n")).toEqual([]);
});
