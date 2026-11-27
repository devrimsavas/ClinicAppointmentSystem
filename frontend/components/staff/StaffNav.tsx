"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarDays, ClipboardList, HeartPulse, LayoutDashboard, Stethoscope, Tags, UserCog, Users, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/types";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const items: Item[] = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/appointments", label: "Appointments", icon: ClipboardList },
  { href: "/staff/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/staff/patients", label: "Patients", icon: HeartPulse },
  { href: "/staff/doctors", label: "Doctors", icon: Stethoscope, adminOnly: true },
  { href: "/staff/clinics", label: "Clinics", icon: Building2, adminOnly: true },
  { href: "/staff/specialities", label: "Specialities", icon: Tags, adminOnly: true },
  { href: "/staff/users", label: "Staff users", icon: Users, adminOnly: true },
  { href: "/staff/account", label: "My account", icon: UserCog },
];

export default function StaffNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const visible = items.filter((i) => !i.adminOnly || role === "Admin");
  const isActive = (href: string) => (href === "/staff" ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {visible.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium no-underline transition ${
            isActive(href) ? "bg-primary text-white" : "text-primary hover:bg-primary-soft"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
