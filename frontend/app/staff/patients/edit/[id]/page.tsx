import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PatientForm from "@/components/forms/PatientForm";
import PageTitle from "@/components/ui/PageTitle";
import { apiGetOrNull } from "@/lib/api";
import type { Patient } from "@/lib/types";

export const metadata: Metadata = { title: "Edit patient" };

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await apiGetOrNull<Patient>(`/patients/${Number(id)}`, "patient");
  if (!patient) notFound();

  return (
    <>
      <PageTitle title="Edit patient" />
      <PatientForm patient={patient} />
    </>
  );
}
