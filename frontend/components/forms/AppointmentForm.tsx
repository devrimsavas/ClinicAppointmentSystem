"use client";

import { useState } from "react";
import { saveAppointment, type AppointmentInput } from "@/lib/actions/staff";
import { toDateTimeInput } from "@/lib/format";
import type { Appointment, Clinic, Doctor, Patient } from "@/lib/types";
import FormCard from "./FormCard";
import { useSave } from "./useSave";

interface Props {
  appointment?: Appointment;
  patients: Patient[];
  doctors: Doctor[];
  clinics: Clinic[];
}

export default function AppointmentForm({ appointment, patients, doctors, clinics }: Props) {
  const { save, error, pending } = useSave("/staff/appointments");
  const [form, setForm] = useState<AppointmentInput>({
    appointmentDateTime: toDateTimeInput(appointment?.appointmentDateTime),
    category: appointment?.category ?? "",
    patientId: appointment?.patientId ?? 0,
    doctorId: appointment?.doctorId ?? 0,
    clinicId: appointment?.clinicId ?? 0,
    durationInMinutes: appointment?.durationInMinutes ?? 30,
  });

  const set = <K extends keyof AppointmentInput>(key: K, value: AppointmentInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const clinicDoctors = doctors.filter((d) => d.clinicId === form.clinicId);

  return (
    <FormCard
      onSubmit={(e) => { e.preventDefault(); save(() => saveAppointment(appointment?.id ?? null, form)); }}
      error={error}
      pending={pending}
      submitLabel={appointment ? "Save changes" : "Create appointment"}
      cancelHref="/staff/appointments"
    >
      <div>
        <label htmlFor="patient" className="label">Patient</label>
        <select id="patient" className="input" required value={form.patientId || ""} onChange={(e) => set("patientId", Number(e.target.value))}>
          <option value="">Select a patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="clinic" className="label">Clinic</label>
          <select id="clinic" className="input" required value={form.clinicId || ""} onChange={(e) => setForm((f) => ({ ...f, clinicId: Number(e.target.value), doctorId: 0 }))}>
            <option value="">Select a clinic</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="doctor" className="label">Doctor</label>
          <select id="doctor" className="input" required disabled={!form.clinicId} value={form.doctorId || ""} onChange={(e) => set("doctorId", Number(e.target.value))}>
            <option value="">{form.clinicId ? "Select a doctor" : "Select a clinic first"}</option>
            {clinicDoctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="when" className="label">Date and time</label>
          <input id="when" type="datetime-local" step={900} className="input" required value={form.appointmentDateTime} onChange={(e) => set("appointmentDateTime", e.target.value)} />
        </div>
        <div>
          <label htmlFor="duration" className="label">Duration (minutes)</label>
          <input id="duration" type="number" min={5} max={600} step={5} className="input" required value={form.durationInMinutes} onChange={(e) => set("durationInMinutes", Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label htmlFor="category" className="label">Reason for visit</label>
        <input id="category" className="input" required maxLength={100} value={form.category} onChange={(e) => set("category", e.target.value)} />
      </div>
    </FormCard>
  );
}
