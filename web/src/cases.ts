import case01 from "./case-data.json";
import case02 from "./case-02-data.json";
import case03 from "./case-03-data.json";
import case04 from "./case-04-data.json";
import case05 from "./case-05-data.json";

export const caseDefinitions = [case01, case02, case03, case04, case05];
export type CaseId = "fs-c01" | "fs-c02" | "fs-c03" | "fs-c04" | "fs-c05";
export type CaseDefinition = (typeof caseDefinitions)[number];

export function getCaseById(id: string): CaseDefinition | undefined {
  return caseDefinitions.find((item) => item.id === id);
}

export function getCaseBySlug(slug: string): CaseDefinition | undefined {
  return caseDefinitions.find((item) => item.slug === slug);
}

export function visibleCases(includeDrafts = false): CaseDefinition[] {
  return caseDefinitions.filter(
    (item) => item.status === "published" || includeDrafts,
  );
}
