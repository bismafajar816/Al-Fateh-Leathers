import type { Metadata } from "next";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { generateOrganizationSchema } from "@/lib/schema";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Fateh Leather Garments — Genuine Leather Jackets, Wallets, Belts & Gloves",
  description:
    "Al Fateh Leathers offers genuine leather jackets, wallets, belts and gloves for men, women and kids. Prices in EUR."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateOrganizationSchema();

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <CurrencyProvider>{children}</CurrencyProvider>
      </body>
    </html>
  );
}