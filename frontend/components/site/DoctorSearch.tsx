"use client";

import { useState, useTransition } from "react";
import { Search, Stethoscope } from "lucide-react";
import { searchDoctors } from "@/lib/actions/public";
import type { DoctorSearchResult } from "@/lib/types";
import { Button, LinkButton } from "@/components/ui/Button";
import IconBadge from "@/components/ui/IconBadge";

export default function DoctorSearch({ allDoctors }: { allDoctors: DoctorSearchResult[] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [results, setResults] = useState(allDoctors);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() && !lastName.trim()) {
      setResults(allDoctors);
      setSearched(false);
      return;
    }
    startTransition(async () => {
      const res = await searchDoctors(firstName.trim(), lastName.trim());
      if (!res.ok) setError(res.message ?? "Search failed.");
      setResults(res.results);
      setSearched(true);
    });
  };

  const showAll = () => {
    setFirstName("");
    setLastName("");
    setResults(allDoctors);
    setSearched(false);
    setError("");
  };

  return (
    <>
      <form onSubmit={search} className="card grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="firstName" className="label">First name</label>
          <input id="firstName" className="input" placeholder="e.g. Anna" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="lastName" className="label">Last name</label>
          <input id="lastName" className="input" placeholder="e.g. Berg" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            <Search className="h-4 w-4" aria-hidden /> {pending ? "Searching..." : "Search"}
          </Button>
          {searched && (
            <Button variant="ghost" onClick={showAll}>Show all</Button>
          )}
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {searched ? `${results.length} doctor${results.length === 1 ? "" : "s"} found` : `All doctors (${results.length})`}
      </p>

      {results.length === 0 ? (
        <div className="card mt-3 p-10 text-center text-muted">No doctors match your search.</div>
      ) : (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d, i) => (
            <li key={`${d.fullName}-${i}`} className="card flex items-center gap-4 p-5">
              <IconBadge icon={Stethoscope} tone={i % 2 === 0 ? "mint" : "sky"} />
              <div>
                <p className="font-semibold text-primary">Dr. {d.fullName}</p>
                <p className="text-sm text-muted">{d.specialityName ?? "General practice"}</p>
                <p className="text-sm text-muted">{d.clinicName}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 text-center">
        <LinkButton href="/book">Book an appointment</LinkButton>
      </div>
    </>
  );
}
