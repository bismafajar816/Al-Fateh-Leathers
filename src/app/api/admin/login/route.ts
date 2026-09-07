import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { verifyPassword, signAdminSession, ADMIN_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth";
import { z } from "zod";

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const parsed = LoginInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const admin = await Admin.findOne({ email: parsed.data.email.toLowerCase(), isActive: true });
  if (!admin) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await signAdminSession({ adminId: String(admin._id), email: admin.email, role: admin.role });

  const res = NextResponse.json({
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
  });
  res.cookies.set(ADMIN_COOKIE_NAME, token, sessionCookieOptions);
  return res;
}
