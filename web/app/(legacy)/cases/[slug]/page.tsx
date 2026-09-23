import { notFound } from "next/navigation";
import { LocaleEntry } from "../../../../components/LocaleEntry";
import caseData from "../../../../src/case-data.json";

export const dynamicParams = false;
export function generateStaticParams() {
  return caseData.status === "published" ? [{ slug: caseData.slug }] : [];
}
export default async function LegacyCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== caseData.slug) notFound();
  const path = `cases/${slug}`;
  return (
    <main className="page-wrap locale-entry">
      <h1>Choose your human language</h1>
      <LocaleEntry path={path} />
      <a href={`/en/${path}/`}>Continue in English</a>
    </main>
  );
}
