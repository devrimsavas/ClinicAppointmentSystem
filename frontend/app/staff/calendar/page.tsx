import type { Metadata } from "next";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";
import PageTitle from "@/components/ui/PageTitle";
import { apiGet } from "@/lib/api";
import type { Appointment, Doctor } from "@/lib/types";

export const metadata: Metadata = { title: "Calendar" };

export default async function AdminCalendarPage() {
  const [appointments, doctors] = await Promise.all([
    apiGet<Appointment[]>("/appointments", "appointments"),
    apiGet<Doctor[]>("/doctors", "doctors"),
  ]);

  return (
    <>
      <PageTitle title="Calendar" description="All appointments with patient details. Only visible to staff." />
      <AppointmentCalendar mode="staff" doctors={doctors} appointments={appointments} />
    </>
  );
}
