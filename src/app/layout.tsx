import type { Metadata } from "next";
import { CurrencyProvider } from "@/components/CurrencyProvider";
// @ts-expect-error Next.js handles this global stylesheet import at build time.
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Fateh Leathers — Genuine Leather Jackets, Wallets, Belts & Gloves",
  description:
    "Al Fateh Leathers offers genuine leather jackets, wallets, belts and gloves for men, women and kids. Prices in EUR."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><CurrencyProvider>{children}</CurrencyProvider></body>
    </html>
  );
}
