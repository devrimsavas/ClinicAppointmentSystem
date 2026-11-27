import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import StaffNav from "@/components/staff/StaffNav";
import Logo from "@/components/site/Logo";
import { logout } from "@/lib/actions/auth";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Staff portal", template: "%s | NovaMed staff" } };

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts already redirected logged-out users; this is the second check
  const session = await requireSession();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <Logo href="/staff" />
            <span className="hidden rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary sm:inline">Staff portal</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hidden md:inline">View site</Link>
            <span className="hidden text-right sm:block">
              <span className="block font-medium">{session.name}</span>
              <span className="block text-xs text-muted">{session.role}</span>
            </span>
            <form action={logout}>
              <button type="submit" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-primary hover:bg-primary-soft">
                <LogOut className="h-4 w-4" aria-hidden /> Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <StaffNav role={session.role} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
