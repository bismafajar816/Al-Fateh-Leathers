import { notFound } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import DisplayPrice from "@/components/DisplayPrice";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { IOrder } from "@/models/Order";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectDB();
  const order = (await Order.findById(params.id).lean()) as unknown as IOrder | null;
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leather-800 text-2xl text-leather-50">
          ✓
        </div>
        <h1 className="font-serif text-3xl text-leather-900">Thank you, {order.customer.fullName.split(" ")[0]}!</h1>
        <p className="mt-2 text-leather-600">
          Your order <strong>#{order.orderNumber}</strong> has been received.
        </p>
        <span className="mt-3 inline-block rounded-full bg-leather-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-leather-700">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="card mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-leather-700">Order Details</h2>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-leather-700">
                {item.name} × {item.quantity}
                {item.size ? ` (${item.size}${item.color ? ", " + item.color : ""})` : ""}
              </span>
              <span className="text-leather-900"><DisplayPrice amount={item.price * item.quantity} /></span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-leather-100 pt-4 text-sm">
          <div className="flex justify-between text-leather-700">
            <span>Subtotal</span>
            <span><DisplayPrice amount={order.subtotal} /></span>
          </div>
          <div className="flex justify-between text-leather-700">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : <DisplayPrice amount={order.shippingFee} />}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-leather-900">
            <span>Total</span>
            <span><DisplayPrice amount={order.total} /></span>
          </div>
        </div>
      </div>

      <div className="card mb-6 border-brass/50 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-leather-700">
          Pay by Bank Transfer
        </h2>
        <p className="mb-3 text-sm text-leather-700">
          Please transfer <strong><DisplayPrice amount={order.total} /></strong> to the account below, then contact us with your
          order number so we can confirm your payment and start processing your order.
        </p>
        <div className="rounded-md border border-leather-200 bg-leather-50 p-4 text-sm">
          <Row label="Account Title" value={order.bankDetailsShown.accountTitle} />
          <Row label="Bank" value={order.bankDetailsShown.bankName} />
          <Row label="Account Number" value={order.bankDetailsShown.accountNumber} />
          {order.bankDetailsShown.iban && <Row label="IBAN" value={order.bankDetailsShown.iban} />}
          {order.bankDetailsShown.swift && <Row label="SWIFT/BIC" value={order.bankDetailsShown.swift} />}
        </div>
      </div>

      <div className="text-center">
        <Link href="/" className="btn-primary">
          Continue Shopping
        </Link>
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
