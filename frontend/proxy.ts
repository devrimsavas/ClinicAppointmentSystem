// proxy.ts (Next.js 16, formerly middleware.ts)
// First line of defence for the staff portal: redirect before any page renders.
// The staff layout checks the session again, and the API checks the token on every call.

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isAdminOnlyPath } from "@/lib/auth-config";
import { decodeToken, isExpired } from "@/lib/jwt";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const claims = decodeToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!claims || isExpired(claims)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminOnlyPath(pathname) && claims.role !== "Admin") {
    return NextResponse.redirect(new URL("/staff", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"],
};
