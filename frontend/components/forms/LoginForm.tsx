"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export default function LoginForm({ next, expired }: { next?: string; expired?: boolean }) {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="space-y-5">
      {state && !state.ok && <Alert type="error" message={state.message} />}
      {!state && expired && <Alert type="error" message="Your session has expired. Please log in again." />}
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" className="input" required autoComplete="username" defaultValue={state?.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" className="input" required autoComplete="current-password" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
