"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import DisplayPrice from "@/components/DisplayPrice";
import type { IProduct, IProductVariant } from "@/models/Product";

export default function ProductPurchaseBox({ product }: { product: IProduct }) {
  const { addItem } = useCart();
  const router = useRouter();

  const sizes = useMemo(() => Array.from(new Set(product.variants.map((v) => v.size))), [product.variants]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0]);

  const colorsForSize = useMemo(
    () => product.variants.filter((v) => v.size === selectedSize).map((v) => v.color).filter(Boolean) as string[],
    [product.variants, selectedSize]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colorsForSize[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const hasVariants = product.variants.length > 0;
  const activeVariant: IProductVariant | undefined = hasVariants
    ? product.variants.find((v) => v.size === selectedSize && (v.color || undefined) === selectedColor)
    : undefined;
  const maxStock = hasVariants ? activeVariant?.stock ?? 0 : 99;
  const outOfStock = hasVariants && (!activeVariant || activeVariant.stock <= 0);

  function handleSizeChange(size: string) {
    setSelectedSize(size);
    const firstColor = product.variants.find((v) => v.size === size)?.color;
    setSelectedColor(firstColor);
    setQuantity(1);
  }

  function buildCartItem() {
    return {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
      maxStock: maxStock || 99
    };
  }

  function handleAddToCart() {
    addItem(buildCartItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(buildCartItem());
    router.push("/checkout");
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-leather-900"><DisplayPrice amount={product.price} /></span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-leather-400 line-through"><DisplayPrice amount={product.compareAtPrice} /></span>
          )}
        </div>
        <p className="mt-1 text-xs uppercase tracking-wide text-leather-500">{product.material}</p>
      </div>

      {hasVariants && (
        <>
          <div>
            <p className="label">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    size === selectedSize
                      ? "border-leather-800 bg-leather-800 text-leather-50"
                      : "border-leather-300 text-leather-800 hover:border-leather-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {colorsForSize.length > 0 && (
            <div>
              <p className="label">Color</p>
              <div className="flex flex-wrap gap-2">
                {colorsForSize.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      color === selectedColor
                        ? "border-leather-800 bg-leather-800 text-leather-50"
                        : "border-leather-300 text-leather-800 hover:border-leather-600"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-leather-500">
            {outOfStock ? "Out of stock for this size/color." : `${maxStock} in stock`}
          </p>
        </>
      )}

      <div>
        <p className="label">Quantity</p>
        <div className="flex w-32 items-center rounded-md border border-leather-300">
          <button
            className="flex-1 px-3 py-1.5 text-leather-800 disabled:opacity-30"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="flex-1 text-center text-sm">{quantity}</span>
          <button
            className="flex-1 px-3 py-1.5 text-leather-800 disabled:opacity-30"
            onClick={() => setQuantity((q) => Math.min(maxStock || 99, q + 1))}
            disabled={quantity >= (maxStock || 99)}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={handleAddToCart} disabled={outOfStock}>
          {added ? "Added ✓" : "Add to Cart"}
        </button>
        <button className="btn-primary flex-1" onClick={handleBuyNow} disabled={outOfStock}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
