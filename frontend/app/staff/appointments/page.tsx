import type { Metadata } from "next";
import { Plus } from "lucide-react";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import DataTable from "@/components/ui/DataTable";
import { LinkButton } from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { deleteAppointment } from "@/lib/actions/staff";
import { apiGet } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Appointment } from "@/lib/types";

export const metadata: Metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  const appointments = await apiGet<Appointment[]>("/appointments", "appointments");
  const sorted = [...appointments].sort((a, b) => b.appointmentDateTime.localeCompare(a.appointmentDateTime));

  return (
    <>
      <PageTitle
        title="Appointments"
        description="Newest first."
        action={<LinkButton href="/staff/appointments/add"><Plus className="h-4 w-4" aria-hidden /> New appointment</LinkButton>}
      />
      <DataTable
        rows={sorted}
        empty="No appointments yet."
        columns={[
          { label: "When", render: (a) => <span className="whitespace-nowrap">{formatDateTime(a.appointmentDateTime)}</span> },
          { label: "Patient", render: (a) => a.patientName },
          { label: "Doctor", render: (a) => `Dr. ${a.doctorName}` },
          { label: "Clinic", render: (a) => a.clinicName },
          { label: "Reason", render: (a) => a.category },
          { label: "Duration", render: (a) => `${a.durationInMinutes} min` },
        ]}
        actions={(a) => (
          <>
            <LinkButton href={`/staff/appointments/edit/${a.id}`} variant="secondary" className="px-3 py-1.5">Edit</LinkButton>
            <ConfirmDelete action={deleteAppointment.bind(null, a.id)} label="this appointment" />
          </>
        )}
      />
    </>
  );
}
