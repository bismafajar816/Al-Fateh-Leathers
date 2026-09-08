import Link from "next/link";

const instructions = [
  {
    number: "01",
    title: "Review your order",
    text: "Please check your products, size, color, quantity, and customization requirements carefully before placing your order."
  },
  {
    number: "02",
    title: "Make your payment",
    text: "We accept payment by direct bank transfer. Your complete bank account details are shown at checkout and in your order confirmation email."
  },
  {
    number: "03",
    title: "Contact us before payment",
    text: "For customizations, cancellations, or changes to size and color, please contact us before making payment."
  },
  {
    number: "04",
    title: "Changes after payment",
    text: "Once payment has been made, we cannot guarantee changes or cancellation of the order."
  }
];

export default function InstructionsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 py-4 md:py-8">
      <section className="relative overflow-hidden rounded-xl bg-leather-900 px-6 py-12 text-leather-50 md:px-12 md:py-16">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-leather-900" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brass">Al Fateh Leather Garments</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">Order Instructions</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-leather-200 md:text-base">
            A few important details to help you place your order smoothly and avoid changes after payment.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Order instructions">
        {instructions.map((instruction) => (
          <article key={instruction.number} className="border border-leather-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold tracking-widest text-brass">{instruction.number}</p>
            <h2 className="mt-3 font-serif text-2xl text-leather-900">{instruction.title}</h2>
            <p className="mt-3 text-sm leading-7 text-leather-600">{instruction.text}</p>
          </article>
        ))}
      </section>

      <section className="border-l-4 border-brass bg-leather-50 px-6 py-6">
        <h2 className="font-serif text-2xl text-leather-900">Before you pay</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-leather-700">
          <li className="flex gap-3">
            <span aria-hidden="true" className="font-semibold text-brass">✓</span>
            <span>Confirm your delivery address and contact details.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="font-semibold text-brass">✓</span>
            <span>Confirm your preferred size, color, and any customization requests.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="font-semibold text-brass">✓</span>
            <span>Keep your payment reference so you can share it with us after the transfer.</span>
          </li>
        </ul>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 border-t border-leather-100 pt-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-xl text-leather-900">Need help with your order?</h2>
          <p className="mt-1 text-sm text-leather-600">Contact us before making payment and we will be happy to help.</p>
        </div>
        <Link href="/checkout" className="btn-primary whitespace-nowrap">
          Continue to checkout
        </Link>
      </section>
    </div>
  );
}
