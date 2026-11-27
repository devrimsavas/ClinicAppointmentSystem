import type { Metadata } from "next";
import ClinicForm from "@/components/forms/ClinicForm";
import PageTitle from "@/components/ui/PageTitle";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "New clinic" };

export default async function AddClinicPage() {
  await requireSession("Admin");
  return (
    <>
      <PageTitle title="New clinic" />
      <ClinicForm />
    </>
  );
}
