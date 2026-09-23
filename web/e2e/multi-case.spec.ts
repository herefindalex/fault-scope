import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

type RegistryEntry = { id: string; status: string; direction: "ltr" | "rtl" };
type CaseCatalog = { stepIds: string[]; messages: Record<string, string> };
type CaseDefinition = { id: string; slug: string; steps: string[] };

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as T;
}

const locales = readJson<RegistryEntry[]>("../i18n/registry.json").filter(
  (entry) => entry.status !== "draft",
);
const cases = [
  readJson<CaseDefinition>("../src/case-02-data.json"),
  readJson<CaseDefinition>("../src/case-03-data.json"),
];
const englishUI = readJson<Record<string, string>>("../i18n/messages/en.json");

for (const definition of cases) {
  const english = readJson<CaseCatalog>(
    `../content/cases/${definition.id}/locales/en.json`,
  );
  for (const locale of locales) {
    const catalog = readJson<CaseCatalog>(
      `../content/cases/${definition.id}/locales/${locale.id}.json`,
    );
    const ui = readJson<Record<string, string>>(
      `../i18n/messages/${locale.id}.json`,
    );

    test(`${definition.id} has complete ${locale.id} copy and learning flow`, async ({
      page,
    }) => {
      expect(catalog.stepIds).toEqual(english.stepIds);
      expect(Object.keys(catalog.messages).sort()).toEqual(
        Object.keys(english.messages).sort(),
      );
      expect(catalog.stepIds).toEqual(definition.steps);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(
        `/${locale.id}/cases/${definition.slug}/?mode=guided&lang=go`,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", locale.id);
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        locale.direction,
      );
      await expect(page.locator("nav")).toContainText(ui["nav.cases"]);
      await expect(page.locator(".case-topline")).toContainText(
        ui["nav.cases"],
      );
      await expect(page.locator(".site-footer")).toContainText(
        ui["footer.preview"],
      );
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        catalog.messages.title,
      );
      const lesson = page.locator(".lesson-panel");
      const next = page.getByRole("button", { name: ui["action.next"] });
      for (const [index, step] of catalog.stepIds.entries()) {
        await expect(lesson.locator("h2")).toHaveText(
          catalog.messages[`step.${step}.title`],
        );
        await expect(lesson).toContainText(
          catalog.messages[`step.${step}.lead`],
        );
        if (index < catalog.stepIds.length - 1) await next.click();
      }
      await next.click();
      await expect(page.locator(".challenge-panel")).toBeVisible();
      await expect(page).toHaveURL(/mode=challenge/);
      await expect(page.locator(".challenge-panel")).toContainText(
        catalog.messages["challenge.question"],
      );
      await page.locator(".answer-row button").first().click();
      await expect(page.locator(".answer-note")).toHaveText(
        catalog.messages["challenge.feedback"],
      );
      await page.getByRole("button", { name: ui["case.deepDive"] }).click();
      await expect(page.locator(".deep-dive")).toContainText(
        catalog.messages["takeaway"],
      );
      for (const section of definition.id === "fs-c03"
        ? [1, 2, 3, 4, 5]
        : [1, 2, 3, 4]) {
        await expect(page.locator(".deep-dive")).toContainText(
          catalog.messages[`deepDive.section${section}.body`],
        );
      }
      await expect(page.locator(".case-visual")).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
}

test("case progress remains separate across cases, locales, and Code Lenses", async ({
  page,
}) => {
  const [case02, case03] = cases;
  await page.goto(`/en/cases/${case02.slug}/?mode=guided&lang=go`);
  await page.getByRole("button", { name: englishUI["action.next"] }).click();
  await page.getByRole("button", { name: englishUI["action.next"] }).click();
  const step02 = case02.steps[2];
  await expect(page.locator(".lesson-panel h2")).toHaveText(
    readJson<CaseCatalog>("../content/cases/fs-c02/locales/en.json").messages[
      `step.${step02}.title`
    ],
  );
  await page.locator("#global-language").selectOption("php");
  await expect(page.locator(".lesson-panel h2")).toHaveText(
    readJson<CaseCatalog>("../content/cases/fs-c02/locales/en.json").messages[
      `step.${step02}.title`
    ],
  );
  await page.locator("#global-locale").selectOption("zh-TW");
  await expect(page.locator(".lesson-panel h2")).toHaveText(
    readJson<CaseCatalog>("../content/cases/fs-c02/locales/zh-TW.json")
      .messages[`step.${step02}.title`],
  );
  await page.goto(`/en/cases/${case03.slug}/?mode=guided&lang=go`);
  await expect(page.locator(".lesson-panel h2")).toHaveText(
    readJson<CaseCatalog>("../content/cases/fs-c03/locales/en.json").messages[
      `step.${case03.steps[0]}.title`
    ],
  );
  await page.getByRole("button", { name: englishUI["action.next"] }).click();
  await page.goto("/en/cases/should-you-send-it-again/?mode=guided&lang=go");
  await page.getByRole("button", { name: englishUI["action.next"] }).click();
  await page.goto(`/en/cases/${case02.slug}/?mode=guided&lang=go`);
  await expect(page.locator(".lesson-panel h2")).toHaveText(
    readJson<CaseCatalog>("../content/cases/fs-c02/locales/en.json").messages[
      `step.${step02}.title`
    ],
  );
  const stored = await page.evaluate(() => ({
    first: JSON.parse(
      localStorage.getItem("faultscope.v1.caseProgress.fs-c01") ?? "null",
    ),
    second: JSON.parse(
      localStorage.getItem("faultscope.v1.caseProgress.fs-c02") ?? "null",
    ),
    third: JSON.parse(
      localStorage.getItem("faultscope.v1.caseProgress.fs-c03") ?? "null",
    ),
  }));
  expect(stored.second.step).toBe(step02);
  expect(stored.third.step).toBe(case03.steps[1]);
  expect(stored.first.step).toBe("evidence");
  await page.goto("/en/cases/should-you-send-it-again/?mode=guided&lang=go");
  await expect(page.locator(".lesson-panel h2")).toHaveText(
    readJson<CaseCatalog>("../content/cases/fs-c01/locales/en.json").messages[
      "step.evidence.title"
    ],
  );
});

test("Code Lens entries reopen each new Case in Guided mode", async ({
  page,
}) => {
  for (const definition of cases) {
    await page.goto(`/en/cases/${definition.slug}/?mode=challenge&lang=go`);
    await expect(page.locator(".challenge-panel")).toBeVisible();
    await page.locator("#global-language").selectOption("go");
    await page.goto("/en/languages/go/");
    await page
      .locator(`a[href="/en/cases/${definition.slug}/?lang=go&mode=guided"]`)
      .click();
    await expect(page.locator(".lesson-panel")).toBeVisible();
    await expect(
      page.getByRole("button", { name: englishUI["case.guided"] }),
    ).toHaveAttribute("aria-pressed", "true");
  }
});

test("each case uses its own visual and all seven Code Lenses", async ({
  page,
}) => {
  for (const definition of cases) {
    await page.goto(`/en/cases/${definition.slug}/?mode=guided&lang=go`);
    await expect(
      page.locator(
        definition.id === "fs-c02"
          ? ".authority-timeline"
          : ".durability-domains",
      ),
    ).toBeVisible();
    for (const language of [
      "go",
      "typescript",
      "python",
      "java",
      "php",
      "c",
      "cpp",
    ]) {
      await page.locator("#global-language").selectOption(language);
      await expect(page.locator(".code-frame")).toBeVisible();
      await expect(page.locator(".code-frame code")).not.toBeEmpty();
    }
    if (definition.id === "fs-c03") {
      const catalog = readJson<CaseCatalog>(
        "../content/cases/fs-c03/locales/en.json",
      );
      await expect(page.locator(".durability-domains")).not.toContainText(
        catalog.messages["visual.rollback"],
      );
      for (let step = 0; step < 9; step++) {
        await page
          .getByRole("button", { name: englishUI["action.next"] })
          .click();
      }
      await expect(page.locator(".durability-domains")).toContainText(
        catalog.messages["visual.rollback"],
      );
    }
  }
});
