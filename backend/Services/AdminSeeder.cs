using ClinicBooking.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ClinicBooking.Services
{
    /// <summary>
    /// Creates the first admin account on startup, but only when there are no users yet.
    /// There is no public registration: all other accounts are created by an admin.
    /// Reads "SeedAdmin:Email", "SeedAdmin:Password" and optional "SeedAdmin:FullName" from configuration.
    /// </summary>
    public static class AdminSeeder
    {
        public const int MinimumPasswordLength = 8;

        public static async Task SeedAsync(
            AppDbContext context,
            IPasswordHasher<StaffUser> hasher,
            IConfiguration configuration,
            ILogger logger)
        {
            if (await context.Users.AnyAsync(u => true))
                return;

            var email = configuration["SeedAdmin:Email"];
            var password = configuration["SeedAdmin:Password"];
            var fullName = configuration["SeedAdmin:FullName"];

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                logger.LogWarning("No users exist and SeedAdmin:Email / SeedAdmin:Password are not configured. Nobody can log in.");
                return;
            }

            if (password.Length < MinimumPasswordLength)
            {
                logger.LogWarning("SeedAdmin:Password must be at least {Length} characters. Admin was not created.", MinimumPasswordLength);
                return;
            }

            var admin = new StaffUser
            {
                Email = StaffUser.NormalizeEmail(email),
                FullName = string.IsNullOrWhiteSpace(fullName) ? "Administrator" : fullName.Trim(),
                Role = Roles.Admin,
            };
            admin.PasswordHash = hasher.HashPassword(admin, password);

            context.Users.Add(admin);
            await context.SaveChangesAsync();

            logger.LogInformation("Seeded first admin user {Email}.", admin.Email);
        }
    }
}
