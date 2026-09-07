"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminRow {
  _id: string;
  name: string;
  email: string;
  role: "owner" | "admin";
  isActive: boolean;
}

export default function AdminsManager({ admins, currentAdminId }: { admins: AdminRow[]; currentAdminId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" as "owner" | "admin" });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error?.toString?.() || data.error || "Could not create admin.");
      return;
    }
    setForm({ name: "", email: "", password: "", role: "admin" });
    router.refresh();
  }

  async function toggleActive(admin: AdminRow) {
    await fetch(`/api/admins/${admin._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !admin.isActive })
    });
    router.refresh();
  }

  async function handleDelete(admin: AdminRow) {
    if (!confirm(`Remove admin "${admin.name}"?`)) return;
    await fetch(`/api/admins/${admin._id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="card p-5 md:col-span-2">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-leather-700">Current Admins</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-leather-500">
            <tr>
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Status</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a._id} className="border-t border-leather-50">
                <td className="py-2 text-leather-900">{a.name}</td>
                <td className="py-2 text-leather-600">{a.email}</td>
                <td className="py-2 text-leather-600">{a.role}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${a.isActive ? "bg-green-100 text-green-700" : "bg-leather-100 text-leather-500"}`}>
                    {a.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="py-2 text-right text-xs">
                  {a._id !== currentAdminId && (
                    <>
                      <button onClick={() => toggleActive(a)} className="mr-3 text-brass hover:underline">
                        {a.isActive ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => handleDelete(a)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </>
                  )}
                  {a._id === currentAdminId && <span className="text-leather-400">You</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card h-fit p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-leather-700">Add New Admin</h2>
        <p className="mb-4 text-xs text-leather-500">
          New admins can only be added here, by an already-signed-in admin. There is no public sign-up page.
        </p>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              required
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              required
              type="password"
              minLength={8}
              className="input"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "owner" | "admin" }))}
            >
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? "Creating…" : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
