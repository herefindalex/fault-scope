export const languageIds = [
  "go",
  "typescript",
  "python",
  "java",
  "php",
  "c",
  "cpp",
] as const;
export type Language = (typeof languageIds)[number];
export const languageNames: Record<Language, string> = {
  go: "Go",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  php: "PHP",
  c: "C",
  cpp: "C++",
};
export function isLanguage(value: string | null): value is Language {
  return value !== null && languageIds.some((language) => language === value);
}

export const steps = [
  "review",
  "evidence",
  "worlds",
  "property",
  "weak-contract",
  "strong-contract",
  "scope-challenge",
  "positive-control",
  "negative-control",
  "transfer",
  "remaining",
  "recap",
] as const;
export type Step = (typeof steps)[number];
export type Mode = "guided" | "challenge" | "deep-dive";
export type CaseState = {
  mode: Mode;
  step: Step;
  answers: Record<string, string>;
};
export type CaseAction =
  | { type: "answer"; key: string; value: string }
  | { type: "next" | "previous" }
  | { type: "mode"; mode: Mode }
  | { type: "step"; step: Step };

export const initialCaseState: CaseState = {
  mode: "guided",
  step: "review",
  answers: {},
};

export function caseReducer(state: CaseState, action: CaseAction): CaseState {
  if (action.type === "answer")
    return {
      ...state,
      answers: { ...state.answers, [action.key]: action.value },
    };
  if (action.type === "mode") return { ...state, mode: action.mode };
  if (action.type === "step") return { ...state, step: action.step };
  const index = steps.indexOf(state.step);
  const next =
    action.type === "next"
      ? Math.min(index + 1, steps.length - 1)
      : Math.max(index - 1, 0);
  return { ...state, step: steps[next] };
}

export const caseFacts = {
  observation: "No completion response before the caller’s deadline.",
  property: "One logical CreateVM operation must not create two VMs.",
  weakContract:
    "No documented repeat protection; no additional outcome evidence.",
  strongContract:
    "Compatible repeats carrying P are one logical operation; the receiver will not create a second VM for P within its defined scope.",
};
