import type { MetadataRoute } from "next";
import caseData from "../src/case-data.json";
import { localPath, publicLocales, siteUrl } from "../i18n/locale";
import { languageIds } from "../src/case";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicLocales
    .filter((item) => item.status === "source" || item.status === "reviewed")
    .flatMap((item) => {
      const routes = [localPath(item.id), localPath(item.id, "about")];
      if (caseData.status === "published") {
        routes.push(localPath(item.id, `cases/${caseData.slug}`));
        routes.push(
          ...languageIds.map((language) =>
            localPath(item.id, `languages/${language}`),
          ),
        );
      }
      return routes.map((route) => ({ url: `${siteUrl}${route}` }));
    });
}
