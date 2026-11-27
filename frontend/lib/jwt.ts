// Reads the payload of a JWT WITHOUT verifying the signature.
// Only used to decide what to show (name, role) and to redirect early in proxy.ts.
// The backend verifies the signature on every API call, so a forged token gets nothing.
// Works in both the Node.js and Edge runtimes (no Buffer).

import type { Role } from "./types";

export interface SessionClaims {
  userId: number;
  email: string;
  name: string;
  role: Role;
  /** Expiry as a Unix timestamp in seconds. */
  exp: number;
}

export function decodeToken(token: string | undefined | null): SessionClaims | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));

    if (payload.role !== "Admin" && payload.role !== "Staff") return null;
    if (typeof payload.exp !== "number") return null;

    return {
      userId: Number(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: payload.role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isExpired(claims: SessionClaims, nowMs = Date.now()): boolean {
  return claims.exp * 1000 <= nowMs;
}
