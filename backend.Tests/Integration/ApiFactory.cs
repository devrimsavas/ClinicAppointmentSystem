using System.Net.Http.Headers;
using System.Net.Http.Json;
using ClinicBooking.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ClinicBooking.Tests.Integration;

/// <summary>
/// Runs the real API (routing, JWT authentication, roles, rate limiting) in memory.
/// Only the database is swapped: EF Core InMemory instead of MySQL, so no database server is needed.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "test.admin@example.com";
    public const string StaffEmail = "test.staff@example.com";
    public const string Password = "Test-password-1";

    // One database per factory. The name must be created once, not inside the options lambda.
    private readonly string _databaseName = "clinic-tests-" + Guid.NewGuid();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // Read by Program.cs before the app is built, so UseSetting (not ConfigureAppConfiguration) is needed
        builder.UseSetting("ConnectionStrings:DefaultConnection", "Server=unused;Database=unused");
        builder.UseSetting("Jwt:Key", "integration-test-signing-key-that-is-long-enough-123");
        builder.UseSetting("Jwt:Issuer", "ClinicBooking");
        builder.UseSetting("Jwt:Audience", "ClinicBooking");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(_databaseName));
        });
    }

    /// <summary>Adds the test users and some reference data directly to the database.</summary>
    public async Task SeedAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<StaffUser>>();

        if (await db.Users.AnyAsync(u => u.Email == AdminEmail))
            return;

        foreach (var (email, role) in new[] { (AdminEmail, Roles.Admin), (StaffEmail, Roles.Staff) })
        {
            var user = new StaffUser { Email = email, FullName = role + " User", Role = role };
            user.PasswordHash = hasher.HashPassword(user, Password);
            db.Users.Add(user);
        }

        var speciality = new Speciality { Name = "Dermatology" };
        var clinic = new Clinic { Name = "Test Clinic", Address = "Test street 1" };
        db.Doctors.Add(new Doctor { FirstName = "Ann", LastName = "Lee", Clinic = clinic, Speciality = speciality });
        db.Patients.Add(new Patient { FirstName = "Jane", LastName = "Doe", Email = "jane@example.com" });
        await db.SaveChangesAsync();
    }

    /// <summary>Logs in through the real endpoint and returns a client that sends the JWT.</summary>
    public async Task<HttpClient> CreateClientAsAsync(string email)
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password });
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<LoginBody>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
        return client;
    }

    private record LoginBody(string Token);
}
