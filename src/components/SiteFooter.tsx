export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-leather-100 bg-leather-900 py-10 text-leather-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-serif text-lg text-white">Al Fateh Leathers</h3>
            <p className="mt-2 text-sm text-leather-300">
              Genuine leather jackets, wallets, belts and gloves for men, women and kids.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-brass">Shop</h4>
            <ul className="mt-2 space-y-1 text-sm text-leather-300">
              <li>
                <a href="/shop/men">Men</a>
              </li>
              <li>
                <a href="/shop/women">Women</a>
              </li>
              <li>
                <a href="/shop/kids">Kids</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-brass">Payment</h4>
            <p className="mt-2 text-sm text-leather-300">
              We accept payment by direct bank transfer. Full account details are shown at checkout and on your order
              confirmation email.
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-leather-800 pt-6 text-center text-xs text-leather-400">
          © {new Date().getFullYear()} Al Fateh Leathers. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
