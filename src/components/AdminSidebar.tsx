"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/settings", label: "Settings" }
];

export default function AdminSidebar({ adminName, adminRole }: { adminName: string; adminRole: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-leather-200 bg-leather-900 text-leather-100">
      <div className="border-b border-leather-800 px-5 py-5">
        <Link href="/admin" aria-label="Al Fateh Leathers admin dashboard" className="relative block h-14 w-full overflow-hidden rounded-sm bg-leather-50">
          <Image
            src="/uploads/Logo.png"
            alt="Al Fateh Leathers"
            width={2048}
            height={768}
            priority
            className="absolute left-1/2 top-1/2 h-auto w-[270px] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </Link>
        <p className="text-xs uppercase tracking-wide text-brass">Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active ? "bg-leather-700 text-white" : "text-leather-300 hover:bg-leather-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-leather-800 px-5 py-4 text-xs text-leather-400">
        <p className="text-leather-200">{adminName}</p>
        <p className="uppercase tracking-wide">{adminRole}</p>
        <button onClick={handleLogout} className="mt-3 text-brass hover:underline">
          Log out
        </button>
      </div>
    </aside>
  );
}
