import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DoctorForm from "@/components/forms/DoctorForm";
import PageTitle from "@/components/ui/PageTitle";
import { apiGet, apiGetOrNull } from "@/lib/api";
import { requireSession } from "@/lib/session";
import type { Clinic, Doctor, Speciality } from "@/lib/types";

export const metadata: Metadata = { title: "Edit doctor" };

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("Admin");
  const { id } = await params;
  const [doctor, clinics, specialities] = await Promise.all([
    apiGetOrNull<Doctor>(`/doctors/${Number(id)}`, "doctor"),
    apiGet<Clinic[]>("/clinics", "clinics"),
    apiGet<Speciality[]>("/specialities", "specialities"),
  ]);
  if (!doctor) notFound();

  return (
    <>
      <PageTitle title="Edit doctor" />
      <DoctorForm doctor={doctor} clinics={clinics} specialities={specialities} />
    </>
  );
}
