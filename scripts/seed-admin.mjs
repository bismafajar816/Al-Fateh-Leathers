// Creates the first admin account from env vars (SEED_ADMIN_*).
// Run with: npm run seed:admin
// This is intentionally the ONLY way to create the very first admin — there is no
// public /signup route anywhere in the app. Every admin after this one must be
// added from the Admins page in the dashboard by an already-authenticated admin.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const AdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, enum: ["owner", "admin"], default: "owner" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function main() {
  const { MONGODB_URI, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set in .env");
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env");
  }

  await mongoose.connect(MONGODB_URI);

  const existing = await Admin.findOne({ email: SEED_ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin ${SEED_ADMIN_EMAIL} already exists — nothing to do.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
  await Admin.create({
    name: SEED_ADMIN_NAME || "Owner",
    email: SEED_ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    role: "owner",
    createdBy: null,
    isActive: true
  });

  console.log(`✔ Created first admin: ${SEED_ADMIN_EMAIL}`);
  console.log("You can now log in at /admin/login with this email and the password from your .env file.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
