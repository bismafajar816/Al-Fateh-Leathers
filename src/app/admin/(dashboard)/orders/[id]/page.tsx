import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderStatusUpdater from "@/components/OrderStatusUpdater";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/constants";
import type { IOrder } from "@/models/Order";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await connectDB();
  const order = (await Order.findById(params.id).lean()) as unknown as IOrder | null;
  if (!order) notFound();

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl text-leather-900">Order #{order.orderNumber}</h1>
      <p className="mb-6 text-sm text-leather-500">Placed {new Date(order.createdAt).toLocaleString()}</p>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-leather-700">Items</h2>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-leather-700">
                    {item.name} × {item.quantity}
                    {item.size ? ` (${item.size}${item.color ? ", " + item.color : ""})` : ""}
                  </span>
                  <span className="text-leather-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-leather-100 pt-4 text-sm">
              <div className="flex justify-between text-leather-700">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-leather-700">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold text-leather-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-leather-700">Customer</h2>
            <p className="text-sm text-leather-700">{order.customer.fullName}</p>
            <p className="text-sm text-leather-700">{order.customer.email}</p>
            <p className="text-sm text-leather-700">{order.customer.phone}</p>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-leather-700">Shipping Address</h2>
            <p className="text-sm text-leather-700">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
            {order.notes && (
              <p className="mt-3 rounded-md bg-leather-50 p-3 text-sm text-leather-600">
                <strong>Order note:</strong> {order.notes}
              </p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-leather-700">Payment</h2>
            <p className="text-sm text-leather-700">Method: Bank Transfer</p>
            <p className="text-sm text-leather-700">
              Account shown to customer: {order.bankDetailsShown.accountTitle} — {order.bankDetailsShown.accountNumber} (
              {order.bankDetailsShown.bankName})
            </p>
            {order.paymentReference && (
              <p className="mt-1 text-sm text-leather-700">Reference on file: {order.paymentReference}</p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-leather-700">Status History</h2>
            <ul className="space-y-2 text-sm text-leather-700">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex justify-between border-b border-leather-50 pb-2 last:border-none">
                  <span>
                    {ORDER_STATUS_LABELS[h.status as keyof typeof ORDER_STATUS_LABELS] || h.status}
                    {h.note ? ` — ${h.note}` : ""}
                  </span>
                  <span className="text-xs text-leather-400">{new Date(h.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <OrderStatusUpdater orderId={order._id} currentStatus={order.status} currentReference={order.paymentReference} />
        </div>
      </div>
    </div>
  );
}
