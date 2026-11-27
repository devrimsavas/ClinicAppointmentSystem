"use client";

import { useState } from "react";
import { createUser, type UserInput } from "@/lib/actions/staff";
import FormCard from "./FormCard";
import { useSave } from "./useSave";

export default function UserForm() {
  const { save, error, pending } = useSave("/staff/users");
  const [form, setForm] = useState<UserInput>({ email: "", fullName: "", password: "", role: "Staff" });
  const set = <K extends keyof UserInput>(key: K, value: UserInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <FormCard
      onSubmit={(e) => { e.preventDefault(); save(() => createUser(form)); }}
      error={error}
      pending={pending}
      submitLabel="Create user"
      cancelHref="/staff/users"
    >
      <div>
        <label htmlFor="fullName" className="label">Full name</label>
        <input id="fullName" className="input" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
      </div>
      <div>
        <label htmlFor="email" className="label">Email (used to log in)</label>
        <input id="email" type="email" className="input" required autoComplete="off" value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="label">Temporary password</label>
        <input id="password" type="password" minLength={8} className="input" required autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} />
        <p className="mt-1 text-xs text-muted">At least 8 characters. The user can change it under &quot;My account&quot;.</p>
      </div>
      <fieldset>
        <legend className="label">Role</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            { value: "Staff", title: "Staff", text: "Front desk: appointments and patients." },
            { value: "Admin", title: "Admin", text: "Everything, incl. clinics, doctors and users." },
          ] as const).map((r) => (
            <label key={r.value} className={`card cursor-pointer p-4 ${form.role === r.value ? "border-primary ring-2 ring-primary/20" : ""}`}>
              <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={() => set("role", r.value)} className="sr-only" />
              <span className="block font-semibold text-primary">{r.title}</span>
              <span className="block text-sm text-muted">{r.text}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </FormCard>
  );
}
