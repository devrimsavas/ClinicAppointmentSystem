import type { LucideIcon } from "lucide-react";

const tones = {
  mint: "bg-mint",
  sky: "bg-sky",
  soft: "bg-primary-soft",
} as const;

export default function IconBadge({ icon: Icon, tone = "mint", size = "md" }: { icon: LucideIcon; tone?: keyof typeof tones; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const icon = size === "lg" ? "h-7 w-7" : "h-6 w-6";
  return (
    <span className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>
      <Icon className={`${icon} text-primary`} strokeWidth={1.6} aria-hidden />
    </span>
  );
}
