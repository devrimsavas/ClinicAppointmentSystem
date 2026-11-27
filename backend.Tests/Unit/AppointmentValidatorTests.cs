using ClinicBooking.Services;
using static ClinicBooking.Tests.TestData;

namespace ClinicBooking.Tests.Unit;

/// <summary>Rules that need the database: existing records and overlapping appointments.</summary>
public class AppointmentValidatorTests
{
    private readonly AppointmentValidator _validator = new(CreateDb(), new FixedTime(Now));

    private Task<string?> Validate(DateTime start, int doctorId, int? patientId, int duration = 30, int? excludeId = null, string category = "Checkup", int clinicId = 1) =>
        _validator.ValidateAsync(new AppointmentCandidate(start, duration, category, doctorId, clinicId, patientId, excludeId));

    [Fact]
    public async Task Free_slot_is_valid() =>
        Assert.Null(await Validate(Tuesday(11), doctorId: 1, patientId: 1));

    [Fact]
    public async Task Doctor_cannot_be_double_booked() =>
        Assert.Equal("Doctor is already booked at this time.", await Validate(Tuesday(10, 15), doctorId: 1, patientId: 2));

    [Fact]
    public async Task Patient_cannot_be_double_booked() =>
        Assert.Equal("Patient already has an overlapping appointment.", await Validate(Tuesday(10, 15), doctorId: 2, patientId: 1));

    [Fact]
    public async Task Back_to_back_appointments_are_allowed() =>
        Assert.Null(await Validate(Tuesday(10, 30), doctorId: 1, patientId: 1));

    [Fact]
    public async Task Updated_appointment_does_not_clash_with_itself() =>
        Assert.Null(await Validate(Tuesday(10), doctorId: 1, patientId: 1, duration: 45, excludeId: 1));

    [Fact]
    public async Task New_patient_is_only_checked_for_doctor_clashes() =>
        Assert.Equal("Doctor is already booked at this time.", await Validate(Tuesday(10), doctorId: 1, patientId: null));

    [Fact]
    public async Task Unknown_doctor_is_rejected() =>
        Assert.Equal("Doctor ID does not exist.", await Validate(Tuesday(11), doctorId: 99, patientId: 1));

    [Fact]
    public async Task Unknown_clinic_is_rejected() =>
        Assert.Equal("Clinic ID does not exist.", await Validate(Tuesday(11), doctorId: 1, patientId: 1, clinicId: 99));

    [Fact]
    public async Task Unknown_patient_is_rejected() =>
        Assert.Equal("Patient ID does not exist.", await Validate(Tuesday(11), doctorId: 1, patientId: 99));

    [Fact]
    public async Task Category_is_required() =>
        Assert.Equal("Category is required.", await Validate(Tuesday(11), doctorId: 1, patientId: 1, category: " "));
}
