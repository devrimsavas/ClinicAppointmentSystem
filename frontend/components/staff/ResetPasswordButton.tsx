"use client";

import { useState, useTransition } from "react";
import { resetUserPassword } from "@/lib/actions/staff";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordButton({ userId, name }: { userId: number; name: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => { setOpen(false); setPassword(""); setMessage(null); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await resetUserPassword(userId, password);
      setMessage({ ok: result.ok, text: result.message ?? "" });
      if (result.ok) setPassword("");
    });
  };

  return (
    <>
      <Button variant="secondary" className="px-3 py-1.5" onClick={() => setOpen(true)}>Reset password</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6 shadow-xl">
            <h2 className="text-lg">New password for {name}</h2>
            {message && <p className={`text-sm ${message.ok ? "text-success" : "text-danger"}`}>{message.text}</p>}
            <input type="password" minLength={8} required className="input" placeholder="At least 8 characters" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={close}>Close</Button>
              <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Set password"}</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
