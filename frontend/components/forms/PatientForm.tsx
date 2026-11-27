"use client";

import { useState } from "react";
import { savePatient, type PatientInput } from "@/lib/actions/staff";
import { toDateInput } from "@/lib/format";
import type { Patient } from "@/lib/types";
import FormCard from "./FormCard";
import { useSave } from "./useSave";

export default function PatientForm({ patient }: { patient?: Patient }) {
  const { save, error, pending } = useSave("/staff/patients");
  const [form, setForm] = useState<PatientInput>({
    firstName: patient?.firstName ?? "",
    lastName: patient?.lastName ?? "",
    email: patient?.email ?? "",
    birthDate: toDateInput(patient?.birthDate),
    gender: patient?.gender ?? "",
  });
  const set = (key: keyof PatientInput, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <FormCard
      onSubmit={(e) => { e.preventDefault(); save(() => savePatient(patient?.id ?? null, form)); }}
      error={error}
      pending={pending}
      submitLabel={patient ? "Save changes" : "Create patient"}
      cancelHref="/staff/patients"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="label">First name</label>
          <input id="firstName" className="input" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
        </div>
        <div>
          <label htmlFor="lastName" className="label">Last name</label>
          <input id="lastName" className="input" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label htmlFor="birthDate" className="label">Date of birth</label>
          <input id="birthDate" type="date" className="input" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
        </div>
        <div>
          <label htmlFor="gender" className="label">Gender</label>
          <select id="gender" className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Not specified</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>
      </div>
    </FormCard>
  );
}
