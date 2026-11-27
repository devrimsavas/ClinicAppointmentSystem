import type { Metadata } from "next";
import { Plus } from "lucide-react";
import ResetPasswordButton from "@/components/staff/ResetPasswordButton";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import DataTable from "@/components/ui/DataTable";
import { LinkButton } from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { deleteUser } from "@/lib/actions/staff";
import { apiGet } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { requireSession } from "@/lib/session";
import type { StaffUser } from "@/lib/types";

export const metadata: Metadata = { title: "Staff users" };

export default async function UsersPage() {
  const session = await requireSession("Admin");
  const users = await apiGet<StaffUser[]>("/users", "users");

  return (
    <>
      <PageTitle
        title="Staff users"
        description="People who can log in to the staff portal. Patients do not have accounts."
        action={<LinkButton href="/staff/users/add"><Plus className="h-4 w-4" aria-hidden /> New user</LinkButton>}
      />
      <DataTable
        rows={users}
        empty="No users."
        columns={[
          { label: "Name", render: (u) => <>{u.fullName}{u.id === session.userId && <span className="ml-2 text-xs text-muted">(you)</span>}</> },
          { label: "Email", render: (u) => u.email },
          {
            label: "Role",
            render: (u) => (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold text-primary ${u.role === "Admin" ? "bg-primary-soft" : "bg-mint"}`}>{u.role}</span>
            ),
          },
          { label: "Created", render: (u) => formatDate(u.createdAt) },
        ]}
        actions={(u) =>
          u.id === session.userId ? null : (
            <>
              <ResetPasswordButton userId={u.id} name={u.fullName} />
              <ConfirmDelete action={deleteUser.bind(null, u.id)} label={u.fullName} />
            </>
          )
        }
      />
    </>
  );
}
