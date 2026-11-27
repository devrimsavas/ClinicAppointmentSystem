import { CalendarX2, Clock, Hourglass, ShieldCheck } from "lucide-react";

// The rules are enforced by the backend (AppointmentValidator); this only explains them.
const rules = [
  { icon: Clock, text: "Appointments start at 08:00 at the earliest and must end by 18:00." },
  { icon: CalendarX2, text: "We are open on weekdays only. Past dates cannot be booked." },
  { icon: Hourglass, text: "A doctor can only see one patient at a time. If a time is taken, choose another." },
  { icon: ShieldCheck, text: "We only use your details to manage your appointment." },
];

export default function BookingRules() {
  return (
    <aside className="card bg-sky/40 p-6">
      <h2 className="text-lg">Good to know</h2>
      <ul className="mt-4 space-y-4">
        {rules.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 text-sm">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
