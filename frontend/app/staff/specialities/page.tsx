import type { Metadata } from "next";
import { Plus } from "lucide-react";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import DataTable from "@/components/ui/DataTable";
import { LinkButton } from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { deleteSpeciality } from "@/lib/actions/staff";
import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/session";
import type { Speciality } from "@/lib/types";

export const metadata: Metadata = { title: "Specialities" };

export default async function SpecialitiesPage() {
  await requireSession("Admin");
  const specialities = await apiGet<Speciality[]>("/specialities", "specialities");

  return (
    <>
      <PageTitle
        title="Specialities"
        description="A speciality that is assigned to doctors cannot be deleted."
        action={<LinkButton href="/staff/specialities/add"><Plus className="h-4 w-4" aria-hidden /> New speciality</LinkButton>}
      />
      <DataTable
        rows={specialities}
        empty="No specialities yet."
        columns={[{ label: "Name", render: (s) => s.name }]}
        actions={(s) => (
          <>
            <LinkButton href={`/staff/specialities/edit/${s.id}`} variant="secondary" className="px-3 py-1.5">Edit</LinkButton>
            <ConfirmDelete action={deleteSpeciality.bind(null, s.id)} label={s.name} />
          </>
        )}
      />
    </>
  );
}
