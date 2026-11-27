"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiSend } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/auth-config";
import type { ActionResult, StaffUser } from "@/lib/types";

interface LoginResponse {
  token: string;
  expiresAt: string;
  user: StaffUser;
}

/** The email is sent back so the form can keep it after a failed attempt (React resets forms after an action). */
export type LoginState = (ActionResult & { email?: string }) | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) return { ok: false, message: "Please enter your email and password.", email };

  const result = await apiSend<LoginResponse>("POST", "/auth/login", { email, password }, { auth: false });
  if (!result.ok || !result.data) return { ok: false, message: result.ok ? "Login failed." : result.message, email };

  // httpOnly: client-side JavaScript cannot read the token (protects against XSS token theft)
  (await cookies()).set(SESSION_COOKIE, result.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(result.data.expiresAt),
  });

  // Only redirect inside the staff portal (no open redirects)
  redirect(next.startsWith("/staff") ? next : "/staff");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function changePassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) return { ok: false, message: "The new passwords do not match." };

  const result = await apiSend("PUT", "/auth/password", { currentPassword, newPassword });
  return result.ok ? { ok: true, message: "Your password has been changed." } : result;
}
