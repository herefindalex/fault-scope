"use client";

import { useState } from "react";
import { caseFacts } from "../src/case";
import { CodeBlock } from "./CodeBlock";

export function HomeExperience() {
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <main>
      <section className="hero page-wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" /> INTERACTIVE CORRECTNESS LAB · CASE 01
          </p>
          <h1>
            When the response disappears, <em>what do you know?</em>
          </h1>
          <p className="hero-lead">
            Real distributed failures make ordinary code hard to judge. Follow
            the evidence, test the contract, and see which next action the
            property permits.
          </p>
          <div className="hero-badges">
            <span>01 / CREATE VM</span>
            <span>7 CODE LENSES</span>
            <span>~8 MINUTES</span>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true">
          <span>01</span>
          <small>
            THE MISSING
            <br />
            RESPONSE
          </small>
        </div>
      </section>
      <section className="home-lab page-wrap" aria-labelledby="home-lab-title">
        <div className="section-heading">
          <p className="eyebrow">START WITH CODE</p>
          <h2 id="home-lab-title">This code looks reasonable.</h2>
          <p>{caseFacts.observation}</p>
        </div>
        <CodeBlock anchor="fs-c01.retry-independent-attempt" />
        <div className="question-card">
          <div>
            <p className="eyebrow">YOUR FIRST INSTINCT</p>
            <h3>Would you send it again?</h3>
          </div>
          <div className="answer-row">
            {["Yes", "No", "I need more information"].map((option) => (
              <button
                type="button"
                key={option}
                aria-pressed={answer === option}
                onClick={() => setAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {answer && (
            <p className="answer-note">
              You chose “{answer}.” Keep that thought; the observation alone
              does not settle the decision.
            </p>
          )}
          <a className="primary-link" href="/cases/should-you-send-it-again/">
            See what the caller actually knows <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <section className="home-principle page-wrap">
        <span className="section-number">THE METHOD</span>
        <p>
          Evidence tells you what happened <strong>locally.</strong> The
          contract tells you what the other side may still do. The property
          tells you what must remain true.
        </p>
      </section>
    </main>
  );
}
