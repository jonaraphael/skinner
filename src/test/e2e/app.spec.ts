import { expect, test } from "@playwright/test";

test("mobile core flow: create, complete, filter, persist, reduced motion", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "New" }).click();
  await page.getByLabel("Title").fill("Easy recurring task");
  await page.getByLabel("Type").selectOption("recurring");
  await page.getByLabel("Difficulty").selectOption("easy");
  await page.getByRole("button", { name: "Save Task" }).click();

  await expect(page.getByRole("heading", { name: "Easy recurring task" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Complete" }).first().click();
  const continueBtn = page.getByRole("button", { name: "Continue" });
  if (await continueBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await continueBtn.click();
  }

  await page.getByRole("link", { name: "Rewards" }).click();
  await expect(page.getByText("Completions")).toBeVisible();
  const completionCount = await page.locator(".stats-grid article").first().locator("p").textContent();
  expect(Number(completionCount ?? "0")).toBeGreaterThanOrEqual(1);

  await page.getByRole("link", { name: "Tasks" }).click();
  await page.getByRole("link", { name: "New" }).click();
  await page.getByLabel("Title").fill("Hard deadline task");
  await page.getByLabel("Type").selectOption("deadline");
  await page.getByLabel("Difficulty").selectOption("hard");
  await page.getByLabel("Due At").fill("2026-02-27T12:00");
  await page.getByRole("button", { name: "Save Task" }).click();

  await page.getByRole("link", { name: "Tasks" }).click();
  await page.getByRole("button", { name: "hard" }).click();
  await expect(page.getByText("Hard deadline task")).toBeVisible();

  await page.reload();
  await page.getByRole("link", { name: "Tasks" }).click();
  await expect(page.getByText("Hard deadline task")).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await page.getByLabel("Reduced Motion").check();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
});
