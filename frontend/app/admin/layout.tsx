// app/admin/layout.tsx

import AdminNav from "@/components/AdminNavBar";
import {Settings } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-admin-bg text-admin-text p-6 rounded-xl ">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl border border-admin-border p-8">
        <h1 className="text-3xl font-bold mb-6 text-admin-accent text-center flex items-center justify-center gap-3">
          <Settings className="w-8 h-8 text-primary-dark" />
          Admin Panel
        </h1>
        <AdminNav />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
