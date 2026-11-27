"use server";

// Server actions for the public site. They call public API endpoints only.

import { apiGet, apiSend } from "@/lib/api";
import type { ActionResult, BusySlot, DoctorSearchResult } from "@/lib/types";

export interface BookingInput {
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    gender: string;
  };
  appointment: {
    appointmentDateTime: string;
    category: string;
    doctorId: number;
    clinicId: number;
    durationInMinutes: number;
  };
}

export async function bookAppointment(input: BookingInput): Promise<ActionResult> {
  const result = await apiSend("POST", "/appointments/with-patient", {
    patient: { ...input.patient, birthDate: input.patient.birthDate || null, gender: input.patient.gender || null },
    appointment: input.appointment,
  }, { auth: false });

  return result.ok ? { ok: true, message: "Your appointment is booked. We look forward to seeing you." } : result;
}

export async function searchDoctors(firstName: string, lastName: string): Promise<{ ok: boolean; message?: string; results: DoctorSearchResult[] }> {
  const result = await apiSend<{ results: DoctorSearchResult[] }>("POST", "/search/doctors", { firstName, lastName }, { auth: false });
  if (!result.ok) return { ok: false, message: result.message, results: [] };
  return { ok: true, results: result.data?.results ?? [] };
}

/** Booked time ranges (no patient data) for the public calendar. */
export async function getBusySlots(from: string, to: string, doctorId?: number): Promise<BusySlot[]> {
  const query = new URLSearchParams({ from, to });
  if (doctorId) query.set("doctorId", String(doctorId));

  return apiGet<BusySlot[]>(`/appointments/busy?${query}`, "slots", { auth: false });
}
