"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPilot, DayPilotCalendar, DayPilotMonth } from "@daypilot/daypilot-lite-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBusySlots } from "@/lib/actions/public";
import type { Appointment, Doctor } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface CalendarEvent {
  id: string;
  start: string;
  end: string;
  doctorId: number;
  title: string;
  lines: string[];
}

type Props =
  | { mode: "public"; doctors: Doctor[] }
  | { mode: "staff"; doctors: Doctor[]; appointments: Appointment[] };

// Values come from users (patient names, reason for visit), so never put them into HTML unescaped
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** DayPilot needs "yyyy-MM-ddTHH:mm:ss"; accept values without seconds or with fractions too. */
function normalize(iso: string): string {
  const value = iso.slice(0, 19);
  return value.length === 16 ? `${value}:00` : value;
}

function addMinutes(iso: string, minutes: number): string {
  return new DayPilot.Date(normalize(iso)).addMinutes(minutes).toString("yyyy-MM-ddTHH:mm:ss");
}

export default function AppointmentCalendar(props: Props) {
  const [month, setMonth] = useState(DayPilot.Date.today().firstDayOfMonth());
  const [day, setDay] = useState(DayPilot.Date.today());
  const [doctorId, setDoctorId] = useState(0);
  const [publicEvents, setPublicEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState("");

  // Public mode: load busy slots for the visible month from the API
  useEffect(() => {
    if (props.mode !== "public") return;
    let cancelled = false;
    getBusySlots(month.toString("yyyy-MM-dd"), month.addMonths(1).toString("yyyy-MM-dd"), doctorId || undefined)
      .then((slots) => {
        if (cancelled) return;
        setError("");
        setPublicEvents(
          slots.map((s, i) => ({
            id: `${s.doctorId}-${s.start}-${i}`,
            start: normalize(s.start),
            end: normalize(s.end),
            doctorId: s.doctorId,
            title: "Booked",
            lines: [`Dr. ${s.doctorName}`],
          })),
        );
      })
      .catch(() => !cancelled && setError("Could not load the calendar. Please try again later."));
    return () => {
      cancelled = true;
    };
  }, [props.mode, month, doctorId]);

  const staffAppointments = props.mode === "staff" ? props.appointments : null;

  const events = useMemo(() => {
    if (!staffAppointments) return publicEvents;
    return staffAppointments
      .filter((a) => !doctorId || a.doctorId === doctorId)
      .map((a) => ({
        id: String(a.id),
        start: normalize(a.appointmentDateTime),
        end: addMinutes(a.appointmentDateTime, a.durationInMinutes),
        doctorId: a.doctorId,
        title: a.patientName ?? "Appointment",
        lines: [`Dr. ${a.doctorName ?? ""}`, a.category],
      }));
  }, [staffAppointments, publicEvents, doctorId]);

  const dpEvents = events.map((e) => ({ id: e.id, start: e.start, end: e.end, text: e.title, data: e }));

  // Month cells are small: time + title + doctor. The day view has room for the reason too.
  const renderEvent = (view: "month" | "day") => (args: { data: { html?: string; backColor?: string; borderColor?: string; fontColor?: string; data?: CalendarEvent } }) => {
    const e = args.data.data!;
    const time = new DayPilot.Date(e.start).toString("HH:mm");
    const lines = view === "month" ? e.lines.slice(0, 1) : e.lines;
    args.data.html =
      `<div style="line-height:1.3;padding:3px 6px;font-size:12px;overflow:hidden">` +
      `<div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(time)} · ${escapeHtml(e.title)}</div>` +
      lines.map((l) => `<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(l)}</div>`).join("") +
      `</div>`;
    args.data.backColor = props.mode === "public" ? "#dcebf5" : "#d6efe4";
    args.data.borderColor = "#0f3570";
    args.data.fontColor = "#0f3570";
  };

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-3" onClick={() => setMonth(month.addMonths(-1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-40 text-center text-lg font-semibold text-primary">{month.toString("MMMM yyyy")}</span>
          <Button variant="secondary" className="px-3" onClick={() => setMonth(month.addMonths(1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => { setMonth(DayPilot.Date.today().firstDayOfMonth()); setDay(DayPilot.Date.today()); }}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="doctorFilter" className="text-sm font-medium">Doctor</label>
          <select id="doctorFilter" className="input w-56" value={doctorId} onChange={(e) => setDoctorId(Number(e.target.value))}>
            <option value={0}>All doctors</option>
            {props.doctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="card overflow-hidden p-2">
          <DayPilotMonth
            startDate={month}
            events={dpEvents}
            eventHeight={42}
            cellHeight={130}
            locale="en-gb"
            eventClickHandling="Disabled"
            eventMoveHandling="Disabled"
            timeRangeSelectedHandling="Enabled"
            onTimeRangeSelected={(args) => {
              setDay(args.start);
              args.control.clearSelection();
            }}
            onBeforeEventRender={renderEvent("month") as never}
          />
        </div>

        <div className="card overflow-hidden p-2">
          <div className="flex items-center justify-between px-2 py-2">
            <Button variant="ghost" className="px-2" onClick={() => setDay(day.addDays(-1))} aria-label="Previous day">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-primary">{day.toString("dddd d MMMM")}</span>
            <Button variant="ghost" className="px-2" onClick={() => setDay(day.addDays(1))} aria-label="Next day">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <DayPilotCalendar
            viewType="Day"
            startDate={day}
            events={dpEvents}
            businessBeginsHour={8}
            businessEndsHour={18}
            cellHeight={44}
            locale="en-gb"
            eventClickHandling="Disabled"
            eventMoveHandling="Disabled"
            timeRangeSelectedHandling="Disabled"
            durationBarVisible={false}
            onBeforeEventRender={renderEvent("day") as never}
          />
        </div>
      </div>
      <p className="text-xs text-muted">Click a day in the month view to see it on the right.</p>
    </div>
  );
}
