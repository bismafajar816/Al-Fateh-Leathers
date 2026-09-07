import { CartProvider } from "@/lib/cart-context";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-8">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
