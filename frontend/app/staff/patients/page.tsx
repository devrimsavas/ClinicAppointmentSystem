import type { Metadata } from "next";
import { Plus } from "lucide-react";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import DataTable from "@/components/ui/DataTable";
import { LinkButton } from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { deletePatient } from "@/lib/actions/staff";
import { apiGet } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Patient } from "@/lib/types";

export const metadata: Metadata = { title: "Patients" };

export default async function PatientsPage() {
  const patients = await apiGet<Patient[]>("/patients", "patients");
  const sorted = [...patients].sort((a, b) => a.lastName.localeCompare(b.lastName));

  return (
    <>
      <PageTitle
        title="Patients"
        description="A patient with appointments cannot be deleted."
        action={<LinkButton href="/staff/patients/add"><Plus className="h-4 w-4" aria-hidden /> New patient</LinkButton>}
      />
      <DataTable
        rows={sorted}
        empty="No patients yet."
        columns={[
          { label: "Name", render: (p) => `${p.lastName}, ${p.firstName}` },
          { label: "Email", render: (p) => p.email },
          { label: "Date of birth", render: (p) => formatDate(p.birthDate) },
          { label: "Gender", render: (p) => p.gender ?? "" },
        ]}
        actions={(p) => (
          <>
            <LinkButton href={`/staff/patients/edit/${p.id}`} variant="secondary" className="px-3 py-1.5">Edit</LinkButton>
            <ConfirmDelete action={deletePatient.bind(null, p.id)} label={`${p.firstName} ${p.lastName}`} />
          </>
        )}
      />
    </>
  );
}
