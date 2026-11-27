"use server";

// Server actions for the staff portal. Each one forwards the logged-in user's token to the API,
// which decides what the user may do (Admin vs Staff). The UI only hides what a role cannot use.

import { revalidatePath } from "next/cache";
import { apiSend } from "@/lib/api";
import type { ActionResult } from "@/lib/types";

async function send(method: "POST" | "PUT" | "DELETE", path: string, body: unknown, listPath: string, success: string): Promise<ActionResult> {
  const result = await apiSend(method, path, body);
  if (!result.ok) return result;
  revalidatePath(listPath);
  return { ok: true, message: success };
}

// ---------- Appointments (Staff + Admin) ----------
export interface AppointmentInput {
  appointmentDateTime: string;
  category: string;
  patientId: number;
  doctorId: number;
  clinicId: number;
  durationInMinutes: number;
}

export async function saveAppointment(id: number | null, input: AppointmentInput): Promise<ActionResult> {
  return id
    ? send("PUT", `/appointments/${id}`, input, "/staff/appointments", "Appointment updated.")
    : send("POST", "/appointments", input, "/staff/appointments", "Appointment created.");
}

export async function deleteAppointment(id: number): Promise<ActionResult> {
  return send("DELETE", `/appointments/${id}`, undefined, "/staff/appointments", "Appointment deleted.");
}

// ---------- Patients (Staff + Admin) ----------
export interface PatientInput {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender: string;
}

export async function savePatient(id: number | null, input: PatientInput): Promise<ActionResult> {
  const body = { ...input, birthDate: input.birthDate || null, gender: input.gender || null };
  return id
    ? send("PUT", `/patients/${id}`, body, "/staff/patients", "Patient updated.")
    : send("POST", "/patients", body, "/staff/patients", "Patient created.");
}

export async function deletePatient(id: number): Promise<ActionResult> {
  return send("DELETE", `/patients/${id}`, undefined, "/staff/patients", "Patient deleted.");
}

// ---------- Clinics (Admin) ----------
export async function saveClinic(id: number | null, input: { name: string; address: string }): Promise<ActionResult> {
  return id
    ? send("PUT", `/clinics/${id}`, input, "/staff/clinics", "Clinic updated.")
    : send("POST", "/clinics", input, "/staff/clinics", "Clinic created.");
}

export async function deleteClinic(id: number): Promise<ActionResult> {
  return send("DELETE", `/clinics/${id}`, undefined, "/staff/clinics", "Clinic deleted.");
}

// ---------- Doctors (Admin) ----------
export interface DoctorInput {
  firstName: string;
  lastName: string;
  clinicId: number;
  specialityId: number;
}

export async function saveDoctor(id: number | null, input: DoctorInput): Promise<ActionResult> {
  return id
    ? send("PUT", `/doctors/${id}`, input, "/staff/doctors", "Doctor updated.")
    : send("POST", "/doctors", input, "/staff/doctors", "Doctor created.");
}

export async function deleteDoctor(id: number): Promise<ActionResult> {
  return send("DELETE", `/doctors/${id}`, undefined, "/staff/doctors", "Doctor deleted.");
}

// ---------- Specialities (Admin) ----------
export async function saveSpeciality(id: number | null, input: { name: string }): Promise<ActionResult> {
  return id
    ? send("PUT", `/specialities/${id}`, input, "/staff/specialities", "Speciality updated.")
    : send("POST", "/specialities", input, "/staff/specialities", "Speciality created.");
}

export async function deleteSpeciality(id: number): Promise<ActionResult> {
  return send("DELETE", `/specialities/${id}`, undefined, "/staff/specialities", "Speciality deleted.");
}

// ---------- Staff users (Admin) ----------
export interface UserInput {
  email: string;
  fullName: string;
  password: string;
  role: "Admin" | "Staff";
}

export async function createUser(input: UserInput): Promise<ActionResult> {
  return send("POST", "/users", input, "/staff/users", "User created.");
}

export async function resetUserPassword(id: number, newPassword: string): Promise<ActionResult> {
  return send("PUT", `/users/${id}/password`, { newPassword }, "/staff/users", "Password reset.");
}

export async function deleteUser(id: number): Promise<ActionResult> {
  return send("DELETE", `/users/${id}`, undefined, "/staff/users", "User deleted.");
}
