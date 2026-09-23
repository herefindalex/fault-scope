"use client";

import {
  caseReducer,
  questionOptions,
  steps,
  type CaseAction,
  type CaseState,
  type Step,
} from "../src/case";
import { caseCopy, ui, type CaseMessageKey } from "../i18n/catalog";
import { CodeBlock } from "./CodeBlock";
import {
  CaseShell,
  StepNavigation,
  StepStatus,
  ReasoningRail as SharedReasoningRail,
} from "./CaseShell";
import {
  caseProgressKey as progressKeyFor,
  parseStoredProgress,
  useCaseProgress,
} from "./useCaseProgress";
import { useLocale } from "./LocaleProvider";

export const caseProgressKey = progressKeyFor("fs-c01");

export function parseCaseProgress(raw: string | null): CaseState | null {
  return parseStoredProgress(raw, steps);
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

function Case01Rail({ step }: { step: Step }) {
  const { locale } = useLocale();
  const index = steps.indexOf(step);
  const c = (key: CaseMessageKey) => caseCopy(locale, key);
  return (
    <SharedReasoningRail
      evidence={index >= 1 ? c("observation") : ui(locale, "reasoning.inspect")}
      contract={
        index >= 5
          ? c("strongContract")
          : index >= 4
            ? c("weakContract")
            : ui(locale, "reasoning.notEstablished")
      }
      property={index >= 3 ? c("property") : ui(locale, "reasoning.reveal")}
    />
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
  const { state, update, chooseMode } = useCaseProgress("fs-c01", steps);
  function dispatch(action: CaseAction) {
    update((current) => caseReducer(current, action));
  }
  const c = (key: CaseMessageKey) => caseCopy(locale, key);
  const index = steps.indexOf(state.step);
  return (
    <CaseShell
      caseId="fs-c01"
      topline={c("topline")}
      eyebrow={c("eyebrow")}
      title={c("title")}
      subtitle={c("subtitle")}
      mode={state.mode}
      onModeChange={chooseMode}
    >
      {state.mode === "guided" && (
        <div className="case-layout">
          <section className="lesson-panel" aria-live="polite">
            <StepStatus index={index} total={steps.length} />
            <h2>{c(`step.${state.step}.title`)}</h2>
            <GuidedStep
              state={state}
              answer={(key, value) => dispatch({ type: "answer", key, value })}
            />
            <StepNavigation
              index={index}
              total={steps.length}
              onPrevious={() => dispatch({ type: "previous" })}
              onNext={() =>
                index === steps.length - 1
                  ? chooseMode("challenge")
                  : dispatch({ type: "next" })
              }
            />
          </section>
          <Case01Rail step={state.step} />
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
    </CaseShell>
  );
}
