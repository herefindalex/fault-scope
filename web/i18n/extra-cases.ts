import { catalogs } from "./generated-extra-cases";
import type { Locale } from "./locale";
import { localeDefinition } from "./locale";

export type ExtraCaseId = keyof typeof catalogs;

export function extraCaseCopy(
  caseId: ExtraCaseId,
  locale: Locale,
  key: string,
): string {
  const messages = catalogs[caseId] as Record<string, Record<string, string>>;
  return (
    messages[localeDefinition(locale).id]?.[key] ?? messages.en[key] ?? key
  );
}
