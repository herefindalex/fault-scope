import { notFound } from "next/navigation";
import { LocaleEntry } from "../../../../components/LocaleEntry";
import { languageIds, type Language } from "../../../../src/case";

export const dynamicParams = false;
export function generateStaticParams() {
  return languageIds.map((language) => ({ language }));
}
export default async function LegacyLanguagePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  if (!languageIds.includes(language as Language)) notFound();
  const path = `languages/${language}`;
  return (
    <main className="page-wrap locale-entry">
      <h1>Choose your human language</h1>
      <LocaleEntry path={path} />
      <a href={`/en/${path}/`}>Continue in English</a>
    </main>
  );
}
