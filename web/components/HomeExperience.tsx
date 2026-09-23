"use client";

import { useState } from "react";
import { caseCopy, ui } from "../i18n/catalog";
import { CodeBlock } from "./CodeBlock";
import { useLocale } from "./LocaleProvider";

const choices = ["option.yes", "option.no", "option.needMore"] as const;

export function HomeExperience() {
  const { locale } = useLocale();
  const [answer, setAnswer] = useState<(typeof choices)[number] | null>(null);
  const c = (key: Parameters<typeof caseCopy>[1]) => caseCopy(locale, key);
  const t = (
    key: Parameters<typeof ui>[1],
    values?: Record<string, string | number>,
  ) => ui(locale, key, values);
  return (
    <main>
      <section className="hero page-wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" /> {t("home.eyebrow")}
          </p>
          <h1>{t("home.title")}</h1>
          <p className="hero-lead">{t("home.lead")}</p>
          <div className="hero-badges">
            <span>{t("home.createVm")}</span>
            <span>{t("home.lenses")}</span>
            <span>{t("home.duration")}</span>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true">
          <span>01</span>
          <small>{t("home.missingResponse")}</small>
        </div>
      </section>
      <section className="home-lab page-wrap" aria-labelledby="home-lab-title">
        <div className="section-heading">
          <p className="eyebrow">{t("home.start")}</p>
          <h2 id="home-lab-title">{t("home.codeReasonable")}</h2>
          <p>{c("observation")}</p>
        </div>
        <CodeBlock anchor="fs-c01.retry-independent-attempt" />
        <div className="question-card">
          <div>
            <p className="eyebrow">{t("home.instinct")}</p>
            <h3>{t("home.question")}</h3>
          </div>
          <div className="answer-row">
            {choices.map((option) => (
              <button
                type="button"
                key={option}
                aria-pressed={answer === option}
                onClick={() => setAnswer(option)}
              >
                {c(option)}
              </button>
            ))}
          </div>
          {answer && (
            <p className="answer-note">
              {t("home.answerNote", { answer: c(answer) })}
            </p>
          )}
          <a
            className="primary-link"
            href={`/${locale}/cases/should-you-send-it-again/`}
          >
            {t("home.cta")} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <section className="home-principle page-wrap">
        <span className="section-number">{t("home.methodLabel")}</span>
        <p>{t("home.method")}</p>
      </section>
    </main>
  );
}
