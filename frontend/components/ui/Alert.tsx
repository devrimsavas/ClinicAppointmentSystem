import { CircleAlert, CircleCheck } from "lucide-react";

interface AlertProps {
  type: "success" | "error";
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const styles =
    type === "success"
      ? "bg-mint text-success border-success/20"
      : "bg-danger/5 text-danger border-danger/20";
  const Icon = type === "success" ? CircleCheck : CircleAlert;

  return (
    <div role={type === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
