"use client";

import {
  isLanguage,
  languageIds,
  languageNames,
  type Language,
} from "../src/case";
import { snippetFor, type Anchor } from "../src/snippets";
import { useLanguage } from "./LanguageProvider";

export function CodeBlock({
  anchor,
  fixedLanguage,
}: {
  anchor: Anchor;
  fixedLanguage?: Language;
}) {
  const { language, ready, choose } = useLanguage();
  const selected = fixedLanguage ?? language;
  return (
    <section
      className="code-frame"
      aria-label={`${languageNames[selected]} source code`}
    >
      <div className="code-toolbar">
        <span>
          <span className="code-dot" /> SOURCE /{" "}
          {anchor.split(".")[1].replaceAll("-", " ").toUpperCase()}
        </span>
        {fixedLanguage ? (
          <strong>{languageNames[fixedLanguage]}</strong>
        ) : (
          <select
            aria-label="Code block language"
            value={ready ? selected : ""}
            onChange={(event) => {
              if (isLanguage(event.target.value)) choose(event.target.value);
            }}
          >
            {!ready && <option value="">Choose lens</option>}
            {languageIds.map((item) => (
              <option key={item} value={item}>
                {languageNames[item]}
              </option>
            ))}
          </select>
        )}
      </div>
      {ready || fixedLanguage ? (
        <pre>
          <code>{snippetFor(anchor, selected)}</code>
        </pre>
      ) : (
        <div className="code-placeholder">
          Choose a code lens to inspect this source.
        </div>
      )}
    </section>
  );
}
