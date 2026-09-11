import Link from "next/link";
import Image from "next/image";
import DisplayPrice from "@/components/DisplayPrice";
import type { IProduct } from "@/models/Product";

export default function ProductCard({ product }: { product: IProduct }) {
  const img = product.images[0];
  const hoverImg = product.images[1];
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link href={`/product/${product.slug}`} className="group card overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-leather-100">
        {img ? (
          <>
            <Image
              src={img}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-300 ${hoverImg ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
            />
            {hoverImg && (
              <Image
                src={hoverImg}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-leather-400">No image</div>
        )}
        {onSale && (
          <span className="absolute left-2 top-2 rounded bg-brass px-2 py-1 text-[10px] font-bold uppercase text-white">
            Sale
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-leather-900">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-leather-800"><DisplayPrice amount={product.price} /></span>
          {onSale && (
            <span className="text-xs text-leather-400 line-through"><DisplayPrice amount={product.compareAtPrice!} /></span>
          )}
        </div>
      </div>
    </Link>
  );
}