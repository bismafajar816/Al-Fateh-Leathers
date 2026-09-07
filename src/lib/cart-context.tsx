"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
  maxStock: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, size: string | undefined, color: string | undefined, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalQuantity: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "afl_cart_v1";

function sameLine(a: CartItem, productId: string, size?: string, color?: string) {
  return a.productId === productId && a.size === size && a.color === color;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt cart data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => sameLine(p, item.productId, item.size, item.color));
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, existing.maxStock || 99);
        return prev.map((p) => (sameLine(p, item.productId, item.size, item.color) ? { ...p, quantity: newQty } : p));
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string, size?: string, color?: string) => {
    setItems((prev) => prev.filter((p) => !sameLine(p, productId, size, color)));
  };

  const updateQuantity = (productId: string, size: string | undefined, color: string | undefined, quantity: number) => {
    setItems((prev) =>
      prev.map((p) =>
        sameLine(p, productId, size, color) ? { ...p, quantity: Math.max(1, Math.min(quantity, p.maxStock || 99)) } : p
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
