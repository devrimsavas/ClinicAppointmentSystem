"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/types";

/** Runs a save server action; on success goes back to the list, on failure keeps the form and shows the error. */
export function useSave(listHref: string) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const save = (action: () => Promise<ActionResult>) => {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        router.push(listHref);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return { save, error, pending };
}
