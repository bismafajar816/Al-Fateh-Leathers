import Link from "next/link";

const policies = [
  {
    number: "01",
    title: "Bulk order discounts",
    text: "Discounts are available on bulk orders. Contact us with the products and quantities you need so we can discuss the best available price."
  },
  {
    number: "02",
    title: "Free delivery on bulk orders",
    text: "Bulk orders qualify for free delivery. Please contact us before placing your order so we can confirm the order details and delivery arrangements."
  },
  {
    number: "03",
    title: "Individual delivery",
    text: "Individual orders are welcome and delivery is available, but individual delivery is not free. The applicable delivery fee will be shown at checkout."
  },
  {
    number: "04",
    title: "Something out of stock?",
    text: "If the item, size, or color you want is out of stock, contact us. We will be happy to help you find an alternative or advise when it may be available again."
  }
];

export default function DiscountPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 py-4 md:py-8">
      <section className="relative overflow-hidden rounded-xl bg-leather-900 px-6 py-12 text-leather-50 md:px-12 md:py-16">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-leather-900" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brass">Al Fateh Leather Garments</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">Discount &amp; Delivery Policy</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-leather-200 md:text-base">
            Flexible options for individual shoppers and businesses ordering leather goods in larger quantities.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Discount and delivery policy">
        {policies.map((policy) => (
          <article key={policy.number} className="border border-leather-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold tracking-widest text-brass">{policy.number}</p>
            <h2 className="mt-3 font-serif text-2xl text-leather-900">{policy.title}</h2>
            <p className="mt-3 text-sm leading-7 text-leather-600">{policy.text}</p>
          </article>
        ))}
      </section>

      <section className="border-l-4 border-brass bg-leather-50 px-6 py-6">
        <h2 className="font-serif text-2xl text-leather-900">Planning a bulk order?</h2>
        <p className="mt-3 text-sm leading-7 text-leather-700">
          Send us the products, quantities, and delivery location you have in mind. We will be happy to discuss your
          discount and arrange free delivery for your bulk order.
        </p>
        <a href="mailto:alfatehleather95@gmail.com" className="btn-primary mt-5">
          Contact us about an order
        </a>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 border-t border-leather-100 pt-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-xl text-leather-900">Ready to shop?</h2>
          <p className="mt-1 text-sm text-leather-600">Browse our collection or review the order instructions first.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/instructions" className="btn-secondary">
            Order instructions
          </Link>
          <Link href="/shop/men" className="btn-primary">
            Browse products
          </Link>
        </div>
      </section>
    </div>
  );
}
