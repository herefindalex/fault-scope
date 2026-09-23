import type { Metadata } from "next";
import { ui } from "./catalog";
import {
  localPath,
  localeDefinition,
  publicLocales,
  siteUrl,
  type Locale,
} from "./locale";

export function localizedMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  const route = localPath(locale, path);
  const languages = Object.fromEntries(
    publicLocales.map((item) => [
      item.id,
      `${siteUrl}${localPath(item.id, path)}`,
    ]),
  );
  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}${route}`,
      languages: { ...languages, "x-default": `${siteUrl}/` },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}${route}`,
      locale,
      alternateLocale: publicLocales
        .filter((item) => item.id !== locale)
        .map((item) => item.id),
    },
    robots:
      localeDefinition(locale).status === "source" ||
      localeDefinition(locale).status === "reviewed"
        ? { index: true, follow: true }
        : { index: false, follow: true },
  };
}

export function homeMetadata(locale: Locale) {
  return localizedMetadata(
    locale,
    "",
    ui(locale, "seo.homeTitle"),
    ui(locale, "seo.homeDescription"),
  );
}
