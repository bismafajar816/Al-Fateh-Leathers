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
    <header className="sticky top-0 z-40 border-b border-leather-200/80 bg-leather-50/90 shadow-[0_1px_0_rgba(47,32,19,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <Link href="/" aria-label="Al Fateh Leathers home" className="relative h-10 w-28 shrink-0 overflow-hidden sm:h-14 sm:w-56">
          <Image
            src="/uploads/Logo.png"
            alt="Al Fateh Leathers"
            width={2048}
            height={768}
            priority
            className="absolute left-1/2 top-1/2 h-auto w-[200px] max-w-none -translate-x-1/2 -translate-y-1/2 sm:w-[310px]"
          />
        </Link>

        <nav className="hidden gap-8 md:flex">
          {GENDERS.map((g) => (
            <div key={g} className="group relative" onMouseEnter={() => setOpen(g)} onMouseLeave={() => setOpen(null)}>
              <Link href={`/shop/${g}`} className="text-sm font-medium uppercase tracking-wide text-leather-800 hover:text-brass">
                {GENDER_LABELS[g]}
              </Link>
              {open === g && (
                <div className="absolute left-0 top-full w-44 rounded-xl border border-leather-100 bg-white py-2 shadow-lg">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c}
                      href={`/shop/${g}/${c}`}
                      className="block px-4 py-2 text-sm text-leather-800 transition hover:bg-leather-50 hover:text-brass"
                    >
                      {CATEGORY_LABELS[c]}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/cart" className="relative inline-flex items-center justify-center rounded-full border border-leather-200 bg-white px-2.5 py-1.5 text-sm font-medium text-leather-800 shadow-sm transition hover:border-leather-300 hover:text-brass sm:px-3">
            Cart
            {totalQuantity > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-white">
                {totalQuantity}
              </span>
            )}
          </Link>

          <div className="flex items-center rounded-full border border-leather-200 bg-white p-0.5 text-[11px] font-semibold shadow-sm sm:text-xs">
            {(["EUR", "PKR"] as DisplayCurrency[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCurrency(option)}
                className={`rounded-full px-2.5 py-1.5 transition ${currency === option ? "bg-leather-800 text-white" : "text-leather-700 hover:text-brass"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-leather-200/80 bg-white/80 px-3 py-2.5 md:hidden">
        <div className="flex justify-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {GENDERS.map((g) => (
            <Link
              key={g}
              href={`/shop/${g}`}
              className="whitespace-nowrap rounded-full border border-leather-200 bg-leather-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-leather-800 shadow-sm transition hover:border-leather-300 hover:bg-leather-100"
            >
              {GENDER_LABELS[g]}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
