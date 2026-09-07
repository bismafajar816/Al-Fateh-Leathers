import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendOrderStatusUpdateEmail } from "@/lib/mailer";
import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/constants";

const UpdateInput = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentReference: z.string().optional(),
  note: z.string().optional()
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const order = await Order.findById(params.id).lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const parsed = UpdateInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const order = await Order.findById(params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const statusChanged = parsed.data.status && parsed.data.status !== order.status;

  if (parsed.data.status) order.status = parsed.data.status;
  if (parsed.data.paymentReference !== undefined) order.paymentReference = parsed.data.paymentReference;
  if (statusChanged) {
    order.statusHistory.push({ status: parsed.data.status as string, at: new Date(), note: parsed.data.note });
  }

  await order.save();

  if (statusChanged) {
    sendOrderStatusUpdateEmail(order.toObject()).catch((e) => console.error(e));
  }

  return NextResponse.json({ order });
}
