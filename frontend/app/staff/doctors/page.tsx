import type { Metadata } from "next";
import { Plus } from "lucide-react";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import DataTable from "@/components/ui/DataTable";
import { LinkButton } from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { deleteDoctor } from "@/lib/actions/staff";
import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/session";
import type { Doctor } from "@/lib/types";

export const metadata: Metadata = { title: "Doctors" };

export default async function DoctorsAdminPage() {
  await requireSession("Admin");
  const doctors = await apiGet<Doctor[]>("/doctors", "doctors");

  return (
    <>
      <PageTitle
        title="Doctors"
        description="A doctor with appointments cannot be deleted."
        action={<LinkButton href="/staff/doctors/add"><Plus className="h-4 w-4" aria-hidden /> New doctor</LinkButton>}
      />
      <DataTable
        rows={doctors}
        empty="No doctors yet."
        columns={[
          { label: "Name", render: (d) => `Dr. ${d.firstName} ${d.lastName}` },
          { label: "Speciality", render: (d) => d.specialityName ?? "" },
          { label: "Clinic", render: (d) => d.clinicName ?? "" },
        ]}
        actions={(d) => (
          <>
            <LinkButton href={`/staff/doctors/edit/${d.id}`} variant="secondary" className="px-3 py-1.5">Edit</LinkButton>
            <ConfirmDelete action={deleteDoctor.bind(null, d.id)} label={`Dr. ${d.firstName} ${d.lastName}`} />
          </>
        )}
      />
    </>
  );
}
