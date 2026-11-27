"use client";

import { useState } from "react";
import { saveClinic } from "@/lib/actions/staff";
import type { Clinic } from "@/lib/types";
import FormCard from "./FormCard";
import { useSave } from "./useSave";

export default function ClinicForm({ clinic }: { clinic?: Clinic }) {
  const { save, error, pending } = useSave("/staff/clinics");
  const [name, setName] = useState(clinic?.name ?? "");
  const [address, setAddress] = useState(clinic?.address ?? "");

  return (
    <FormCard
      onSubmit={(e) => { e.preventDefault(); save(() => saveClinic(clinic?.id ?? null, { name, address })); }}
      error={error}
      pending={pending}
      submitLabel={clinic ? "Save changes" : "Create clinic"}
      cancelHref="/staff/clinics"
    >
      <div>
        <label htmlFor="name" className="label">Clinic name</label>
        <input id="name" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="address" className="label">Address</label>
        <input id="address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
    </FormCard>
  );
}
