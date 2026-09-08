import nodemailer from "nodemailer";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/constants";
import type { IOrder } from "@/models/Order";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "false" ? false : Boolean(process.env.SMTP_SECURE), // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
}

async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("SMTP not configured — skipping email:", subject, "to", to);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

function itemsRows(order: IOrder) {
  return order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5ddd0;">${it.name}${
        it.size ? ` (${it.size}${it.color ? ", " + it.color : ""})` : ""
      }</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5ddd0;text-align:center;">${it.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5ddd0;text-align:right;">${formatPrice(
          it.price * it.quantity
        )}</td>
      </tr>`
    )
    .join("");
}

function wrap(title: string, bodyHtml: string) {
  return `
  <div style="font-family:Georgia,serif;background:#faf6ef;padding:24px;color:#2b2016;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5ddd0;border-radius:8px;overflow:hidden;">
      <div style="background:#2b2016;color:#f2e9dc;padding:20px 24px;">
        <h1 style="margin:0;font-size:20px;letter-spacing:1px;">AL FATEH LEATHERS</h1>
      </div>
      <div style="padding:24px;">
        <h2 style="margin-top:0;font-size:18px;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px 24px;background:#f2e9dc;font-size:12px;color:#5a4128;">
        Thank you for shopping with Al Fateh Leathers.
      </div>
    </div>
  </div>`;
}

export async function sendOrderConfirmationEmail(order: IOrder) {
  const body = `
    <p>Hi ${order.customer.fullName}, thank you for your order <strong>#${order.orderNumber}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${itemsRows(order)}
    </table>
    <p style="text-align:right;margin:4px 0;">Subtotal: ${formatPrice(order.subtotal)}</p>
    <p style="text-align:right;margin:4px 0;">Shipping: ${formatPrice(order.shippingFee)}</p>
    <p style="text-align:right;margin:4px 0;font-weight:bold;">Total: ${formatPrice(order.total)}</p>
    <hr style="border:none;border-top:1px solid #e5ddd0;margin:20px 0;" />
    <h3 style="font-size:15px;">Payment by bank transfer</h3>
    <p>Please pay the total above directly to the account below, then contact us with your payment reference so we can confirm your order.</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#5a4128;">Account title</td><td style="padding:4px 0;text-align:right;">${order.bankDetailsShown.accountTitle}</td></tr>
      <tr><td style="padding:4px 0;color:#5a4128;">Bank</td><td style="padding:4px 0;text-align:right;">${order.bankDetailsShown.bankName}</td></tr>
      <tr><td style="padding:4px 0;color:#5a4128;">Account number</td><td style="padding:4px 0;text-align:right;">${order.bankDetailsShown.accountNumber}</td></tr>
      ${order.bankDetailsShown.iban ? `<tr><td style="padding:4px 0;color:#5a4128;">IBAN</td><td style="padding:4px 0;text-align:right;">${order.bankDetailsShown.iban}</td></tr>` : ""}
      ${order.bankDetailsShown.swift ? `<tr><td style="padding:4px 0;color:#5a4128;">SWIFT/BIC</td><td style="padding:4px 0;text-align:right;">${order.bankDetailsShown.swift}</td></tr>` : ""}
    </table>
    <p style="margin-top:20px;">We will email you again once your payment is confirmed and your order is being processed.</p>
  `;
  await sendMail(order.customer.email, `Order Confirmation #${order.orderNumber}`, wrap("Order received", body));
}

export async function sendAdminNewOrderNotification(order: IOrder, recipient?: string) {
  const to = recipient || process.env.ADMIN_NOTIFY_EMAIL || process.env.OWNER_EMAIL;
  if (!to) return;
  const body = `
    <p>New order <strong>#${order.orderNumber}</strong> from ${order.customer.fullName} (${order.customer.email}, ${order.customer.phone}).</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsRows(order)}</table>
    <p style="text-align:right;font-weight:bold;">Total: ${formatPrice(order.total)}</p>
    <p>Shipping to: ${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
    <p>Log in to the admin dashboard to review and update this order.</p>
  `;
  await sendMail(to, `New order #${order.orderNumber}`, wrap("New order placed", body));
}

export async function sendOrderStatusUpdateEmail(order: IOrder) {
  const label = ORDER_STATUS_LABELS[order.status];
  const body = `
    <p>Hi ${order.customer.fullName}, the status of your order <strong>#${order.orderNumber}</strong> has been updated to:</p>
    <p style="font-size:18px;font-weight:bold;color:#7a5834;">${label}</p>
    <p style="text-align:right;font-weight:bold;">Total: ${formatPrice(order.total)}</p>
  `;
  await sendMail(order.customer.email, `Order #${order.orderNumber} — ${label}`, wrap("Order status update", body));
}
