"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  isLanguage,
  languageIds,
  languageNames,
  type Language,
} from "../src/case";
import { resolveLanguage } from "../src/language-choice";

type LanguageContextValue = {
  language: Language;
  ready: boolean;
  choose: (language: Language) => void;
  needsSelection: boolean;
  skip: () => void;
  openChooser: () => void;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);
const preferenceKey = "faultscope.code-lens";

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider missing");
  return value;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("go");
  const [ready, setReady] = useState(false);
  const [needsSelection, setNeedsSelection] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolution = resolveLanguage(
      params.get("lang"),
      window.localStorage.getItem(preferenceKey),
    );
    setLanguage(resolution.language);
    setNeedsSelection(resolution.prompt);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !dialog.current) return;
    if (needsSelection && !dialog.current.open) dialog.current.showModal();
    if (!needsSelection && dialog.current.open) dialog.current.close();
  }, [needsSelection, ready]);

  function choose(next: Language) {
    setLanguage(next);
    window.localStorage.setItem(preferenceKey, next);
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
    setNeedsSelection(false);
  }
  function skip() {
    setNeedsSelection(false);
  }
  const value = {
    language,
    ready,
    choose,
    needsSelection,
    skip,
    openChooser: () => setNeedsSelection(true),
  };
  return (
    <LanguageContext.Provider value={value}>
      {children}
      <dialog
        className="lens-dialog"
        ref={dialog}
        aria-labelledby="lens-title"
        onCancel={skip}
        onClose={skip}
      >
        <div className="dialog-symbol" aria-hidden="true">{`{ }`}</div>
        <p className="eyebrow">MAKE IT YOURS</p>
        <h2 id="lens-title">Choose your code lens</h2>
        <p>The reasoning stays the same. Only the code changes.</p>
        <div className="lens-grid">
          {languageIds.map((item) => (
            <button key={item} type="button" onClick={() => choose(item)}>
              {languageNames[item]} <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <button className="text-button" type="button" onClick={skip}>
          Skip for now · use Go
        </button>
      </dialog>
    </LanguageContext.Provider>
  );
}

export function GlobalLanguageSelector() {
  const { language, ready, choose, openChooser } = useLanguage();
  return (
    <div className="header-lens">
      <label htmlFor="global-language">Code lens</label>
      <select
        id="global-language"
        aria-label="Code lens"
        value={ready ? language : ""}
        onChange={(event) => {
          if (isLanguage(event.target.value)) choose(event.target.value);
        }}
      >
        {!ready && <option value="">Loading</option>}
        {languageIds.map((item) => (
          <option key={item} value={item}>
            {languageNames[item]}
          </option>
        ))}
      </select>
      <button
        className="lens-help"
        type="button"
        onClick={openChooser}
        aria-label="Choose a code lens"
      >
        ?
      </button>
    </div>
  );
}
