import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseCopy, ui } from "../../../i18n/catalog";
import { isLocale } from "../../../i18n/locale";
import { localizedMetadata } from "../../../i18n/metadata";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedMetadata(
    locale,
    "about",
    ui(locale, "about.title"),
    ui(locale, "about.lead"),
  );
}
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="page-wrap language-page">
      <p className="eyebrow">{ui(locale, "home.methodLabel")}</p>
      <h1>{ui(locale, "about.title")}</h1>
      <p>{ui(locale, "about.lead")}</p>
      <ol className="recap-list">
        {([1, 2, 3, 4, 5, 6] as const).map((number) => (
          <li key={number}>{caseCopy(locale, `recap.${number}`)}</li>
        ))}
      </ol>
      <p>{ui(locale, "about.tail")}</p>
    </main>
  );
}
