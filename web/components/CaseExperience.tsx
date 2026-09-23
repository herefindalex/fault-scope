"use client";

import { useEffect, useState } from "react";
import {
  caseReducer,
  initialCaseState,
  questionOptions,
  steps,
  type CaseAction,
  type CaseState,
  type Step,
} from "../src/case";
import { caseCopy, ui, type CaseMessageKey } from "../i18n/catalog";
import { formatNumber } from "../i18n/locale";
import { CodeBlock } from "./CodeBlock";
import { useLocale } from "./LocaleProvider";

export const caseProgressKey = "faultscope.v1.caseProgress.fs-c01";

export function parseCaseProgress(raw: string | null): CaseState | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const value = data as Record<string, unknown>;
    if (!steps.includes(value.step as Step)) return null;
    if (
      value.mode !== "guided" &&
      value.mode !== "challenge" &&
      value.mode !== "deep-dive"
    )
      return null;
    if (
      !value.answers ||
      typeof value.answers !== "object" ||
      Array.isArray(value.answers)
    )
      return null;
    const answers = value.answers as Record<string, unknown>;
    if (!Object.values(answers).every((answer) => typeof answer === "string"))
      return null;
    return {
      mode: value.mode,
      step: value.step as Step,
      answers: answers as Record<string, string>,
    };
  } catch {
    return null;
  }
}

function Answer({
  state,
  answerKey,
  options,
  onAnswer,
}: {
  state: CaseState;
  answerKey: string;
  options: readonly string[];
  onAnswer: (value: string) => void;
}) {
  const { locale } = useLocale();
  return (
    <div
      className="choice-list"
      role="group"
      aria-label={ui(locale, "answer.choose")}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={state.answers[answerKey] === option}
          onClick={() => onAnswer(option)}
        >
          {caseCopy(locale, option as CaseMessageKey)}{" "}
          <span aria-hidden="true">↗</span>
        </button>
      ))}
    </div>
  );
}

function ReasoningRail({ step }: { step: Step }) {
  const { locale } = useLocale();
  const index = steps.indexOf(step);
  const c = (key: CaseMessageKey) => caseCopy(locale, key);
  return (
    <aside className="reasoning-rail" aria-label={ui(locale, "reasoning.rail")}>
      <p className="eyebrow">{ui(locale, "reasoning.rail")}</p>
      <div>
        <span className="rail-label">
          01 / {ui(locale, "reasoning.evidence")}
        </span>
        <p>{index >= 1 ? c("observation") : ui(locale, "reasoning.inspect")}</p>
      </div>
      <div>
        <span className="rail-label">
          02 / {ui(locale, "reasoning.contract")}
        </span>
        <p>
          {index >= 5
            ? c("strongContract")
            : index >= 4
              ? c("weakContract")
              : ui(locale, "reasoning.notEstablished")}
        </p>
      </div>
      <div>
        <span className="rail-label">
          03 / {ui(locale, "reasoning.property")}
        </span>
        <p>{index >= 3 ? c("property") : ui(locale, "reasoning.reveal")}</p>
      </div>
    </aside>
  );
}

function PossibleWorlds() {
  const { locale } = useLocale();
  const c = (key: CaseMessageKey) => caseCopy(locale, key);
  return (
    <div className="worlds" role="group" aria-label={c("worlds.aria")}>
      <div className="world-observation">
        <span>{c("worlds.observes")}</span>
        <strong>{c("worlds.noResponse")}</strong>
        <small>{c("worlds.both")}</small>
      </div>
      <div className="world-split" aria-hidden="true">
        ↓ {c("worlds.compatible")} ↓
      </div>
      <div className="world-cards">
        <div>
          <span className="world-tag">{c("worlds.a")}</span>
          <strong>{c("worlds.aTitle")}</strong>
          <p>{c("worlds.aDescription")}</p>
        </div>
        <div>
          <span className="world-tag">{c("worlds.b")}</span>
          <strong>{c("worlds.bTitle")}</strong>
          <p>{c("worlds.bDescription")}</p>
        </div>
      </div>
    </div>
  );
}

function Timeline({ aria, rows }: { aria: string; rows: [string, string][] }) {
  return (
    <div className="timeline" aria-label={aria}>
      {rows.map(([label, text]) => (
        <div key={label}>
          <span>{label}</span>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}

function GuidedStep({
  state,
  answer,
}: {
  state: CaseState;
  answer: (key: string, value: string) => void;
}) {
  const { locale } = useLocale();
  const c = (key: CaseMessageKey) => caseCopy(locale, key);
  const choice = (key: keyof typeof questionOptions) => (
    <Answer
      state={state}
      answerKey={key}
      options={questionOptions[key]}
      onAnswer={(value) => answer(key, value)}
    />
  );
  switch (state.step) {
    case "review":
      return (
        <>
          <p className="step-lead">{c("step.review.lead")}</p>
          <CodeBlock anchor="fs-c01.retry-independent-attempt" />
          <h3>{c("step.review.question")}</h3>
          {choice("review")}
          {state.answers.review && (
            <p className="feedback">{c("step.review.feedback")}</p>
          )}
        </>
      );
    case "evidence":
      return (
        <>
          <p className="step-lead">{c("step.evidence.lead")}</p>
          <h3>{c("step.evidence.question")}</h3>
          {choice("evidence")}
          {state.answers.evidence && (
            <p className="feedback" role="status">
              {c("step.evidence.feedback")}
            </p>
          )}
        </>
      );
    case "worlds":
      return (
        <>
          <p className="step-lead">{c("step.worlds.lead")}</p>
          <PossibleWorlds />
          <p className="insight">{c("step.worlds.insight")}</p>
        </>
      );
    case "property":
      return (
        <>
          <p className="step-lead">{c("step.property.lead")}</p>
          <div className="property-card">
            <span>{c("step.property.label")}</span>
            <strong>{c("property")}</strong>
          </div>
          <p>{c("step.property.explanation")}</p>
          <CodeBlock anchor="fs-c01.keep-unresolved" />
        </>
      );
    case "weak-contract":
      return (
        <>
          <p className="contract-pill">{c("step.weak-contract.label")}</p>
          <p className="step-lead">{c("step.weak-contract.lead")}</p>
          <Timeline
            aria={c("step.weak-contract.aria")}
            rows={[
              ["A1", c("step.weak-contract.a1")],
              ["↯", c("step.weak-contract.timeout")],
              ["A2", c("step.weak-contract.a2")],
            ]}
          />
          <p className="feedback">{c("step.weak-contract.feedback")}</p>
          <div className="tradeoff">
            <p>
              <strong>{c("step.weak-contract.safety")}</strong>
              <br />
              {c("step.weak-contract.safetyText")}
            </p>
            <p>
              <strong>{c("step.weak-contract.liveness")}</strong>
              <br />
              {c("step.weak-contract.livenessText")}
            </p>
          </div>
        </>
      );
    case "strong-contract":
      return (
        <>
          <p className="contract-pill strong">
            {c("step.strong-contract.label")}
          </p>
          <p className="step-lead">{c("step.strong-contract.lead")}</p>
          <p>{c("step.strong-contract.explanation")}</p>
          <CodeBlock anchor="fs-c01.retry-same-logical-operation" />
          <p className="insight">{c("step.strong-contract.insight")}</p>
        </>
      );
    case "scope-challenge":
      return (
        <>
          <p className="step-lead">{c("step.scope-challenge.lead")}</p>
          <CodeBlock anchor="fs-c01.retry-with-new-logical-operation" />
          <h3>{c("step.scope-challenge.question")}</h3>
          {choice("scope")}
          {state.answers.scope && (
            <p className="feedback" role="status">
              {c("step.scope-challenge.feedback")}
            </p>
          )}
        </>
      );
    case "positive-control":
      return (
        <>
          <p className="step-lead">{c("step.positive-control.lead")}</p>
          <Timeline
            aria={c("step.positive-control.aria")}
            rows={[
              ["A1(P)", c("step.positive-control.a1")],
              ["A2(P)", c("step.positive-control.a2")],
              [
                c("step.positive-control.resultLabel"),
                c("step.positive-control.result"),
              ],
            ]}
          />
          <p className="insight">{c("step.positive-control.insight")}</p>
        </>
      );
    case "negative-control":
      return (
        <>
          <p className="step-lead">{c("step.negative-control.lead")}</p>
          <div className="property-card">
            <span>{c("step.negative-control.label")}</span>
            <strong dir="ltr">SetDesiredState(resourceID, RUNNING)</strong>
          </div>
          <p>{c("step.negative-control.explanation")}</p>
        </>
      );
    case "transfer":
      return (
        <>
          <p className="step-lead">{c("step.transfer.lead")}</p>
          <h3>{c("step.transfer.question")}</h3>
          {choice("transfer")}
          {state.answers.transfer && (
            <p className="feedback" role="status">
              {c("step.transfer.feedback")}
            </p>
          )}
        </>
      );
    case "remaining":
      return (
        <>
          <p className="step-lead">{c("step.remaining.lead")}</p>
          <ul className="remaining-list">
            {(
              ["lost", "reuse", "retention", "concurrent", "reconcile"] as const
            ).map((key) => (
              <li key={key}>
                <strong>{c(`remaining.${key}.title`)}</strong>
                <span>{c(`remaining.${key}.text`)}</span>
              </li>
            ))}
          </ul>
        </>
      );
    case "recap":
      return (
        <>
          <p className="step-lead">{c("step.recap.lead")}</p>
          <ol className="recap-list">
            {([1, 2, 3, 4, 5, 6] as const).map((number) => (
              <li key={number}>{c(`recap.${number}`)}</li>
            ))}
          </ol>
          <p className="insight">{c("step.recap.insight")}</p>
        </>
      );
  }
  const exhaustive: never = state.step;
  return exhaustive;
}

export function CaseExperience({ deepDive }: { deepDive?: React.ReactNode }) {
  const { locale } = useLocale();
  const [state, setState] = useState<CaseState>(initialCaseState);
  useEffect(() => {
    const restored =
      parseCaseProgress(window.localStorage.getItem(caseProgressKey)) ??
      initialCaseState;
    const mode = new URLSearchParams(window.location.search).get("mode");
    setState(
      mode === "guided" || mode === "challenge" || mode === "deep-dive"
        ? { ...restored, mode }
        : restored,
    );
  }, []);
  function dispatch(action: CaseAction) {
    setState((current) => {
      const next = caseReducer(current, action);
      window.localStorage.setItem(caseProgressKey, JSON.stringify(next));
      return next;
    });
  }
  function chooseMode(mode: CaseState["mode"]) {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    window.history.replaceState(null, "", url);
    dispatch({ type: "mode", mode });
  }
  const c = (key: CaseMessageKey) => caseCopy(locale, key);
  const index = steps.indexOf(state.step);
  return (
    <main className="case-page page-wrap">
      <div className="case-topline">
        <span>{ui(locale, "nav.cases")} / FS-C01</span>
        <span>{c("topline")}</span>
      </div>
      <div className="case-intro">
        <p className="eyebrow">{c("eyebrow")}</p>
        <h1>{c("title")}</h1>
        <p>{c("subtitle")}</p>
      </div>
      <div
        className="mode-tabs"
        role="group"
        aria-label={ui(locale, "case.learningMode")}
      >
        {(["guided", "challenge", "deep-dive"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={state.mode === mode}
            onClick={() => chooseMode(mode)}
          >
            {ui(
              locale,
              mode === "deep-dive"
                ? "case.deepDive"
                : mode === "guided"
                  ? "case.guided"
                  : "case.challenge",
            )}
          </button>
        ))}
      </div>
      {state.mode === "guided" && (
        <div className="case-layout">
          <section className="lesson-panel" aria-live="polite">
            <div className="step-status">
              <span>
                {ui(locale, "case.step", {
                  current: formatNumber(locale, index + 1),
                  total: formatNumber(locale, steps.length),
                })}
              </span>
              <div className="progress-track">
                <span
                  style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <h2>{c(`step.${state.step}.title`)}</h2>
            <GuidedStep
              state={state}
              answer={(key, value) => dispatch({ type: "answer", key, value })}
            />
            <div className="step-nav">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => dispatch({ type: "previous" })}
              >
                <span aria-hidden="true">←</span>{" "}
                {ui(locale, "action.previous")}
              </button>
              <button
                type="button"
                onClick={() =>
                  index === steps.length - 1
                    ? chooseMode("challenge")
                    : dispatch({ type: "next" })
                }
              >
                {ui(locale, "action.next")} <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
          <ReasoningRail step={state.step} />
        </div>
      )}
      {state.mode === "challenge" && (
        <section className="challenge-panel">
          <p className="eyebrow">{c("challenge.eyebrow")}</p>
          <h2>{c("challenge.title")}</h2>
          <p>
            {c("challenge.intro")} {c("observation")} {c("property")}{" "}
            {c("weakContract")}
          </p>
          <CodeBlock anchor="fs-c01.retry-independent-attempt" />
          <h3>{c("challenge.question")}</h3>
          <Answer
            state={state}
            answerKey="challenge"
            options={questionOptions.challenge}
            onAnswer={(value) =>
              dispatch({ type: "answer", key: "challenge", value })
            }
          />
          {state.answers.challenge && (
            <p className="feedback" role="status">
              {c("challenge.feedback")}
            </p>
          )}
        </section>
      )}
      {state.mode === "deep-dive" && (
        <article className="deep-dive">
          <p className="eyebrow">{c("deepDive.eyebrow")}</p>
          <h2>{c("deepDive.title")}</h2>
          {deepDive ??
            ([1, 2, 3] as const).map((number) => (
              <section key={number}>
                <h3>{c(`deepDive.section${number}.title`)}</h3>
                <p>{c(`deepDive.section${number}.body`)}</p>
              </section>
            ))}
        </article>
      )}
    </main>
  );
}
