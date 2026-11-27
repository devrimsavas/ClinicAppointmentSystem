using System.ComponentModel.DataAnnotations;

namespace ClinicBooking.DTOs
{
    public class LoginRequestDto
    {
        /// <example>admin@novamed.no</example>
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserReadDto User { get; set; } = new();
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UserReadDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class UserCreateDto
    {
        /// <example>desk@novamed.no</example>
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <example>Kari Nordmann</example>
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        /// <summary>"Admin" or "Staff".</summary>
        /// <example>Staff</example>
        [Required]
        public string Role { get; set; } = string.Empty;
    }

    public class PasswordResetDto
    {
        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// A booked time range without any patient data, for the public calendar.
    /// </summary>
    public class BusySlotDto
    {
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
}
