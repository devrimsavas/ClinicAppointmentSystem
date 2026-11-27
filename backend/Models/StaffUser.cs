using System.ComponentModel.DataAnnotations;

namespace ClinicBooking.Models
{
    /// <summary>
    /// Role names used in JWT tokens and [Authorize] attributes.
    /// </summary>
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Staff = "Staff";
        public const string AdminOrStaff = Admin + "," + Staff;

        public static readonly string[] All = { Admin, Staff };

        public static bool IsValid(string? role) => role != null && All.Contains(role);
    }

    /// <summary>
    /// A clinic employee who can log in to the admin panel.
    /// Admin manages clinics, doctors, specialities and users; Staff (front desk) manages appointments and patients.
    /// Patients do not have accounts.
    /// </summary>
    public class StaffUser
    {
        public int Id { get; set; }

        /// <summary>Stored trimmed and lower-case; unique.</summary>
        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = Roles.Staff;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
    }
}
