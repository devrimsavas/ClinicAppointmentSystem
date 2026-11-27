import Link from "next/link";
import { CalendarDays, ClipboardList, HeartPulse, Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import IconBadge from "@/components/ui/IconBadge";
import { apiGet } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/session";
import type { Appointment, Patient } from "@/lib/types";

export default async function DashboardPage() {
  const session = await requireSession();
  const [appointments, patients] = await Promise.all([
    apiGet<Appointment[]>("/appointments", "appointments"),
    apiGet<Patient[]>("/patients", "patients"),
  ]);

  const now = new Date();
  const todayKey = now.toLocaleDateString("sv-SE"); // yyyy-mm-dd in local time
  const upcoming = appointments
    .filter((a) => new Date(a.appointmentDateTime) >= now)
    .sort((a, b) => a.appointmentDateTime.localeCompare(b.appointmentDateTime));
  const today = appointments.filter((a) => a.appointmentDateTime.startsWith(todayKey));

  const stats = [
    { label: "Appointments today", value: today.length, icon: CalendarDays, tone: "mint" as const, href: "/staff/calendar" },
    { label: "Upcoming appointments", value: upcoming.length, icon: ClipboardList, tone: "sky" as const, href: "/staff/appointments" },
    { label: "Patients", value: patients.length, icon: HeartPulse, tone: "soft" as const, href: "/staff/patients" },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Hello, {session.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted">Here is what is happening at the clinics.</p>
        </div>
        <LinkButton href="/staff/appointments/add">
          <Plus className="h-4 w-4" aria-hidden /> New appointment
        </LinkButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card flex items-center gap-4 p-5 no-underline hover:shadow-md">
            <IconBadge icon={s.icon} tone={s.tone} />
            <div>
              <p className="text-3xl font-semibold text-primary">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="card mt-6 p-6">
        <h2 className="text-xl">Next appointments</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-muted">No upcoming appointments.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {upcoming.slice(0, 6).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{a.patientName}</p>
                  <p className="text-sm text-muted">Dr. {a.doctorName} · {a.clinicName} · {a.category}</p>
                </div>
                <span className="rounded-full bg-sky px-3 py-1 text-sm font-medium text-primary">{formatDateTime(a.appointmentDateTime)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
