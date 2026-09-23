"use client";

import { useEffect, useState } from "react";

export type CaseMode = "guided" | "challenge" | "deep-dive";
export type CaseProgress<Step extends string> = {
  mode: CaseMode;
  step: Step;
  answers: Record<string, string>;
};

export function caseProgressKey(caseId: string): string {
  return `faultscope.v1.caseProgress.${caseId}`;
}

export function parseStoredProgress<Step extends string>(
  raw: string | null,
  steps: readonly Step[],
): CaseProgress<Step> | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    if (!steps.includes(record.step as Step)) return null;
    if (
      record.mode !== "guided" &&
      record.mode !== "challenge" &&
      record.mode !== "deep-dive"
    ) {
      return null;
    }
    if (
      !record.answers ||
      typeof record.answers !== "object" ||
      Array.isArray(record.answers)
    ) {
      return null;
    }
    const answers = record.answers as Record<string, unknown>;
    if (!Object.values(answers).every((answer) => typeof answer === "string")) {
      return null;
    }
    return {
      mode: record.mode,
      step: record.step as Step,
      answers: answers as Record<string, string>,
    };
  } catch {
    return null;
  }
}

export function useCaseProgress<Step extends string>(
  caseId: string,
  steps: readonly Step[],
) {
  const [state, setState] = useState<CaseProgress<Step>>({
    mode: "guided",
    step: steps[0],
    answers: {},
  });

  useEffect(() => {
    const restored = parseStoredProgress(
      window.localStorage.getItem(caseProgressKey(caseId)),
      steps,
    ) ?? { mode: "guided" as const, step: steps[0], answers: {} };
    const requested = new URLSearchParams(window.location.search).get("mode");
    setState(
      requested === "guided" ||
        requested === "challenge" ||
        requested === "deep-dive"
        ? { ...restored, mode: requested }
        : restored,
    );
  }, [caseId, steps]);

  function update(
    next:
      | CaseProgress<Step>
      | ((current: CaseProgress<Step>) => CaseProgress<Step>),
  ) {
    setState((current) => {
      const value = typeof next === "function" ? next(current) : next;
      window.localStorage.setItem(
        caseProgressKey(caseId),
        JSON.stringify(value),
      );
      return value;
    });
  }

  function chooseMode(mode: CaseMode) {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    window.history.replaceState(null, "", url);
    update((current) => ({ ...current, mode }));
  }

  function move(delta: -1 | 1) {
    update((current) => {
      const index = steps.indexOf(current.step);
      const nextIndex = Math.max(0, Math.min(steps.length - 1, index + delta));
      return { ...current, step: steps[nextIndex] };
    });
  }

  function answer(key: string, value: string) {
    update((current) => ({
      ...current,
      answers: { ...current.answers, [key]: value },
    }));
  }

  return { state, update, chooseMode, move, answer };
}
