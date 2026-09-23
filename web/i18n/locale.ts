import registry from "./registry.json";
import english from "./messages/en.json";

export { registry };
export type Locale = string;
export type MessageKey = keyof typeof english;
export const localePreferenceKey = "faultscope.v1.locale";
export const siteUrl = (
  process.env.FAULTSCOPE_SITE_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && registry.some((item) => item.id === value);
}

export function localeDefinition(locale: Locale) {
  return registry.find((item) => item.id === locale) ?? registry[0];
}

export function resolveLocale(
  explicit: string | null,
  saved: string | null,
  browser: readonly string[],
): Locale {
  if (isLocale(explicit)) return explicit;
  if (isLocale(saved)) return saved;
  for (const item of browser) {
    const normalized = item.replaceAll("_", "-");
    const exact = registry.find(
      (entry) => entry.id.toLowerCase() === normalized.toLowerCase(),
    );
    if (exact) return exact.id;
    const base = normalized.split("-")[0].toLowerCase();
    if (base === "zh") {
      if (/\b(hant|tw|hk|mo)\b/i.test(normalized.replaceAll("-", " ")))
        return "zh-TW";
      if (/\b(hans|cn|sg)\b/i.test(normalized.replaceAll("-", " ")))
        return "zh-CN";
      if (normalized.toLowerCase() === "zh") return "zh-CN";
      continue;
    }
    const regional = registry.find((entry) => entry.id.toLowerCase() === base);
    if (regional) return regional.id;
    if (base === "pt") return "pt-BR";
  }
  return "en";
}

export function switchLocaleUrl(url: URL, next: Locale): string {
  const segments = url.pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments[0] = next;
  else segments.unshift(next);
  url.pathname = `/${segments.join("/")}/`;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function localPath(locale: Locale, path = ""): string {
  return `/${locale}/${path ? `${path.replace(/^\/+|\/+$/g, "")}/` : ""}`;
}

export function alternates(path: string) {
  return Object.fromEntries(
    registry.map((item) => [item.id, localPath(item.id, path)]),
  );
}

export function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatList(locale: Locale, values: string[]) {
  return new Intl.ListFormat(locale).format(values);
}
