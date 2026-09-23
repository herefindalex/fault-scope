import { localeDefinition, type Locale, type MessageKey } from "./locale";
import uiEn from "./messages/en.json";
import uiZhTw from "./messages/zh-TW.json";
import uiZhCn from "./messages/zh-CN.json";
import uiJa from "./messages/ja.json";
import uiKo from "./messages/ko.json";
import uiEs from "./messages/es.json";
import uiFr from "./messages/fr.json";
import uiDe from "./messages/de.json";
import uiPtBr from "./messages/pt-BR.json";
import uiIt from "./messages/it.json";
import uiNl from "./messages/nl.json";
import uiPl from "./messages/pl.json";
import uiTr from "./messages/tr.json";
import uiUk from "./messages/uk.json";
import uiRu from "./messages/ru.json";
import uiAr from "./messages/ar.json";
import uiHi from "./messages/hi.json";
import uiVi from "./messages/vi.json";
import uiTh from "./messages/th.json";
import uiId from "./messages/id.json";
import caseEn from "../content/cases/fs-c01/locales/en.json";
import caseZhTw from "../content/cases/fs-c01/locales/zh-TW.json";
import caseZhCn from "../content/cases/fs-c01/locales/zh-CN.json";
import caseJa from "../content/cases/fs-c01/locales/ja.json";
import caseKo from "../content/cases/fs-c01/locales/ko.json";
import caseEs from "../content/cases/fs-c01/locales/es.json";
import caseFr from "../content/cases/fs-c01/locales/fr.json";
import caseDe from "../content/cases/fs-c01/locales/de.json";
import casePtBr from "../content/cases/fs-c01/locales/pt-BR.json";
import caseIt from "../content/cases/fs-c01/locales/it.json";
import caseNl from "../content/cases/fs-c01/locales/nl.json";
import casePl from "../content/cases/fs-c01/locales/pl.json";
import caseTr from "../content/cases/fs-c01/locales/tr.json";
import caseUk from "../content/cases/fs-c01/locales/uk.json";
import caseRu from "../content/cases/fs-c01/locales/ru.json";
import caseAr from "../content/cases/fs-c01/locales/ar.json";
import caseHi from "../content/cases/fs-c01/locales/hi.json";
import caseVi from "../content/cases/fs-c01/locales/vi.json";
import caseTh from "../content/cases/fs-c01/locales/th.json";
import caseId from "../content/cases/fs-c01/locales/id.json";

export type CaseMessageKey = keyof typeof caseEn.messages;
const uiCatalogs: Record<string, Partial<Record<MessageKey, string>>> = {
  en: uiEn,
  "zh-TW": uiZhTw,
  "zh-CN": uiZhCn,
  ja: uiJa,
  ko: uiKo,
  es: uiEs,
  fr: uiFr,
  de: uiDe,
  "pt-BR": uiPtBr,
  it: uiIt,
  nl: uiNl,
  pl: uiPl,
  tr: uiTr,
  uk: uiUk,
  ru: uiRu,
  ar: uiAr,
  hi: uiHi,
  vi: uiVi,
  th: uiTh,
  id: uiId,
};
const caseCatalogs: Record<string, Partial<Record<CaseMessageKey, string>>> = {
  en: caseEn.messages,
  "zh-TW": caseZhTw.messages,
  "zh-CN": caseZhCn.messages,
  ja: caseJa.messages,
  ko: caseKo.messages,
  es: caseEs.messages,
  fr: caseFr.messages,
  de: caseDe.messages,
  "pt-BR": casePtBr.messages,
  it: caseIt.messages,
  nl: caseNl.messages,
  pl: casePl.messages,
  tr: caseTr.messages,
  uk: caseUk.messages,
  ru: caseRu.messages,
  ar: caseAr.messages,
  hi: caseHi.messages,
  vi: caseVi.messages,
  th: caseTh.messages,
  id: caseId.messages,
};

function interpolate(
  message: string,
  values?: Record<string, string | number>,
) {
  return message.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (_, key: string) =>
    String(values?.[key] ?? `{${key}}`),
  );
}

function fallback(
  locale: Locale,
  key: string,
  translated: string | undefined,
  source: string,
  values?: Record<string, string | number>,
) {
  if (
    !translated &&
    locale !== "en" &&
    process.env.NODE_ENV === "development"
  ) {
    return `[MISSING: ${key}] ${source}`;
  }
  const formatted = interpolate(translated ?? source, values);
  return !translated && localeDefinition(locale).direction === "rtl"
    ? `\u2066${formatted}\u2069`
    : formatted;
}

export function ui(
  locale: Locale,
  key: MessageKey,
  values?: Record<string, string | number>,
) {
  return fallback(locale, key, uiCatalogs[locale]?.[key], uiEn[key], values);
}

export function caseCopy(
  locale: Locale,
  key: CaseMessageKey,
  values?: Record<string, string | number>,
) {
  return fallback(
    locale,
    `case.fs-c01.${key}`,
    caseCatalogs[locale]?.[key],
    caseEn.messages[key],
    values,
  );
}
