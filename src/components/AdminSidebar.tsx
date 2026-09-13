"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/settings", label: "Settings" },
];

type AdminSidebarProps = {
  adminName: string;
  adminRole: string;
};

export default function AdminSidebar({ adminName, adminRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Desktop: collapsed (icon-only) vs expanded
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: drawer open vs closed
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }, [router]);

  return (
    <>
      {/* ---------- Mobile top bar (only visible < lg) ---------- */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-leather-200 bg-leather-900 px-4 py-3 text-leather-100 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-leather-200 hover:bg-leather-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
        >
          <HamburgerIcon />
        </button>
        <p className="text-xs uppercase tracking-wide text-brass">Admin</p>
        <div className="w-9" aria-hidden="true" />
      </div>

      {/* ---------- Mobile backdrop ---------- */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ---------- Sidebar ---------- */}
      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={[
          // Base layout
          "flex shrink-0 flex-col border-r border-leather-200 bg-leather-900 text-leather-100",
          // Desktop sizing + collapse animation
          "transition-[width] duration-300 ease-in-out",
          collapsed ? "lg:w-20" : "lg:w-60",
          // Mobile: fixed drawer
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] transform transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header / brand */}
        <div className="border-b border-leather-800 px-5 py-5">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              aria-label="Al Fateh Leathers admin dashboard"
              className={`relative block h-14 overflow-hidden rounded-sm bg-leather-50 transition-all duration-300 ${
                collapsed ? "lg:w-10 lg:mx-auto" : "w-full"
              }`}
            >
              <Image
                src="/uploads/Logo.png"
                alt="Al Fateh Leathers"
                width={2048}
                height={768}
                priority
                className={`absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  collapsed ? "lg:w-[160px]" : "w-[270px]"
                } max-w-none`}
              />
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-leather-300 hover:bg-leather-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brass lg:hidden"
            >
              <CloseIcon />
            </button>
          </div>

          <p
            className={`text-xs uppercase tracking-wide text-brass transition-opacity duration-200 ${
              collapsed ? "lg:opacity-0" : "opacity-100"
            }`}
          >
            Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={[
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-leather-700 text-white"
                    : "text-leather-300 hover:bg-leather-800 hover:text-white",
                  collapsed ? "lg:justify-center lg:px-2" : "",
                ].join(" ")}
              >
                <span className="shrink-0 text-leather-200 group-hover:text-white">
                  <NavIcon href={item.href} />
                </span>
                <span
                  className={`truncate transition-all duration-200 ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / user + logout */}
        <div className="border-t border-leather-800 px-5 py-4 text-xs text-leather-400">
          <div className={`${collapsed ? "lg:hidden" : ""}`}>
            <p className="truncate text-leather-200" title={adminName}>
              {adminName}
            </p>
            <p className="uppercase tracking-wide">{adminRole}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={[
              "mt-3 inline-flex items-center gap-2 text-brass hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brass",
              collapsed ? "lg:mt-0 lg:justify-center" : "",
            ].join(" ")}
          >
            <LogoutIcon />
            <span className={`${collapsed ? "lg:hidden" : ""}`}>Log out</span>
          </button>
        </div>

        {/* Desktop collapse toggle (floating on the edge) */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-leather-700 bg-leather-900 text-leather-200 shadow-md transition-colors hover:bg-leather-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brass lg:flex"
        >
          <ChevronIcon direction={collapsed ? "right" : "left"} />
        </button>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                              */
/* ------------------------------------------------------------------ */

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function NavIcon({ href }: { href: string }) {
  // Simple inline icons keyed off the nav route
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (href === "/admin") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    );
  }
  if (href === "/admin/products") {
    return (
      <svg {...common}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }
  if (href === "/admin/orders") {
    return (
      <svg {...common}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }
  if (href === "/admin/admins") {
    return (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  // settings (default)
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}