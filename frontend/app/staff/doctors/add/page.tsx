import type { Metadata } from "next";
import DoctorForm from "@/components/forms/DoctorForm";
import PageTitle from "@/components/ui/PageTitle";
import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/session";
import type { Clinic, Speciality } from "@/lib/types";

export const metadata: Metadata = { title: "New doctor" };

export default async function AddDoctorPage() {
  await requireSession("Admin");
  const [clinics, specialities] = await Promise.all([
    apiGet<Clinic[]>("/clinics", "clinics"),
    apiGet<Speciality[]>("/specialities", "specialities"),
  ]);

  return (
    <>
      <PageTitle title="New doctor" />
      <DoctorForm clinics={clinics} specialities={specialities} />
    </>
  );
}
