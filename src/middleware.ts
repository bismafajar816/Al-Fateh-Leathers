import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/login") &&
    !pathname.startsWith("/api/admins/bootstrap"); // no such public route, defense in depth only

  const isProtectedWriteApi =
    (pathname.startsWith("/api/products") && req.method !== "GET") ||
    // Orders: creating an order (checkout) is public; listing/reading/updating orders is admin-only
    // because order documents contain customer PII.
    (pathname.startsWith("/api/orders") && req.method !== "POST") ||
    pathname.startsWith("/api/admins") ||
    pathname.startsWith("/api/upload") ||
    (pathname.startsWith("/api/settings") && req.method !== "GET");

  if (!isAdminPage && !isAdminApi && !isProtectedWriteApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminSession(token) : null;

  if (!session) {
    if (isAdminPage) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/products/:path*", "/api/orders/:path*", "/api/admins/:path*", "/api/upload/:path*", "/api/settings/:path*"]
};
