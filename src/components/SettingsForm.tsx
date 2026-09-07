"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SettingsShape {
  storeName: string;
  ownerEmail: string;
  ownerWhatsapp?: string;
  heroImage?: string;
  bank: { accountTitle: string; bankName: string; accountNumber: string; iban?: string; swift?: string };
  shippingFeeFlat: number;
  freeShippingThreshold?: number | null;
}

export default function SettingsForm({ initial }: { initial: SettingsShape }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSavedMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setForm((f) => ({ ...f, heroImage: data.url }));
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: form.storeName,
        ownerEmail: form.ownerEmail,
        ownerWhatsapp: form.ownerWhatsapp,
        heroImage: form.heroImage || "",
        bank: form.bank,
        shippingFeeFlat: Number(form.shippingFeeFlat),
        freeShippingThreshold: form.freeShippingThreshold ? Number(form.freeShippingThreshold) : null
      })
    });
    setSaving(false);
    setSavedMsg(res.ok ? "Settings saved." : "Could not save settings.");
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Store</h2>
        <div>
          <label className="label">Store Name</label>
          <input className="input" value={form.storeName} onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Owner Email (also used for order notifications)</label>
            <input
              type="email"
              className="input"
              value={form.ownerEmail}
              onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Owner WhatsApp (optional)</label>
            <input
              className="input"
              value={form.ownerWhatsapp || ""}
              onChange={(e) => setForm((f) => ({ ...f, ownerWhatsapp: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Homepage Hero Image</h2>
        <p className="text-xs text-leather-500">
          Shown inside the circle on the homepage banner. Recommended: a square photo, at least 600×600px.
        </p>
        {form.heroImage && (
          <div className="relative h-32 w-32 overflow-hidden rounded-full border border-leather-200">
            <Image src={form.heroImage} alt="" fill unoptimized className="object-cover" />
          </div>
        )}
        <div>
          <label className="label">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleHeroUpload} disabled={uploading} />
          {uploading && <p className="mt-1 text-xs text-leather-500">Uploading…</p>}
        </div>
        {form.heroImage && (
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, heroImage: "" }))}
            className="text-xs text-red-600 hover:underline"
          >
            Remove image
          </button>
        )}
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">
          Bank Account (shown to customers at checkout)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Account Title</label>
            <input
              className="input"
              value={form.bank.accountTitle}
              onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, accountTitle: e.target.value } }))}
            />
          </div>
          <div>
            <label className="label">Bank Name</label>
            <input
              className="input"
              value={form.bank.bankName}
              onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, bankName: e.target.value } }))}
            />
          </div>
          <div>
            <label className="label">Account Number</label>
            <input
              className="input"
              value={form.bank.accountNumber}
              onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, accountNumber: e.target.value } }))}
            />
          </div>
          <div>
            <label className="label">IBAN (optional)</label>
            <input
              className="input"
              value={form.bank.iban || ""}
              onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, iban: e.target.value } }))}
            />
          </div>
          <div>
            <label className="label">SWIFT/BIC (optional)</label>
            <input
              className="input"
              value={form.bank.swift || ""}
              onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, swift: e.target.value } }))}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Shipping</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Flat Shipping Fee (EUR)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={form.shippingFeeFlat}
              onChange={(e) => setForm((f) => ({ ...f, shippingFeeFlat: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="label">Free Shipping Above (EUR, optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={form.freeShippingThreshold ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, freeShippingThreshold: e.target.value ? Number(e.target.value) : null }))
              }
            />
          </div>
        </div>
      </div>

      {savedMsg && <p className="text-sm text-leather-600">{savedMsg}</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}