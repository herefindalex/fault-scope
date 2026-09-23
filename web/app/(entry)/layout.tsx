import type { Metadata } from "next";
import "../style.css";

export const metadata: Metadata = {
  title: "FaultScope — Choose your language",
  description:
    "Interactive learning lab for distributed application correctness.",
  robots: { index: false, follow: true },
};

export default function EntryLayout({
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
