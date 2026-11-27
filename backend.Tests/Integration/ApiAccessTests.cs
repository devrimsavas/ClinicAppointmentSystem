using System.Net;
using System.Net.Http.Json;

namespace ClinicBooking.Tests.Integration;

/// <summary>
/// End-to-end checks through HTTP: who can call what, and that the real JWT works.
/// One factory is shared by all tests in this class; the login rate limit (5 per minute)
/// is respected by logging in only once per role.
/// </summary>
public class ApiAccessTests : IClassFixture<ApiFactory>, IAsyncLifetime
{
    private readonly ApiFactory _factory;
    private static HttpClient? _admin;
    private static HttpClient? _staff;

    public ApiAccessTests(ApiFactory factory) => _factory = factory;

    public async Task InitializeAsync()
    {
        await _factory.SeedAsync();
        _admin ??= await _factory.CreateClientAsAsync(ApiFactory.AdminEmail);
        _staff ??= await _factory.CreateClientAsAsync(ApiFactory.StaffEmail);
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private HttpClient Anonymous => _factory.CreateClient();

    [Theory]
    [InlineData("/api/clinics")]
    [InlineData("/api/doctors")]
    [InlineData("/api/specialities")]
    [InlineData("/api/appointments/busy")]
    public async Task Public_endpoints_work_without_login(string url) =>
        Assert.Equal(HttpStatusCode.OK, (await Anonymous.GetAsync(url)).StatusCode);

    [Theory]
    [InlineData("/api/patients")]
    [InlineData("/api/appointments")]
    [InlineData("/api/users")]
    [InlineData("/api/auth/me")]
    public async Task Protected_endpoints_return_401_without_login(string url) =>
        Assert.Equal(HttpStatusCode.Unauthorized, (await Anonymous.GetAsync(url)).StatusCode);

    [Fact]
    public async Task A_forged_token_is_rejected()
    {
        var client = _factory.CreateClient();
        // Header and payload are valid JSON, but the signature is not made with the server key
        client.DefaultRequestHeaders.Authorization = new("Bearer",
            "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFkbWluIiwiZXhwIjo0MTAyNDQ0ODAwfQ.c2lnbmF0dXJl");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/users")).StatusCode);
    }

    [Fact]
    public async Task Staff_can_read_patients_and_appointments()
    {
        Assert.Equal(HttpStatusCode.OK, (await _staff!.GetAsync("/api/patients")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _staff.GetAsync("/api/appointments")).StatusCode);
    }

    [Theory]
    [InlineData("/api/clinics")]
    [InlineData("/api/specialities")]
    public async Task Staff_cannot_manage_admin_data(string url)
    {
        var response = await _staff!.PostAsJsonAsync(url, new { name = "Not allowed" });
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Staff_cannot_list_users() =>
        Assert.Equal(HttpStatusCode.Forbidden, (await _staff!.GetAsync("/api/users")).StatusCode);

    [Fact]
    public async Task Admin_can_create_a_clinic()
    {
        var response = await _admin!.PostAsJsonAsync("/api/clinics", new { name = "Clinic " + Guid.NewGuid(), address = "Somewhere 2" });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Me_returns_the_logged_in_user()
    {
        var me = await _staff!.GetFromJsonAsync<MeBody>("/api/auth/me");
        Assert.Equal(ApiFactory.StaffEmail, me!.Email);
        Assert.Equal("Staff", me.Role);
    }

    [Fact]
    public async Task Wrong_password_returns_401()
    {
        var response = await Anonymous.PostAsJsonAsync("/api/auth/login", new { email = ApiFactory.AdminEmail, password = "wrong" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Public_booking_creates_an_appointment_that_staff_can_see()
    {
        var doctors = await Anonymous.GetFromJsonAsync<DoctorsBody>("/api/doctors");
        var doctor = doctors!.Doctors[0];

        var booking = await Anonymous.PostAsJsonAsync("/api/appointments/with-patient", new
        {
            patient = new { firstName = "Per", lastName = "Test", email = $"per.{Guid.NewGuid():N}@example.com" },
            appointment = new { appointmentDateTime = NextMondayAt(11), category = "Checkup", doctorId = doctor.Id, clinicId = doctor.ClinicId, durationInMinutes = 30 }
        });
        Assert.Equal(HttpStatusCode.Created, booking.StatusCode);

        var list = await _staff!.GetStringAsync("/api/appointments");
        Assert.Contains("Per Test", list);
    }

    [Fact]
    public async Task Public_booking_on_a_weekend_is_rejected_with_a_message()
    {
        var doctors = await Anonymous.GetFromJsonAsync<DoctorsBody>("/api/doctors");
        var doctor = doctors!.Doctors[0];
        var saturday = DateTime.Today.AddDays(((int)DayOfWeek.Saturday - (int)DateTime.Today.DayOfWeek + 7) % 7 + 7).AddHours(10);

        var response = await Anonymous.PostAsJsonAsync("/api/appointments/with-patient", new
        {
            patient = new { firstName = "Per", lastName = "Test", email = "weekend@example.com" },
            appointment = new { appointmentDateTime = saturday, category = "Checkup", doctorId = doctor.Id, clinicId = doctor.ClinicId, durationInMinutes = 30 }
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("weekdays", await response.Content.ReadAsStringAsync());
    }

    /// <summary>A Monday at least a week ahead, so the test never hits "in the past".</summary>
    private static DateTime NextMondayAt(int hour) =>
        DateTime.Today.AddDays(((int)DayOfWeek.Monday - (int)DateTime.Today.DayOfWeek + 7) % 7 + 7).AddHours(hour);

    private record MeBody(string Email, string Role);
    private record DoctorItem(int Id, int ClinicId);
    private record DoctorsBody(List<DoctorItem> Doctors);
}
