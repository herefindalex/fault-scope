import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeBlock } from "../../../../components/CodeBlock";
import { ui } from "../../../../i18n/catalog";
import { extraCaseCopy } from "../../../../i18n/extra-cases";
import { isLocale } from "../../../../i18n/locale";
import { localizedMetadata } from "../../../../i18n/metadata";
import case02 from "../../../../src/case-02-data.json";
import case03 from "../../../../src/case-03-data.json";
import case04 from "../../../../src/case-04-data.json";
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
      <div className="language-case-grid">
        {[
          {
            id: "fs-c02" as const,
            slug: case02.slug,
            anchor: "fs-c02.commit-without-generation" as const,
            label: "anchor.commit-without-generation",
          },
          {
            id: "fs-c03" as const,
            slug: case03.slug,
            anchor: "fs-c03.split-dual-write" as const,
            label: "anchor.split-dual-write",
          },
          {
            id: "fs-c04" as const,
            slug: case04.slug,
            anchor: "fs-c04.effect-then-ack" as const,
            label: "anchor.effect-then-ack",
          },
        ].map((entry) => (
          <section key={entry.id} className="language-case-card">
            <h2>{extraCaseCopy(entry.id, locale, "title")}</h2>
            <p>{extraCaseCopy(entry.id, locale, "subtitle")}</p>
            <CodeBlock
              anchor={entry.anchor}
              fixedLanguage={language as Language}
              label={extraCaseCopy(entry.id, locale, entry.label)}
            />
            <a
              className="primary-link"
              href={`/${locale}/cases/${entry.slug}/?lang=${language}&mode=guided`}
            >
              {extraCaseCopy(entry.id, locale, "title")}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </section>
        ))}
      </div>
    </main>
  );
}
