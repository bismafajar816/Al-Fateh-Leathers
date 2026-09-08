"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { GENDERS, GENDER_LABELS, CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { useState } from "react";
import { useCurrency, type DisplayCurrency } from "@/components/CurrencyProvider";

export default function SiteHeader() {
  const { totalQuantity } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-leather-100 bg-leather-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" aria-label="Al Fateh Leathers home" className="relative h-12 w-48 shrink-0 overflow-hidden sm:h-14 sm:w-56">
          <Image
            src="/uploads/Logo.png"
            alt="Al Fateh Leathers"
            width={2048}
            height={768}
            priority
            className="absolute left-1/2 top-1/2 h-auto w-[270px] max-w-none -translate-x-1/2 -translate-y-1/2 sm:w-[310px]"
          />
        </Link>

        <nav className="hidden gap-8 md:flex">
          {GENDERS.map((g) => (
            <div key={g} className="group relative" onMouseEnter={() => setOpen(g)} onMouseLeave={() => setOpen(null)}>
              <Link href={`/shop/${g}`} className="text-sm font-medium uppercase tracking-wide text-leather-800 hover:text-brass">
                {GENDER_LABELS[g]}
              </Link>
              {open === g && (
                <div className="absolute left-0 top-full w-44 rounded-md border border-leather-100 bg-white py-2 shadow-lg">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c}
                      href={`/shop/${g}/${c}`}
                      className="block px-4 py-2 text-sm text-leather-800 hover:bg-leather-50"
                    >
                      {CATEGORY_LABELS[c]}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-sm font-medium text-leather-800 hover:text-brass">
            Cart
            {totalQuantity > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[11px] font-bold text-white">
                {totalQuantity}
              </span>
            )}
          </Link>
          <div className="flex items-center rounded-md border border-leather-200 p-0.5 text-xs font-semibold">
            {(["EUR", "PKR"] as DisplayCurrency[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCurrency(option)}
                className={`rounded px-2 py-1 ${currency === option ? "bg-leather-800 text-white" : "text-leather-700 hover:text-brass"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto border-t border-leather-100 px-4 py-2 md:hidden">
        {GENDERS.map((g) => (
          <Link key={g} href={`/shop/${g}`} className="whitespace-nowrap text-xs font-medium uppercase text-leather-800">
            {GENDER_LABELS[g]}
          </Link>
        ))}
      </div>
    </header>
  );
}
