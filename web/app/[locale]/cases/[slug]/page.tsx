import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseExperience } from "../../../../components/CaseExperience";
import { caseCopy } from "../../../../i18n/catalog";
import { isLocale } from "../../../../i18n/locale";
import { localizedMetadata } from "../../../../i18n/metadata";
import caseData from "../../../../src/case-data.json";

const visible =
  caseData.status === "published" ||
  process.env.FAULTSCOPE_INCLUDE_DRAFTS === "1";
export const dynamicParams = false;
export function generateStaticParams() {
  return visible ? [{ slug: caseData.slug }] : [];
}
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!visible || !isLocale(locale) || slug !== caseData.slug) notFound();
  return localizedMetadata(
    locale,
    `cases/${slug}`,
    caseCopy(locale, "title"),
    caseCopy(locale, "subtitle"),
  );
}
export default async function CasePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!visible || !isLocale(locale) || slug !== caseData.slug) notFound();
  return <CaseExperience />;
}
