"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import DisplayPrice from "@/components/DisplayPrice";

interface SettingsShape {
  storeName: string;
  ownerEmail: string;
  ownerWhatsapp?: string;
  bank: { accountTitle: string; bankName: string; accountNumber: string; iban?: string; swift?: string };
  shippingFeeFlat: number;
  freeShippingThreshold?: number | null;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [settings, setSettings] = useState<SettingsShape | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    notes: ""
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setSettings(null));
  }, []);

  const shippingFee =
    settings && settings.freeShippingThreshold && subtotal >= settings.freeShippingThreshold
      ? 0
      : settings?.shippingFeeFlat ?? 0;
  const total = subtotal + shippingFee;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity
          })),
          customer: { fullName: form.fullName, email: form.email, phone: form.phone },
          shippingAddress: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state || undefined,
            postalCode: form.postalCode,
            country: form.country
          },
          notes: form.notes || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not place order. Please check your details.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${data.order._id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="mb-3 font-serif text-2xl text-leather-900">Your cart is empty</h1>
        <Link href="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-leather-900">Checkout</h1>
      <div className="grid gap-10 md:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 md:col-span-2">
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-leather-700">Contact Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name</label>
                <input required className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input required className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email</label>
                <input
                  required
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-leather-700">Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Address Line 1</label>
                <input required className="input" value={form.line1} onChange={(e) => update("line1", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line 2 (optional)</label>
                <input className="input" value={form.line2} onChange={(e) => update("line2", e.target.value)} />
              </div>
              <div>
                <label className="label">City</label>
                <input required className="input" value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <label className="label">State / Region</label>
                <input className="input" value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input required className="input" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
              </div>
              <div>
                <label className="label">Country</label>
                <input required className="input" value={form.country} onChange={(e) => update("country", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Order Notes (optional)</label>
                <textarea className="input" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-leather-700">Payment Method</h2>
            <p className="mb-3 text-sm text-leather-700">
              Payment is by <strong>direct bank transfer</strong>. Once you place your order, we'll show you the
              owner's bank account details below and email them to you — please transfer the total amount and then
              contact us so we can confirm your payment.
            </p>
            {settings ? (
              <div className="rounded-md border border-leather-200 bg-leather-50 p-4 text-sm">
                <Row label="Account Title" value={settings.bank.accountTitle} />
                <Row label="Bank" value={settings.bank.bankName} />
                <Row label="Account Number" value={settings.bank.accountNumber} />
                {settings.bank.iban && <Row label="IBAN" value={settings.bank.iban} />}
                {settings.bank.swift && <Row label="SWIFT/BIC" value={settings.bank.swift} />}
                {settings.ownerWhatsapp && <Row label="Contact (WhatsApp)" value={settings.ownerWhatsapp} />}
                <Row label="Contact (Email)" value={settings.ownerEmail} />
              </div>
            ) : (
              <p className="text-xs text-leather-400">Loading bank details…</p>
            )}
          </div>

          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Placing order…" : <>Place Order — <DisplayPrice amount={total} /></>}
          </button>
        </form>

        <div className="card h-fit p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-leather-700">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                <span className="text-leather-700">
                  {item.name} × {item.quantity}
                  {item.size ? ` (${item.size})` : ""}
                </span>
                <span className="text-leather-900"><DisplayPrice amount={item.price * item.quantity} /></span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-leather-100 pt-4 text-sm">
            <div className="flex justify-between text-leather-700">
              <span>Subtotal</span>
              <span><DisplayPrice amount={subtotal} /></span>
            </div>
            <div className="flex justify-between text-leather-700">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "Free" : <DisplayPrice amount={shippingFee} />}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold text-leather-900">
              <span>Total</span>
              <span><DisplayPrice amount={total} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-leather-100 py-1.5 last:border-none">
      <span className="text-leather-500">{label}</span>
      <span className="font-medium text-leather-900">{value}</span>
    </div>
  );
}
