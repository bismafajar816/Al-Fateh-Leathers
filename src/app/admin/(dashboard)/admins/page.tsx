import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/auth";
import AdminsManager from "@/components/AdminsManager";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  await connectDB();
  const session = await getAdminSession();
  const admins = await Admin.find().select("-passwordHash").sort({ createdAt: 1 }).lean();

  const rows = admins.map((a) => ({
    _id: String(a._id),
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.isActive
  }));

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-leather-900">Admins</h1>
      <AdminsManager admins={rows} currentAdminId={session?.adminId || ""} />
    </div>
  );
}
