import "server-only";

// Server-side client for the ASP.NET Core API.
// The browser never talks to the backend: server components and server actions call it from here,
// adding the JWT from the httpOnly session cookie. This keeps the token away from client-side JavaScript.

import { redirect } from "next/navigation";
import { getToken } from "./session";
import type { ActionResult } from "./types";

const API_URL = (process.env.API_URL ?? "http://localhost:5196/api").replace(/\/$/, "");

interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T | null;
  message: string;
}

async function request<T>(path: string, init: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  if (init.auth !== false) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, data: null, message: "The booking service is not reachable. Please try again later." };
  }

  // 401/403 responses have an empty body, so only parse JSON when there is some
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  return { ok: res.ok, status: res.status, data: data as T, message: errorMessage(res.status, data) };
}

function errorMessage(status: number, data: unknown): string {
  if (data && typeof data === "object") {
    const body = data as { message?: string; title?: string; errors?: Record<string, string[]> };
    if (body.message) return body.message;
    // ASP.NET model validation errors (ProblemDetails)
    if (body.errors) return Object.values(body.errors).flat().join(" ");
    if (body.title) return body.title;
  }
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to do this.";
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  return "Something went wrong. Please try again.";
}

/**
 * GET for server components. Returns the "key" property of the JSON body (the API wraps lists, e.g. { doctors: [...] }).
 * Redirects to /login when the session is missing or expired; throws on other errors (shown by error.tsx).
 */
export async function apiGet<T>(path: string, key: string, options: { auth?: boolean } = {}): Promise<T> {
  const res = await request<Record<string, T>>(path, { auth: options.auth });

  if (res.status === 401 && options.auth !== false) redirect("/login?expired=1");
  if (!res.ok || !res.data) throw new Error(res.message);

  return res.data[key];
}

/** Same as apiGet, but returns null for 404. */
export async function apiGetOrNull<T>(path: string, key: string): Promise<T | null> {
  const res = await request<Record<string, T>>(path);
  if (res.status === 404) return null;
  if (res.status === 401) redirect("/login?expired=1");
  if (!res.ok || !res.data) throw new Error(res.message);
  return res.data[key];
}

/** POST/PUT/DELETE for server actions. Never throws: the form shows the message. */
export async function apiSend<T = unknown>(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  options: { auth?: boolean } = {},
): Promise<ActionResult & { data?: T }> {
  const res = await request<T>(path, { method, body, auth: options.auth });

  if (!res.ok) return { ok: false, message: res.message };

  const message = (res.data as { message?: string } | null)?.message;
  return { ok: true, message, data: res.data ?? undefined };
}
