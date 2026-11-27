using ClinicBooking.Services;
using static ClinicBooking.Tests.TestData;

namespace ClinicBooking.Tests.Unit;

/// <summary>The pure date/time rules (no database).</summary>
public class ScheduleRulesTests
{
    [Theory]
    [InlineData(8, 0, 30)]   // first possible start
    [InlineData(10, 0, 30)]
    [InlineData(17, 30, 30)] // ends exactly at 18:00
    public void Valid_weekday_slots_are_accepted(int hour, int minute, int duration)
    {
        Assert.Null(AppointmentValidator.CheckSchedule(Tuesday(hour, minute), duration, Now));
    }

    [Theory]
    [InlineData(7, 30, 30)]  // starts before opening
    [InlineData(17, 50, 60)] // ends after closing
    [InlineData(18, 0, 15)]  // starts at closing time
    public void Slots_outside_working_hours_are_rejected(int hour, int minute, int duration)
    {
        Assert.Equal("Appointments must start and end between 08:00 and 18:00.",
            AppointmentValidator.CheckSchedule(Tuesday(hour, minute), duration, Now));
    }

    [Fact]
    public void Appointment_running_past_midnight_is_rejected()
    {
        Assert.NotNull(AppointmentValidator.CheckSchedule(Tuesday(17), 60 * 10, Now));
    }

    [Theory]
    [InlineData(5)] // Saturday 5 Dec 2026
    [InlineData(6)] // Sunday 6 Dec 2026
    public void Weekends_are_rejected(int day)
    {
        Assert.Equal("Appointments can only be booked on weekdays.",
            AppointmentValidator.CheckSchedule(new DateTime(2026, 12, day, 10, 0, 0), 30, Now));
    }

    [Fact]
    public void Past_times_are_rejected()
    {
        Assert.Equal("You cannot book an appointment in the past.",
            AppointmentValidator.CheckSchedule(Now.AddHours(-1), 30, Now));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-15)]
    public void Duration_must_be_positive(int duration)
    {
        Assert.Equal("Duration must be greater than zero.",
            AppointmentValidator.CheckSchedule(Tuesday(10), duration, Now));
    }
}
