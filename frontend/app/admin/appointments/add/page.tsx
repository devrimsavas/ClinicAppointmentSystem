// app/admin/appointments/add/page.tsx

import AdminAppointmentForm from "@/components/AdminAppointmentForm";

export default function AddAppointmentPage() {
  return (
    <section className="mt-10 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-border">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Create New Appointment
        </h1>
        <p className="text-text-muted text-sm">
          This form allows you to schedule a new appointment for an existing
          patient. Make sure the patient, doctor, and clinic already exist in
          the system.
        </p>
      </div>

      <AdminAppointmentForm mode="add" />
    </section>
  );
}
