import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeExperience } from "../../components/HomeExperience";
import { isLocale } from "../../i18n/locale";
import { homeMetadata } from "../../i18n/metadata";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return homeMetadata(locale);
}
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <HomeExperience />;
}
