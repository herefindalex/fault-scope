"use client";

import case02 from "../src/case-02-data.json";
import case03 from "../src/case-03-data.json";
import { extraCaseCopy, type ExtraCaseId } from "../i18n/extra-cases";
import { ui } from "../i18n/catalog";
import type { Anchor } from "../src/snippets";
import {
  CaseShell,
  ReasoningRail,
  StepNavigation,
  StepStatus,
} from "./CaseShell";
import { CodeBlock } from "./CodeBlock";
import { useLocale } from "./LocaleProvider";
import { caseProgressKey, useCaseProgress } from "./useCaseProgress";

const cases = { "fs-c02": case02, "fs-c03": case03 };
const choiceIds = ["option.yes", "option.no", "option.needMore"] as const;

export function laterCaseProgressKey(caseId: ExtraCaseId): string {
  return caseProgressKey(caseId);
}

function stepAnchor(caseId: ExtraCaseId, index: number): Anchor {
  if (caseId === "fs-c02") {
    if (index >= 12) return "fs-c02.local-authority-check";
    if (index >= 11) return "fs-c02.current-generation-commit";
    if (index >= 9) return "fs-c02.commit-with-generation";
    return "fs-c02.commit-without-generation";
  }
  if (index >= 13) return "fs-c03.mark-publication-complete";
  if (index >= 10) return "fs-c03.relay-publish";
  if (index >= 7) return "fs-c03.durable-publication-intent";
  if (index === 1) return "fs-c03.business-state-commit";
  return "fs-c03.split-dual-write";
}

function AuthorityTimeline({
  index,
  c,
}: {
  index: number;
  c: (key: string) => string;
}) {
  const a =
    index >= 10
      ? c("visual.aRejected")
      : index >= 7
        ? c("visual.aAccepted")
        : index >= 2
          ? c("visual.aPaused")
          : c("visual.aActive");
  const b =
    index >= 11
      ? c("visual.bAccepted")
      : index >= 3
        ? c("visual.bPending")
        : "—";
  return (
    <figure
      className="case-visual authority-timeline"
      aria-label={c("visual.title")}
    >
      <figcaption>{c("visual.title")}</figcaption>
      <div className="visual-track">
        <strong>{c("visual.workerA")}</strong>
        <span>{a}</span>
      </div>
      <div className="visual-track">
        <strong>{c("visual.workerB")}</strong>
        <span>{b}</span>
      </div>
      <div className="visual-track visual-authority">
        <strong>{c("visual.store")}</strong>
        <span>{index >= 3 ? "8" : "7"}</span>
      </div>
      <div className="visual-track">
        <strong>{c("visual.state")}</strong>
        <span>{c("visual.running")}</span>
      </div>
      {index >= 3 && index <= 10 && <p>{c("visual.bCurrent")}</p>}
      {index >= 12 && <p>{c("visual.external")}</p>}
    </figure>
  );
}

function DurabilityDomains({
  index,
  c,
}: {
  index: number;
  c: (key: string) => string;
}) {
  const initial = index === 0;
  const rollback = index === 9;
  const hasIntent = index >= 7 && !rollback;
  const brokerAccepted = index >= 10 && !rollback;
  return (
    <figure
      className="case-visual durability-domains"
      aria-label={c("visual.title")}
    >
      <figcaption>{c("visual.title")}</figcaption>
      <div className="durability-domain">
        <strong>{c("visual.database")}</strong>
        <span>
          {initial || rollback
            ? c("visual.orderNotConfirmed")
            : c("visual.order")}
        </span>
        {hasIntent && <span>{c("visual.eventPending")}</span>}
      </div>
      <p className="domain-boundary">
        {hasIntent ? c("visual.shared") : c("visual.crashGap")}
      </p>
      <div className="durability-domain">
        <strong>{c("visual.broker")}</strong>
        <span>
          {brokerAccepted ? c("visual.eventAccepted") : c("visual.eventAbsent")}
        </span>
        {index >= 12 && <span>{c("visual.duplicate")}</span>}
      </div>
      {rollback && <p>{c("visual.rollback")}</p>}
      {index >= 11 && <p>{c("visual.relayCrash")}</p>}
      {hasIntent && <p>{c("visual.separate")}</p>}
    </figure>
  );
}

export function LaterCaseExperience({ caseId }: { caseId: ExtraCaseId }) {
  const { locale } = useLocale();
  const definition = cases[caseId];
  const steps = definition.steps;
  const c = (key: string) => extraCaseCopy(caseId, locale, key);
  const { state, chooseMode, move, answer } = useCaseProgress(caseId, steps);
  const index = Math.max(0, steps.indexOf(state.step));
  const railPhase =
    caseId === "fs-c02"
      ? index >= 9
        ? "repair"
        : index >= 3
          ? "takeover"
          : "early"
      : index >= 7
        ? "repair"
        : index >= 2
          ? "gap"
          : "early";
  const evidence = c(
    railPhase === "early"
      ? "rail.evidenceEarly"
      : caseId === "fs-c02"
        ? "rail.evidenceTakeover"
        : "rail.evidenceGap",
  );
  const contract = c(
    railPhase === "repair"
      ? "rail.contractStrong"
      : railPhase === "early"
        ? "rail.contractEarly"
        : caseId === "fs-c02"
          ? "rail.contractWeak"
          : "rail.contractEarly",
  );
  const property = c(
    railPhase === "early" ? "rail.propertyHidden" : "rail.property",
  );
  const anchor = stepAnchor(caseId, index);
  const anchorLabel = c(`anchor.${anchor.split(".")[1]}`);
  const challengeAnchor =
    caseId === "fs-c02"
      ? "fs-c02.commit-without-generation"
      : "fs-c03.split-dual-write";

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
            {caseId === "fs-c02" ? (
              <AuthorityTimeline index={index} c={c} />
            ) : (
              <DurabilityDomains index={index} c={c} />
            )}
            <CodeBlock anchor={anchor} label={anchorLabel} />
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
            anchor={challengeAnchor}
            label={c(`anchor.${challengeAnchor.split(".")[1]}`)}
          />
          <h3>{c("challenge.question")}</h3>
          <div className="answer-row">
            {choiceIds.map((choice) => (
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
          {(caseId === "fs-c03" ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]).map(
            (number) => (
              <section key={number}>
                <h3>{c(`deepDive.section${number}.title`)}</h3>
                <p>{c(`deepDive.section${number}.body`)}</p>
              </section>
            ),
          )}
          <p className="insight">{c("takeaway")}</p>
        </article>
      )}
    </CaseShell>
  );
}
