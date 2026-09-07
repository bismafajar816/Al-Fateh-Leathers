import Link from "next/link";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/constants";
import type { IOrder } from "@/models/Order";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  await connectDB();
  const filter = searchParams.status ? { status: searchParams.status } : {};
  const orders = (await Order.find(filter).sort({ createdAt: -1 }).lean()) as unknown as IOrder[];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-leather-900">Orders</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 text-xs ${
            !searchParams.status ? "border-leather-800 bg-leather-800 text-white" : "border-leather-300 text-leather-700"
          }`}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              searchParams.status === s
                ? "border-leather-800 bg-leather-800 text-white"
                : "border-leather-300 text-leather-700"
            }`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-leather-100 text-left text-xs uppercase text-leather-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t border-leather-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order._id}`} className="font-medium text-leather-900 hover:underline">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-leather-600">
                  {order.customer.fullName}
                  <br />
                  <span className="text-xs text-leather-400">{order.customer.email}</span>
                </td>
                <td className="px-4 py-3 text-leather-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <StatusPill status={order.status} />
                </td>
                <td className="px-4 py-3 text-right text-leather-900">{formatPrice(order.total)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-leather-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: IOrder["status"] }) {
  const colors: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-700",
    payment_received: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700"
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${colors[status] || "bg-leather-100 text-leather-600"}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
