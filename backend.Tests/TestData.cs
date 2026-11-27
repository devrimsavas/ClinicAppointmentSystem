using System.Security.Claims;
using ClinicBooking.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicBooking.Tests;

/// <summary>A clock that always returns the same local time, so date rules are testable.</summary>
public class FixedTime(DateTime localNow) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => new(localNow, TimeSpan.Zero);
    public override TimeZoneInfo LocalTimeZone => TimeZoneInfo.Utc;
}

public static class TestData
{
    /// <summary>"Now" in the unit tests: Monday 30 Nov 2026, 09:00.</summary>
    public static readonly DateTime Now = new(2026, 11, 30, 9, 0, 0);

    /// <summary>Tuesday 1 Dec 2026 at the given time.</summary>
    public static DateTime Tuesday(int hour, int minute = 0) => new(2026, 12, 1, hour, minute, 0);

    /// <summary>
    /// A fresh in-memory database with: clinic 1, doctors 1 and 2, patients 1 and 2,
    /// appointment 1 (doctor 1 + patient 1, Tue 10:00-10:30) and appointment 2 (doctor 2 + patient 2, Tue 13:00-13:30).
    /// </summary>
    public static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(options);

        db.Specialities.Add(new Speciality { ID = 1, Name = "Dermatology" });
        db.Clinics.Add(new Clinic { ID = 1, Name = "Oslo", Address = "Main street 1" });
        db.Doctors.AddRange(
            new Doctor { ID = 1, FirstName = "Ann", LastName = "Lee", ClinicID = 1, SpecialityID = 1 },
            new Doctor { ID = 2, FirstName = "Bob", LastName = "Ray", ClinicID = 1, SpecialityID = 1 });
        db.Patients.AddRange(
            new Patient { Id = 1, FirstName = "Jane", LastName = "Doe", Email = "jane@example.com" },
            new Patient { Id = 2, FirstName = "Max", LastName = "Moe", Email = "max@example.com" });
        db.Appointments.AddRange(
            new Appointment { Id = 1, AppointmentDateTime = Tuesday(10), DurationInMinutes = 30, Category = "Checkup", DoctorId = 1, PatientId = 1, ClinicId = 1 },
            new Appointment { Id = 2, AppointmentDateTime = Tuesday(13), DurationInMinutes = 30, Category = "Checkup", DoctorId = 2, PatientId = 2, ClinicId = 1 });
        db.SaveChanges();
        db.ChangeTracker.Clear();
        return db;
    }

    /// <summary>Gives a controller a logged-in user, like the JWT middleware would.</summary>
    public static T WithUser<T>(this T controller, int userId, string role) where T : ControllerBase
    {
        var identity = new ClaimsIdentity(
            new[] { new Claim("sub", userId.ToString()), new Claim("role", role) },
            authenticationType: "Test", nameType: "name", roleType: "role");
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
        return controller;
    }
}
