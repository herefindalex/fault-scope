import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeBlock } from "./CodeBlock";
import {
  LanguageProvider,
  codeLensPreferenceKey,
  useLanguage,
} from "./LanguageProvider";
import { LocaleProvider } from "./LocaleProvider";

function Harness() {
  const { language, ready } = useLanguage();
  return (
    <>
      <span data-testid="lens">{ready ? language : "resolving"}</span>
      <CodeBlock anchor="fs-c01.retry-independent-attempt" />
    </>
  );
}
function renderLens(locale = "en", navigate?: (url: string) => void) {
  return render(
    <LocaleProvider locale={locale} navigate={navigate}>
      <LanguageProvider>
        <Harness />
      </LanguageProvider>
    </LocaleProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/en/");
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => cleanup());

describe("Code Lens preference", () => {
  it("prompts on first visit and saves a choice independently of locale", async () => {
    const user = userEvent.setup();
    renderLens("zh-TW");
    expect(screen.getByRole("dialog").hasAttribute("open")).toBe(true);
    await user.click(screen.getByRole("button", { name: "PHP" }));
    expect(screen.getByTestId("lens").textContent).toBe("php");
    expect(localStorage.getItem(codeLensPreferenceKey)).toBe("php");
    expect(localStorage.getItem("faultscope.v1.locale")).toBeNull();
  });

  it("uses a URL override without overwriting the saved code lens", () => {
    localStorage.setItem(codeLensPreferenceKey, "php");
    history.replaceState(null, "", "/ja/?lang=cpp");
    renderLens("ja");
    expect(screen.getByTestId("lens").textContent).toBe("cpp");
    expect(localStorage.getItem(codeLensPreferenceKey)).toBe("php");
  });

  it("lets a first-time visitor change human locale from the Code Lens dialog", async () => {
    const user = userEvent.setup();
    let destination = "";
    renderLens("en", (url) => {
      destination = url;
    });
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Choose human language" }),
      "ja",
    );
    expect(destination).toBe("/ja/");
    expect(localStorage.getItem("faultscope.v1.locale")).toBe("ja");
    expect(localStorage.getItem(codeLensPreferenceKey)).toBeNull();
  });

  it("switches code lens while keeping the human locale", async () => {
    localStorage.setItem(codeLensPreferenceKey, "cpp");
    const user = userEvent.setup();
    renderLens("ja");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "コードレンズ" }),
      "go",
    );
    expect(screen.getByTestId("lens").textContent).toBe("go");
    expect(history.state).toBeNull();
    expect(window.location.pathname).toBe("/en/");
  });
});
