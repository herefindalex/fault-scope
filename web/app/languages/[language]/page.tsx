import { notFound } from "next/navigation";
import { CodeBlock } from "../../../components/CodeBlock";
import { languageIds, languageNames, type Language } from "../../../src/case";

export function generateStaticParams() {
  return languageIds.map((language) => ({ language }));
}

export default async function LanguagePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  if (!languageIds.includes(language as Language)) notFound();
  return (
    <main className="page-wrap language-page">
      <p className="eyebrow">CODE LENS / {language.toUpperCase()}</p>
      <h1>{languageNames[language as Language]} lens</h1>
      <p>
        Language changes the code you inspect. The observation, property, and
        contract in Case 01 stay the same.
      </p>
      <CodeBlock
        anchor="fs-c01.retry-independent-attempt"
        fixedLanguage={language as Language}
      />
      <a
        className="primary-link"
        href={`/cases/should-you-send-it-again/?lang=${language}`}
      >
        Explore Case 01 in {languageNames[language as Language]}{" "}
        <span aria-hidden="true">↗</span>
      </a>
    </main>
  );
}
