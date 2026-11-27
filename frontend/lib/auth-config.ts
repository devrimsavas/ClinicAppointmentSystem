// Shared by proxy.ts, the session helpers and the staff navigation.

export const SESSION_COOKIE = "novamed_session";

/** Staff portal sections that only the Admin role may open. */
export const ADMIN_ONLY_PATHS = [
  "/staff/clinics",
  "/staff/doctors",
  "/staff/specialities",
  "/staff/users",
];

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
