// Shapes returned by the ASP.NET Core API (JSON is camelCase).

export type Role = "Admin" | "Staff";

export interface Clinic {
  id: number;
  name: string;
  address: string | null;
}

export interface Speciality {
  id: number;
  name: string;
}

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  clinicId: number;
  specialityId: number;
  clinicName: string | null;
  specialityName: string | null;
}

export interface DoctorSearchResult {
  fullName: string;
  clinicName: string | null;
  specialityName: string | null;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string | null;
  gender: string | null;
}

export interface Appointment {
  id: number;
  appointmentDateTime: string;
  category: string;
  durationInMinutes: number;
  patientId: number;
  doctorId: number;
  clinicId: number;
  patientName: string | null;
  doctorName: string | null;
  clinicName: string | null;
}

export interface BusySlot {
  doctorId: number;
  doctorName: string;
  start: string;
  end: string;
}

export interface StaffUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

/** Result of a server action, shown to the user by the form. */
export type ActionResult = { ok: true; message?: string } | { ok: false; message: string };
