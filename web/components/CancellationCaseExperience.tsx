"use client";

import case07 from "../src/case-07-data.json";
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

const caseId = "fs-c07";
const choices = [
  "option.signalOnly",
  "option.forcedStop",
  "option.rollback",
] as const;
const anchors: Record<string, Anchor> = {
  review: "fs-c07.precheck-then-block",
  "precheck-passes": "fs-c07.precheck-then-block",
  "process-completes": "fs-c07.precheck-then-block",
  "send-starts": "fs-c07.blocking-send-without-cancel",
  "no-receiver": "fs-c07.blocking-send-without-cancel",
  "send-blocks": "fs-c07.blocking-send-without-cancel",
  "cancel-requested": "fs-c07.blocking-send-without-cancel",
  "signal-question": "fs-c07.blocking-send-without-cancel",
  "still-blocked": "fs-c07.blocking-send-without-cancel",
  property: "fs-c07.blocking-send-without-cancel",
  "aware-wait": "fs-c07.blocking-send-with-cancel",
  replay: "fs-c07.blocking-send-with-cancel",
  "cancel-releases": "fs-c07.blocking-send-with-cancel",
  "receiver-ready": "fs-c07.blocking-send-with-cancel",
  "bounded-local": "fs-c07.precheck-then-block",
  "cpu-bound": "fs-c07.long-work-check-cancel",
  downstream: "fs-c07.downstream-without-cancellation",
  "no-rollback": "fs-c07.blocking-send-with-cancel",
  remaining: "fs-c07.blocking-send-with-cancel",
  transfer: "fs-c07.blocking-send-with-cancel",
  recap: "fs-c07.blocking-send-with-cancel",
};

function visualState(index: number): string {
  if (index < 2) return "precheck";
  if (index < 3) return "processed";
  if (index < 4) return "send-started";
  if (index < 5) return "no-receiver";
  if (index < 6) return "blocked";
  if (index < 8) return "cancel-signalled";
  if (index < 10) return "still-blocked";
  if (index < 12) return "cancellable-wait";
  if (index < 13) return "released";
  if (index < 14) return "delivered";
  if (index < 15) return "bounded-work";
  if (index < 16) return "cpu-running";
  if (index < 17) return "downstream-running";
  if (index < 18) return "completed-effect";
  if (index === 19) return "blocked";
  return "released";
}

function CancellationPropagationVisual({
  index,
  c,
}: {
  index: number;
  c: (key: string) => string;
}) {
  const state = visualState(index);
  const work =
    index < 2
      ? "workPrecheck"
      : index < 3 || index === 14
        ? "workProcessed"
        : index < 10 || index === 19
          ? "workWaiting"
          : "workAware";
  const cancel =
    index === 17
      ? "cancelLate"
      : (index >= 6 && index < 13) || index === 18 || index === 20
        ? "cancelActive"
        : "cancelPending";
  const intersection =
    index === 14
      ? "boundedBoundary"
      : index === 15
        ? "cpuBoundary"
        : index === 16
          ? "downstreamBoundary"
          : index < 10 || index === 19
            ? "weakBoundary"
            : "strongBoundary";
  const producer =
    index < 4
      ? "producerActive"
      : index < 6 || index === 10 || index === 11 || index === 19
        ? "producerBlocked"
        : index < 10
          ? "producerTrapped"
          : index === 12 || index === 18 || index === 20
            ? "producerReleased"
            : index === 13 || index === 17
              ? "producerDelivered"
              : index === 15
                ? "producerCpu"
                : index === 16
                  ? "producerDownstream"
                  : "producerActive";
  return (
    <figure
      className="case-visual cancel-path-visual"
      aria-label={c("visual.title")}
      data-state={state}
    >
      <figcaption>{c("visual.title")}</figcaption>
      <div className="cancel-flow-row">
        <strong>{c("visual.work")}</strong>
        <span>{c(`visual.${work}`)}</span>
      </div>
      <div className="cancel-flow-row">
        <strong>{c("visual.cancel")}</strong>
        <span>{c(`visual.${cancel}`)}</span>
      </div>
      <div className="cancel-flow-row cancel-intersection">
        <strong>{c("visual.intersection")}</strong>
        <span>{c(`visual.${intersection}`)}</span>
      </div>
      <div className="cancel-flow-row cancel-producer">
        <strong>{c("visual.producer")}</strong>
        <span>{c(`visual.${producer}`)}</span>
      </div>
    </figure>
  );
}

export function CancellationCaseExperience() {
  const { locale } = useLocale();
  const c = (key: string) => extraCaseCopy(caseId, locale, key);
  const steps = case07.steps;
  const { state, chooseMode, move, answer } = useCaseProgress(caseId, steps);
  const index = Math.max(0, steps.indexOf(state.step));
  const anchor = anchors[state.step];
  const evidence = c(
    index < 4
      ? "rail.evidencePrecheck"
      : index < 6
        ? "rail.evidenceBlocked"
        : index < 10
          ? "rail.evidenceCancel"
          : index < 13
            ? "rail.evidenceRepair"
            : "rail.evidenceControl",
  );
  const contract = c(
    index < 10
      ? "rail.contractWeak"
      : index >= 15 && index <= 18
        ? "rail.contractScope"
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
            <CancellationPropagationVisual index={index} c={c} />
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
            property={c(index < 9 ? "rail.propertyHidden" : "rail.property")}
          />
        </div>
      )}
      {state.mode === "challenge" && (
        <section className="challenge-panel">
          <p className="eyebrow">{c("challenge.eyebrow")}</p>
          <h2>{c("challenge.title")}</h2>
          <p>{c("challenge.intro")}</p>
          <CodeBlock
            anchor="fs-c07.blocking-send-without-cancel"
            label={c("anchor.blocking-send-without-cancel")}
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
