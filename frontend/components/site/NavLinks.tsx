"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/** Pill-style navigation; the current page is highlighted. */
export default function NavLinks({ items, exact = [] }: { items: NavItem[]; exact?: string[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    exact.includes(href) ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium no-underline transition ${
            isActive(item.href) ? "bg-primary text-white" : "text-primary hover:bg-primary-soft"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
