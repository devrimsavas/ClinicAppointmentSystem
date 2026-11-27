import Link from "next/link";
import { LockKeyhole, LayoutDashboard } from "lucide-react";
import { getSession } from "@/lib/session";
import Logo from "./Logo";
import NavLinks from "./NavLinks";

const items = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book appointment" },
  { href: "/doctors", label: "Find a doctor" },
  { href: "/calendar", label: "Availability" },
];

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Logo />
        <div className="order-3 w-full md:order-2 md:w-auto">
          <NavLinks items={items} exact={["/"]} />
        </div>
        <Link
          href={session ? "/staff" : "/login"}
          className="order-2 inline-flex items-center gap-2 text-sm font-medium no-underline hover:underline md:order-3"
        >
          {session ? <LayoutDashboard className="h-4 w-4" aria-hidden /> : <LockKeyhole className="h-4 w-4" aria-hidden />}
          {session ? "Staff portal" : "Staff login"}
        </Link>
      </div>
    </header>
  );
}
