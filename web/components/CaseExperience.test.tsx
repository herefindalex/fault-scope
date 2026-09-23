import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CaseExperience } from "./CaseExperience";
import { LanguageProvider } from "./LanguageProvider";

beforeEach(() => {
  localStorage.setItem("faultscope.code-lens", "go");
  history.replaceState(null, "", "/cases/should-you-send-it-again/");
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => cleanup());

function renderCase() {
  render(
    <LanguageProvider>
      <CaseExperience deepDive={<p>Deep Dive content is available.</p>} />
    </LanguageProvider>,
  );
}

describe("Case 01 learning flow", () => {
  it("reveals the evidence, possible worlds, property, and changing rail", async () => {
    const user = userEvent.setup();
    renderCase();
    const next = screen.getByRole("button", { name: "Next insight →" });
    await user.click(next);
    expect(
      screen.getByRole("heading", { name: "What did the caller observe?" }),
    ).toBeTruthy();
    const rail = screen.getByRole("complementary", { name: "Reasoning rail" });
    expect(
      within(rail).getByText(/No completion response before the caller/),
    ).toBeTruthy();
    await user.click(next);
    expect(
      screen.getByRole("heading", { name: "Two possible worlds" }),
    ).toBeTruthy();
    const worlds = screen.getByRole("group", {
      name: /Two representative executions/,
    });
    expect(within(worlds).getByText("WORLD A")).toBeTruthy();
    expect(within(worlds).getByText("WORLD B")).toBeTruthy();
    await user.click(next);
    expect(
      within(rail).getByText(
        /One logical CreateVM operation must not create two VMs/,
      ),
    ).toBeTruthy();
  });

  it("keeps the stronger-contract step while switching code lens", async () => {
    const user = userEvent.setup();
    renderCase();
    const next = screen.getByRole("button", { name: "Next insight →" });
    for (let i = 0; i < 5; i++) await user.click(next);
    expect(
      screen.getByRole("heading", {
        name: "Change the contract, not the failure",
      }),
    ).toBeTruthy();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Code block language" }),
      "cpp",
    );
    expect(
      screen.getByRole("heading", {
        name: "Change the contract, not the failure",
      }),
    ).toBeTruthy();
    expect(screen.getByText(/VmOutcome retry_same_operation/)).toBeTruthy();
  });

  it("supports Challenge and Deep Dive without losing Guided progress", async () => {
    const user = userEvent.setup();
    renderCase();
    await user.click(screen.getByRole("button", { name: "Next insight →" }));
    await user.click(screen.getByRole("button", { name: "Challenge" }));
    expect(screen.getByRole("heading", { name: "Make the call" })).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: /Keep the operation unresolved/ }),
    );
    expect(screen.getByRole("status").textContent).toContain(
      "Contract A permits A1",
    );
    await user.click(screen.getByRole("button", { name: "Deep Dive" }));
    expect(screen.getByText("Deep Dive content is available.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Guided" }));
    expect(
      screen.getByRole("heading", { name: "What did the caller observe?" }),
    ).toBeTruthy();
  });
});
