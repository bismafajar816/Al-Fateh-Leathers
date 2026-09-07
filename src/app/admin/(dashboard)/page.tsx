import Link from "next/link";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/constants";
import type { IOrder } from "@/models/Order";
import type { OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

type RevenuePoint = { label: string; value: number };
type StatusPoint = { status: OrderStatus; count: number };

async function getStats() {
  await connectDB();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  const [totalOrders, pendingPayment, totalProducts, recentOrders, revenueAgg, monthlyRevenueAgg, statusAgg] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "pending_payment" }),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(6).lean(),
    Order.aggregate([
      { $match: { status: { $in: ["payment_received", "processing", "shipped", "delivered"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ["payment_received", "processing", "shipped", "delivered"] }
        }
      },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, total: { $sum: "$total" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
  ]);

  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  const monthlyRevenue: RevenuePoint[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(sixMonthsAgo);
    date.setMonth(sixMonthsAgo.getMonth() + index);
    const match = monthlyRevenueAgg.find(
      (point: { _id: { year: number; month: number } }) => point._id.year === date.getFullYear() && point._id.month === date.getMonth() + 1
    );
    return { label: monthFormatter.format(date), value: match?.total || 0 };
  });
  const statusCounts: StatusPoint[] = Object.keys(ORDER_STATUS_LABELS).map((status) => ({
    status: status as OrderStatus,
    count: statusAgg.find((point: { _id: string }) => point._id === status)?.count || 0
  }));

  return {
    totalOrders,
    pendingPayment,
    totalProducts,
    recentOrders: recentOrders as unknown as IOrder[],
    revenue: revenueAgg[0]?.total || 0,
    monthlyRevenue,
    statusCounts
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-leather-900">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={String(stats.totalOrders)} />
        <StatCard label="Pending Payment" value={String(stats.pendingPayment)} accent />
        <StatCard label="Products" value={String(stats.totalProducts)} />
        <StatCard label="Confirmed Revenue" value={formatPrice(stats.revenue)} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <RevenueChart points={stats.monthlyRevenue} />
        <StatusChart points={stats.statusCounts} />
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brass hover:underline">
            View all
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-leather-500">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-leather-100 text-left text-xs uppercase text-leather-500">
                <th className="pb-2">Order</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-leather-50 last:border-none">
                  <td className="py-2">
                    <Link href={`/admin/orders/${order._id}`} className="text-leather-900 hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-2 text-leather-700">{order.customer.fullName}</td>
                  <td className="py-2 text-leather-700">{ORDER_STATUS_LABELS[order.status]}</td>
                  <td className="py-2 text-right text-leather-900">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <section className="card p-5">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Revenue overview</h2>
          <p className="mt-1 text-xs text-leather-500">Confirmed revenue, last six months</p>
        </div>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">EUR</span>
      </div>
      <div className="flex h-48 items-end gap-3 border-b border-leather-200 px-1 pb-2">
        {points.map((point) => (
          <div key={point.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="invisible text-[10px] text-leather-600 group-hover:visible">{formatPrice(point.value)}</span>
            <div
              className="w-full max-w-12 rounded-t bg-gradient-to-t from-leather-800 to-brass transition-all duration-200 group-hover:from-brass group-hover:to-leather-600"
              style={{ height: `${Math.max((point.value / max) * 100, point.value ? 5 : 1)}%` }}
              title={`${point.label}: ${formatPrice(point.value)}`}
            />
            <span className="text-[10px] uppercase text-leather-500">{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusChart({ points }: { points: StatusPoint[] }) {
  const max = Math.max(...points.map((point) => point.count), 1);

  return (
    <section className="card p-5">
      <div className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Order status</h2>
        <p className="mt-1 text-xs text-leather-500">Current order pipeline</p>
      </div>
      <div className="space-y-3">
        {points.map((point) => (
          <div key={point.status}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-leather-700">{ORDER_STATUS_LABELS[point.status]}</span>
              <span className="font-semibold text-leather-900">{point.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-leather-100">
              <div
                className="h-full rounded-full bg-brass transition-all duration-300"
                style={{ width: `${(point.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-leather-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? "text-brass" : "text-leather-900"}`}>{value}</p>
    </div>
  );
}
