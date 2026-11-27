"use client";

import { useState } from "react";
import { saveDoctor, type DoctorInput } from "@/lib/actions/staff";
import type { Clinic, Doctor, Speciality } from "@/lib/types";
import FormCard from "./FormCard";
import { useSave } from "./useSave";

export default function DoctorForm({ doctor, clinics, specialities }: { doctor?: Doctor; clinics: Clinic[]; specialities: Speciality[] }) {
  const { save, error, pending } = useSave("/staff/doctors");
  const [form, setForm] = useState<DoctorInput>({
    firstName: doctor?.firstName ?? "",
    lastName: doctor?.lastName ?? "",
    clinicId: doctor?.clinicId ?? 0,
    specialityId: doctor?.specialityId ?? 0,
  });
  const set = <K extends keyof DoctorInput>(key: K, value: DoctorInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <FormCard
      onSubmit={(e) => { e.preventDefault(); save(() => saveDoctor(doctor?.id ?? null, form)); }}
      error={error}
      pending={pending}
      submitLabel={doctor ? "Save changes" : "Create doctor"}
      cancelHref="/staff/doctors"
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
        <div>
          <label htmlFor="clinic" className="label">Clinic</label>
          <select id="clinic" className="input" required value={form.clinicId || ""} onChange={(e) => set("clinicId", Number(e.target.value))}>
            <option value="">Select a clinic</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="speciality" className="label">Speciality</label>
          <select id="speciality" className="input" required value={form.specialityId || ""} onChange={(e) => set("specialityId", Number(e.target.value))}>
            <option value="">Select a speciality</option>
            {specialities.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </FormCard>
  );
}
