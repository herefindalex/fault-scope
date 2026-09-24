"use client";

import case06 from "../src/case-06-data.json";
import { ui } from "../i18n/catalog";
import { extraCaseCopy } from "../i18n/extra-cases";
import type { Anchor } from "../src/snippets";
import {
  CaseShell,
  ReasoningRail,
  StepNavigation,
  StepStatus,
} from "./CaseShell";
import { CodeBlock } from "./CodeBlock";
import { useLocale } from "./LocaleProvider";
import { useCaseProgress } from "./useCaseProgress";

const caseId = "fs-c06";
const choices = ["option.reject", "option.httpOk", "option.sleep"] as const;
const anchors: Record<string, Anchor> = {
  "write-success": "fs-c06.read-current-projection",
  "revision-token": "fs-c06.read-current-projection",
  "http-200": "fs-c06.read-current-projection",
  "projection-behind": "fs-c06.read-current-projection",
  "transport-question": "fs-c06.read-current-projection",
  "freshness-question": "fs-c06.read-current-projection",
  separate: "fs-c06.read-current-projection",
  property: "fs-c06.read-current-projection",
  sleep: "fs-c06.sleep-before-read",
  "value-poll": "fs-c06.sleep-before-read",
  "minimum-revision": "fs-c06.read-at-least-revision",
  "reject-43": "fs-c06.reject-insufficient-revision",
  "catch-up": "fs-c06.serve-fresh-enough-projection",
  "positive-44": "fs-c06.serve-fresh-enough-projection",
  "positive-45": "fs-c06.serve-fresh-enough-projection",
  "eventual-control": "fs-c06.read-current-projection",
  "lost-token": "fs-c06.read-at-least-revision",
  cache: "fs-c06.read-at-least-revision",
  remaining: "fs-c06.serve-fresh-enough-projection",
  transfer: "fs-c06.read-at-least-revision",
  recap: "fs-c06.read-at-least-revision",
};

function visualState(index: number) {
  if (index < 2) return "write-committed";
  if (index < 3) return "transport-success";
  if (index < 5) return "projection-behind";
  if (index < 11) return "revision-gap";
  if (index < 12) return "not-fresh-enough";
  if (index < 13) return "caught-up-44";
  if (index < 14) return "satisfied-44";
  if (index < 15) return "satisfied-45";
  if (index < 16) return "eventual-43";
  if (index < 17) return "lost-token";
  if (index < 18) return "cache-gap";
  return "lower-bound";
}

function RevisionGapVisual({
  index,
  c,
}: {
  index: number;
  c: (key: string) => string;
}) {
  const state = visualState(index);
  const projection =
    index < 3
      ? "projectionPending"
      : index === 14
        ? "projection45"
        : index === 12 || index === 13 || index >= 18
          ? "projection44"
          : "projection43";
  const required =
    index < 5 || index === 16
      ? "requiredPending"
      : index === 15
        ? "requiredNone"
        : "required44";
  const verdict =
    index < 2
      ? "verdictPending"
      : index < 5
        ? "transportOk"
        : index < 12
          ? "notFresh"
          : index < 14
            ? "fresh44"
            : index === 14
              ? "fresh45"
              : index === 15
                ? "eventualOk"
                : index === 16
                  ? "noToken"
                  : index === 17
                    ? "cacheGap"
                    : "lowerBound";
  return (
    <figure
      className="case-visual revision-gap-visual"
      aria-label={c("visual.title")}
      data-state={state}
    >
      <figcaption>{c("visual.title")}</figcaption>
      <div className="revision-gap-row">
        <strong>{c("visual.authority")}</strong>
        <span>
          {c(index === 18 ? "visual.authority45" : "visual.authority44")}
        </span>
      </div>
      <div className="revision-gap-row">
        <strong>{c("visual.projection")}</strong>
        <span>{c(`visual.${projection}`)}</span>
      </div>
      <div className="revision-gap-row">
        <strong>{c("visual.required")}</strong>
        <span>{c(`visual.${required}`)}</span>
      </div>
      <div className="revision-gap-row revision-gap-verdict">
        <strong>{c("visual.verdict")}</strong>
        <span>{c(`visual.${verdict}`)}</span>
      </div>
    </figure>
  );
}

export function FreshnessCaseExperience() {
  const { locale } = useLocale();
  const c = (key: string) => extraCaseCopy(caseId, locale, key);
  const steps = case06.steps;
  const { state, chooseMode, move, answer } = useCaseProgress(caseId, steps);
  const index = Math.max(0, steps.indexOf(state.step));
  const anchor = anchors[state.step];
  const evidence = c(
    index < 3
      ? "rail.evidenceWrite"
      : index < 10
        ? "rail.evidenceGap"
        : index < 13
          ? "rail.evidenceStrong"
          : "rail.evidenceControl",
  );
  const contract = c(
    index === 15
      ? "rail.contractEventual"
      : index < 10
        ? "rail.contractWeak"
        : "rail.contractStrong",
  );
  return (
    <CaseShell
      caseId={caseId}
      topline={ui(locale, "codeLens.label")}
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
            <p className="lesson-lead">{c(`step.${state.step}.lead`)}</p>
            <RevisionGapVisual index={index} c={c} />
            <CodeBlock
              anchor={anchor}
              label={c(`anchor.${anchor.split(".")[1]}`)}
            />
            {state.step === "recap" && (
              <ol className="case-recap">
                {[1, 2, 3, 4, 5, 6].map((number) => (
                  <li key={number}>{c(`recap.${number}`)}</li>
                ))}
              </ol>
            )}
            <StepNavigation
              index={index}
              total={steps.length}
              onPrevious={() => move(-1)}
              onNext={() =>
                index === steps.length - 1 ? chooseMode("challenge") : move(1)
              }
            />
          </section>
          <ReasoningRail
            evidence={evidence}
            contract={contract}
            property={c(index < 7 ? "rail.propertyHidden" : "rail.property")}
          />
        </div>
      )}
      {state.mode === "challenge" && (
        <section className="challenge-panel">
          <p className="eyebrow">{c("challenge.eyebrow")}</p>
          <h2>{c("challenge.title")}</h2>
          <p>{c("challenge.intro")}</p>
          <CodeBlock
            anchor="fs-c06.read-at-least-revision"
            label={c("anchor.read-at-least-revision")}
          />
          <h3>{c("challenge.question")}</h3>
          <div className="answer-row">
            {choices.map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={state.answers.challenge === choice}
                onClick={() => answer("challenge", choice)}
              >
                {c(choice)}
              </button>
            ))}
          </div>
          {state.answers.challenge && (
            <p className="answer-note">{c("challenge.feedback")}</p>
          )}
        </section>
      )}
      {state.mode === "deep-dive" && (
        <article className="deep-dive">
          <p className="eyebrow">{c("deepDive.eyebrow")}</p>
          <h2>{c("deepDive.title")}</h2>
          {[1, 2, 3, 4, 5].map((number) => (
            <section key={number}>
              <h3>{c(`deepDive.section${number}.title`)}</h3>
              <p>{c(`deepDive.section${number}.body`)}</p>
            </section>
          ))}
          <p className="insight">{c("takeaway")}</p>
        </article>
      )}
    </CaseShell>
  );
}
