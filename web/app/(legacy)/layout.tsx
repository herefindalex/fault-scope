import type { Metadata } from "next";
import "../style.css";

export const metadata: Metadata = { robots: { index: false, follow: true } };
export default function LegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
