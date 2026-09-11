import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import { GENDER_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import type { IProduct } from "@/models/Product";
import { generateProductSchema } from "@/lib/schema";
export const dynamic = "force-dynamic";

async function getProduct(slug: string): Promise<IProduct | null> {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true }).lean();
  return product ? (product as unknown as IProduct) : null;
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const productSchema = generateProductSchema(product);

  return (
  <div>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
      {/* ...rest of your existing JSX unchanged... */}
      <nav className="mb-6 text-xs text-leather-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/shop/${product.gender}`} className="hover:underline">
          {GENDER_LABELS[product.gender]}
        </Link>{" "}
        /{" "}
        <Link href={`/shop/${product.gender}/${product.category}`} className="hover:underline">
          {CATEGORY_LABELS[product.category]}
        </Link>{" "}
        / {product.name}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div>
          <h1 className="font-serif text-3xl text-leather-900">{product.name}</h1>
          <div className="mt-6">
            <ProductPurchaseBox product={product} />
          </div>
          <div className="mt-8 border-t border-leather-100 pt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-leather-700">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-leather-700">{product.description}</p>
          </div>
          <div className="mt-6 rounded-md bg-leather-100 p-4 text-xs text-leather-700">
            Payment by direct bank transfer. Full account details are shown at checkout and on your confirmation
            email.
          </div>
        </div>
      </div>
    </div>
  );
}