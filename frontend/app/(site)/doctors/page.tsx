import type { Metadata } from "next";
import DoctorSearch from "@/components/site/DoctorSearch";
import PageTitle from "@/components/ui/PageTitle";
import { apiGet } from "@/lib/api";
import type { Doctor } from "@/lib/types";

export const metadata: Metadata = { title: "Find a doctor" };

export default async function DoctorsPage() {
  const doctors = await apiGet<Doctor[]>("/doctors", "doctors", { auth: false });

  const allDoctors = doctors.map((d) => ({
    fullName: `${d.firstName} ${d.lastName}`,
    clinicName: d.clinicName,
    specialityName: d.specialityName,
  }));

  return (
    <>
      <PageTitle title="Find a doctor" description="Search by first name, last name or both." />
      <DoctorSearch allDoctors={allDoctors} />
    </>
  );
}
