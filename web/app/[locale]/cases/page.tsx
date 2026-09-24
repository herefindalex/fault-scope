import { notFound } from "next/navigation";
import { caseCopy, ui } from "../../../i18n/catalog";
import { extraCaseCopy, type ExtraCaseId } from "../../../i18n/extra-cases";
import { isLocale } from "../../../i18n/locale";
import { localizedMetadata } from "../../../i18n/metadata";
import { visibleCases } from "../../../src/cases";
import type { Locale } from "../../../i18n/locale";

type Props = { params: Promise<{ locale: string }> };

function caseEntries(locale: Locale) {
  return visibleCases(process.env.FAULTSCOPE_INCLUDE_DRAFTS === "1").map(
    (definition) => ({
      number: definition.id.slice(-2),
      slug: definition.slug,
      title:
        definition.id === "fs-c01"
          ? caseCopy(locale, "title")
          : extraCaseCopy(definition.id as ExtraCaseId, locale, "title"),
      subtitle:
        definition.id === "fs-c01"
          ? caseCopy(locale, "subtitle")
          : extraCaseCopy(definition.id as ExtraCaseId, locale, "subtitle"),
    }),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedMetadata(
    locale,
    "cases",
    ui(locale, "nav.cases"),
    caseEntries(locale)
      .map((entry) => entry.title)
      .join(" · "),
  );
}

export default async function CasesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const entries = caseEntries(locale);
  return (
    <main className="page-wrap cases-index">
      <p className="eyebrow">FaultScope</p>
      <h1>{ui(locale, "nav.cases")}</h1>
      <div className="case-index-grid">
        {entries.map((entry) => (
          <a key={entry.number} href={`/${locale}/cases/${entry.slug}/`}>
            <span className="eyebrow">{entry.number}</span>
            <h2>{entry.title}</h2>
            <p>{entry.subtitle}</p>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </main>
  );
}
