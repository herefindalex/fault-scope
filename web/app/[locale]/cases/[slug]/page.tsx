import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseExperience } from "../../../../components/CaseExperience";
import { CancellationCaseExperience } from "../../../../components/CancellationCaseExperience";
import { DeliveryCaseExperience } from "../../../../components/DeliveryCaseExperience";
import { FreshnessCaseExperience } from "../../../../components/FreshnessCaseExperience";
import { LaterCaseExperience } from "../../../../components/LaterCaseExperience";
import { OrderingCaseExperience } from "../../../../components/OrderingCaseExperience";
import { RecoveryCaseExperience } from "../../../../components/RecoveryCaseExperience";
import { caseCopy } from "../../../../i18n/catalog";
import { extraCaseCopy, type ExtraCaseId } from "../../../../i18n/extra-cases";
import { isLocale } from "../../../../i18n/locale";
import { localizedMetadata } from "../../../../i18n/metadata";
import { getCaseBySlug, visibleCases } from "../../../../src/cases";

const includeDrafts = process.env.FAULTSCOPE_INCLUDE_DRAFTS === "1";
const publishedRoutes = visibleCases(includeDrafts);

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedRoutes.map((item) => ({ slug: item.slug }));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const selected = getCaseBySlug(slug);
  if (!selected || !publishedRoutes.includes(selected)) notFound();
  const title =
    selected.id === "fs-c01"
      ? caseCopy(locale, "title")
      : extraCaseCopy(selected.id as ExtraCaseId, locale, "title");
  const description =
    selected.id === "fs-c01"
      ? caseCopy(locale, "subtitle")
      : extraCaseCopy(selected.id as ExtraCaseId, locale, "subtitle");
  return localizedMetadata(locale, `cases/${slug}`, title, description);
}

export default async function CasePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const selected = getCaseBySlug(slug);
  if (!selected || !publishedRoutes.includes(selected)) notFound();
  if (selected.id === "fs-c01") return <CaseExperience />;
  if (selected.id === "fs-c04") return <DeliveryCaseExperience />;
  if (selected.id === "fs-c05") return <OrderingCaseExperience />;
  if (selected.id === "fs-c06") return <FreshnessCaseExperience />;
  if (selected.id === "fs-c07") return <CancellationCaseExperience />;
  if (selected.id === "fs-c08") return <RecoveryCaseExperience />;
  return <LaterCaseExperience caseId={selected.id as "fs-c02" | "fs-c03"} />;
}
