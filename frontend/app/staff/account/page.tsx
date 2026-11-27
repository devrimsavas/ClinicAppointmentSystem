import type { Metadata } from "next";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import PageTitle from "@/components/ui/PageTitle";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <>
      <PageTitle title="My account" />
      <div className="card mb-6 max-w-md p-6 text-sm">
        <p><span className="text-muted">Name:</span> {session.name}</p>
        <p><span className="text-muted">Email:</span> {session.email}</p>
        <p><span className="text-muted">Role:</span> {session.role}</p>
      </div>
      <ChangePasswordForm />
    </>
  );
}
