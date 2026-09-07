export const GENDERS = ["men", "women", "kids"] as const;
export type Gender = (typeof GENDERS)[number];

export const CATEGORIES = ["jackets", "wallets", "belts", "gloves"] as const;
export type Category = (typeof CATEGORIES)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids"
};

export const CATEGORY_LABELS: Record<Category, string> = {
  jackets: "Jackets",
  wallets: "Wallets",
  belts: "Belts",
  gloves: "Gloves"
};

export const CURRENCY = process.env.STORE_CURRENCY || "EUR";
export const CURRENCY_SYMBOL = "€";

export function formatPrice(amount: number) {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}

export const ORDER_STATUSES = [
  "pending_payment", // customer placed order, awaiting bank transfer
  "payment_received", // admin confirmed payment
  "processing",
  "shipped",
  "delivered",
  "cancelled"
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  payment_received: "Payment Received",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};
