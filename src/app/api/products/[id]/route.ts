import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { deleteProductImage } from "@/lib/r2";
import { z } from "zod";
import { CATEGORIES, GENDERS } from "@/lib/constants";

const VariantInput = z.object({
  size: z.string().min(1),
  color: z.string().optional(),
  stock: z.number().min(0),
  sku: z.string().optional()
});

const ProductUpdateInput = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(1).optional(),
  gender: z.enum(GENDERS).optional(),
  category: z.enum(CATEGORIES).optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).nullable().optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(VariantInput).optional(),
  material: z.string().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const product = await Product.findById(params.id).lean();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const parsed = ProductUpdateInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await Product.findByIdAndUpdate(params.id, parsed.data, { new: true });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const product = await Product.findByIdAndDelete(params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Promise.all(product.images.map((url: string) => deleteProductImage(url).catch(() => null)));

  return NextResponse.json({ ok: true });
}
