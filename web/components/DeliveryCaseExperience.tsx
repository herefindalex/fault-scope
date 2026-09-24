"use client";

import case04 from "../src/case-04-data.json";
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

const caseId = "fs-c04";
const choices = [
  "option.atomic",
  "option.ackFirst",
  "option.stableId",
] as const;

const anchors: Record<string, Anchor> = {
  review: "fs-c04.effect-then-ack",
  "first-delivery": "fs-c04.effect-then-ack",
  "reward-commit": "fs-c04.effect-then-ack",
  "crash-before-ack": "fs-c04.effect-then-ack",
  "broker-knowledge": "fs-c04.effect-then-ack",
  "redelivery-contract": "fs-c04.effect-then-ack",
  "second-delivery": "fs-c04.effect-then-ack",
  "repeated-effect": "fs-c04.effect-then-ack",
  property: "fs-c04.effect-then-ack",
  "ack-first": "fs-c04.ack-before-effect",
  "event-identity": "fs-c04.apply-event-once",
  "atomic-apply": "fs-c04.apply-event-once",
  "replay-crash": "fs-c04.apply-event-once",
  "redelivery-again": "fs-c04.redelivery-no-repeat",
  "suppress-repeat": "fs-c04.redelivery-no-repeat",
  "first-time-control": "fs-c04.apply-event-once",
  "split-durability": "fs-c04.separate-dedupe-record",
  "repeat-safe-control": "fs-c04.redelivery-no-repeat",
  remaining: "fs-c04.redelivery-no-repeat",
  transfer: "fs-c04.apply-event-once",
  recap: "fs-c04.redelivery-no-repeat",
};

const repeatedSteps = new Set([
  "second-delivery",
  "repeated-effect",
  "property",
  "event-identity",
  "redelivery-again",
  "suppress-repeat",
  "split-durability",
  "remaining",
  "transfer",
  "recap",
]);
const repairedSteps = new Set([
  "atomic-apply",
  "replay-crash",
  "redelivery-again",
  "suppress-repeat",
  "first-time-control",
  "split-durability",
  "remaining",
  "transfer",
  "recap",
]);

function EffectAcknowledgementTimeline({
  step,
  c,
}: {
  step: string;
  c: (key: string) => string;
}) {
  const redelivered = repeatedSteps.has(step);
  const repaired = repairedSteps.has(step);
  const weakRepeat = [
    "repeated-effect",
    "property",
    "event-identity",
    "split-durability",
  ].includes(step);
  const committed =
    repaired ||
    [
      "reward-commit",
      "crash-before-ack",
      "broker-knowledge",
      "redelivery-contract",
      "second-delivery",
      "repeated-effect",
      "property",
      "event-identity",
    ].includes(step);
  const note =
    step === "ack-first"
      ? "visual.ackFirstRisk"
      : step === "atomic-apply"
        ? "visual.atomicBoundary"
        : step === "split-durability"
          ? "visual.splitRisk"
          : null;
  return (
    <figure
      className="case-visual delivery-timeline"
      aria-label={c("visual.title")}
    >
      <figcaption>{c("visual.title")}</figcaption>
      <div className="delivery-timeline-row">
        <strong>{c("visual.event")}</strong>
        <span>E</span>
      </div>
      <div className="delivery-timeline-row">
        <strong>{c("visual.delivery")}</strong>
        <span>
          {step === "review"
            ? c("visual.waiting")
            : redelivered
              ? `${c("visual.d1")} → ${c("visual.d2")}`
              : c("visual.d1")}
        </span>
      </div>
      <div className="delivery-timeline-row delivery-effect">
        <strong>{c("visual.effect")}</strong>
        <span>
          {weakRepeat
            ? c("visual.twice")
            : repaired && redelivered
              ? c("visual.suppressed")
              : committed
                ? c("visual.once")
                : c("visual.noEffect")}
        </span>
      </div>
      <div className="delivery-timeline-row">
        <strong>{c("visual.ack")}</strong>
        <span>
          {step === "ack-first"
            ? c("visual.ackFirstRisk")
            : step === "split-durability"
              ? c("visual.ackGap")
              : repaired && redelivered
                ? c("visual.canAck")
                : committed
                  ? c("visual.ackGap")
                  : c("visual.notAccepted")}
        </span>
      </div>
      {note && <p className="delivery-timeline-note">{c(note)}</p>}
    </figure>
  );
}

export function DeliveryCaseExperience() {
  const { locale } = useLocale();
  const c = (key: string) => extraCaseCopy(caseId, locale, key);
  const steps = case04.steps;
  const { state, chooseMode, move, answer } = useCaseProgress(caseId, steps);
  const index = Math.max(0, steps.indexOf(state.step));
  const anchor = anchors[state.step];
  const phase =
    index < 3 ? "Early" : index < 7 ? "Gap" : index < 11 ? "Repeat" : "Repair";
  const evidence = c(
    state.step === "ack-first"
      ? "rail.evidenceAckFirst"
      : state.step === "split-durability"
        ? "rail.evidenceSplit"
        : `rail.evidence${phase}`,
  );
  const contract = c(
    state.step === "ack-first"
      ? "rail.contractAckFirst"
      : state.step === "split-durability"
        ? "rail.contractSplit"
        : phase === "Repair"
          ? "rail.contractStrong"
          : phase === "Early"
            ? "rail.contractEarly"
            : "rail.contractGap",
  );
  const property = c(index < 8 ? "rail.propertyHidden" : "rail.property");
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
            {state.step === "repeat-safe-control" ? (
              <figure className="case-visual repeat-safe-control">
                <figcaption>{c("step.repeat-safe-control.title")}</figcaption>
                <pre>
                  {
                    "SetShipmentState(S, READY) → READY\nSetShipmentState(S, READY) → READY"
                  }
                </pre>
              </figure>
            ) : (
              <>
                <EffectAcknowledgementTimeline step={state.step} c={c} />
                <CodeBlock
                  anchor={anchor}
                  label={c(`anchor.${anchor.split(".")[1]}`)}
                />
              </>
            )}
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
            property={property}
          />
        </div>
      )}
      {state.mode === "challenge" && (
        <section className="challenge-panel">
          <p className="eyebrow">{c("challenge.eyebrow")}</p>
          <h2>{c("challenge.title")}</h2>
          <p>{c("challenge.intro")}</p>
          <CodeBlock
            anchor="fs-c04.effect-then-ack"
            label={c("anchor.effect-then-ack")}
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
