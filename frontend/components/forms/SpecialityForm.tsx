"use client";

import { useState } from "react";
import { saveSpeciality } from "@/lib/actions/staff";
import type { Speciality } from "@/lib/types";
import FormCard from "./FormCard";
import { useSave } from "./useSave";

export default function SpecialityForm({ speciality }: { speciality?: Speciality }) {
  const { save, error, pending } = useSave("/staff/specialities");
  const [name, setName] = useState(speciality?.name ?? "");

  return (
    <FormCard
      onSubmit={(e) => { e.preventDefault(); save(() => saveSpeciality(speciality?.id ?? null, { name })); }}
      error={error}
      pending={pending}
      submitLabel={speciality ? "Save changes" : "Create speciality"}
      cancelHref="/staff/specialities"
    >
      <div>
        <label htmlFor="name" className="label">Speciality name</label>
        <input id="name" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    </FormCard>
  );
}
