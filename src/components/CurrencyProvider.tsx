"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type DisplayCurrency = "EUR" | "PKR";

const EUR_TO_PKR = 305;
const STORAGE_KEY = "afl_display_currency";

interface CurrencyContextValue {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
  formatCurrency: (eurAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<DisplayCurrency>("EUR");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "EUR" || saved === "PKR") setCurrency(saved);
  }, []);

  function changeCurrency(nextCurrency: DisplayCurrency) {
    setCurrency(nextCurrency);
    localStorage.setItem(STORAGE_KEY, nextCurrency);
  }

  function formatCurrency(eurAmount: number) {
    if (currency === "PKR") {
      return `PKR ${(eurAmount * EUR_TO_PKR).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
    }
    return `€${eurAmount.toFixed(2)}`;
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency: changeCurrency, formatCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
