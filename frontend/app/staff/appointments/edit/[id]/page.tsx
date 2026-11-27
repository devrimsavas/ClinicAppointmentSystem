import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppointmentForm from "@/components/forms/AppointmentForm";
import PageTitle from "@/components/ui/PageTitle";
import { apiGet, apiGetOrNull } from "@/lib/api";
import type { Appointment, Clinic, Doctor, Patient } from "@/lib/types";

export const metadata: Metadata = { title: "Edit appointment" };

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [appointment, patients, doctors, clinics] = await Promise.all([
    apiGetOrNull<Appointment>(`/appointments/${Number(id)}`, "appointment"),
    apiGet<Patient[]>("/patients", "patients"),
    apiGet<Doctor[]>("/doctors", "doctors"),
    apiGet<Clinic[]>("/clinics", "clinics"),
  ]);
  if (!appointment) notFound();

  return (
    <>
      <PageTitle title="Edit appointment" />
      <AppointmentForm appointment={appointment} patients={patients} doctors={doctors} clinics={clinics} />
    </>
  );
}
