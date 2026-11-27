import type { Metadata } from "next";
import PatientForm from "@/components/forms/PatientForm";
import PageTitle from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "New patient" };

export default function AddPatientPage() {
  return (
    <>
      <PageTitle title="New patient" />
      <PatientForm />
    </>
  );
}
