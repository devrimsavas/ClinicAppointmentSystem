"use client";

import { useState, useTransition } from "react";
import { bookAppointment, type BookingInput } from "@/lib/actions/public";
import type { Clinic, Doctor } from "@/lib/types";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

const emptyForm: BookingInput = {
  patient: { firstName: "", lastName: "", email: "", birthDate: "", gender: "" },
  appointment: { appointmentDateTime: "", category: "", doctorId: 0, clinicId: 0, durationInMinutes: 30 },
};

export default function BookingForm({ clinics, doctors }: { clinics: Clinic[]; doctors: Doctor[] }) {
  const [form, setForm] = useState<BookingInput>(emptyForm);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const clinicDoctors = doctors.filter((d) => d.clinicId === form.appointment.clinicId);

  const setPatient = (name: keyof BookingInput["patient"], value: string) =>
    setForm((f) => ({ ...f, patient: { ...f.patient, [name]: value } }));

  const setAppointment = (name: keyof BookingInput["appointment"], value: string | number) =>
    setForm((f) => ({ ...f, appointment: { ...f.appointment, [name]: value } }));

  const changeClinic = (clinicId: number) =>
    // a doctor from another clinic is no longer valid
    setForm((f) => ({ ...f, appointment: { ...f.appointment, clinicId, doctorId: 0 } }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await bookAppointment(form);
      setResult({ ok: res.ok, message: res.message ?? "" });
      if (res.ok) setForm(emptyForm);
    });
  };

  return (
    <form onSubmit={submit} className="card space-y-8 p-6 md:p-8">
      {result && <Alert type={result.ok ? "success" : "error"} message={result.message} />}

      <fieldset className="space-y-4">
        <legend className="mb-2 text-lg font-semibold text-primary">Your details</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="label">First name</label>
            <input id="firstName" className="input" required value={form.patient.firstName} onChange={(e) => setPatient("firstName", e.target.value)} autoComplete="given-name" />
          </div>
          <div>
            <label htmlFor="lastName" className="label">Last name</label>
            <input id="lastName" className="input" required value={form.patient.lastName} onChange={(e) => setPatient("lastName", e.target.value)} autoComplete="family-name" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" className="input" required value={form.patient.email} onChange={(e) => setPatient("email", e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label htmlFor="birthDate" className="label">Date of birth</label>
            <input id="birthDate" type="date" className="input" required value={form.patient.birthDate} onChange={(e) => setPatient("birthDate", e.target.value)} autoComplete="bday" />
          </div>
          <div>
            <label htmlFor="gender" className="label">Gender <span className="font-normal text-muted">(optional)</span></label>
            <select id="gender" className="input" value={form.patient.gender} onChange={(e) => setPatient("gender", e.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-lg font-semibold text-primary">Appointment</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="clinic" className="label">Clinic</label>
            <select id="clinic" className="input" required value={form.appointment.clinicId || ""} onChange={(e) => changeClinic(Number(e.target.value))}>
              <option value="">Select a clinic</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="doctor" className="label">Doctor</label>
            <select
              id="doctor"
              className="input"
              required
              disabled={!form.appointment.clinicId}
              value={form.appointment.doctorId || ""}
              onChange={(e) => setAppointment("doctorId", Number(e.target.value))}
            >
              <option value="">{form.appointment.clinicId ? "Select a doctor" : "Select a clinic first"}</option>
              {clinicDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName}{d.specialityName ? ` — ${d.specialityName}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="when" className="label">Date and time</label>
            <input id="when" type="datetime-local" step={900} className="input" required value={form.appointment.appointmentDateTime} onChange={(e) => setAppointment("appointmentDateTime", e.target.value)} />
          </div>
          <div>
            <label htmlFor="duration" className="label">Duration</label>
            <select id="duration" className="input" value={form.appointment.durationInMinutes} onChange={(e) => setAppointment("durationInMinutes", Number(e.target.value))}>
              {[15, 30, 45, 60].map((m) => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="category" className="label">Reason for visit</label>
            <input id="category" className="input" required maxLength={100} placeholder="e.g. Check-up, skin rash, follow-up" value={form.appointment.category} onChange={(e) => setAppointment("category", e.target.value)} />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={() => { setForm(emptyForm); setResult(null); }} disabled={pending}>
          Clear
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Booking..." : "Book appointment"}
        </Button>
      </div>
    </form>
  );
}
