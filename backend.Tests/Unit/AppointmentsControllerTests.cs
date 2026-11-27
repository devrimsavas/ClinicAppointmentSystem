using ClinicBooking.Controllers;
using ClinicBooking.DTOs;
using ClinicBooking.Models;
using ClinicBooking.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static ClinicBooking.Tests.TestData;

namespace ClinicBooking.Tests.Unit;

public class AppointmentsControllerTests
{
    private readonly AppDbContext _db = CreateDb();
    private readonly AppointmentsController _controller;

    public AppointmentsControllerTests()
    {
        var time = new FixedTime(Now);
        _controller = new AppointmentsController(_db, new AppointmentValidator(_db, time), time);
    }

    private static AppointmentCreateDto Dto(DateTime start, int doctorId, int patientId, int duration = 30) => new()
    {
        AppointmentDateTime = start, DurationInMinutes = duration, Category = "Checkup",
        DoctorId = doctorId, PatientId = patientId, ClinicId = 1
    };

    [Fact]
    public async Task Update_into_a_busy_doctor_slot_is_rejected()
    {
        // This used to be allowed: PUT only checked the patient
        var result = await _controller.UpdateAppointment(1, Dto(Tuesday(13), doctorId: 2, patientId: 1));
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Update_outside_working_hours_is_rejected()
    {
        var result = await _controller.UpdateAppointment(1, Dto(Tuesday(17, 50), doctorId: 1, patientId: 1, duration: 60));
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Valid_update_is_saved()
    {
        var result = await _controller.UpdateAppointment(1, Dto(Tuesday(11), doctorId: 1, patientId: 1));

        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(Tuesday(11), (await _db.Appointments.FindAsync(1))!.AppointmentDateTime);
    }

    [Fact]
    public async Task Update_of_unknown_appointment_returns_404() =>
        Assert.IsType<NotFoundObjectResult>(await _controller.UpdateAppointment(999, Dto(Tuesday(11), 1, 1)));

    [Fact]
    public async Task Create_returns_201_with_ids_and_names()
    {
        var result = await _controller.CreateAppointment(Dto(Tuesday(14), doctorId: 1, patientId: 2));

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<AppointmentReadDto>(created.Value);
        Assert.Equal(1, dto.DoctorId);
        Assert.Equal(2, dto.PatientId);
        Assert.Equal("Ann Lee", dto.DoctorName);
    }

    [Fact]
    public async Task Rejected_booking_with_patient_does_not_create_the_patient()
    {
        var before = await _db.Patients.CountAsync();

        var result = await _controller.CreateAppointmentWithPatient(new AppointmentWithPatientCreateDto
        {
            Patient = new PatientCreateDto { FirstName = "New", LastName = "Person", Email = "new@example.com" },
            Appointment = new AppointmentSubDto { AppointmentDateTime = new DateTime(2026, 12, 5, 10, 0, 0), DurationInMinutes = 30, Category = "Checkup", DoctorId = 1, ClinicId = 1 }
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal(before, await _db.Patients.CountAsync());
    }

    [Fact]
    public async Task Valid_booking_with_new_patient_creates_both()
    {
        var result = await _controller.CreateAppointmentWithPatient(new AppointmentWithPatientCreateDto
        {
            Patient = new PatientCreateDto { FirstName = "New", LastName = "Person", Email = "new@example.com" },
            Appointment = new AppointmentSubDto { AppointmentDateTime = Tuesday(15), DurationInMinutes = 30, Category = "Checkup", DoctorId = 2, ClinicId = 1 }
        });

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal("New Person", ((AppointmentReadDto)created.Value!).PatientName);
        Assert.True(await _db.Patients.AnyAsync(p => p.Email == "new@example.com"));
    }

    [Fact]
    public async Task Booking_with_existing_patient_checks_their_other_appointments()
    {
        var result = await _controller.CreateAppointmentWithPatient(new AppointmentWithPatientCreateDto
        {
            Patient = new PatientCreateDto { FirstName = "Jane", LastName = "Doe", Email = "jane@example.com" },
            Appointment = new AppointmentSubDto { AppointmentDateTime = Tuesday(10, 15), DurationInMinutes = 30, Category = "Checkup", DoctorId = 2, ClinicId = 1 }
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task List_is_200_even_when_empty()
    {
        _db.Appointments.RemoveRange(_db.Appointments);
        await _db.SaveChangesAsync();
        Assert.IsType<OkObjectResult>((await _controller.GetAppointments()).Result);
    }

    [Fact]
    public async Task Busy_slots_contain_no_patient_data()
    {
        var result = await _controller.GetBusySlots(Tuesday(0), Tuesday(0).AddDays(1), doctorId: null);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var slots = ((IEnumerable<BusySlotDto>)ok.Value!.GetType().GetProperty("slots")!.GetValue(ok.Value)!).ToList();
        Assert.Equal(2, slots.Count);
        Assert.Equal(Tuesday(10, 30), slots[0].End);
        Assert.DoesNotContain(typeof(BusySlotDto).GetProperties(), p => p.Name.Contains("Patient"));
    }

    [Fact]
    public async Task Busy_slots_reject_a_too_long_range()
    {
        var result = await _controller.GetBusySlots(new DateTime(2026, 1, 1), new DateTime(2026, 6, 1), null);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
