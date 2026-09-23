"use client";

import { useEffect, useReducer } from "react";
import DeepDive from "../content/deep-dive.mdx";
import {
  caseFacts,
  caseReducer,
  initialCaseState,
  steps,
  type CaseState,
  type Step,
} from "../src/case";
import { CodeBlock } from "./CodeBlock";

const titles: Record<Step, string> = {
  review: "The code looks reasonable",
  evidence: "What did the caller observe?",
  worlds: "Two possible worlds",
  property: "Name the property",
  "weak-contract": "Test the weak contract",
  "strong-contract": "Change the contract, not the failure",
  "scope-challenge": "The identity boundary",
  "positive-control": "Protection can permit progress",
  "negative-control": "A repeat can be safe",
  transfer: "Try another domain",
  remaining: "What can still fail?",
  recap: "The six questions",
};

function Answer({
  state,
  answerKey,
  options,
  onAnswer,
}: {
  state: CaseState;
  answerKey: string;
  options: string[];
  onAnswer: (value: string) => void;
}) {
  return (
    <div className="choice-list" role="group" aria-label="Choose an answer">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={state.answers[answerKey] === option}
          onClick={() => onAnswer(option)}
        >
          {option}
          <span aria-hidden="true">↗</span>
        </button>
      ))}
    </div>
  );
}

function ReasoningRail({ step }: { step: Step }) {
  const index = steps.indexOf(step);
  return (
    <aside className="reasoning-rail" aria-label="Reasoning rail">
      <p className="eyebrow">REASONING RAIL</p>
      <div>
        <span className="rail-label">01 / EVIDENCE</span>
        <p>
          {index >= 1
            ? caseFacts.observation
            : "Inspect the code and reveal the observation."}
        </p>
      </div>
      <div>
        <span className="rail-label">02 / CONTRACT</span>
        <p>
          {index >= 5
            ? caseFacts.strongContract
            : index >= 4
              ? caseFacts.weakContract
              : "Not established yet."}
        </p>
      </div>
      <div>
        <span className="rail-label">03 / PROPERTY</span>
        <p>
          {index >= 3
            ? caseFacts.property
            : "Reveal the desired safety property."}
        </p>
      </div>
    </aside>
  );
}

function PossibleWorlds() {
  return (
    <div
      className="worlds"
      role="group"
      aria-label="Two representative executions compatible with the same observation"
    >
      <div className="world-observation">
        <span>CALLER OBSERVES</span>
        <strong>No completion response</strong>
        <small>Both worlds fit this evidence</small>
      </div>
      <div className="world-split" aria-hidden="true">
        ↓ compatible with ↓
      </div>
      <div className="world-cards">
        <div>
          <span className="world-tag">WORLD A</span>
          <strong>No VM created</strong>
          <p>The request may not have produced an external effect.</p>
        </div>
        <div>
          <span className="world-tag">WORLD B</span>
          <strong>VM exists</strong>
          <p>
            The effect occurred, but its completion response is unavailable.
          </p>
        </div>
      </div>
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
  switch (state.step) {
    case "review":
      return (
        <>
          <p className="step-lead">
            A production-looking caller retries after a missing completion
            response. Read it before judging it.
          </p>
          <CodeBlock anchor="fs-c01.retry-independent-attempt" />
          <h3>
            Is the deadline alone enough to justify another CreateVM request?
          </h3>
          <Answer
            state={state}
            answerKey="review"
            options={["Yes", "No", "I need more information"]}
            onAnswer={(value) => answer("review", value)}
          />
          {state.answers.review && (
            <p className="feedback">
              Hold that answer. First separate the caller’s observation from the
              remote effect.
            </p>
          )}
        </>
      );
    case "evidence":
      return (
        <>
          <p className="step-lead">
            The caller received no completion response before its deadline. In
            this teaching model, transport cannot establish that the request
            definitely never left.
          </p>
          <h3>Which claim does that observation establish?</h3>
          <Answer
            state={state}
            answerKey="evidence"
            options={[
              "The VM definitely was not created",
              "The VM definitely was created",
              "Neither outcome is established",
            ]}
            onAnswer={(value) => answer("evidence", value)}
          />
          {state.answers.evidence && (
            <p className="feedback" role="status">
              The observation establishes only that no completion response
              arrived in time. It does not, by itself, establish either remote
              outcome.
            </p>
          )}
        </>
      );
    case "worlds":
      return (
        <>
          <p className="step-lead">
            These are representative executions, not an exhaustive list. The
            caller sees the same thing in both.
          </p>
          <PossibleWorlds />
          <p className="insight">
            Observation ≠ external effect ≠ logical-operation resolution.
          </p>
        </>
      );
    case "property":
      return (
        <>
          <p className="step-lead">
            For this case, safety takes priority when an unprotected repeat
            cannot be justified.
          </p>
          <div className="property-card">
            <span>THE PROPERTY</span>
            <strong>{caseFacts.property}</strong>
          </div>
          <p>
            Automatic progress is desirable too, but the current contract may
            leave the operation <strong>UNRESOLVED</strong>. That is not the
            same as failed.
          </p>
          <CodeBlock anchor="fs-c01.keep-unresolved" />
        </>
      );
    case "weak-contract":
      return (
        <>
          <p className="contract-pill">CONTRACT A · NO REPEAT PROTECTION</p>
          <p className="step-lead">
            There is no documented guarantee that a repeat represents the same
            logical operation, and there is no additional outcome evidence.
          </p>
          <div
            className="timeline"
            aria-label="Counterexample: two VMs are possible"
          >
            <div>
              <span>A1</span>
              <p>VM created</p>
            </div>
            <div>
              <span>↯</span>
              <p>Response unavailable; caller times out</p>
            </div>
            <div>
              <span>A2</span>
              <p>Independent creation → second VM</p>
            </div>
          </div>
          <p className="feedback">
            This execution is allowed by Contract A and violates the stated
            property. The contract does not justify an unprotected independent
            repeat here.
          </p>
          <div className="tradeoff">
            <p>
              <strong>Safety</strong>
              <br />
              Avoid creating another VM.
            </p>
            <p>
              <strong>Liveness</strong>
              <br />
              Automatic resolution is not guaranteed.
            </p>
          </div>
        </>
      );
    case "strong-contract":
      return (
        <>
          <p className="contract-pill strong">
            CONTRACT B · SAME LOGICAL OPERATION
          </p>
          <p className="step-lead">
            Keep the same failure, observation, representative worlds, and
            property. Change only the receiver contract.
          </p>
          <p>
            The caller assigns identity <strong>P before A1</strong>. A
            compatible repeat with P represents the same logical operation.
            Within the receiver’s defined scope, it will not create a second VM
            for P. Incompatible reuse is rejected or explicitly handled.
          </p>
          <CodeBlock anchor="fs-c01.retry-same-logical-operation" />
          <p className="insight">
            The failure did not change. The justified action changed because the
            contract changed.
          </p>
        </>
      );
    case "scope-challenge":
      return (
        <>
          <p className="step-lead">
            The receiver protects a logical operation identified by P. Now the
            caller sends <strong>A1(P)</strong> and then <strong>A2(Q)</strong>.
          </p>
          <CodeBlock anchor="fs-c01.retry-with-new-logical-operation" />
          <h3>Does protection for P prevent two VMs?</h3>
          <Answer
            state={state}
            answerKey="scope"
            options={[
              "Yes, all repeats are protected",
              "No, Q is another logical operation",
            ]}
            onAnswer={(value) => answer("scope", value)}
          />
          {state.answers.scope && (
            <p className="feedback" role="status">
              No. The receiver can honor its contract for each identity while P
              and Q create two VMs. The caller lost identity continuity.
            </p>
          )}
        </>
      );
    case "positive-control":
      return (
        <>
          <p className="step-lead">
            Repeat protection should still allow a legitimate completion path.
          </p>
          <div
            className="timeline"
            aria-label="Same identity makes progress without a second VM"
          >
            <div>
              <span>A1(P)</span>
              <p>Effect occurs; response unavailable</p>
            </div>
            <div>
              <span>A2(P)</span>
              <p>Receiver recognizes P</p>
            </div>
            <div>
              <span>RESULT</span>
              <p>Same logical operation; result returned</p>
            </div>
          </div>
          <p className="insight">
            Safety does not require rejecting every repeat.
          </p>
        </>
      );
    case "negative-control":
      return (
        <>
          <p className="step-lead">
            Consider a different operation under an explicit repeat-safe
            contract:
          </p>
          <div className="property-card">
            <span>SET DESIRED STATE</span>
            <strong>SetDesiredState(resourceID, RUNNING)</strong>
          </div>
          <p>
            If repeating this request simply reasserts the same desired state,
            the same network ambiguity can permit a repeat. The contract and
            property, not the timeout alone, determine the action.
          </p>
        </>
      );
    case "transfer":
      return (
        <>
          <p className="step-lead">
            Transfer the reasoning to{" "}
            <code>Charge(request_id=P, amount=100)</code> under a
            same-logical-operation repeat contract.
          </p>
          <h3>Which sequence preserves the same logical identity?</h3>
          <Answer
            state={state}
            answerKey="transfer"
            options={["P → P", "P → Q"]}
            onAnswer={(value) => answer("transfer", value)}
          />
          {state.answers.transfer && (
            <p className="feedback" role="status">
              P → P is a compatible repeat within the stated contract. P → Q can
              represent another charge. The identity must survive the caller’s
              own failure and retry path.
            </p>
          )}
        </>
      );
    case "remaining":
      return (
        <>
          <p className="step-lead">
            Contract B closes this counterexample only within its scope. It does
            not settle every failure.
          </p>
          <ul className="remaining-list">
            <li>
              <strong>Lost P after a crash</strong>
              <span>A new identity may create another VM.</span>
            </li>
            <li>
              <strong>Incompatible reuse</strong>
              <span>The receiver must define and handle changed specs.</span>
            </li>
            <li>
              <strong>Retention window</strong>
              <span>Protection may expire before a late retry.</span>
            </li>
            <li>
              <strong>Hidden retries and concurrency</strong>
              <span>
                SDKs, proxies, and overlapping attempts must honor identity
                continuity.
              </span>
            </li>
            <li>
              <strong>Reconciliation evidence</strong>
              <span>
                Eventually consistent NOT_FOUND need not prove no effect
                occurred.
              </span>
            </li>
          </ul>
        </>
      );
    case "recap":
      return (
        <>
          <p className="step-lead">
            Use these questions on the next ambiguous production failure.
          </p>
          <ol className="recap-list">
            <li>What was actually established?</li>
            <li>What execution does the current contract still allow?</li>
            <li>What property must remain true?</li>
            <li>Where is that property enforced?</li>
            <li>Can the bad execution still occur?</li>
            <li>What failure remains after repair?</li>
          </ol>
          <p className="insight">
            Same observation. Different contract. Different justified action.
          </p>
        </>
      );
  }
  const exhaustive: never = state.step;
  return exhaustive;
}

export function CaseExperience() {
  const [state, dispatch] = useReducer(caseReducer, initialCaseState);
  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "challenge" || mode === "deep-dive")
      dispatch({ type: "mode", mode });
  }, []);
  const index = steps.indexOf(state.step);
  return (
    <main className="case-page page-wrap">
      <div className="case-topline">
        <span>CASE 01 / FS-C01</span>
        <span>CREATE VM · MISSING RESPONSE</span>
      </div>
      <div className="case-intro">
        <p className="eyebrow">AN INTERACTIVE CORRECTNESS CASE</p>
        <h1>
          Should You
          <br />
          <em>Send It Again?</em>
        </h1>
        <p>
          One missing response. Two possible worlds. A decision that depends on
          the contract.
        </p>
      </div>
      <div className="mode-tabs" role="group" aria-label="Learning mode">
        {(["guided", "challenge", "deep-dive"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={state.mode === mode}
            onClick={() => dispatch({ type: "mode", mode })}
          >
            {mode === "deep-dive"
              ? "Deep Dive"
              : mode[0].toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
      {state.mode === "guided" ? (
        <div className="case-layout">
          <section className="lesson-panel" aria-live="polite">
            <div className="step-status">
              <span>
                STEP {String(index + 1).padStart(2, "0")} / {steps.length}
              </span>
              <div className="progress-track">
                <span
                  style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <h2>{titles[state.step]}</h2>
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
                ← Previous
              </button>
              <button
                type="button"
                disabled={index === steps.length - 1}
                onClick={() => dispatch({ type: "next" })}
              >
                Next insight →
              </button>
            </div>
          </section>
          <ReasoningRail step={state.step} />
        </div>
      ) : null}
      {state.mode === "challenge" && (
        <section className="challenge-panel">
          <p className="eyebrow">CHALLENGE MODE / SAME CASE</p>
          <h2>Make the call</h2>
          <p>
            You have the code, the observation, the property, and Contract A.{" "}
            {caseFacts.observation} {caseFacts.property}{" "}
            {caseFacts.weakContract}
          </p>
          <CodeBlock anchor="fs-c01.retry-independent-attempt" />
          <h3>What action is justified by this evidence and contract?</h3>
          <Answer
            state={state}
            answerKey="challenge"
            options={[
              "Repeat as an independent creation",
              "Keep the operation unresolved; seek stronger evidence or contract",
              "Assume the VM was not created",
            ]}
            onAnswer={(value) =>
              dispatch({ type: "answer", key: "challenge", value })
            }
          />
          {state.answers.challenge && (
            <p className="feedback" role="status">
              Contract A permits A1 to create a VM and A2 to create another. The
              safe immediate choice under this property is to keep the operation
              unresolved while seeking a stronger contract or evidence. A
              timeout does not prove failure.
            </p>
          )}
        </section>
      )}
      {state.mode === "deep-dive" && (
        <article className="deep-dive">
          <p className="eyebrow">DEEP DIVE / CASE 01</p>
          <h2>The edges of the contract</h2>
          <DeepDive />
        </article>
      )}
    </main>
  );
}
