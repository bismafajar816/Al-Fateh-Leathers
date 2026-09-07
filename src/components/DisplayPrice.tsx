"use client";

import { useCurrency } from "./CurrencyProvider";

export default function DisplayPrice({ amount }: { amount: number }) {
  const { formatCurrency } = useCurrency();
  return <>{formatCurrency(amount)}</>;
}
