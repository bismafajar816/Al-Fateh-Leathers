"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import DisplayPrice from "@/components/DisplayPrice";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="mb-3 font-serif text-2xl text-leather-900">Your cart is empty</h1>
        <p className="mb-6 text-leather-500">Browse our collection and add something you love.</p>
        <Link href="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-leather-900">Your Cart</h1>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="card flex gap-4 p-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-leather-100">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-leather-400">No image</div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/product/${item.slug}`} className="font-medium text-leather-900 hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-xs text-leather-500">
                    {item.size ? `Size: ${item.size}` : ""}
                    {item.color ? ` · Color: ${item.color}` : ""}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-leather-300">
                    <button
                      className="px-2.5 py-1 text-sm text-leather-800"
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button
                      className="px-2.5 py-1 text-sm text-leather-800"
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-leather-900"><DisplayPrice amount={item.price * item.quantity} /></span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId, item.size, item.color)}
                className="self-start text-xs text-leather-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-leather-700">Order Summary</h2>
          <div className="flex justify-between text-sm text-leather-700">
            <span>Subtotal</span>
            <span><DisplayPrice amount={subtotal} /></span>
          </div>
          <p className="mt-1 text-xs text-leather-400">Shipping calculated at checkout.</p>
          <Link href="/checkout" className="btn-primary mt-5 w-full">
            Proceed to Checkout
          </Link>
          <Link href="/" className="btn-secondary mt-3 w-full">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}