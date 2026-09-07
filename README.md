# Al Fateh Leathers

A full e-commerce site built with **Next.js 14 (App Router)** + **MongoDB**, for genuine leather jackets, wallets,
belts and gloves — for men, women and kids — priced in **EUR**.

- Customers browse products → add to cart → check out → pay by **direct bank transfer** (the owner's account
  details are shown at checkout and emailed on the confirmation)
- An **admin dashboard** tracks every order, its payment status, and lets you manage products, store settings,
  and other admins
- **No public sign-up** — the very first admin is created by a one-time seed script; every admin after that can
  only be added from inside the dashboard by an already-logged-in admin
- Order confirmations, admin new-order alerts, and status-update emails are sent via **SMTP** (Nodemailer)
- Product images are stored on **Cloudflare R2** (free-tier compatible, S3-compatible API)

## 1. Prerequisites

- Node.js 18.18+ (Node 20 recommended)
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/atlas) has a free tier that works fine
- An SMTP account for sending email — e.g. a Gmail account with an
  [App Password](https://support.google.com/accounts/answer/185833), or a transactional provider like
  Resend, SendGrid, Mailgun, Brevo, etc.
- A [Cloudflare](https://dash.cloudflare.com/) account with **R2** enabled (R2 has a generous free tier —
  10 GB storage and no egress fees)

## 2. Install

```bash
npm install
```

## 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | What it's for |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign admin session cookies — generate with `openssl rand -base64 48` |
| `SESSION_MAX_AGE` | How long an admin stays logged in, in seconds (default 7 days) |
| `STORE_NAME`, `STORE_CURRENCY` | Store display name and currency code (defaults to EUR) |
| `BANK_*`, `OWNER_WHATSAPP`, `OWNER_EMAIL` | Initial bank account + contact info shown at checkout — this seeds the editable **Settings** page in the dashboard the first time it runs |
| `SMTP_*`, `ADMIN_NOTIFY_EMAIL` | Your SMTP credentials for sending order emails, and where new-order alerts go |
| `R2_*` | Cloudflare R2 credentials — see below for how to get these |
| `SEED_ADMIN_*` | Used once, by the seed script below, to create your first admin login |

### Setting up Cloudflare R2 (free image storage)

1. In the Cloudflare dashboard, go to **R2 Object Storage** → **Create bucket**. Name it e.g. `al-fateh-leathers`.
2. Under **Settings** for the bucket, enable **Public Access** (or connect a custom domain) and copy the public
   URL (either the free `pub-xxxxx.r2.dev` URL, or your own domain) into `R2_PUBLIC_URL`.
3. Go to **R2 → Manage API Tokens → Create API Token**, give it Object Read & Write permission on your bucket,
   and copy the **Access Key ID** and **Secret Access Key** into `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`.
4. Your `R2_ENDPOINT` is `https://<your-account-id>.r2.cloudflarestorage.com` — the account ID is shown on the
   R2 overview page.

## 4. Create your first admin

There is no public sign-up page anywhere in this app — admins can only be created by an existing admin from
inside the dashboard. To bootstrap the very first one, set `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` and
`SEED_ADMIN_PASSWORD` in `.env`, then run:

```bash
npm run seed:admin
```

This creates one `owner`-role admin. Log in at `/admin/login` with that email/password, then use the
**Admins** page in the dashboard to add your team — each new admin needs an existing admin to create them.

## 5. Run it

```bash
npm run dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin) (redirects to `/admin/login`)

## 6. Add your first products

Log in to `/admin`, go to **Products → New Product**, fill in the name/description/department (men, women,
kids)/category (jackets, wallets, belts, gloves)/price in EUR, upload images (stored on R2), and add
size/color/stock variants if the product needs them (leave the variant list empty for products without
size/color options).

## 7. Configure your bank details & shipping fee

Go to **Admin → Settings** to edit the bank account customers see at checkout, the shipping fee, and an
optional free-shipping threshold — this is editable any time, without redeploying.

## How the checkout & admin flow works

1. A customer browses `/shop/men`, `/shop/women`, `/shop/kids` (each with Jackets/Wallets/Belts/Gloves
   sub-categories), adds items to their cart (stored in the browser, not the database, until checkout).
2. At `/checkout` they enter their contact + shipping details. The page shows your bank account info live from
   **Settings**.
3. Placing the order creates an `Order` document (status `pending_payment`), decrements stock for any
   size/color variants, and sends:
   - a confirmation email to the customer with their order + your bank details
   - a notification email to `ADMIN_NOTIFY_EMAIL`
4. The customer transfers the money directly to your bank account and contacts you (email/WhatsApp) with proof.
5. You open the order in **Admin → Orders**, confirm the transfer, and move its status to `Payment Received` →
   `Processing` → `Shipped` → `Delivered` (or `Cancelled`). Each status change emails the customer automatically.

## Project structure

```
src/
  app/
    (shop)/            storefront pages (home, /shop/[gender]/[category], /product/[slug], /cart, /checkout, /order-confirmation/[id])
    admin/
      login/           admin login (public route, no signup link anywhere)
      (dashboard)/     everything else under /admin — protected by middleware + a server-side session check
    api/               route handlers (products, orders, admin auth, admins, settings, image upload)
  components/          shared UI (ProductCard, ProductForm, AdminSidebar, etc.)
  lib/                 db connection, auth (JWT + bcrypt), mailer (SMTP), r2 (Cloudflare storage), cart context, constants
  models/              Mongoose schemas: Product, Order, Admin, Settings
  middleware.ts        protects all /admin pages and admin-only API routes
scripts/
  seed-admin.mjs       one-time script to create the first admin account
```

## Deployment

This is a standard Next.js app and deploys anywhere Next.js runs (Vercel, Railway, Render, a VPS with
`npm run build && npm run start`, etc.). Just set the same environment variables from `.env` on your hosting
provider, and make sure your MongoDB and R2 resources are reachable from wherever it's hosted.

```bash
npm run build
npm run start
```
