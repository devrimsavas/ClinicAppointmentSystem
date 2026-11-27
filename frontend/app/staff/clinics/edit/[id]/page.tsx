import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClinicForm from "@/components/forms/ClinicForm";
import PageTitle from "@/components/ui/PageTitle";
import { apiGetOrNull } from "@/lib/api";
import { requireSession } from "@/lib/session";
import type { Clinic } from "@/lib/types";

export const metadata: Metadata = { title: "Edit clinic" };

export default async function EditClinicPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("Admin");
  const { id } = await params;
  const clinic = await apiGetOrNull<Clinic>(`/clinics/${Number(id)}`, "clinic");
  if (!clinic) notFound();

  return (
    <>
      <PageTitle title="Edit clinic" />
      <ClinicForm clinic={clinic} />
    </>
  );
}
