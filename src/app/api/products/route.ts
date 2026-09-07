import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import slugify from "slugify";
import { z } from "zod";
import { CATEGORIES, GENDERS } from "@/lib/constants";

const VariantInput = z.object({
  size: z.string().min(1),
  color: z.string().optional(),
  stock: z.number().min(0),
  sku: z.string().optional()
});

const ProductInput = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  gender: z.enum(GENDERS),
  category: z.enum(CATEGORIES),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),
  images: z.array(z.string()).default([]),
  variants: z.array(VariantInput).default([]),
  material: z.string().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const gender = searchParams.get("gender");
  const category = searchParams.get("category");
  const search = searchParams.get("q");
  const featured = searchParams.get("featured");
  const includeInactive = searchParams.get("includeInactive") === "true";
  const requestedLimit = Number(searchParams.get("limit") || 60);
  const requestedPage = Number(searchParams.get("page") || 1);

  if (gender && !GENDERS.includes(gender as (typeof GENDERS)[number])) {
    return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
  }
  if (category && !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || !Number.isInteger(requestedPage) || requestedPage < 1) {
    return NextResponse.json({ error: "Page and limit must be positive integers" }, { status: 400 });
  }

  const limit = Math.min(requestedLimit, 100);
  const page = requestedPage;

  const filter: Record<string, unknown> = {};
  if (!includeInactive) filter.isActive = true;
  if (gender) filter.gender = gender;
  if (category) filter.category = category;
  if (featured) filter.featured = true;
  if (search?.trim()) filter.$text = { $search: search.trim() };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter)
  ]);

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const parsed = ProductInput.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const baseSlug = slugify(data.name, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;
  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${i++}`;
  }

  const product = await Product.create({ ...data, slug });
  return NextResponse.json({ product }, { status: 201 });
}
