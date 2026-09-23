import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { caseCopy } from "../i18n/catalog";
import { CaseExperience, caseProgressKey } from "./CaseExperience";
import {
  LanguageProvider,
  codeLensPreferenceKey,
  useLanguage,
} from "./LanguageProvider";
import { GlobalLocaleSelector, LocaleProvider } from "./LocaleProvider";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(codeLensPreferenceKey, "go");
  history.replaceState(null, "", "/en/cases/should-you-send-it-again/");
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => cleanup());

function renderCase(locale = "en", navigate?: (url: string) => void) {
  function LensProbe() {
    const { language } = useLanguage();
    return <output data-testid="lens">{language}</output>;
  }
  return render(
    <LocaleProvider locale={locale} navigate={navigate}>
      <LanguageProvider>
        <GlobalLocaleSelector />
        <LensProbe />
        <CaseExperience />
      </LanguageProvider>
    </LocaleProvider>,
  );
}

describe("Case 01 with independent locale and code lens", () => {
  it("reveals evidence, worlds, property, and the reasoning rail", async () => {
    const user = userEvent.setup();
    renderCase();
    const next = screen.getByRole("button", { name: "Next insight" });
    await user.click(next);
    expect(
      screen.getByRole("heading", { name: "What did the caller observe?" }),
    ).toBeTruthy();
    const rail = screen.getByRole("complementary", { name: "Reasoning rail" });
    expect(
      within(rail).getByText(/No completion response before the caller/),
    ).toBeTruthy();
    await user.click(next);
    const worlds = screen.getByRole("group", {
      name: /Two representative executions/,
    });
    expect(within(worlds).getByText("World A")).toBeTruthy();
    expect(within(worlds).getByText("World B")).toBeTruthy();
    await user.click(next);
    expect(
      within(rail).getByText(/One logical CreateVM operation/),
    ).toBeTruthy();
  });

  it("preserves Case, step, answers, visual state, and PHP when switching locale", async () => {
    const user = userEvent.setup();
    localStorage.setItem(codeLensPreferenceKey, "php");
    history.replaceState(
      null,
      "",
      "/zh-TW/cases/should-you-send-it-again/?lang=php",
    );
    let destination = "";
    const first = renderCase("zh-TW", (url) => {
      destination = url;
    });
    await user.click(screen.getByRole("button", { name: /我需要更多資訊/ }));
    await user.click(screen.getByRole("button", { name: "下一步" }));
    await user.click(screen.getByRole("button", { name: "下一步" }));
    expect(
      screen.getByRole("group", { name: caseCopy("zh-TW", "worlds.aria") }),
    ).toBeTruthy();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "選擇人類語言" }),
      "ja",
    );
    expect(destination).toBe("/ja/cases/should-you-send-it-again/?lang=php");
    expect(localStorage.getItem("faultscope.v1.locale")).toBe("ja");
    const saved = JSON.parse(localStorage.getItem(caseProgressKey) ?? "{}");
    expect(saved).toMatchObject({
      step: "worlds",
      answers: { review: "option.needMore" },
      mode: "guided",
    });
    first.unmount();
    history.replaceState(null, "", destination);
    renderCase("ja");
    expect(
      screen.getByRole("group", { name: caseCopy("ja", "worlds.aria") }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "二つの可能な実行" }),
    ).toBeTruthy();
    expect(screen.getByTestId("lens").textContent).toBe("php");
    expect(localStorage.getItem(codeLensPreferenceKey)).toBe("php");
  });

  it("keeps Guided progress across Challenge and Deep Dive", async () => {
    const user = userEvent.setup();
    let destination = "";
    const first = renderCase("en", (url) => {
      destination = url;
    });
    await user.click(screen.getByRole("button", { name: "Next insight" }));
    await user.click(screen.getByRole("button", { name: "Challenge" }));
    expect(
      screen.getByRole("heading", { name: "What should the caller do?" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Deep Dive" }));
    expect(
      screen.getByRole("heading", {
        name: "Where does the retry guarantee end?",
      }),
    ).toBeTruthy();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Choose human language" }),
      "ar",
    );
    expect(destination).toBe(
      "/ar/cases/should-you-send-it-again/?mode=deep-dive",
    );
    first.unmount();
    history.replaceState(null, "", destination);
    renderCase("ar");
    expect(screen.getByRole("heading", { name: "حدود العقد" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "موجّه" }));
    expect(
      screen.getByRole("heading", { name: "ماذا لاحظت الجهة المستدعية؟" }),
    ).toBeTruthy();
  });
});
