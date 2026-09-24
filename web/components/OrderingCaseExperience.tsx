"use client";

import case05 from "../src/case-05-data.json";
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

const caseId = "fs-c05";
const choices = [
  "option.sourceRevision",
  "option.arrival",
  "option.timestamp",
] as const;

const anchors: Record<string, Anchor> = {
  review: "fs-c05.apply-on-arrival",
  "source-order": "fs-c05.apply-on-arrival",
  "arrival-order": "fs-c05.apply-on-arrival",
  "apply-43": "fs-c05.apply-on-arrival",
  "late-42": "fs-c05.apply-on-arrival",
  "arrival-assumption": "fs-c05.apply-on-arrival",
  regression: "fs-c05.apply-on-arrival",
  property: "fs-c05.apply-on-arrival",
  timestamp: "fs-c05.apply-on-arrival",
  "source-contract": "fs-c05.apply-if-newer",
  "apply-43-strong": "fs-c05.apply-if-newer",
  "reject-42": "fs-c05.reject-stale-revision",
  "forward-44": "fs-c05.accept-newer-revision",
  duplicate: "fs-c05.reject-stale-revision",
  "entity-scope": "fs-c05.apply-if-newer",
  remaining: "fs-c05.apply-if-newer",
  transfer: "fs-c05.apply-if-newer",
  recap: "fs-c05.apply-if-newer",
};

function projectionState(index: number): string {
  if (index < 3) return "waiting";
  if (index < 6) return "applied43";
  if (index < 10) return "regressed42";
  if (index === 10) return "applied43";
  if (index === 12) return "advanced44";
  if (index === 13) return "duplicate43";
  if (index === 15) return "lagging43";
  return "rejected42";
}

function SourceArrivalVisual({
  index,
  c,
}: {
  index: number;
  c: (key: string) => string;
}) {
  const projection = projectionState(index);
  const sourceEvents =
    index === 12 || index === 15
      ? `${c("visual.sourceEvents")} → E${index === 12 ? "44" : "50"}`
      : c("visual.sourceEvents");
  const arrivalEvents =
    index === 12
      ? "E43 → E44"
      : index === 13
        ? "E43 → E43"
        : index === 15
          ? "E43"
          : c("visual.arrivalEvents");
  return (
    <figure
      className="case-visual source-arrival-visual"
      aria-label={c("visual.title")}
      data-state={projection}
    >
      <figcaption>{c("visual.title")}</figcaption>
      <div className="order-lane">
        <strong>{c("visual.source")}</strong>
        <span>{index >= 1 ? sourceEvents : c("visual.sourcePending")}</span>
      </div>
      <div className="order-lane">
        <strong>{c("visual.arrival")}</strong>
        <span>{index >= 2 ? arrivalEvents : c("visual.arrivalPending")}</span>
      </div>
      <div className="order-lane order-projection">
        <strong>{c("visual.projection")}</strong>
        <span>
          {c(`visual.${projection === "lagging43" ? "applied43" : projection}`)}
        </span>
      </div>
    </figure>
  );
}

export function OrderingCaseExperience() {
  const { locale } = useLocale();
  const c = (key: string) => extraCaseCopy(caseId, locale, key);
  const steps = case05.steps;
  const { state, chooseMode, move, answer } = useCaseProgress(caseId, steps);
  const index = Math.max(0, steps.indexOf(state.step));
  const anchor = anchors[state.step];
  const evidence = c(
    index < 2
      ? "rail.evidenceEarly"
      : index < 6
        ? "rail.evidenceArrival"
        : index < 10
          ? "rail.evidenceWeak"
          : index < 12
            ? "rail.evidenceStrong"
            : "rail.evidenceControl",
  );
  const contract = c(
    index < 9
      ? "rail.contractWeak"
      : index === 9
        ? "rail.contractSource"
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
            <SourceArrivalVisual index={index} c={c} />
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
            anchor="fs-c05.apply-if-newer"
            label={c("anchor.apply-if-newer")}
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
