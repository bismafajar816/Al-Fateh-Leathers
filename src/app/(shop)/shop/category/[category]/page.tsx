import { notFound } from "next/navigation";
import Link from "next/link";
import type { SortOrder } from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";
import { GENDERS, CATEGORIES, CATEGORY_LABELS, type Gender, type Category } from "@/lib/constants";
import type { IProduct } from "@/models/Product";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// A pure category browse across every department — this is what a "Shop by Category"
// tile on the homepage should link to. Use /shop/[gender]/[category] instead when you
// want a single department's products in this category.
export default async function CategoryOnlyPage({
  params,
  searchParams
}: {
  params: { category: string };
  searchParams: SearchParams;
}) {
  if (!CATEGORIES.includes(params.category as Category)) notFound();
  const category = params.category as Category;

  const query = getValue(searchParams.q)?.trim() || "";
  const selectedGender = getValue(searchParams.gender) || "";
  const minPrice = getValue(searchParams.min) || "";
  const maxPrice = getValue(searchParams.max) || "";
  const sort = getValue(searchParams.sort) || "newest";

  const filter: Record<string, unknown> = { isActive: true, category };
  if (GENDERS.includes(selectedGender as Gender)) filter.gender = selectedGender;
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
        / {CATEGORY_LABELS[category]}
      </nav>

      <h1 className="mb-2 font-serif text-3xl text-leather-900">{CATEGORY_LABELS[category]}</h1>
      <p className="mb-6 text-leather-500">{products.length} products across all departments</p>

      <div className="sticky top-[72px] z-30 -mx-0 border-b border-leather-200/80 bg-leather-50/95 pb-4 pt-4 backdrop-blur-sm">
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/shop/category/${c}`}
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
          action={`/shop/category/${category}`}
          category={category}
          selectedGender={selectedGender}
          query={query}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
        />
      </div>

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