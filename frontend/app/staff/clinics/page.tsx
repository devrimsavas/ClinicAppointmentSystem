import type { Metadata } from "next";
import { Plus } from "lucide-react";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import DataTable from "@/components/ui/DataTable";
import { LinkButton } from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { deleteClinic } from "@/lib/actions/staff";
import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/session";
import type { Clinic } from "@/lib/types";

export const metadata: Metadata = { title: "Clinics" };

export default async function ClinicsPage() {
  await requireSession("Admin");
  const clinics = await apiGet<Clinic[]>("/clinics", "clinics");

  return (
    <>
      <PageTitle
        title="Clinics"
        description="A clinic with doctors or appointments cannot be deleted."
        action={<LinkButton href="/staff/clinics/add"><Plus className="h-4 w-4" aria-hidden /> New clinic</LinkButton>}
      />
      <DataTable
        rows={clinics}
        empty="No clinics yet."
        columns={[
          { label: "Name", render: (c) => c.name },
          { label: "Address", render: (c) => c.address ?? "" },
        ]}
        actions={(c) => (
          <>
            <LinkButton href={`/staff/clinics/edit/${c.id}`} variant="secondary" className="px-3 py-1.5">Edit</LinkButton>
            <ConfirmDelete action={deleteClinic.bind(null, c.id)} label={c.name} />
          </>
        )}
      />
    </>
  );
}
