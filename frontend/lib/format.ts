// Display helpers. The API sends local clinic times without a time zone ("2026-12-01T10:00:00").

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return dateFormat.format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return `${dateFormat.format(d)}, ${timeFormat.format(d)}`;
}

/** "2026-12-01T10:00:00" -> "2026-12-01T10:00" for <input type="datetime-local">. */
export function toDateTimeInput(value: string | null | undefined): string {
  return value ? value.slice(0, 16) : "";
}

/** "1990-05-01T00:00:00" -> "1990-05-01" for <input type="date">. */
export function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}
