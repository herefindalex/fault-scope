import type { Metadata } from "next";
import "./style.css";
import {
  LanguageProvider,
  GlobalLanguageSelector,
} from "../components/LanguageProvider";

export const metadata: Metadata = {
  title: "Faultscope — Distributed correctness lab",
  description:
    "An interactive learning lab for distributed application correctness.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <header className="site-header">
            <a className="brand" href="/" aria-label="Faultscope home">
              <span className="brand-mark" aria-hidden="true">
                F<span>●</span>
              </span>
              faultscope
            </a>
            <nav aria-label="Main navigation">
              <a href="/cases/should-you-send-it-again/">Case 01</a>
              <a href="/languages/go/">Code lenses</a>
            </nav>
            <GlobalLanguageSelector />
          </header>
          {children}
          <footer className="site-footer">
            <span>Faultscope · Case 01 preview</span>
            <span>Reason from evidence, contract, and property.</span>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
