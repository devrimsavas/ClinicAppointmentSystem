import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import LoginForm from "@/components/forms/LoginForm";
import IconBadge from "@/components/ui/IconBadge";

export const metadata: Metadata = { title: "Staff login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  const { next, expired } = await searchParams;

  return (
    <div className="card mx-auto max-w-md p-8">
      <div className="mb-6 flex items-center gap-4">
        <IconBadge icon={LockKeyhole} tone="sky" />
        <div>
          <h1 className="text-2xl">Staff login</h1>
          <p className="text-sm text-muted">For NovaMed clinic staff only.</p>
        </div>
      </div>
      <LoginForm next={next} expired={expired === "1"} />
      <p className="mt-6 text-sm text-muted">Patients do not need an account to book an appointment.</p>
    </div>
  );
}
