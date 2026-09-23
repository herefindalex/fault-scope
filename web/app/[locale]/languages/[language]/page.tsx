import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeBlock } from "../../../../components/CodeBlock";
import { ui } from "../../../../i18n/catalog";
import { isLocale } from "../../../../i18n/locale";
import { localizedMetadata } from "../../../../i18n/metadata";
import {
  languageIds,
  languageNames,
  type Language,
} from "../../../../src/case";

export const dynamicParams = false;
export function generateStaticParams() {
  return languageIds.map((language) => ({ language }));
}
type Props = { params: Promise<{ locale: string; language: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, language } = await params;
  if (!isLocale(locale) || !languageIds.includes(language as Language))
    notFound();
  const name = languageNames[language as Language];
  return localizedMetadata(
    locale,
    `languages/${language}`,
    ui(locale, "language.heading", { language: name }),
    ui(locale, "seo.languageDescription", { language: name }),
  );
}
export default async function LanguagePage({ params }: Props) {
  const { locale, language } = await params;
  if (!isLocale(locale) || !languageIds.includes(language as Language))
    notFound();
  const name = languageNames[language as Language];
  return (
    <main className="page-wrap language-page">
      <p className="eyebrow">
        {ui(locale, "codeLens.label")} / {language.toUpperCase()}
      </p>
      <h1>{ui(locale, "language.heading", { language: name })}</h1>
      <p>{ui(locale, "language.description")}</p>
      <CodeBlock
        anchor="fs-c01.retry-independent-attempt"
        fixedLanguage={language as Language}
      />
      <a
        className="primary-link"
        href={`/${locale}/cases/should-you-send-it-again/?lang=${language}&mode=guided`}
      >
        {ui(locale, "language.cta", { language: name })}{" "}
        <span aria-hidden="true">↗</span>
      </a>
    </main>
  );
}
