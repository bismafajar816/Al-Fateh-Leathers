"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this product permanently? This cannot be undone.")) return;
    setLoading(true);
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setLoading(false);
      alert("Could not delete product.");
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-sm text-red-600 hover:underline disabled:opacity-50">
      {loading ? "Deleting…" : "Delete Product"}
    </button>
  );
}
