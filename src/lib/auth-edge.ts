// Edge-runtime-safe auth helpers (JWT sign/verify only — no bcrypt here).
// This file is safe to import from middleware.ts. Password hashing lives in
// auth.ts (node-only) and is used exclusively by API route handlers.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE || 60 * 60 * 24 * 7); // seconds, default 7 days
export const ADMIN_COOKIE_NAME = "afl_admin_session";

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  role: "owner" | "admin";
}

export async function signAdminSession(payload: AdminSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE)
    .sign(JWT_SECRET);
}

export async function verifyAdminSession(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      role: payload.role as "owner" | "admin"
    };
  } catch {
    return null;
  }
}

/** Read + verify the admin session from the request cookie store (server components / route handlers). */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSession(token);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE
};
