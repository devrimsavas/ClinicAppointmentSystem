"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/types";
import { Button } from "./Button";

interface ConfirmDeleteProps {
  /** Bound server action, e.g. deleteDoctor.bind(null, id) */
  action: () => Promise<ActionResult>;
  label: string;
}

export default function ConfirmDelete({ action, label }: ConfirmDeleteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message);
      }
    });

  return (
    <>
      <Button variant="danger" className="px-3 py-1.5" onClick={() => setOpen(true)}>
        Delete
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-lg">Delete {label}?</h2>
            <p className="mt-2 text-sm text-muted">This cannot be undone.</p>
            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setOpen(false); setError(""); }} disabled={pending}>
                Cancel
              </Button>
              <Button variant="primary" className="bg-danger hover:bg-danger/90" onClick={confirm} disabled={pending}>
                {pending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
