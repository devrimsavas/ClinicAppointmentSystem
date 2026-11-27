import type { Metadata } from "next";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";
import { LinkButton } from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { apiGet } from "@/lib/api";
import type { Doctor } from "@/lib/types";

export const metadata: Metadata = { title: "Availability" };

export default async function CalendarPage() {
  const doctors = await apiGet<Doctor[]>("/doctors", "doctors", { auth: false });

  return (
    <>
      <PageTitle
        title="Availability"
        description="Booked times are shown in blue. Everything else between 08:00 and 18:00 on weekdays is free."
        action={<LinkButton href="/book">Book an appointment</LinkButton>}
      />
      <AppointmentCalendar mode="public" doctors={doctors} />
    </>
  );
}
