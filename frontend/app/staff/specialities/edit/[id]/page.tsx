import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SpecialityForm from "@/components/forms/SpecialityForm";
import PageTitle from "@/components/ui/PageTitle";
import { apiGetOrNull } from "@/lib/api";
import { requireSession } from "@/lib/session";
import type { Speciality } from "@/lib/types";

export const metadata: Metadata = { title: "Edit speciality" };

export default async function EditSpecialityPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("Admin");
  const { id } = await params;
  const speciality = await apiGetOrNull<Speciality>(`/specialities/${Number(id)}`, "speciality");
  if (!speciality) notFound();

  return (
    <>
      <PageTitle title="Edit speciality" />
      <SpecialityForm speciality={speciality} />
    </>
  );
}
