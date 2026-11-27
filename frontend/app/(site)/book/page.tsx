import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import BookingForm from "@/components/forms/BookingForm";
import BookingRules from "@/components/site/BookingRules";
import PageTitle from "@/components/ui/PageTitle";
import { apiGet } from "@/lib/api";
import type { Clinic, Doctor } from "@/lib/types";

export const metadata: Metadata = { title: "Book an appointment" };

export default async function BookPage() {
  const [clinics, doctors] = await Promise.all([
    apiGet<Clinic[]>("/clinics", "clinics", { auth: false }),
    apiGet<Doctor[]>("/doctors", "doctors", { auth: false }),
  ]);

  return (
    <>
      <PageTitle title="Book an appointment" description="Fill in your details and choose a time. No account needed." />
      <div className="grid items-start gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BookingForm clinics={clinics} doctors={doctors} />
        </div>
        <div className="space-y-4">
          <BookingRules />
          <Link href="/calendar" className="card flex items-center gap-3 p-5 text-sm font-medium no-underline hover:shadow-md">
            <CalendarDays className="h-5 w-5" aria-hidden />
            Check which times are already booked
          </Link>
        </div>
      </div>
    </>
  );
}
