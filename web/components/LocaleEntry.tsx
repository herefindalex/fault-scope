"use client";

import { useEffect } from "react";
import { localePreferenceKey, resolveLocale } from "../i18n/locale";

export function LocaleEntry({ path = "" }: { path?: string }) {
  useEffect(() => {
    const preferred = resolveLocale(
      null,
      window.localStorage.getItem(localePreferenceKey),
      navigator.languages?.length ? navigator.languages : [navigator.language],
    );
    window.location.replace(
      `/${preferred}/${path ? `${path}/` : ""}${window.location.search}${window.location.hash}`,
    );
  }, [path]);
  return null;
}
