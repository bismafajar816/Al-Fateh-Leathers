import React from 'react';

export default function SiteFooter() {
  return (
    <footer className="bg-[#1a1410] border-t border-[#3a2c24] text-[#c9b8a8]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <h2 className="text-2xl font-serif font-semibold tracking-wide text-[#e8d5b5]">
              Al Fateh <br className="sm:hidden" />
              <span className="text-[#b8944c]">Leather</span> Garments
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#b09a88]">
              Genuine leather jackets, wallets, belts, and gloves — crafted for men, women, and kids.
            </p>
            {/* decorative line */}
            <div className="mt-4 h-0.5 w-12 bg-[#b8944c] opacity-60" />
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#b8944c]">
              Shop
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {['Men', 'Women', 'Kids'].map((item) => (
                <li key={item}>
                  <a
                    href={`/shop/${item.toLowerCase()}`}
                    className="transition-colors duration-200 hover:text-[#e8d5b5] hover:underline underline-offset-2"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Order & Payment */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#b8944c]">
              Order &amp; Payment
            </h3>
            <div className="mt-4 text-sm text-[#b09a88]">
              <p className="leading-relaxed">
                We accept direct bank transfer. Please review our order instructions before completing your payment.
              </p>
              <a
                href="/instructions"
                className="mt-4 inline-flex items-center gap-2 font-medium text-[#e8d5b5] transition-colors duration-200 hover:text-white hover:underline underline-offset-4"
              >
                View order instructions <span aria-hidden="true">→</span>
              </a>
              <a
                href="/discount-policy"
                className="mt-2 inline-flex items-center gap-2 font-medium text-[#e8d5b5] transition-colors duration-200 hover:text-white hover:underline underline-offset-4"
              >
                View discount &amp; delivery policy <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#b8944c]">
              Contact
            </h3>
            <address className="mt-4 space-y-3 not-italic text-sm text-[#b09a88]">
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-[#b8944c]">📍</span>
                <span>96-D, Small Industrial Estate, Sahiwal</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-[#b8944c]">📞</span>
                <a
                  href="tel:03124748617"
                  className="transition-colors duration-200 hover:text-[#e8d5b5]"
                >
                  0312 4748617
                </a>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-[#b8944c]">✉️</span>
                <a
                  href="mailto:alfatehleather95@gmail.com"
                  className="break-all transition-colors duration-200 hover:text-[#e8d5b5]"
                >
                  alfatehleather95@gmail.com
                </a>
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                {[
                  { label: 'Instagram', href: 'https://www.instagram.com/al.fateh.95', icon: '📷' },
                  { label: 'Facebook', href: 'https://www.facebook.com/al.fateh.75457', icon: '📘' },
                  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shahid-ali-127580267/', icon: '🔗' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm transition-colors duration-200 hover:text-[#e8d5b5]"
                  >
                    <span className="text-[#b8944c]">{social.icon}</span>
                    {social.label}
                  </a>
                ))}
              </div>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-[#2f221b] pt-6 text-center text-xs text-[#7a685a]">
          <p>
            &copy; {new Date().getFullYear()} Al Fateh Leathers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}