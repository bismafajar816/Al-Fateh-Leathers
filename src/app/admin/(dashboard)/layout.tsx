import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  // Belt-and-braces: middleware already redirects unauthenticated requests, this guards
  // direct/edge-cases and lets us read the admin's name/role for the sidebar.
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar adminName={session.email} adminRole={session.role} />
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
