"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-leather-100">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${productName}${activeIndex > 0 ? ` — image ${activeIndex + 1}` : ""}`}
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-leather-400">No image</div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === activeIndex}
              className={`relative aspect-square overflow-hidden rounded-md bg-leather-100 ring-2 transition ${
                i === activeIndex ? "ring-leather-800" : "ring-transparent hover:ring-leather-300"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 20vw, 10vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}