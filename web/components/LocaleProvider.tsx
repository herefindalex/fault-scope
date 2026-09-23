"use client";

import { createContext, useContext } from "react";
import {
  localePreferenceKey,
  publicLocales,
  switchLocaleUrl,
  type Locale,
} from "../i18n/locale";
import { ui } from "../i18n/catalog";

type LocaleContextValue = { locale: Locale; choose: (locale: Locale) => void };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  return useContext(LocaleContext) ?? { locale: "en", choose: () => {} };
}

export function LocaleProvider({
  locale,
  children,
  navigate = (url: string) => window.location.assign(url),
}: {
  locale: Locale;
  children: React.ReactNode;
  navigate?: (url: string) => void;
}) {
  function choose(next: Locale) {
    if (next === locale) return;
    window.localStorage.setItem(localePreferenceKey, next);
    navigate(switchLocaleUrl(new URL(window.location.href), next));
  }
  return (
    <LocaleContext.Provider value={{ locale, choose }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function GlobalLocaleSelector({
  id = "global-locale",
}: {
  id?: string;
}) {
  const { locale, choose } = useLocale();
  return (
    <div className="header-lens header-locale">
      <label htmlFor={id}>{ui(locale, "locale.label")}</label>
      <select
        id={id}
        aria-label={ui(locale, "locale.choose")}
        value={locale}
        onChange={(event) => choose(event.target.value)}
      >
        {publicLocales.map((item) => (
          <option key={item.id} value={item.id} lang={item.id}>
            {item.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
