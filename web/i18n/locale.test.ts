import { describe, expect, it } from "vitest";
import { caseCopy, ui } from "./catalog";
import { resolveLocale, switchLocaleUrl } from "./locale";

describe("human locale", () => {
  it("resolves explicit route, saved preference, browser language, then English", () => {
    expect(resolveLocale("ja", "es", ["de-AT"])).toBe("ja");
    expect(resolveLocale(null, "es", ["de-AT"])).toBe("es");
    expect(resolveLocale(null, null, ["de-AT"])).toBe("de");
    expect(resolveLocale(null, null, ["es-MX"])).toBe("es");
    expect(resolveLocale(null, null, ["pt-PT"])).toBe("pt-BR");
    expect(resolveLocale(null, null, ["xx-INVALID"])).toBe("en");
  });
  it("keeps meaningful Chinese variants separate", () => {
    expect(resolveLocale(null, null, ["zh-TW"])).toBe("zh-TW");
    expect(resolveLocale(null, null, ["zh-HK"])).toBe("zh-TW");
    expect(resolveLocale(null, null, ["zh-CN"])).toBe("zh-CN");
  });
  it("switches the route without losing code lens or mode query state", () => {
    const route = new URL(
      "https://example.test/zh-TW/cases/should-you-send-it-again/?lang=php&mode=challenge#evidence",
    );
    expect(switchLocaleUrl(route, "ja")).toBe(
      "/ja/cases/should-you-send-it-again/?lang=php&mode=challenge#evidence",
    );
  });
  it("serves localized beta content with placeholder interpolation", () => {
    expect(caseCopy("ja", "step.strong-contract.explanation")).not.toBe(
      caseCopy("en", "step.strong-contract.explanation"),
    );
    expect(ui("ja", "home.answerNote", { answer: "Go" })).toContain("Go");
    expect(caseCopy("ar", "step.evidence.lead")).not.toBe(
      caseCopy("en", "step.evidence.lead"),
    );
  });
});
