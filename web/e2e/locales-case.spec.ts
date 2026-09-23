import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

type RegistryEntry = { id: string; status: string; direction: "ltr" | "rtl" };
type CaseCatalog = { stepIds: string[]; messages: Record<string, string> };

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as T;
}

const locales = readJson<RegistryEntry[]>("../i18n/registry.json").filter(
  ({ status }) => status !== "draft",
);
const englishUI = readJson<Record<string, string>>("../i18n/messages/en.json");
const englishCase = readJson<CaseCatalog>(
  "../content/cases/fs-c01/locales/en.json",
);
const casePath = "cases/should-you-send-it-again/";

for (const locale of locales) {
  const ui = readJson<Record<string, string>>(
    `../i18n/messages/${locale.id}.json`,
  );
  const content = readJson<CaseCatalog>(
    `../content/cases/fs-c01/locales/${locale.id}.json`,
  );

  test(`${locale.id} catalog covers all current messages and steps`, () => {
    expect(Object.keys(ui).sort()).toEqual(Object.keys(englishUI).sort());
    expect(content.stepIds).toEqual(englishCase.stepIds);
    expect(Object.keys(content.messages).sort()).toEqual(
      Object.keys(englishCase.messages).sort(),
    );
  });

  test(`${locale.id} completes the Case 01 learning path`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`/${locale.id}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale.id);
    await expect(page.locator("html")).toHaveAttribute("dir", locale.direction);
    await page.getByRole("button", { name: "Go", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      ui["home.title"],
    );
    await expect(page.getByText(ui["home.codeReasonable"])).toBeVisible();
    await page.getByRole("link", { name: ui["home.cta"] }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale.id}/${casePath}$`));

    const lesson = page.locator(".lesson-panel");
    for (const [index, step] of content.stepIds.entries()) {
      await expect(lesson.locator("h2")).toHaveText(
        content.messages[`step.${step}.title`],
      );
      await expect(lesson).toContainText(content.messages[`step.${step}.lead`]);
      if (index < content.stepIds.length - 1) {
        await page
          .getByRole("button", { name: ui["action.next"], exact: true })
          .click();
      }
    }

    const finalNext = page.getByRole("button", {
      name: ui["action.next"],
      exact: true,
    });
    await expect(finalNext).toBeEnabled();
    await finalNext.click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale.id}/${casePath}\\?mode=challenge$`),
    );
    await expect(
      page.getByRole("button", { name: ui["case.challenge"] }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".challenge-panel")).toContainText(
      content.messages["challenge.intro"],
    );
    await expect(page.locator(".challenge-panel")).toContainText(
      content.messages["option.challengeUnresolved"],
    );

    await page.getByRole("button", { name: ui["case.deepDive"] }).click();
    for (const section of [1, 2, 3]) {
      await expect(page.locator(".deep-dive")).toContainText(
        content.messages[`deepDive.section${section}.body`],
      );
    }
    expect(errors).toEqual([]);
  });
}

test("Traditional Chinese keeps challenge mode and Code Lens across locale changes", async ({
  page,
}) => {
  await page.goto(`/zh-TW/${casePath}?mode=challenge`);
  await expect(page.locator(".challenge-panel")).toBeVisible();
  await page.locator("#global-language").selectOption("php");
  await expect(page.locator("#global-language")).toHaveValue("php");
  await page.locator("#global-locale").selectOption("en");
  await expect(page).toHaveURL(new RegExp(`/en/${casePath}\\?mode=challenge$`));
  await page.locator("#global-locale").selectOption("zh-TW");
  await expect(page.locator("#global-language")).toHaveValue("php");
  await expect(page.locator(".challenge-panel")).toBeVisible();
});
