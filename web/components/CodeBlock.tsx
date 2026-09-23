"use client";

import {
  isLanguage,
  languageIds,
  languageNames,
  type Language,
} from "../src/case";
import { snippetFor, type Anchor } from "../src/snippets";
import { caseCopy, ui, type CaseMessageKey } from "../i18n/catalog";
import { useLanguage } from "./LanguageProvider";
import { useLocale } from "./LocaleProvider";

const anchorLabels: Partial<Record<Anchor, CaseMessageKey>> = {
  "fs-c01.retry-independent-attempt": "anchor.retry-independent-attempt",
  "fs-c01.keep-unresolved": "anchor.keep-unresolved",
  "fs-c01.retry-same-logical-operation": "anchor.retry-same-logical-operation",
  "fs-c01.retry-with-new-logical-operation":
    "anchor.retry-with-new-logical-operation",
};

export function CodeBlock({
  anchor,
  fixedLanguage,
  label,
}: {
  anchor: Anchor;
  fixedLanguage?: Language;
  label?: string;
}) {
  const { language, ready, choose } = useLanguage();
  const { locale } = useLocale();
  const selected = fixedLanguage ?? language;
  const defaultLabel = anchorLabels[anchor];
  return (
    <section
      className="code-frame"
      aria-label={`${languageNames[selected]} ${ui(locale, "codeLens.source")}`}
    >
      <div className="code-toolbar">
        <span>
          <span className="code-dot" /> {ui(locale, "codeLens.source")} /{" "}
          {label ?? (defaultLabel ? caseCopy(locale, defaultLabel) : anchor)}
        </span>
        {fixedLanguage ? (
          <strong>{languageNames[fixedLanguage]}</strong>
        ) : (
          <select
            aria-label={ui(locale, "codeLens.label")}
            value={ready ? selected : ""}
            onChange={(event) => {
              if (isLanguage(event.target.value)) choose(event.target.value);
            }}
          >
            {!ready && (
              <option value="">{ui(locale, "codeLens.choose")}</option>
            )}
            {languageIds.map((item) => (
              <option key={item} value={item}>
                {languageNames[item]}
              </option>
            ))}
          </select>
        )}
      </div>
      {ready || fixedLanguage ? (
        <pre dir="ltr">
          <code>{snippetFor(anchor, selected)}</code>
        </pre>
      ) : (
        <div className="code-placeholder">
          {ui(locale, "codeLens.placeholder")}
        </div>
      )}
    </section>
  );
}
