import type { Metadata } from "next";
import AppointmentForm from "@/components/forms/AppointmentForm";
import PageTitle from "@/components/ui/PageTitle";
import { apiGet } from "@/lib/api";
import type { Clinic, Doctor, Patient } from "@/lib/types";

export const metadata: Metadata = { title: "New appointment" };

export default async function AddAppointmentPage() {
  const [patients, doctors, clinics] = await Promise.all([
    apiGet<Patient[]>("/patients", "patients"),
    apiGet<Doctor[]>("/doctors", "doctors"),
    apiGet<Clinic[]>("/clinics", "clinics"),
  ]);

  return (
    <>
      <PageTitle title="New appointment" description="For an existing patient. New patients can also book themselves on the public site." />
      <AppointmentForm patients={patients} doctors={doctors} clinics={clinics} />
    </>
  );
}
