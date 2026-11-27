import type { Metadata } from "next";
import SpecialityForm from "@/components/forms/SpecialityForm";
import PageTitle from "@/components/ui/PageTitle";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "New speciality" };

export default async function AddSpecialityPage() {
  await requireSession("Admin");
  return (
    <>
      <PageTitle title="New speciality" />
      <SpecialityForm />
    </>
  );
}
