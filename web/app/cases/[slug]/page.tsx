import { notFound } from "next/navigation";
import { CaseExperience } from "../../../components/CaseExperience";
import DeepDive from "../../../content/deep-dive.mdx";
import caseData from "../../../src/case-data.json";

const visible =
  caseData.status === "published" ||
  process.env.FAULTSCOPE_INCLUDE_DRAFTS === "1";
export const dynamicParams = false;

export function generateStaticParams() {
  return visible ? [{ slug: caseData.slug }] : [];
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!visible || slug !== caseData.slug) notFound();
  return <CaseExperience deepDive={<DeepDive />} />;
}
