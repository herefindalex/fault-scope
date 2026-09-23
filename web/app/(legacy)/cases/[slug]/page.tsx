import { notFound } from "next/navigation";
import { LocaleEntry } from "../../../../components/LocaleEntry";
import { getCaseBySlug, visibleCases } from "../../../../src/cases";

export const dynamicParams = false;
export function generateStaticParams() {
  return visibleCases().map((definition) => ({ slug: definition.slug }));
}
export default async function LegacyCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (
    !getCaseBySlug(slug) ||
    !visibleCases().some((item) => item.slug === slug)
  )
    notFound();
  const path = `cases/${slug}`;
  return (
    <main className="page-wrap locale-entry">
      <h1>Choose your human language</h1>
      <LocaleEntry path={path} />
      <a href={`/en/${path}/`}>Continue in English</a>
    </main>
  );
}
