import type { ReactNode } from "react";

export interface Column<T> {
  label: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id: number }> {
  rows: T[];
  columns: Column<T>[];
  actions?: (row: T) => ReactNode;
  empty: string;
}

export default function DataTable<T extends { id: number }>({ rows, columns, actions, empty }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <div className="card p-10 text-center text-muted">{empty}</div>;
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-primary-soft/60 text-primary">
          <tr>
            {columns.map((c) => (
              <th key={c.label} className="px-4 py-3 font-semibold">{c.label}</th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-sand/60">
              {columns.map((c) => (
                <td key={c.label} className="px-4 py-3">{c.render(row)}</td>
              ))}
              {actions && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
