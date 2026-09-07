import { Schema, models, model } from "mongoose";

export interface IAdmin {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin";
  createdBy?: string | null; // Admin _id that created this admin, null for the seeded owner
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner", "admin"], default: "admin" },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default models.Admin || model<IAdmin>("Admin", AdminSchema);
