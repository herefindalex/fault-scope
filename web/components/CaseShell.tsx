"use client";

import { ui } from "../i18n/catalog";
import { formatNumber } from "../i18n/locale";
import { useLocale } from "./LocaleProvider";
import type { CaseMode } from "./useCaseProgress";

export function CaseShell({
  caseId,
  topline,
  eyebrow,
  title,
  subtitle,
  mode,
  onModeChange,
  children,
}: {
  caseId: string;
  topline: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  mode: CaseMode;
  onModeChange: (mode: CaseMode) => void;
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  return (
    <main className="case-page page-wrap">
      <div className="case-topline">
        <span>
          {ui(locale, "nav.cases")} / {caseId.toUpperCase()}
        </span>
        <span>{topline}</span>
      </div>
      <div className="case-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div
        className="mode-tabs"
        role="group"
        aria-label={ui(locale, "case.learningMode")}
      >
        {(["guided", "challenge", "deep-dive"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={mode === item}
            onClick={() => onModeChange(item)}
          >
            {ui(
              locale,
              item === "deep-dive"
                ? "case.deepDive"
                : item === "guided"
                  ? "case.guided"
                  : "case.challenge",
            )}
          </button>
        ))}
      </div>
      {children}
    </main>
  );
}

export function StepStatus({ index, total }: { index: number; total: number }) {
  const { locale } = useLocale();
  return (
    <div className="step-status">
      <span>
        {ui(locale, "case.step", {
          current: formatNumber(locale, index + 1),
          total: formatNumber(locale, total),
        })}
      </span>
      <div className="progress-track">
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

export function StepNavigation({
  index,
  total,
  onPrevious,
  onNext,
}: {
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { locale } = useLocale();
  return (
    <div className="step-nav">
      <button type="button" disabled={index === 0} onClick={onPrevious}>
        <span aria-hidden="true">←</span> {ui(locale, "action.previous")}
      </button>
      <button type="button" onClick={onNext}>
        {ui(locale, "action.next")} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

export function ReasoningRail({
  evidence,
  contract,
  property,
}: {
  evidence: string;
  contract: string;
  property: string;
}) {
  const { locale } = useLocale();
  return (
    <aside className="reasoning-rail" aria-label={ui(locale, "reasoning.rail")}>
      <p className="eyebrow">{ui(locale, "reasoning.rail")}</p>
      {(
        [
          ["01", "reasoning.evidence", evidence],
          ["02", "reasoning.contract", contract],
          ["03", "reasoning.property", property],
        ] as const
      ).map(([number, key, value]) => (
        <div key={number}>
          <span className="rail-label">
            {number} / {ui(locale, key)}
          </span>
          <p>{value}</p>
        </div>
      ))}
    </aside>
  );
}
