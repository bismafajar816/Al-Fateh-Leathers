import { notFound } from "next/navigation";
import Link from "next/link";
import type { SortOrder } from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";
import {
  GENDERS,
  GENDER_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  type Gender,
  type Category
} from "@/lib/constants";
import type { IProduct } from "@/models/Product";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GenderCategoryPage({
  params,
  searchParams
}: {
  params: { gender: string; category: string };
  searchParams: SearchParams;
}) {
  if (!GENDERS.includes(params.gender as Gender) || !CATEGORIES.includes(params.category as Category)) notFound();
  const gender = params.gender as Gender;
  const category = params.category as Category;

  const query = getValue(searchParams.q)?.trim() || "";
  const minPrice = getValue(searchParams.min) || "";
  const maxPrice = getValue(searchParams.max) || "";
  const sort = getValue(searchParams.sort) || "newest";

  // Both segments are fixed by the URL — this page always shows this department's
  // products in this category. Neither gender nor category can be overridden by a
  // query param here (that's what /shop/[gender] and /shop/category/[category] are for).
  const filter: Record<string, unknown> = { isActive: true, gender, category };

  if (query) filter.$text = { $search: query };
  const price: Record<string, number> = {};
  if (minPrice !== "" && Number.isFinite(Number(minPrice))) price.$gte = Number(minPrice);
  if (maxPrice !== "" && Number.isFinite(Number(maxPrice))) price.$lte = Number(maxPrice);
  if (Object.keys(price).length) filter.price = price;

  const sortOrder: Record<string, SortOrder> =
    sort === "price-asc"
      ? { price: 1 }
      : sort === "price-desc"
        ? { price: -1 }
        : sort === "name"
          ? { name: 1 }
          : { createdAt: -1 };

  await connectDB();
  const products = (await Product.find(filter).sort(sortOrder).lean()) as unknown as IProduct[];

  return (
    <div>
      <nav className="mb-4 text-xs text-leather-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/shop/${gender}`} className="hover:underline">
          {GENDER_LABELS[gender]}
        </Link>{" "}
        / {CATEGORY_LABELS[category]}
      </nav>

      <h1 className="mb-2 font-serif text-3xl text-leather-900">
        {GENDER_LABELS[gender]} {CATEGORY_LABELS[category]}
      </h1>
      <p className="mb-6 text-leather-500">{products.length} products</p>

      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/shop/${gender}/${c}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              c === category
                ? "border-leather-800 bg-leather-800 text-leather-50"
                : "border-leather-300 text-leather-800 hover:bg-leather-800 hover:text-leather-50"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
      </div>

      <ShopFilters
        action={`/shop/${gender}/${category}`}
        gender={gender}
        category={category}
        query={query}
        minPrice={minPrice}
        maxPrice={maxPrice}
        sort={sort}
      />

      {products.length === 0 ? (
        <p className="text-leather-500">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}