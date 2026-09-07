"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentReference
}: {
  orderId: string;
  currentStatus: string;
  currentReference?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [reference, setReference] = useState(currentReference || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSavedMsg(null);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentReference: reference || undefined, note: note || undefined })
    });
    setSaving(false);
    if (res.ok) {
      setSavedMsg("Saved. The customer has been emailed if the status changed.");
      setNote("");
      router.refresh();
    } else {
      setSavedMsg("Could not save changes.");
    }
  }

  return (
    <div className="card space-y-4 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-leather-700">Update Order</h2>

      <div>
        <label className="label">Status</label>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Payment Reference (from customer's bank transfer)</label>
        <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} />
      </div>

      <div>
        <label className="label">Internal Note (optional)</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Confirmed via WhatsApp" />
      </div>

      {savedMsg && <p className="text-xs text-leather-600">{savedMsg}</p>}

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
