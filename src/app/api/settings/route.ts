import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { getSettings } from "@/lib/settings";
import { z } from "zod";

const SettingsInput = z.object({
  storeName: z.string().min(1).optional(),
  ownerEmail: z.string().email().optional(),
  ownerWhatsapp: z.string().optional(),
  heroImage: z.string().optional(),
  bank: z
    .object({
      accountTitle: z.string().optional(),
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      iban: z.string().optional(),
      swift: z.string().optional()
    })
    .optional(),
  shippingFeeFlat: z.number().min(0).optional(),
  freeShippingThreshold: z.number().min(0).nullable().optional()
});

// Public read: checkout page needs the bank details and shipping fee to display them to the customer.
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

// Admin-only write (enforced by middleware).
export async function PATCH(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const parsed = SettingsInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await getSettings(); // ensure the singleton exists
  const updated = await Settings.findByIdAndUpdate(
    "singleton",
    { $set: parsed.data },
    { new: true, upsert: true }
  ).lean();

  return NextResponse.json({ settings: updated });
}