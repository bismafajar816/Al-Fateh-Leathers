import { Schema, models, model } from "mongoose";

// Singleton document (there is only ever one Settings row, id "singleton").
export interface ISettings {
  _id: string;
  storeName: string;
  ownerEmail: string;
  ownerWhatsapp?: string;
  heroImage?: string; // R2 image URL shown in the homepage hero circle
  bank: {
    accountTitle: string;
    bankName: string;
    accountNumber: string;
    iban?: string;
    swift?: string;
  };
  shippingFeeFlat: number;
  freeShippingThreshold?: number | null;
}

const SettingsSchema = new Schema<ISettings>({
  _id: { type: String, default: "singleton" },
  storeName: { type: String, default: "Al Fateh Leathers" },
  ownerEmail: { type: String, default: "" },
  ownerWhatsapp: { type: String, default: "" },
  heroImage: { type: String, default: "" },
  bank: {
    accountTitle: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    iban: { type: String, default: "" },
    swift: { type: String, default: "" }
  },
  shippingFeeFlat: { type: Number, default: 0 },
  freeShippingThreshold: { type: Number, default: null }
});

export default models.Settings || model<ISettings>("Settings", SettingsSchema);