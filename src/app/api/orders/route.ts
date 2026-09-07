import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import type { IProductVariant } from "@/models/Product";
import { getSettings } from "@/lib/settings";
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification } from "@/lib/mailer";
import { z } from "zod";

const OrderItemInput = z.object({
  productId: z.string(),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().min(1).max(20)
});

const CheckoutInput = z.object({
  items: z.array(OrderItemInput).min(1),
  customer: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5)
  }),
  shippingAddress: z.object({
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1)
  }),
  notes: z.string().optional()
});

function generateOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(
    2,
    "0"
  )}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AFL-${stamp}-${rand}`;
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const parsed = CheckoutInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { items, customer, shippingAddress, notes } = parsed.data;

  // Re-fetch products server-side so prices/stock cannot be tampered with client-side.
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Product ${item.productId} is no longer available.` }, { status: 400 });
    }

    if (product.variants.length > 0) {
      const variant = product.variants.find(
        (v: IProductVariant) => v.size === item.size && (v.color || undefined) === item.color
      );
      if (!variant) {
        return NextResponse.json({ error: `Selected size/color for "${product.name}" is unavailable.` }, { status: 400 });
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for "${product.name}" (${item.size}).` }, { status: 400 });
      }
      variant.stock -= item.quantity;
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity
    });

    await product.save();
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const settings = await getSettings();
  const shippingFee =
    settings.freeShippingThreshold && subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFeeFlat || 0;
  const total = subtotal + shippingFee;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    items: orderItems,
    subtotal,
    shippingFee,
    total,
    currency: "EUR",
    customer,
    shippingAddress,
    notes,
    paymentMethod: "bank_transfer",
    bankDetailsShown: {
      accountTitle: settings.bank.accountTitle,
      bankName: settings.bank.bankName,
      accountNumber: settings.bank.accountNumber,
      iban: settings.bank.iban,
      swift: settings.bank.swift
    },
    status: "pending_payment",
    statusHistory: [{ status: "pending_payment", at: new Date() }]
  });

  // Fire-and-forget emails — don't block the checkout response on SMTP latency/errors.
  sendOrderConfirmationEmail(order.toObject()).catch((e) => console.error(e));
  sendAdminNewOrderNotification(order.toObject()).catch((e) => console.error(e));

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { orderNumber: { $regex: q, $options: "i" } },
      { "customer.fullName": { $regex: q, $options: "i" } },
      { "customer.email": { $regex: q, $options: "i" } }
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter)
  ]);

  return NextResponse.json({ orders, total, page, limit });
}
