using ClinicBooking.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicBooking.Services
{
    /// <summary>
    /// The data an appointment is validated against.
    /// PatientId is null when the patient does not exist yet (new patient booking).
    /// ExcludeAppointmentId is set on update, so the appointment does not clash with itself.
    /// </summary>
    public record AppointmentCandidate(
        DateTime Start,
        int DurationInMinutes,
        string? Category,
        int DoctorId,
        int ClinicId,
        int? PatientId = null,
        int? ExcludeAppointmentId = null);

    /// <summary>
    /// Single place for all appointment booking rules.
    /// Used by create, create-with-patient and update, so every endpoint enforces the same rules.
    /// </summary>
    public class AppointmentValidator
    {
        public static readonly TimeSpan OpeningTime = TimeSpan.FromHours(8);
        public static readonly TimeSpan ClosingTime = TimeSpan.FromHours(18);

        private readonly AppDbContext _context;
        private readonly TimeProvider _timeProvider;

        public AppointmentValidator(AppDbContext context, TimeProvider timeProvider)
        {
            _context = context;
            _timeProvider = timeProvider;
        }

        /// <summary>
        /// Validates an appointment. Returns an error message, or null if the appointment is valid.
        /// </summary>
        public async Task<string?> ValidateAsync(AppointmentCandidate candidate)
        {
            // 1. Input and schedule rules (no database needed)
            if (string.IsNullOrWhiteSpace(candidate.Category))
                return "Category is required.";

            var now = _timeProvider.GetLocalNow().DateTime;
            var scheduleError = CheckSchedule(candidate.Start, candidate.DurationInMinutes, now);
            if (scheduleError != null)
                return scheduleError;

            // 2. Referenced records must exist
            if (!await _context.Doctors.AnyAsync(d => d.ID == candidate.DoctorId))
                return "Doctor ID does not exist.";

            if (!await _context.Clinics.AnyAsync(c => c.ID == candidate.ClinicId))
                return "Clinic ID does not exist.";

            if (candidate.PatientId.HasValue &&
                !await _context.Patients.AnyAsync(p => p.Id == candidate.PatientId.Value))
                return "Patient ID does not exist.";

            // 3. No overlapping appointments for the doctor or the patient
            var start = candidate.Start;
            var end = start.AddMinutes(candidate.DurationInMinutes);

            var others = _context.Appointments.AsQueryable();
            if (candidate.ExcludeAppointmentId.HasValue)
                others = others.Where(a => a.Id != candidate.ExcludeAppointmentId.Value);

            // Two time ranges overlap when each one starts before the other one ends
            var overlapping = others.Where(a =>
                start < a.AppointmentDateTime.AddMinutes(a.DurationInMinutes) &&
                a.AppointmentDateTime < end);

            if (await overlapping.AnyAsync(a => a.DoctorId == candidate.DoctorId))
                return "Doctor is already booked at this time.";

            if (candidate.PatientId.HasValue &&
                await overlapping.AnyAsync(a => a.PatientId == candidate.PatientId.Value))
                return "Patient already has an overlapping appointment.";

            return null;
        }

        /// <summary>
        /// Pure schedule rules: positive duration, not in the past, weekdays only,
        /// and the whole appointment must fit inside working hours on the same day.
        /// </summary>
        public static string? CheckSchedule(DateTime start, int durationInMinutes, DateTime now)
        {
            if (durationInMinutes <= 0)
                return "Duration must be greater than zero.";

            if (start < now)
                return "You cannot book an appointment in the past.";

            if (start.DayOfWeek == DayOfWeek.Saturday || start.DayOfWeek == DayOfWeek.Sunday)
                return "Appointments can only be booked on weekdays.";

            var end = start.AddMinutes(durationInMinutes);
            if (start.TimeOfDay < OpeningTime || end.Date != start.Date || end.TimeOfDay > ClosingTime)
                return "Appointments must start and end between 08:00 and 18:00.";

            return null;
        }
    }
}
