import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import HeroImageRotator from "@/components/HeroImageRotator";
import { GENDERS, GENDER_LABELS, CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";
import type { IProduct } from "@/models/Product";

export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif|gif)$/i;

// Any images dropped directly into public/hero/ are picked up here and rotated
// on the homepage. See public/hero/README.md.
function getLocalHeroImages(): string[] {
  const dir = path.join(process.cwd(), "public", "hero");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXTENSIONS.test(f))
      .sort()
      .map((f) => `/hero/${f}`);
  } catch {
    return [];
  }
}

async function getFeatured(): Promise<IProduct[]> {
  await connectDB();
  const products = await Product.find({ isActive: true, featured: true }).sort({ createdAt: -1 }).limit(8).lean();
  if (products.length > 0) return products as unknown as IProduct[];
  const fallback = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(8).lean();
  return fallback as unknown as IProduct[];
}

export default async function HomePage() {
  const [featured, settings] = await Promise.all([getFeatured(), getSettings()]);
  const heroImages = getLocalHeroImages();

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-xl bg-leather-900 text-leather-50">
        <div className="grid gap-8 px-8 py-14 md:grid-cols-2 md:px-14">
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.2em] text-brass">Genuine Leather, Since Generations</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
              Al Fateh <span className="text-brass">Leathers</span>
            </h1>
            <p className="mt-4 max-w-md text-leather-200">
              Handcrafted leather jackets, wallets, belts and gloves for men, women and kids. Timeless quality, made
              to last.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/shop/men" className="btn-primary">
                Shop Men
              </Link>
              <Link href="/shop/women" className="btn-secondary !border-leather-50 !text-leather-50 hover:!bg-leather-50 hover:!text-leather-900">
                Shop Women
              </Link>
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <div className="relative h-64 w-64 overflow-hidden rounded-full border-2 border-brass/40">
              {heroImages.length > 0 ? (
                <HeroImageRotator images={heroImages} intervalMs={30000} />
              ) : (
                settings.heroImage && <Image src={settings.heroImage} alt="" fill unoptimized className="object-cover" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center font-serif text-2xl text-leather-900">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/shop/category/${c}`}
              className="card group flex flex-col items-center justify-center gap-2 p-8 text-center transition duration-200 hover:-translate-y-1 hover:border-brass hover:bg-leather-50 hover:shadow-lg"
            >
              <span className="font-serif text-lg text-leather-900 transition-colors group-hover:text-brass">{CATEGORY_LABELS[c]}</span>
              <span className="text-xs uppercase tracking-wide text-leather-500 transition-colors group-hover:text-leather-800">Men · Women · Kids</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center font-serif text-2xl text-leather-900">Shop by Department</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {GENDERS.map((g) => (
            <Link
              key={g}
              href={`/shop/${g}`}
              className="card group flex h-40 items-center justify-center bg-leather-800 text-leather-50 transition duration-200 hover:-translate-y-1 hover:bg-leather-700 hover:shadow-lg"
            >
              <span className="font-serif text-2xl text-black transition-transform duration-200 group-hover:scale-105">{GENDER_LABELS[g]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-leather-900">Featured Pieces</h2>
        </div>
        {featured.length === 0 ? (
          <p className="text-leather-500">
            No products yet — add your first product from the{" "}
            <Link href="/admin" className="underline">
              admin dashboard
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}