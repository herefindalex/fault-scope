import { expect, test } from "@playwright/test";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test("mobile navigation reaches Cases 02 through 08 from Case 01", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("faultscope.v1.codeLens", "go");
  });

  await page.goto("/zh-TW/cases/should-you-send-it-again/?lang=go");
  const casesLink = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "案例" });
  await expect(casesLink).toBeVisible();

  await casesLink.click();
  await expect(page).toHaveURL(/\/zh-TW\/cases\/$/);
  await page
    .locator('a[href="/zh-TW/cases/can-the-old-worker-still-commit/"]')
    .click();
  await expect(
    page.getByRole("heading", { name: "A 已被接手，還能提交結果嗎？" }),
  ).toBeVisible();

  await casesLink.click();
  await page
    .locator('a[href="/zh-TW/cases/database-committed-where-is-event/"]')
    .click();
  await expect(
    page.getByRole("heading", { name: "訂單已確認，事件怎麼沒送出？" }),
  ).toBeVisible();

  await casesLink.click();
  await page
    .locator('a[href="/zh-TW/cases/consumer-finished-why-run-again/"]')
    .click();
  await expect(
    page.getByRole("heading", {
      name: "消費端明明處理完了，為什麼又執行一次？",
    }),
  ).toBeVisible();

  await casesLink.click();
  await page
    .locator('a[href="/zh-TW/cases/which-event-is-actually-newer/"]')
    .click();
  await expect(
    page.getByRole("heading", { name: "到底哪個事件比較新？" }),
  ).toBeVisible();

  await casesLink.click();
  await page
    .locator('a[href="/zh-TW/cases/the-read-succeeded-is-it-fresh-enough/"]')
    .click();
  await expect(
    page.getByRole("heading", { name: "讀取成功了，但資料夠新嗎？" }),
  ).toBeVisible();

  await casesLink.click();
  await page
    .locator('a[href="/zh-TW/cases/did-cancellation-stop-the-work/"]')
    .click();
  await expect(
    page.getByRole("heading", { name: "取消後，工作真的停了嗎？" }),
  ).toBeVisible();

  await casesLink.click();
  await page
    .locator('a[href="/zh-TW/cases/it-restarted-what-did-it-forget/"]')
    .click();
  await expect(page.locator(".recovery-visual")).toBeVisible();
});
