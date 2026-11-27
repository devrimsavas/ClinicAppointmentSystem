//appointment controller with dto

using ClinicBooking.DTOs;
using ClinicBooking.Models;
using ClinicBooking.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicBooking.Controllers
{
    /// <summary>
    /// Controller for Appointments
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.AdminOrStaff)]
    public class AppointmentsController : ControllerBase
    {
        private const int MaxBusyRangeDays = 62;

        private readonly AppDbContext _context;
        private readonly AppointmentValidator _validator;
        private readonly TimeProvider _timeProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="AppointmentsController"/> class.
        /// </summary>
        public AppointmentsController(AppDbContext context, AppointmentValidator validator, TimeProvider timeProvider)
        {
            _context = context;
            _validator = validator;
            _timeProvider = timeProvider;
        }

        // GET all appointments
        /// <summary>
        /// Retrieves all appointments
        /// </summary>
        /// <remarks>
        /// Sample Request:
        ///     Get /api/Appointments
        /// </remarks>
        /// <response code="200">Appointments retrieved successfully (empty list if there are none)</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<AppointmentReadDto>>> GetAppointments()
        {
            var appointments = await AppointmentsWithDetails().ToListAsync();

            return Ok(new { appointments = appointments.Select(ToReadDto) });
        }

        // GET busy slots (public, no patient data)
        /// <summary>
        /// Retrieves booked time ranges without any patient information, for the public calendar.
        /// </summary>
        /// <remarks>
        /// Defaults to the next 31 days. The range can be at most 62 days.
        ///
        /// Sample request:
        ///     GET /api/appointments/busy?from=2026-12-01&amp;to=2026-12-31&amp;doctorId=2
        /// </remarks>
        /// <param name="from">Start of the range (inclusive). Defaults to today.</param>
        /// <param name="to">End of the range (exclusive). Defaults to 31 days after "from".</param>
        /// <param name="doctorId">Optional: only this doctor's appointments.</param>
        /// <response code="200">Busy slots retrieved successfully</response>
        /// <response code="400">Invalid range</response>
        [HttpGet("busy")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<BusySlotDto>>> GetBusySlots(
            [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int? doctorId)
        {
            var start = from ?? _timeProvider.GetLocalNow().Date;
            var end = to ?? start.AddDays(31);

            if (end <= start)
                return BadRequest(new { Message = "\"to\" must be after \"from\"." });

            if ((end - start).TotalDays > MaxBusyRangeDays)
                return BadRequest(new { Message = $"The range can be at most {MaxBusyRangeDays} days." });

            var query = _context.Appointments
                .Include(a => a.Doctor)
                .Where(a => a.AppointmentDateTime >= start && a.AppointmentDateTime < end);

            if (doctorId.HasValue)
                query = query.Where(a => a.DoctorId == doctorId.Value);

            var appointments = await query.ToListAsync();

            var slots = appointments
                .OrderBy(a => a.AppointmentDateTime)
                .Select(a => new BusySlotDto
                {
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor != null ? $"{a.Doctor.FirstName} {a.Doctor.LastName}" : "",
                    Start = a.AppointmentDateTime,
                    End = a.AppointmentDateTime.AddMinutes(a.DurationInMinutes)
                });

            return Ok(new { slots });
        }

        // GET by ID
        /// <summary>
        /// Retrieves an appointment by its ID.
        /// </summary>
        /// <remarks>GET: /api/appointments/{id}</remarks>
        /// <param name="id">The ID of the appointment</param>
        /// <response code="200">Returns the appointment</response>
        /// <response code="404">If the appointment is not found</response>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AppointmentReadDto>> GetAppointment(int id)
        {
            var appointment = await AppointmentsWithDetails().FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
                return NotFound(new { Message = "Appointment not found." });

            return Ok(new { appointment = ToReadDto(appointment) });
        }

        // POST: create appointment
        /// <summary>
        /// Creates a new appointment for an existing patient.
        /// </summary>
        /// <remarks>POST: /api/appointments</remarks>
        /// <param name="dto">The appointment data</param>
        /// <response code="201">Returns the created appointment</response>
        /// <response code="400">If data is invalid or conflicts exist</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AppointmentReadDto>> CreateAppointment([FromBody] AppointmentCreateDto dto)
        {
            var error = await _validator.ValidateAsync(new AppointmentCandidate(
                dto.AppointmentDateTime, dto.DurationInMinutes, dto.Category,
                dto.DoctorId, dto.ClinicId, PatientId: dto.PatientId));

            if (error != null)
                return BadRequest(new { Message = error });

            var appointment = new Appointment
            {
                AppointmentDateTime = dto.AppointmentDateTime,
                Category = dto.Category,
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                ClinicId = dto.ClinicId,
                DurationInMinutes = dto.DurationInMinutes
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return await CreatedResult(appointment.Id);
        }

        // PUT: update
        /// <summary>
        /// Updates an existing appointment.
        /// </summary>
        /// <remarks>PUT: /api/appointments/{id}</remarks>
        /// <param name="id">The ID of the appointment to update</param>
        /// <param name="dto">The updated appointment data</param>
        /// <response code="200">If the update was successful</response>
        /// <response code="400">If the data is invalid or conflicts exist</response>
        /// <response code="404">If the appointment is not found</response>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] AppointmentCreateDto dto)
        {
            var existing = await _context.Appointments.FindAsync(id);
            if (existing == null)
                return NotFound(new { Message = "Appointment not found." });

            var error = await _validator.ValidateAsync(new AppointmentCandidate(
                dto.AppointmentDateTime, dto.DurationInMinutes, dto.Category,
                dto.DoctorId, dto.ClinicId, PatientId: dto.PatientId, ExcludeAppointmentId: id));

            if (error != null)
                return BadRequest(new { Message = error });

            existing.AppointmentDateTime = dto.AppointmentDateTime;
            existing.Category = dto.Category;
            existing.PatientId = dto.PatientId;
            existing.DoctorId = dto.DoctorId;
            existing.ClinicId = dto.ClinicId;
            existing.DurationInMinutes = dto.DurationInMinutes;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Appointment updated successfully." });
        }

        // DELETE
        /// <summary>
        /// Deletes an appointment.
        /// </summary>
        /// <remarks>DELETE: /api/appointments/{id}</remarks>
        /// <param name="id">The ID of the appointment to delete</param>
        /// <response code="200">If the deletion was successful</response>
        /// <response code="404">If the appointment is not found</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { Message = "Appointment not found." });

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Appointment deleted successfully." });
        }

        //Create a new appointment with new or existing patient
        /// <summary>
        /// Creates a new appointment along with a new or existing patient record.
        /// </summary>
        /// <remarks>
        /// An existing patient is matched by first name, last name and email.
        /// The patient is only created if the appointment is valid.
        ///
        /// Sample request:
        ///
        /// {
        ///   "patient": {
        ///     "firstName": "Jane",
        ///     "lastName": "Doe",
        ///     "email": "jane@example.com",
        ///     "birthDate": "1992-08-15",
        ///     "gender": "Female"
        ///   },
        ///   "appointment": {
        ///     "appointmentDateTime": "2026-12-01T14:00:00",
        ///     "category": "Checkup",
        ///     "doctorId": 2,
        ///     "clinicId": 1,
        ///     "durationInMinutes": 30
        ///   }
        /// }
        ///
        /// </remarks>
        /// <param name="dto">Object containing patient and appointment details.</param>
        /// <returns>Returns the created appointment information.</returns>
        /// <response code="201">Appointment successfully created.</response>
        /// <response code="400">Invalid input or scheduling conflict.</response>
        [HttpPost("with-patient")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AppointmentReadDto>> CreateAppointmentWithPatient([FromBody] AppointmentWithPatientCreateDto dto)
        {
            var p = dto.Patient;
            var a = dto.Appointment;

            if (p == null || a == null)
                return BadRequest(new { Message = "Patient and appointment data are required." });

            if (string.IsNullOrWhiteSpace(p.FirstName) || string.IsNullOrWhiteSpace(p.LastName) || string.IsNullOrWhiteSpace(p.Email))
                return BadRequest(new { Message = "Patient info is required." });

            // Look up the patient, but do not create it before the appointment is validated
            var patient = await _context.Patients.FirstOrDefaultAsync(x =>
                x.FirstName == p.FirstName &&
                x.LastName == p.LastName &&
                x.Email == p.Email);

            var error = await _validator.ValidateAsync(new AppointmentCandidate(
                a.AppointmentDateTime, a.DurationInMinutes, a.Category,
                a.DoctorId, a.ClinicId, PatientId: patient?.Id));

            if (error != null)
                return BadRequest(new { Message = error });

            patient ??= new Patient
            {
                FirstName = p.FirstName,
                LastName = p.LastName,
                Email = p.Email,
                BirthDate = p.BirthDate,
                Gender = p.Gender
            };

            var newAppointment = new Appointment
            {
                AppointmentDateTime = a.AppointmentDateTime,
                Category = a.Category,
                Patient = patient,
                DoctorId = a.DoctorId,
                ClinicId = a.ClinicId,
                DurationInMinutes = a.DurationInMinutes
            };

            // Patient (if new) and appointment are saved together in one transaction
            _context.Appointments.Add(newAppointment);
            await _context.SaveChangesAsync();

            return await CreatedResult(newAppointment.Id);
        }

        private IQueryable<Appointment> AppointmentsWithDetails() =>
            _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.Clinic);

        private async Task<ActionResult<AppointmentReadDto>> CreatedResult(int appointmentId)
        {
            var created = await AppointmentsWithDetails().FirstAsync(a => a.Id == appointmentId);
            var dto = ToReadDto(created);

            return CreatedAtAction(nameof(GetAppointment), new { id = dto.Id }, dto);
        }

        private static AppointmentReadDto ToReadDto(Appointment a) => new()
        {
            Id = a.Id,
            AppointmentDateTime = a.AppointmentDateTime,
            Category = a.Category,
            DurationInMinutes = a.DurationInMinutes,
            PatientId = a.PatientId,
            DoctorId = a.DoctorId,
            ClinicId = a.ClinicId,
            PatientName = a.Patient != null ? $"{a.Patient.FirstName} {a.Patient.LastName}" : null,
            DoctorName = a.Doctor != null ? $"{a.Doctor.FirstName} {a.Doctor.LastName}" : null,
            ClinicName = a.Clinic?.Name
        };
    }
}
