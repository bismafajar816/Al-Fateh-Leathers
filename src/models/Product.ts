import mongoose, { Schema, models, model } from "mongoose";
import { CATEGORIES, GENDERS } from "@/lib/constants";

export interface IProductVariant {
  size: string;
  color?: string;
  stock: number;
  sku?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  gender: (typeof GENDERS)[number];
  category: (typeof CATEGORIES)[number];
  price: number; // EUR
  compareAtPrice?: number | null;
  images: string[]; // R2 public URLs
  variants: IProductVariant[];
  material?: string;
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IProductVariant>(
  {
    size: { type: String, required: true },
    color: { type: String },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String }
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    gender: { type: String, enum: GENDERS, required: true, index: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    images: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    material: { type: String, default: "Genuine Leather" },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" });

export default models.Product || model<IProduct>("Product", ProductSchema);
