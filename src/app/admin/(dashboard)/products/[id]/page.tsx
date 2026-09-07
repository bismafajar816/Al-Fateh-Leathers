import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductForm from "@/components/ProductForm";
import DeleteProductButton from "@/components/DeleteProductButton";
import type { IProduct } from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await connectDB();
  const product = (await Product.findById(params.id).lean()) as unknown as IProduct | null;
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-leather-900">Edit Product</h1>
        <DeleteProductButton productId={product._id} />
      </div>
      <ProductForm
        productId={product._id}
        initial={{
          name: product.name,
          description: product.description,
          gender: product.gender,
          category: product.category,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          material: product.material || "",
          images: product.images,
          variants: product.variants.map((v) => ({ size: v.size, color: v.color || "", stock: v.stock })),
          featured: product.featured,
          isActive: product.isActive
        }}
      />
    </div>
  );
}
