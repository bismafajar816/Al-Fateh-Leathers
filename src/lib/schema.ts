import type { IProduct } from "@/models/Product";

const BASE_URL = "https://al-fateh-leather-garments.store";

export function generateProductSchema(product: IProduct) {
  // Calculate total stock across all variants (0 variants = treat as in stock)
  const totalStock = product.variants?.length
    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : 1;

  // Use first variant SKU if available, otherwise fall back to slug
  const sku = product.variants?.[0]?.sku || product.slug;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku,
    brand: {
      "@type": "Brand",
      name: "Al Fateh Leather Garments",
    },
    material: product.material || "Genuine Leather",
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/product/${product.slug}`,
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Al Fateh Leather Garments",
      },
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Al Fateh Leather Garments",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "Handcrafted genuine leather jackets, wallets, belts and gloves for men, women and kids.",
    // Add your social URLs here once you have them:
    // sameAs: ["https://instagram.com/...", "https://facebook.com/..."],
  };
}