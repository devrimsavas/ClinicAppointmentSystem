import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./auth-config";
import { decodeToken, isExpired, type SessionClaims } from "./jwt";
import type { Role } from "./types";

/** The logged-in staff user, or null. */
export async function getSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const claims = decodeToken(token);
  if (!claims || isExpired(claims)) return null;
  return claims;
}

/** Use at the top of staff portal pages: redirects to /login, or to /staff when the role is not allowed. */
export async function requireSession(role?: Role): Promise<SessionClaims> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role && session.role !== role) redirect("/staff");
  return session;
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
