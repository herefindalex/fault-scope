import type { MetadataRoute } from "next";
import { localPath, publicLocales, siteUrl } from "../i18n/locale";
import { languageIds } from "../src/case";
import { visibleCases } from "../src/cases";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicLocales
    .filter((item) => item.status === "source" || item.status === "reviewed")
    .flatMap((item) => {
      const routes = [
        localPath(item.id),
        localPath(item.id, "about"),
        localPath(item.id, "cases"),
      ];
      for (const entry of visibleCases()) {
        routes.push(localPath(item.id, `cases/${entry.slug}`));
      }
      routes.push(
        ...languageIds.map((language) =>
          localPath(item.id, `languages/${language}`),
        ),
      );
      return routes.map((route) => ({ url: `${siteUrl}${route}` }));
    });
}
