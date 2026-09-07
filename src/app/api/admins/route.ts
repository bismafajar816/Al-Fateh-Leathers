import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { z } from "zod";

const NewAdminInput = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["owner", "admin"]).default("admin")
});

export async function GET() {
  await connectDB();
  const admins = await Admin.find().select("-passwordHash").sort({ createdAt: 1 }).lean();
  return NextResponse.json({ admins });
}

// Creating an admin requires an authenticated admin session (enforced by middleware for this whole
// path) — there is intentionally no public /signup route anywhere in this app.
export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = NewAdminInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await Admin.findOne({ email: parsed.data.email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "An admin with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const admin = await Admin.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash,
    role: parsed.data.role,
    createdBy: session.adminId
  });

  return NextResponse.json(
    { admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } },
    { status: 201 }
  );
}
