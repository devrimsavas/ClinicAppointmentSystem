"use client";

import { Button } from "@/components/ui/Button";

// Shown when a page fails to load data, e.g. the API is not running
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-2 text-muted">{error.message || "The page could not be loaded."}</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </main>
  );
}
