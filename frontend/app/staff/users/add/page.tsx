import type { Metadata } from "next";
import UserForm from "@/components/forms/UserForm";
import PageTitle from "@/components/ui/PageTitle";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "New user" };

export default async function AddUserPage() {
  await requireSession("Admin");
  return (
    <>
      <PageTitle title="New staff user" />
      <UserForm />
    </>
  );
}
