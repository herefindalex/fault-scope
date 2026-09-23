import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useReducer } from "react";
import { caseReducer, initialCaseState } from "../src/case";
import { CodeBlock } from "./CodeBlock";
import { LanguageProvider, useLanguage } from "./LanguageProvider";

function Harness() {
  const { language, ready } = useLanguage();
  const [state, dispatch] = useReducer(caseReducer, initialCaseState);
  return (
    <>
      <span data-testid="lens">{ready ? language : "resolving"}</span>
      <span data-testid="step">{state.step}</span>
      <button onClick={() => dispatch({ type: "next" })}>Next</button>
      <CodeBlock anchor="fs-c01.retry-independent-attempt" />
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/");
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
afterEach(() => cleanup());

describe("Code Lens UI", () => {
  it("prompts on first visit and saves the chosen lens", async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <Harness />
      </LanguageProvider>,
    );
    expect(
      screen
        .getByRole("dialog", { name: "Choose your code lens" })
        .hasAttribute("open"),
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: "PHP" }));
    expect(screen.getByTestId("lens").textContent).toBe("php");
    expect(localStorage.getItem("faultscope.code-lens")).toBe("php");
  });

  it("uses URL override for this visit without overwriting the saved preference", () => {
    localStorage.setItem("faultscope.code-lens", "php");
    history.replaceState(null, "", "/?lang=cpp");
    render(
      <LanguageProvider>
        <Harness />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("lens").textContent).toBe("cpp");
    expect(localStorage.getItem("faultscope.code-lens")).toBe("php");
  });

  it("switches code without moving the guided step", async () => {
    const user = userEvent.setup();
    localStorage.setItem("faultscope.code-lens", "go");
    render(
      <LanguageProvider>
        <Harness />
      </LanguageProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Code block language" }),
      "cpp",
    );
    expect(screen.getByTestId("step").textContent).toBe("evidence");
    expect(screen.getByTestId("lens").textContent).toBe("cpp");
    expect(screen.getByText(/VmOutcome retry_independent/)).toBeTruthy();
  });
});
