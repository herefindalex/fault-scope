import { describe, expect, it } from "vitest";
import { caseReducer, initialCaseState, steps } from "./case";
import { resolveLanguage } from "./language-choice";
import { snippetFor } from "./snippets";
import caseData from "./case-data.json";

describe("code lens resolution", () => {
  it("lets URL override saved preference without changing the saved value", () => {
    expect(resolveLanguage("cpp", "php")).toEqual({
      language: "cpp",
      prompt: false,
      source: "url",
    });
    expect(resolveLanguage(null, "php").language).toBe("php");
    expect(resolveLanguage(null, null)).toEqual({
      language: "go",
      prompt: true,
      source: "default",
    });
  });
  it("resolves every required source anchor in all seven lenses", () => {
    for (const language of [
      "go",
      "typescript",
      "python",
      "java",
      "php",
      "c",
      "cpp",
    ] as const) {
      expect(
        snippetFor("fs-c01.retry-same-logical-operation", language).length,
      ).toBeGreaterThan(25);
    }
  });
});

describe("Case 01 state", () => {
  it("keeps published structural steps aligned with the implemented flow", () => {
    expect(caseData.status).toBe("published");
    expect(caseData.steps).toEqual(steps);
  });
  it("keeps answers and guided position when the mode changes", () => {
    const answered = caseReducer(initialCaseState, {
      type: "answer",
      key: "review",
      value: "I need more information",
    });
    const progressed = caseReducer(answered, { type: "next" });
    const challenge = caseReducer(progressed, {
      type: "mode",
      mode: "challenge",
    });
    expect(challenge.step).toBe("evidence");
    expect(challenge.answers.review).toBe("I need more information");
    expect(caseReducer(challenge, { type: "mode", mode: "guided" }).step).toBe(
      "evidence",
    );
    expect(steps).toContain("scope-challenge");
  });
});
