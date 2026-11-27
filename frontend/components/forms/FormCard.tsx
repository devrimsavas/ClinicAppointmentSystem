import type { ReactNode } from "react";
import Alert from "@/components/ui/Alert";
import { Button, LinkButton } from "@/components/ui/Button";

interface FormCardProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string;
  pending: boolean;
  submitLabel: string;
  cancelHref: string;
  children: ReactNode;
}

export default function FormCard({ onSubmit, error, pending, submitLabel, cancelHref, children }: FormCardProps) {
  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-5 p-6 md:p-8">
      {error && <Alert type="error" message={error} />}
      {children}
      <div className="flex justify-end gap-3 pt-2">
        <LinkButton href={cancelHref} variant="secondary">Cancel</LinkButton>
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
