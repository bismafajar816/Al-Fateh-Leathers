"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GENDERS, GENDER_LABELS, CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

export interface VariantForm {
  size: string;
  color: string;
  stock: number;
}

export interface ProductFormValues {
  name: string;
  description: string;
  gender: string;
  category: string;
  price: string;
  compareAtPrice: string;
  material: string;
  images: string[];
  variants: VariantForm[];
  featured: boolean;
  isActive: boolean;
}

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  gender: "men",
  category: "jackets",
  price: "",
  compareAtPrice: "",
  material: "Genuine Leather",
  images: [],
  variants: [{ size: "M", color: "", stock: 0 }],
  featured: false,
  isActive: true
};

export default function ProductForm({
  initial,
  productId
}: {
  initial?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploadedUrls: string[] = [];
      // Upload sequentially so one failure doesn't abandon the rest silently and errors are clear.
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Upload failed for "${file.name}".`);
        uploadedUrls.push(data.url);
      }
      set("images", [...form.images, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImageAt(index: number) {
    set(
      "images",
      form.images.filter((_, i) => i !== index)
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.images.length) return;
    const next = [...form.images];
    [next[index], next[target]] = [next[target], next[index]];
    set("images", next);
  }

  function updateVariant(index: number, patch: Partial<VariantForm>) {
    set(
      "variants",
      form.variants.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  function addVariant() {
    set("variants", [...form.variants, { size: "", color: "", stock: 0 }]);
  }

  function removeVariant(index: number) {
    set(
      "variants",
      form.variants.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description,
      gender: form.gender,
      category: form.category,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      material: form.material,
      images: form.images,
      variants: form.variants
        .filter((v) => v.size.trim())
        .map((v) => ({ size: v.size, color: v.color || undefined, stock: Number(v.stock) || 0 })),
      featured: form.featured,
      isActive: form.isActive
    };

    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      setError("Please check the form — some fields are invalid.");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Basic Info</h2>
        <div>
          <label className="label">Product Name</label>
          <input required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            required
            rows={5}
            className="input"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Price (EUR)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Compare-at Price (optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={form.compareAtPrice}
              onChange={(e) => set("compareAtPrice", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Material</label>
            <input className="input" value={form.material} onChange={(e) => set("material", e.target.value)} />
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-leather-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-leather-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Active (visible in store)
          </label>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Images</h2>
        <p className="text-xs text-leather-500">
          Add as many photos as you like. The first image is the <strong>cover photo</strong> shown in product
          listings — use the arrows to reorder.
        </p>
        <div className="flex flex-wrap gap-3">
          {form.images.map((url, index) => (
            <div key={url + index} className="relative h-28 w-28 overflow-hidden rounded-md border border-leather-200">
              <Image src={url} alt="" fill unoptimized className="object-cover" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-leather-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-leather-50">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImageAt(index)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
                aria-label="Remove image"
              >
                ✕
              </button>
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/40 py-1">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  className="rounded bg-white/90 px-1.5 text-xs text-leather-800 disabled:opacity-30"
                  aria-label="Move image earlier"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === form.images.length - 1}
                  className="rounded bg-white/90 px-1.5 text-xs text-leather-800 disabled:opacity-30"
                  aria-label="Move image later"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="label">Upload Images (stored on Cloudflare R2)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
          {uploading && <p className="mt-1 text-xs text-leather-500">Uploading…</p>}
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">
            Sizes, Colors &amp; Stock
          </h2>
          <button type="button" onClick={addVariant} className="text-sm text-brass hover:underline">
            + Add variant
          </button>
        </div>
        <p className="text-xs text-leather-500">Leave empty if this product has no size/color options.</p>
        <div className="space-y-3">
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
              <div>
                <label className="label">Size</label>
                <input className="input" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} />
              </div>
              <div>
                <label className="label">Color</label>
                <input className="input" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} />
              </div>
              <div>
                <label className="label">Stock</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                />
              </div>
              <button type="button" onClick={() => removeVariant(i)} className="mb-1 text-xs text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving ? "Saving…" : productId ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}