"use client";

import case08 from "../src/case-08-data.json";
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

const caseId = "fs-c08";
const choices = [
  "option.valueOnly",
  "option.recoveredRevision",
  "option.waitForTimer",
] as const;

const stepAnchors: Record<string, Anchor> = {
  "revision-44": "fs-c08.memory-only-revision",
  "durable-value": "fs-c08.memory-only-revision",
  "memory-guard": "fs-c08.memory-only-revision",
  "reject-before": "fs-c08.memory-only-revision",
  crash: "fs-c08.memory-only-revision",
  restart: "fs-c08.memory-only-revision",
  "value-survives": "fs-c08.memory-only-revision",
  "guard-disappears": "fs-c08.memory-only-revision",
  "stale-arrives": "fs-c08.memory-only-revision",
  "weak-accepts": "fs-c08.memory-only-revision",
  property: "fs-c08.memory-only-revision",
  "atomic-record": "fs-c08.persist-state-with-revision",
  "restart-again": "fs-c08.persist-state-with-revision",
  "recover-44": "fs-c08.recover-state-with-revision",
  "reject-after": "fs-c08.reject-stale-after-restart",
  "accept-45": "fs-c08.reject-stale-after-restart",
  "cache-control": "fs-c08.recover-state-with-revision",
  "replay-alternative": "fs-c08.rebuild-before-ready",
  "checkpoint-mismatch": "fs-c08.rebuild-before-ready",
  "schema-compatibility": "fs-c08.recover-state-with-revision",
  remaining: "fs-c08.recover-state-with-revision",
  transfer: "fs-c08.rebuild-before-ready",
  recap: "fs-c08.recover-state-with-revision",
};

const visualStates = [
  "before",
  "before",
  "before",
  "rejected-before",
  "crashed",
  "weak-restart",
  "weak-restart",
  "weak-restart",
  "weak-restart",
  "regressed",
  "regressed",
  "atomic-record",
  "strong-restart",
  "strong-restart",
  "rejected-after",
  "accepted-next",
  "strong-restart",
  "rebuild-before-ready",
  "checkpoint-mismatch",
  "strong-restart",
  "strong-restart",
  "rebuild-before-ready",
  "strong-restart",
] as const;

function RecoveryVisual({
  index,
  c,
}: {
  index: number;
  c: (key: string) => string;
}) {
  const state = visualStates[index];
  const weak = index >= 5 && index <= 10;
  const regressed = index === 9 || index === 10;
  const strong = index >= 11;
  const afterPhase =
    index === 4
      ? "crashed"
      : weak
        ? "weakRestart"
        : strong
          ? "strongRestart"
          : "before";
  const afterState = regressed
    ? "processing"
    : index === 15
      ? "delivered"
      : index === 11 || index === 12
        ? "atomic"
        : "shipped";
  const afterGuard =
    weak || index === 4
      ? "guardEmpty"
      : index === 15
        ? "guard45"
        : strong
          ? "guardDurable"
          : "guard44";
  const event = [3, 8, 9, 10, 14].includes(index)
    ? "event42"
    : index === 15
      ? "event45"
      : "eventNone";
  const decision =
    index === 3
      ? "decisionReject"
      : index === 4
        ? "decisionLost"
        : regressed
          ? "decisionAcceptWrong"
          : index === 13
            ? "decisionRecover"
            : index === 14
              ? "decisionReject"
              : index === 15
                ? "decisionAcceptNext"
                : index === 17 || index === 21
                  ? "decisionRebuild"
                  : index === 18
                    ? "decisionMismatch"
                    : "decisionWaiting";

  return (
    <figure
      className="case-visual recovery-visual"
      data-state={state}
      aria-label={c("visual.title")}
    >
      <figcaption>{c("visual.title")}</figcaption>
      <div className="recovery-visual-grid">
        <div className="recovery-visual-card">
          <strong>{c("visual.before")}</strong>
          <dl>
            <dt>{c("visual.durable")}</dt>
            <dd>{c("visual.shipped")}</dd>
            <dt>{c("visual.guard")}</dt>
            <dd>{c("visual.guard44")}</dd>
          </dl>
        </div>
        <div className="recovery-visual-card recovery-after">
          <strong>{c(`visual.${afterPhase}`)}</strong>
          <dl>
            <dt>{c("visual.durable")}</dt>
            <dd>{c(`visual.${afterState}`)}</dd>
            <dt>{c("visual.guard")}</dt>
            <dd>{c(`visual.${afterGuard}`)}</dd>
          </dl>
        </div>
      </div>
      <div className="recovery-visual-result">
        <span>
          <strong>{c("visual.event")}</strong> {c(`visual.${event}`)}
        </span>
        <span>
          <strong>{c("visual.decision")}</strong> {c(`visual.${decision}`)}
        </span>
      </div>
    </figure>
  );
}

export function RecoveryCaseExperience() {
  const { locale } = useLocale();
  const c = (key: string) => extraCaseCopy(caseId, locale, key);
  const steps = case08.steps;
  const { state, chooseMode, move, answer } = useCaseProgress(caseId, steps);
  const index = Math.max(0, steps.indexOf(state.step));
  const anchor = stepAnchors[state.step];
  const evidence = c(
    index < 4
      ? "rail.evidenceBefore"
      : index < 9
        ? "rail.evidenceLost"
        : index < 11
          ? "rail.evidenceRegression"
          : index < 14
            ? "rail.evidenceRecovered"
            : "rail.evidenceControl",
  );
  const contract = c(
    index < 11
      ? "rail.contractWeak"
      : index === 16 || index === 17
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
            <RecoveryVisual index={index} c={c} />
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
            property={c(index < 10 ? "rail.propertyHidden" : "rail.property")}
          />
        </div>
      )}
      {state.mode === "challenge" && (
        <section className="challenge-panel">
          <p className="eyebrow">{c("challenge.eyebrow")}</p>
          <h2>{c("challenge.title")}</h2>
          <p>{c("challenge.intro")}</p>
          <CodeBlock
            anchor="fs-c08.memory-only-revision"
            label={c("anchor.memory-only-revision")}
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
