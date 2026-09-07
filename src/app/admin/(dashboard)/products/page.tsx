import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { formatPrice, GENDER_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import type { IProduct } from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() || "";
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await connectDB();
  const filter = query
    ? {
        $or: [
          { name: { $regex: escapedQuery, $options: "i" } },
          { slug: { $regex: escapedQuery, $options: "i" } },
          { material: { $regex: escapedQuery, $options: "i" } }
        ]
      }
    : {};
  const products = (await Product.find(filter).sort({ createdAt: -1 }).lean()) as unknown as IProduct[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-leather-900">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + New Product
        </Link>
      </div>

      <form className="mx-auto mb-6 flex max-w-xl gap-2" action="/admin/products">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search by name, slug, or material"
          className="input"
        />
        <button type="submit" className="btn-primary whitespace-nowrap">
          Search
        </button>
        {query && (
          <Link href="/admin/products" className="btn-secondary whitespace-nowrap">
            Clear
          </Link>
        )}
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-leather-100 text-left text-xs uppercase text-leather-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-leather-50">
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded bg-leather-100">
                    {p.images[0] && <Image src={p.images[0]} alt="" fill unoptimized className="object-cover" />}
                  </div>
                  <span className="font-medium text-leather-900">{p.name}</span>
                </td>
                <td className="px-4 py-3 text-leather-600">{GENDER_LABELS[p.gender]}</td>
                <td className="px-4 py-3 text-leather-600">{CATEGORY_LABELS[p.category]}</td>
                <td className="px-4 py-3 text-leather-900">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.isActive ? "bg-green-100 text-green-700" : "bg-leather-100 text-leather-500"
                    }`}
                  >
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p._id}`} className="text-brass hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-leather-500">
                  {query ? "No products matched your search." : "No products yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}