import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Al Fateh Leathers"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-leather-50">{children}</div>;
}
