"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/auth";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <form action={action} className="card max-w-md space-y-5 p-6" key={state?.ok ? "done" : "form"}>
      <h2 className="text-xl">Change password</h2>
      {state && <Alert type={state.ok ? "success" : "error"} message={state.message ?? ""} />}
      <div>
        <label htmlFor="currentPassword" className="label">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" className="input" required autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="newPassword" className="label">New password</label>
        <input id="newPassword" name="newPassword" type="password" minLength={8} className="input" required autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">Repeat new password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} className="input" required autoComplete="new-password" />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Change password"}</Button>
    </form>
  );
}
