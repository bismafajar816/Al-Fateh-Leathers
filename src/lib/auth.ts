// Node-only auth helpers (bcrypt password hashing). Re-exports the edge-safe
// session helpers too, so API routes and server components can import
// everything from "@/lib/auth" — only middleware.ts should import
// "@/lib/auth-edge" directly (bcrypt isn't supported in the Edge Runtime).
import bcrypt from "bcryptjs";

export * from "@/lib/auth-edge";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
