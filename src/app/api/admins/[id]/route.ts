import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

const UpdateInput = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["owner", "admin"]).optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (params.id === session.adminId && parsed.data.isActive === false) {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }

  const admin = await Admin.findByIdAndUpdate(params.id, parsed.data, { new: true }).select("-passwordHash");
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ admin });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (params.id === session.adminId) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const admin = await Admin.findByIdAndDelete(params.id);
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
