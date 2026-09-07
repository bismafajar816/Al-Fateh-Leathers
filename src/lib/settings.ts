import { connectDB } from "@/lib/db";
import Settings, { ISettings } from "@/models/Settings";

export async function getSettings(): Promise<ISettings> {
  await connectDB();
  const existing = await Settings.findById("singleton").lean<ISettings>();
  if (existing) return existing;

  const created = await Settings.create({
    _id: "singleton",
    storeName: process.env.STORE_NAME || "Al Fateh Leathers",
    ownerEmail: process.env.OWNER_EMAIL || "",
    ownerWhatsapp: process.env.OWNER_WHATSAPP || "",
    bank: {
      accountTitle: process.env.BANK_ACCOUNT_TITLE || "",
      bankName: process.env.BANK_NAME || "",
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
      iban: process.env.BANK_IBAN || "",
      swift: process.env.BANK_SWIFT || ""
    },
    shippingFeeFlat: 0,
    freeShippingThreshold: null
  });

  return created.toObject() as ISettings;
}
