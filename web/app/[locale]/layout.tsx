import { notFound } from "next/navigation";
import "../style.css";
import {
  GlobalLocaleSelector,
  LocaleProvider,
} from "../../components/LocaleProvider";
import {
  GlobalLanguageSelector,
  LanguageProvider,
} from "../../components/LanguageProvider";
import { isLocale, localeDefinition, registry } from "../../i18n/locale";
import { ui } from "../../i18n/catalog";

export const dynamicParams = false;
export function generateStaticParams() {
  return registry.map((item) => ({ locale: item.id }));
}

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const definition = localeDefinition(locale);
  return (
    <html lang={locale} dir={definition.direction}>
      <body>
        <LocaleProvider locale={locale}>
          <LanguageProvider>
            <header className="site-header">
              <a
                className="brand"
                href={`/${locale}/`}
                aria-label={ui(locale, "nav.home")}
              >
                <span className="brand-mark" aria-hidden="true">
                  F<span>●</span>
                </span>
                faultscope
              </a>
              <nav aria-label="Main navigation">
                <a href={`/${locale}/cases/should-you-send-it-again/`}>
                  {ui(locale, "nav.cases")}
                </a>
                <a href={`/${locale}/languages/go/`}>
                  {ui(locale, "nav.lenses")}
                </a>
                <a href={`/${locale}/about/`}>{ui(locale, "nav.about")}</a>
              </nav>
              <GlobalLocaleSelector />
              <GlobalLanguageSelector />
            </header>
            {children}
            <footer className="site-footer">
              <span>{ui(locale, "footer.preview")}</span>
              <span>{ui(locale, "footer.method")}</span>
            </footer>
          </LanguageProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
